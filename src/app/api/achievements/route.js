// src/app/api/achievements/route.js
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSupabaseAdmin } from '@/lib/supabase';

const UnlockAchievementSchema = z.object({
  playerId: z.number().int(),
  achievementId: z.string(),
  progress: z.object({}).optional()
});

// GET /api/achievements?playerId=123 - Get player achievements
export async function GET(req) {
  try {
    const supabase = requireSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const playerId = searchParams.get('playerId');
    
    if (playerId) {
      // Get specific player's achievements
      const { data: playerAchievements, error } = await supabase
        .from('player_achievements')
        .select(`
          *,
          achievements (*)
        `)
        .eq('player_id', parseInt(playerId));

      if (error) throw error;

      // Also get all available achievements to show progress
      const { data: allAchievements, error: allError } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (allError) throw allError;

      // Combine unlocked and available achievements
      const unlockedIds = new Set(playerAchievements.map(pa => pa.achievement_id));
      const availableAchievements = allAchievements.filter(a => !unlockedIds.has(a.id));

      return NextResponse.json({
        unlocked: playerAchievements,
        available: availableAchievements,
        totalUnlocked: playerAchievements.length,
        totalAvailable: allAchievements.length
      });
    } else {
      // Get all achievements
      const { data: achievements, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) throw error;

      return NextResponse.json({ achievements });
    }
  } catch (error) {
    console.error('GET /api/achievements error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}

// POST /api/achievements - Unlock an achievement for a player
export async function POST(req) {
  try {
    const supabase = requireSupabaseAdmin();
    const body = await req.json();
    const { playerId, achievementId, progress } = UnlockAchievementSchema.parse(body);

    // Check if achievement exists and is active
    const { data: achievement, error: achievementError } = await supabase
      .from('achievements')
      .select('*')
      .eq('id', achievementId)
      .eq('is_active', true)
      .single();

    if (achievementError) {
      if (achievementError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Achievement not found' },
          { status: 404 }
        );
      }
      throw achievementError;
    }

    // Check if player already has this achievement
    const { data: existing, error: existingError } = await supabase
      .from('player_achievements')
      .select('*')
      .eq('player_id', playerId)
      .eq('achievement_id', achievementId)
      .single();

    if (existingError && existingError.code !== 'PGRST116') {
      throw existingError;
    }

    if (existing) {
      return NextResponse.json({
        message: 'Achievement already unlocked',
        achievement: existing
      });
    }

    // Unlock the achievement
    const { data: newAchievement, error: unlockError } = await supabase
      .from('player_achievements')
      .insert({
        player_id: playerId,
        achievement_id: achievementId,
        progress: progress || {},
        unlocked_at: new Date().toISOString()
      })
      .select(`
        *,
        achievements (*)
      `)
      .single();

    if (unlockError) throw unlockError;

    // Award rewards if any
    if (achievement.rewards && Object.keys(achievement.rewards).length > 0) {
      await awardAchievementRewards(supabase, playerId, achievement.rewards);
    }

    // Update player's achievement list in stats
    await updatePlayerAchievementsList(supabase, playerId, achievementId);

    return NextResponse.json({
      message: 'Achievement unlocked successfully',
      achievement: newAchievement,
      rewards: achievement.rewards
    });

  } catch (error) {
    console.error('POST /api/achievements error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to unlock achievement' },
      { status: 500 }
    );
  }
}

// Helper function to award achievement rewards
async function awardAchievementRewards(supabase, playerId, rewards) {
  const promises = [];

  // Award XP
  if (rewards.xp) {
    promises.push(
      supabase
        .from('players')
        .update({
          xp: supabase.raw(`xp + ${rewards.xp}`)
        })
        .eq('id', playerId)
    );
  }

  // Award currencies
  if (rewards.gold || rewards.gems || rewards.dust || rewards.tokens) {
    const currencyUpdate = {};
    if (rewards.gold) currencyUpdate.gold = supabase.raw(`gold + ${rewards.gold}`);
    if (rewards.gems) currencyUpdate.gems = supabase.raw(`gems + ${rewards.gems}`);
    if (rewards.dust) currencyUpdate.dust = supabase.raw(`dust + ${rewards.dust}`);
    if (rewards.tokens) currencyUpdate.tokens = supabase.raw(`tokens + ${rewards.tokens}`);

    promises.push(
      supabase
        .from('player_currencies')
        .update(currencyUpdate)
        .eq('player_id', playerId)
    );
  }

  // Award title
  if (rewards.title) {
    promises.push(
      supabase
        .from('players')
        .update({ title: rewards.title })
        .eq('id', playerId)
    );
  }

  // Record transactions for currencies
  const transactions = [];
  if (rewards.gold) {
    transactions.push({
      player_id: playerId,
      transaction_type: 'reward',
      currency_type: 'gold',
      amount: rewards.gold,
      reason: `Achievement reward: ${rewards.title || 'achievement'}`,
      metadata: { source: 'achievement' }
    });
  }
  if (rewards.gems) {
    transactions.push({
      player_id: playerId,
      transaction_type: 'reward',
      currency_type: 'gems',
      amount: rewards.gems,
      reason: `Achievement reward: ${rewards.title || 'achievement'}`,
      metadata: { source: 'achievement' }
    });
  }

  if (transactions.length > 0) {
    promises.push(
      supabase
        .from('transactions')
        .insert(transactions)
    );
  }

  await Promise.all(promises);
}

// Helper function to update player's achievements list in stats
async function updatePlayerAchievementsList(supabase, playerId, achievementId) {
  const { data: stats, error } = await supabase
    .from('player_stats')
    .select('achievements_unlocked')
    .eq('player_id', playerId)
    .single();

  if (error && error.code !== 'PGRST116') return;

  const currentAchievements = stats?.achievements_unlocked || [];
  if (!currentAchievements.includes(achievementId)) {
    currentAchievements.push(achievementId);
    
    await supabase
      .from('player_stats')
      .upsert({
        player_id: playerId,
        achievements_unlocked: currentAchievements
      }, { onConflict: 'player_id' });
  }
}

// Check and unlock achievements based on player actions
export async function checkAndUnlockAchievements(supabase, playerId, actionType, actionData = {}) {
  try {
    // Get player stats to check criteria
    const { data: stats, error: statsError } = await supabase
      .from('player_stats')
      .select('*')
      .eq('player_id', playerId)
      .single();

    if (statsError) return;

    // Get all active achievements the player doesn't have
    const { data: playerAchievements, error: paError } = await supabase
      .from('player_achievements')
      .select('achievement_id')
      .eq('player_id', playerId);

    if (paError) return;

    const unlockedIds = new Set(playerAchievements.map(pa => pa.achievement_id));

    const { data: availableAchievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true);

    if (achievementsError) return;

    // Check each achievement's criteria
    for (const achievement of availableAchievements) {
      if (unlockedIds.has(achievement.id)) continue;

      const criteria = achievement.criteria;
      let shouldUnlock = false;

      switch (criteria.type) {
        case 'wins':
          shouldUnlock = stats.wins >= criteria.target;
          break;
        case 'win_streak':
          shouldUnlock = stats.win_streak >= criteria.target;
          break;
        case 'mmr':
          // Need to get MMR from players table
          const { data: playerData } = await supabase
            .from('players')
            .select('mmr')
            .eq('id', playerId)
            .single();
          shouldUnlock = playerData?.mmr >= criteria.target;
          break;
        case 'total_damage':
          shouldUnlock = stats.total_damage_dealt >= criteria.target;
          break;
        case 'cards_collected':
          // Need to check collection
          const { data: collection } = await supabase
            .from('collections')
            .select('cards')
            .eq('player_id', playerId)
            .single();
          shouldUnlock = (collection?.cards || []).length >= criteria.target;
          break;
        // Add more criteria types as needed
      }

      if (shouldUnlock) {
        // Unlock the achievement (call the POST endpoint internally)
        await POST({
          json: async () => ({
            playerId,
            achievementId: achievement.id
          })
        });
      }
    }
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
}

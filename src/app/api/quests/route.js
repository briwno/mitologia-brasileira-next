// src/app/api/quests/route.js
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSupabaseAdmin } from '@/lib/supabase';

const UpdateQuestSchema = z.object({
  playerId: z.number().int(),
  questId: z.string(),
  progress: z.object({}).optional()
});

const ClaimQuestSchema = z.object({
  playerId: z.number().int(),
  questId: z.string()
});

// GET /api/quests?playerId=123 - Get player's active quests
export async function GET(req) {
  try {
    const supabase = requireSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const playerId = searchParams.get('playerId');
    
    if (playerId) {
      // Get player's assigned quests
      const { data: playerQuests, error } = await supabase
        .from('player_quests')
        .select(`
          *,
          quests (*)
        `)
        .eq('player_id', parseInt(playerId))
        .is('claimed_at', null) // Only unclaimed quests
        .order('assigned_at', { ascending: false });

      if (error) {
        console.error('[Quests API] Error fetching player quests:', error);
        return NextResponse.json({ error: 'database_error' }, { status: 500 });
      }

      // Separate active, completed, and expired quests
      const now = new Date();
      const activeQuests = [];
      const completedQuests = [];
      const expiredQuests = [];

      playerQuests.forEach(pq => {
        const expiresAt = pq.expires_at ? new Date(pq.expires_at) : null;
        
        if (expiresAt && expiresAt < now) {
          expiredQuests.push(pq);
        } else if (pq.completed_at) {
          completedQuests.push(pq);
        } else {
          activeQuests.push(pq);
        }
      });

      return NextResponse.json({
        active: activeQuests,
        completed: completedQuests,
        expired: expiredQuests
      });
    } else {
      // Get all available quests
      const { data: quests, error } = await supabase
        .from('quests')
        .select('*')
        .eq('is_active', true)
        .order('quest_type', { ascending: true });

      if (error) {
        console.error('[Quests API] Error fetching quests:', error);
        return NextResponse.json({ error: 'database_error' }, { status: 500 });
      }

      return NextResponse.json({ quests });
    }
  } catch (error) {
    console.error('GET /api/quests error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quests' },
      { status: 500 }
    );
  }
}

// POST /api/quests/assign - Assign daily/weekly quests to player
export async function POST(req) {
  try {
    const supabase = requireSupabaseAdmin();
    const body = await req.json();
    const { playerId } = z.object({ playerId: z.number().int() }).parse(body);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Check if player already has today's daily quests
    const { data: existingDaily, error: dailyError } = await supabase
      .from('player_quests')
      .select('quest_id')
      .eq('player_id', playerId)
      .gte('assigned_at', todayStart.toISOString())
      .in('quest_id', ['daily_win_2', 'daily_play_5', 'daily_damage_500', 'daily_quiz_1']);

    if (dailyError) {
      console.error('[Quests API] Error fetching daily quests:', dailyError);
      return NextResponse.json({ error: 'database_error' }, { status: 500 });
    }

    const assignedQuests = [];

    // Assign daily quests if not already assigned today
    if (existingDaily.length === 0) {
      const dailyQuests = ['daily_win_2', 'daily_play_5', 'daily_damage_500', 'daily_quiz_1'];
      
      for (const questId of dailyQuests) {
        const expiresAt = new Date(now);
        expiresAt.setHours(23, 59, 59, 999); // End of day
        
        const questAssignment = {
          player_id: playerId,
          quest_id: questId,
          assigned_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          progress: {}
        };

        assignedQuests.push(questAssignment);
      }
    }

    // Check weekly quests (assign on Monday if not already assigned this week)
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
    weekStart.setHours(0, 0, 0, 0);

    const { data: existingWeekly, error: weeklyError } = await supabase
      .from('player_quests')
      .select('quest_id')
      .eq('player_id', playerId)
      .gte('assigned_at', weekStart.toISOString())
      .like('quest_id', 'weekly_%');

    if (weeklyError) {
      console.error('[Quests API] Error fetching weekly quests:', weeklyError);
      return NextResponse.json({ error: 'database_error' }, { status: 500 });
    }

    if (existingWeekly.length === 0 && now.getDay() === 1) { // Monday
      const weeklyQuests = ['weekly_ranked_5', 'weekly_collection', 'weekly_social'];
      
      for (const questId of weeklyQuests) {
        const expiresAt = new Date(weekStart);
        expiresAt.setDate(weekStart.getDate() + 7); // Next Monday
        
        const questAssignment = {
          player_id: playerId,
          quest_id: questId,
          assigned_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          progress: {}
        };

        assignedQuests.push(questAssignment);
      }
    }

    // Insert new quest assignments
    if (assignedQuests.length > 0) {
      const { data: newQuests, error: insertError } = await supabase
        .from('player_quests')
        .insert(assignedQuests)
        .select(`
          *,
          quests (*)
        `);

      if (insertError) {
        console.error('[Quests API] Error assigning quests:', insertError);
        return NextResponse.json({ error: 'database_error' }, { status: 500 });
      }

      return NextResponse.json({
        message: `Assigned ${assignedQuests.length} new quests`,
        quests: newQuests
      });
    } else {
      return NextResponse.json({
        message: 'No new quests to assign',
        quests: []
      });
    }

  } catch (error) {
    console.error('POST /api/quests/assign error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to assign quests' },
      { status: 500 }
    );
  }
}

// PUT /api/quests/progress - Update quest progress
export async function PUT(req) {
  try {
    const supabase = requireSupabaseAdmin();
    const body = await req.json();
    const { playerId, questId, progress } = UpdateQuestSchema.parse(body);

    // Get current quest progress
    const { data: playerQuest, error: questError } = await supabase
      .from('player_quests')
      .select(`
        *,
        quests (*)
      `)
      .eq('player_id', playerId)
      .eq('quest_id', questId)
      .single();

    if (questError) {
      if (questError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Quest not found for player' },
          { status: 404 }
        );
      }
  console.error('[Quests API] Error fetching quest progress:', questError);
  return NextResponse.json({ error: 'database_error' }, { status: 500 });
    }

    // Don't update if already completed or expired
    if (playerQuest.completed_at || playerQuest.claimed_at) {
      return NextResponse.json({
        message: 'Quest already completed',
        quest: playerQuest
      });
    }

    const now = new Date();
    if (playerQuest.expires_at && new Date(playerQuest.expires_at) < now) {
      return NextResponse.json({
        error: 'Quest has expired',
        quest: playerQuest
      }, { status: 400 });
    }

    // Update progress
    const newProgress = { ...playerQuest.progress, ...progress };
    const quest = playerQuest.quests;
    
    // Check if quest is completed
    let isCompleted = false;
    for (const objective of quest.objectives) {
      const currentValue = newProgress[objective.type] || 0;
      if (currentValue >= objective.target) {
        isCompleted = true;
        break;
      }
    }

    const updateData = {
      progress: newProgress,
      ...(isCompleted && { completed_at: now.toISOString() })
    };

    const { data: updatedQuest, error: updateError } = await supabase
      .from('player_quests')
      .update(updateData)
      .eq('player_id', playerId)
      .eq('quest_id', questId)
      .select(`
        *,
        quests (*)
      `)
      .single();

    if (updateError) {
      console.error('[Quests API] Error updating quest progress:', updateError);
      return NextResponse.json({ error: 'database_error' }, { status: 500 });
    }

    return NextResponse.json({
      message: isCompleted ? 'Quest completed!' : 'Progress updated',
      quest: updatedQuest,
      completed: isCompleted
    });

  } catch (error) {
    console.error('PUT /api/quests/progress error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update quest progress' },
      { status: 500 }
    );
  }
}

// POST /api/quests/claim - Claim quest rewards
export async function CLAIM(req) {
  try {
    const supabase = requireSupabaseAdmin();
    const body = await req.json();
    const { playerId, questId } = ClaimQuestSchema.parse(body);

    // Get completed quest
    const { data: playerQuest, error: questError } = await supabase
      .from('player_quests')
      .select(`
        *,
        quests (*)
      `)
      .eq('player_id', playerId)
      .eq('quest_id', questId)
      .not('completed_at', 'is', null)
      .is('claimed_at', null)
      .single();

    if (questError) {
      if (questError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Completed quest not found' },
          { status: 404 }
        );
      }
  console.error('[Quests API] Error fetching completed quest:', questError);
  return NextResponse.json({ error: 'database_error' }, { status: 500 });
    }

    // Award rewards
    const quest = playerQuest.quests;
    const rewards = quest.rewards;
    const now = new Date();

    const promises = [];

    // Award XP
    if (rewards.xp) {
      promises.push(
        supabase.rpc('increment_player_xp', {
          player_id: playerId,
          xp_amount: rewards.xp
        })
      );
    }

    // Award currencies
    if (rewards.gold || rewards.gems || rewards.dust || rewards.tokens) {
      const currencyUpdates = {};
      if (rewards.gold) currencyUpdates.gold = rewards.gold;
      if (rewards.gems) currencyUpdates.gems = rewards.gems;
      if (rewards.dust) currencyUpdates.dust = rewards.dust;
      if (rewards.tokens) currencyUpdates.tokens = rewards.tokens;

      promises.push(
        supabase.rpc('add_player_currencies', {
          player_id: playerId,
          currency_amounts: currencyUpdates
        })
      );
    }

    // Record transactions
    const transactions = [];
    Object.entries(rewards).forEach(([type, amount]) => {
      if (['gold', 'gems', 'dust', 'tokens'].includes(type)) {
        transactions.push({
          player_id: playerId,
          transaction_type: 'reward',
          currency_type: type,
          amount: amount,
          reason: `Quest reward: ${quest.name}`,
          metadata: { source: 'quest', quest_id: questId }
        });
      }
    });

    if (transactions.length > 0) {
      promises.push(
        supabase.from('transactions').insert(transactions)
      );
    }

    // Mark quest as claimed
    promises.push(
      supabase
        .from('player_quests')
        .update({ claimed_at: now.toISOString() })
        .eq('player_id', playerId)
        .eq('quest_id', questId)
    );

    await Promise.all(promises);

    return NextResponse.json({
      message: 'Quest rewards claimed successfully',
      rewards: rewards
    });

  } catch (error) {
    console.error('POST /api/quests/claim error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to claim quest rewards' },
      { status: 500 }
    );
  }
}

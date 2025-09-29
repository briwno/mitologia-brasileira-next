// src/app/api/stats/route.js
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSupabaseAdmin } from '@/lib/supabase';

const UpdateStatsSchema = z.object({
  playerId: z.number().int(),
  matchResult: z.enum(['win', 'loss', 'draw']),
  damageDealt: z.number().int().min(0).default(0),
  damageTaken: z.number().int().min(0).default(0),
  cardsPlayed: z.array(z.string()).default([]),
  isRanked: z.boolean().default(false)
});

// GET /api/stats?playerId=123 - Get player statistics
export async function GET(req) {
  try {
    const supabase = requireSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const playerId = searchParams.get('playerId');
    
    if (!playerId) {
      return NextResponse.json({ error: 'playerId is required' }, { status: 400 });
    }

    const { data: stats, error } = await supabase
      .from('player_stats')
      .select('*')
      .eq('player_id', parseInt(playerId))
      .single();

    if (error && error.code !== 'PGRST116') { // Not found is OK
      console.error('[Stats API] Error fetching stats:', error);
      return NextResponse.json({ error: 'database_error' }, { status: 500 });
    }

    // If no stats exist, create default stats
    if (!stats) {
      const { data: newStats, error: createError } = await supabase
        .from('player_stats')
        .insert({ player_id: parseInt(playerId) })
        .select('*')
        .single();

      if (createError) {
        console.error('[Stats API] Error creating default stats:', createError);
        return NextResponse.json({ error: 'database_error' }, { status: 500 });
      }
      return NextResponse.json({ stats: newStats });
    }

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('GET /api/stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' }, 
      { status: 500 }
    );
  }
}

// POST /api/stats - Update player statistics after a match
export async function POST(req) {
  try {
    const supabase = requireSupabaseAdmin();
    const body = await req.json();
    const { playerId, matchResult, damageDealt, damageTaken, cardsPlayed, isRanked } = UpdateStatsSchema.parse(body);

    // Get current stats
    const { data: currentStats, error: fetchError } = await supabase
      .from('player_stats')
      .select('*')
      .eq('player_id', playerId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('[Stats API] Error fetching current stats:', fetchError);
      return NextResponse.json({ error: 'database_error' }, { status: 500 });
    }

    // Calculate new statistics
    const stats = currentStats || {
      player_id: playerId,
      total_matches: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      ranked_matches: 0,
      ranked_wins: 0,
      win_streak: 0,
      best_win_streak: 0,
      total_damage_dealt: 0,
      total_damage_taken: 0,
      most_used_cards: {}
    };

    // Update match counts
    stats.total_matches += 1;
    if (isRanked) stats.ranked_matches += 1;

    // Update win/loss record
    if (matchResult === 'win') {
      stats.wins += 1;
      if (isRanked) stats.ranked_wins += 1;
      stats.win_streak += 1;
      stats.best_win_streak = Math.max(stats.best_win_streak, stats.win_streak);
    } else if (matchResult === 'loss') {
      stats.losses += 1;
      stats.win_streak = 0;
    } else {
      stats.draws += 1;
      stats.win_streak = 0;
    }

    // Update damage statistics
    stats.total_damage_dealt += damageDealt;
    stats.total_damage_taken += damageTaken;

    // Update most used cards
    const mostUsed = stats.most_used_cards || {};
    cardsPlayed.forEach(cardId => {
      mostUsed[cardId] = (mostUsed[cardId] || 0) + 1;
    });
    stats.most_used_cards = mostUsed;

    // Find favorite card (most used)
    if (Object.keys(mostUsed).length > 0) {
      stats.favorite_card_id = Object.entries(mostUsed)
        .sort(([,a], [,b]) => b - a)[0][0];
    }

    stats.last_match_at = new Date().toISOString();

    // Upsert statistics
    const { data: updatedStats, error: updateError } = await supabase
      .from('player_stats')
      .upsert(stats, { onConflict: 'player_id' })
      .select('*')
      .single();

    if (updateError) {
      console.error('[Stats API] Error updating stats:', updateError);
      return NextResponse.json({ error: 'database_error' }, { status: 500 });
    }

    return NextResponse.json({ 
      stats: updatedStats,
      message: 'Statistics updated successfully' 
    });

  } catch (error) {
    console.error('POST /api/stats error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update stats' },
      { status: 500 }
    );
  }
}

// GET /api/stats/leaderboard - Get top players
export async function GET_LEADERBOARD(req) {
  try {
    const supabase = requireSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type') || 'wins'; // 'wins', 'mmr', 'winrate'

    let query = supabase
      .from('player_stats')
      .select(`
        *,
        players:player_id (
          id,
          name,
          avatar_url,
          level,
          mmr,
          title
        )
      `)
      .limit(limit);

    // Order by different criteria
    switch (type) {
      case 'mmr':
        query = query.order('players.mmr', { ascending: false });
        break;
      case 'winrate':
        // Calculate win rate dynamically (this might need a computed column in production)
        query = query.order('wins', { ascending: false });
        break;
      default:
        query = query.order('wins', { ascending: false });
    }

    const { data: leaderboard, error } = await query;

    if (error) {
      console.error('[Stats API] Error fetching leaderboard:', error);
      return NextResponse.json({ error: 'database_error' }, { status: 500 });
    }

    // Calculate win rates and format response
    const formattedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      player: entry.players,
      stats: {
        ...entry,
        winRate: entry.total_matches > 0 ? 
          Math.round((entry.wins / entry.total_matches) * 100) : 0
      }
    }));

    return NextResponse.json({ leaderboard: formattedLeaderboard });

  } catch (error) {
    console.error('GET /api/stats/leaderboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

// src/app/api/profile/route.js
import { NextResponse } from 'next/server';
import { requireSupabaseAdmin } from '@/lib/supabase';

// GET /api/profile?playerId=123 - Get complete player profile data
export async function GET(req) {
  try {
    const supabase = requireSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const playerId = searchParams.get('playerId');
    
    if (!playerId) {
      return NextResponse.json({ error: 'playerId is required' }, { status: 400 });
    }

    const playerIdInt = parseInt(playerId);

    // Get player basic info
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('*')
      .eq('id', playerIdInt)
      .single();

    if (playerError) {
      console.error('Player fetch error:', playerError);
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // Get player stats
    const { data: stats, error: statsError } = await supabase
      .from('player_stats')
      .select('*')
      .eq('player_id', playerIdInt)
      .single();

    // If no stats exist, create default stats
    const playerStats = stats || {
      total_matches: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      win_streak: 0,
      best_win_streak: 0,
      total_damage_dealt: 0,
      total_damage_taken: 0,
      ranked_matches: 0,
      ranked_wins: 0,
      most_used_cards: {}
    };

    // Get player achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from('player_achievements')
      .select(`
        *,
        achievements (*)
      `)
      .eq('player_id', playerIdInt);

    // Get all available achievements for progress tracking
    const { data: allAchievements, error: allAchievementsError } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true);

    // Get recent match history
    const { data: matchHistory, error: matchHistoryError } = await supabase
      .from('match_history')
      .select(`
        *,
        opponent:players!match_history_opponent_id_fkey(username),
        deck:decks(name)
      `)
      .eq('player_id', playerIdInt)
      .order('ended_at', { ascending: false })
      .limit(10);

    // Get collection stats
    const { data: collection, error: collectionError } = await supabase
      .from('player_collection')
      .select('card_id, quantity')
      .eq('player_id', playerIdInt);

    const { data: totalCards, error: totalCardsError } = await supabase
      .from('cards')
      .select('id')
      .eq('is_active', true);

    // Calculate derived stats
    const totalGames = playerStats.total_matches;
    const winRate = totalGames > 0 ? Math.round((playerStats.wins / totalGames) * 100) : 0;
    const totalCardsCollected = collection ? collection.length : 0;
    const totalCardsAvailable = totalCards ? totalCards.length : 80;

    // Calculate rank based on ranked wins (simplified ranking system)
    const getRank = (rankedWins) => {
      if (rankedWins >= 100) return { rank: 'Diamante I', points: rankedWins * 10 };
      if (rankedWins >= 75) return { rank: 'Platina I', points: rankedWins * 10 };
      if (rankedWins >= 50) return { rank: 'Ouro I', points: rankedWins * 10 };
      if (rankedWins >= 25) return { rank: 'Prata I', points: rankedWins * 10 };
      return { rank: 'Bronze I', points: rankedWins * 10 };
    };

    const rankInfo = getRank(playerStats.ranked_wins || 0);

    // Format achievements
    const formattedAchievements = (allAchievements || []).map(achievement => {
      const playerAchievement = achievements?.find(pa => pa.achievement_id === achievement.id);
      
      return {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon || '🏆',
        completed: !!playerAchievement,
        date: playerAchievement?.unlocked_at ? 
          new Date(playerAchievement.unlocked_at).toLocaleDateString('pt-BR') : null,
        progress: playerAchievement?.progress || null,
        total: achievement.target_value || null
      };
    });

    // Format match history
    const formattedMatches = (matchHistory || []).map(match => ({
      id: match.id,
      opponent: match.opponent?.username || 'Jogador Desconhecido',
      result: match.result,
      deck: match.deck?.name || 'Deck Personalizado',
      duration: match.duration || '0:00',
      date: new Date(match.ended_at).toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    }));

    // Calculate favorite cards from most_used_cards
    const favoriteCards = Object.entries(playerStats.most_used_cards || {})
      .sort(([,a], [,b]) => (b.timesPlayed || 0) - (a.timesPlayed || 0))
      .slice(0, 4)
      .map(([cardName, data]) => ({
        name: cardName,
        category: data.category || 'Desconhecida',
        timesPlayed: data.timesPlayed || 0,
        winRate: data.wins && data.timesPlayed ? 
          Math.round((data.wins / data.timesPlayed) * 100) : 0
      }));

    const profile = {
      // User basic info
      id: player.id,
      username: player.username,
      email: player.email,
      avatar_url: player.avatar_url,
      level: player.level || 1,
      xp: player.experience || 0,
      xpToNext: ((player.level || 1) * 1000) - (player.experience || 0),
      rank: rankInfo.rank,
      rankPoints: rankInfo.points,
      joinDate: new Date(player.created_at).toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      // Game stats
      totalGames,
      wins: playerStats.wins,
      losses: playerStats.losses,
      winRate,
      currentStreak: playerStats.win_streak,
      bestStreak: playerStats.best_win_streak,
      favoriteCard: favoriteCards[0]?.name || 'Nenhuma',
      // Collection info
      totalCardsCollected,
      totalCardsAvailable,
      achievements: formattedAchievements.filter(a => a.completed).length,
      // Detailed data
      recentMatches: formattedMatches,
      achievementsList: formattedAchievements,
      favoriteCards: favoriteCards.length > 0 ? favoriteCards : [
        { name: 'Nenhuma carta jogada ainda', category: '-', timesPlayed: 0, winRate: 0 }
      ]
    };

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('GET /api/profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile data' }, 
      { status: 500 }
    );
  }
}

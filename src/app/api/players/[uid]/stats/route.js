// src/app/api/players/[uid]/stats/route.js
import { NextResponse } from 'next/server';
import { requireSupabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/players/[uid]/stats
 * Buscar estatísticas de um jogador específico
 */
export async function GET(req, { params }) {
  try {
    const { uid } = params;

    if (!uid) {
      return NextResponse.json({ error: 'UID obrigatório' }, { status: 400 });
    }

    const supabase = requireSupabaseAdmin();

    // Buscar estatísticas básicas do jogador
    const { data: jogador, error: erroJogador } = await supabase
      .from('players')
      .select('id, nickname, avatar_url, level, xp, mmr, wins, losses, current_streak, best_streak, created_at')
      .eq('id', uid)
      .single();

    if (erroJogador || !jogador) {
      return NextResponse.json({ error: 'Jogador não encontrado' }, { status: 404 });
    }

    // Calcular estatísticas derivadas
    const totalGames = (jogador.wins || 0) + (jogador.losses || 0);
    const winRate = totalGames > 0 ? Math.round((jogador.wins / totalGames) * 100) : 0;

    // Buscar partidas recentes (limitado)
    const { data: partidas } = await supabase
      .from('partidas')
      .select('id, player1_id, player2_id, winner_id, created_at, duracao')
      .or(`player1_id.eq.${uid},player2_id.eq.${uid}`)
      .order('created_at', { ascending: false })
      .limit(10);

    const partidasRecentes = (partidas || []).map(partida => {
      const ehPlayer1 = partida.player1_id === uid;
      const venceu = partida.winner_id === uid;

      return {
        id: partida.id,
        result: venceu ? 'win' : 'loss',
        opponent: ehPlayer1 ? 'Oponente' : 'Oponente', // TODO: buscar nickname real
        date: new Date(partida.created_at).toLocaleDateString('pt-BR'),
        duration: partida.duracao || 'N/A',
        deck: 'Deck Padrão' // TODO: implementar sistema de decks
      };
    });

    // Buscar conquistas do jogador (se existir tabela)
    const { data: conquistas } = await supabase
      .from('player_achievements')
      .select('achievement_id, unlocked_at, progress')
      .eq('player_id', uid)
      .limit(20);

    const conquistasList = (conquistas || []).map(c => ({
      id: c.achievement_id,
      completed: Boolean(c.unlocked_at),
      date: c.unlocked_at ? new Date(c.unlocked_at).toLocaleDateString('pt-BR') : null,
      progress: c.progress || 0
    }));

    // Buscar cartas favoritas (mais usadas)
    const { data: cartasFavoritas } = await supabase
      .from('player_card_stats')
      .select('card_id, times_played, wins, cards(nome, raridade)')
      .eq('player_id', uid)
      .order('times_played', { ascending: false })
      .limit(5);

    const cartasList = (cartasFavoritas || []).map(c => ({
      id: c.card_id,
      name: c.cards?.nome || 'Carta Desconhecida',
      category: c.cards?.raridade || 'comum',
      timesPlayed: c.times_played || 0,
      winRate: c.times_played > 0 ? Math.round((c.wins / c.times_played) * 100) : 0
    }));

    return NextResponse.json({
      wins: jogador.wins || 0,
      losses: jogador.losses || 0,
      totalGames,
      winRate,
      currentStreak: jogador.current_streak || 0,
      bestStreak: jogador.best_streak || 0,
      recentMatches: partidasRecentes,
      achievements: conquistasList,
      favoriteCards: cartasList
    });

  } catch (error) {
    console.error('[Players Stats API] Erro:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

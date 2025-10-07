// src/app/api/boosters/route.js
import { NextResponse } from 'next/server';
import { requireSupabaseAdmin } from '@/lib/supabase';
import { 
  abrirBooster, 
  BOOSTER_CONFIG
} from '@/utils/boosterSystem';

/**
 * GET - Obter histórico de pulls e pity counters do jogador
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('playerId');

    if (!playerId) {
      return NextResponse.json({ error: 'Player ID obrigatório' }, { status: 400 });
    }

    const supabase = await requireSupabaseAdmin();

    // Buscar saldo em players.coins
    const { data: playerRow } = await supabase
      .from('players')
      .select('coins')
      .eq('id', playerId)
      .maybeSingle();

    return NextResponse.json({
      pullHistory: formatarHistoricoSemHistorico(playerRow?.coins ?? 0),
    });
  } catch (error) {
    console.error('[Boosters API] Erro inesperado:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

/**
 * POST - Abrir booster ou comprar booster
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { playerId, acao, tamanhoBooster, boosters, moedas } = body;

    if (!playerId || !acao) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    const supabase = await requireSupabaseAdmin();

    // Fluxo simplificado: sem player_pull_history
    if (acao === 'COMPRAR' || acao === 'BUY_OPEN') {
      return await comprarEAbrir(supabase, playerId, tamanhoBooster);
    }

    if (acao === 'ABRIR') {
      return NextResponse.json({ error: 'Sem estoque de boosters. Use BUY_OPEN.' }, { status: 400 });
    }

    if (acao === 'RECOMPENSAR_QUIZ') {
      return await recompensarQuizSimples(supabase, playerId, boosters, moedas);
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
  } catch (error) {
    console.error('[Boosters API] Erro inesperado:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

/**
 * Comprar booster com moedas
 */
async function comprarEAbrir(supabase, playerId, tamanhoBooster) {
  const preco = BOOSTER_CONFIG.PRECOS[tamanhoBooster];

  if (!preco) {
    return NextResponse.json({ error: 'Tamanho de booster inválido' }, { status: 400 });
  }

  // Ler saldo atual em players.coins
  const { data: playerRow, error: playerError } = await supabase
    .from('players')
    .select('coins')
    .eq('id', playerId)
    .single();

  if (playerError) {
    console.error('[Boosters API] Erro ao buscar saldo do jogador:', playerError);
    return NextResponse.json({ error: 'Erro ao validar saldo' }, { status: 500 });
  }

  const saldoAtual = Number(playerRow?.coins || 0);
  if (saldoAtual < preco) {
    return NextResponse.json({ error: 'Moedas insuficientes' }, { status: 400 });
  }

  // 1) Debitar coins do jogador
  const { data: saldoAtualizado, error: debitError } = await supabase
    .from('players')
    .update({ coins: saldoAtual - preco })
    .eq('id', playerId)
    .select('coins')
    .single();

  if (debitError) {
    console.error('[Boosters API] Erro ao debitar moedas:', debitError);
    return NextResponse.json({ error: 'Erro ao processar compra' }, { status: 500 });
  }

  // 2) Abrir imediatamente o booster (sem histórico/pity persistidos)
  const resultado = await abrirBoosterComCartas(supabase, tamanhoBooster, { epico: 0, lendario: 0, mitico: 0 });

  return NextResponse.json({
    sucesso: true,
    cartas: resultado.cartas,
    estatisticas: resultado.estatisticas,
    pullHistory: formatarHistoricoSemHistorico(saldoAtualizado?.coins ?? saldoAtual - preco),
  });
}

/**
 * Recompensar jogador com boosters e moedas do quiz
 */
async function recompensarQuizSimples(supabase, playerId, boosters, moedas) {
  // 1) Somar moedas em players.coins (se houver)
  let novoSaldo = null;
  if (moedas && moedas > 0) {
    const { data: playerRow, error: playerError } = await supabase
      .from('players')
      .select('coins')
      .eq('id', playerId)
      .single();

    if (playerError) {
      console.error('[Boosters API] Erro ao buscar saldo do jogador (quiz):', playerError);
      return NextResponse.json({ error: 'Erro ao aplicar recompensa' }, { status: 500 });
    }

    const saldoAtual = Number(playerRow?.coins || 0);
    const { data: saldoAtualizado, error: updateCoinError } = await supabase
      .from('players')
      .update({ coins: saldoAtual + moedas })
      .eq('id', playerId)
      .select('coins')
      .single();

    if (updateCoinError) {
      console.error('[Boosters API] Erro ao creditar moedas (quiz):', updateCoinError);
      return NextResponse.json({ error: 'Erro ao aplicar recompensa' }, { status: 500 });
    }
    novoSaldo = saldoAtualizado?.coins ?? saldoAtual + moedas;
  }

  // Se não alterou coins, buscar para responder corretamente
  if (novoSaldo === null) {
    const { data: playerRow } = await supabase
      .from('players')
      .select('coins')
      .eq('id', playerId)
      .maybeSingle();
    novoSaldo = Number(playerRow?.coins || 0);
  }

  return NextResponse.json({
    sucesso: true,
    mensagem: 'Recompensas aplicadas com sucesso!',
    pullHistory: formatarHistoricoSemHistorico(novoSaldo),
  });
}

/**
 * Abrir booster
 */
async function abrirBoosterComCartas(supabase, tamanhoBooster, pityCounters) {
  const tamanho = BOOSTER_CONFIG.TAMANHOS[tamanhoBooster];
  if (!tamanho) throw new Error('Tamanho de booster inválido');

  const [cardsResponse, itemCardsResponse] = await Promise.all([
    supabase.from('cards').select('*'),
    supabase.from('item_cards').select('*'),
  ]);

  const cartasDisponiveis = [
    ...(cardsResponse.data || []),
    ...(itemCardsResponse.data || []),
  ];
  if (cartasDisponiveis.length === 0) {
    throw new Error('Nenhuma carta disponível');
  }

  return abrirBooster(tamanho, cartasDisponiveis, pityCounters || { epico: 0, lendario: 0, mitico: 0 });
}

/**
 * Formatar histórico para resposta
 */
function formatarHistoricoSemHistorico(moedas = 0) {
  return {
    pityCounters: { epico: 0, lendario: 0, mitico: 0 },
    total: 0,
    porRaridade: { COMUM: 0, INCOMUM: 0, RARO: 0, EPICO: 0, LENDARIO: 0, MITICO: 0 },
    moedas,
    boostersDisponiveis: 0,
  };
}

// src/app/api/boosters/route.js
import { NextResponse } from 'next/server';
import { requireSupabaseAdmin } from '@/lib/supabase';
import { 
  abrirBooster, 
  atualizarPityCounters, 
  BOOSTER_CONFIG,
  podeComprarBooster 
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

    // Buscar histórico do jogador
    const { data: historico, error } = await supabase
      .from('player_pull_history')
      .select('*')
      .eq('player_id', playerId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[Boosters API] Erro ao buscar histórico:', error);
      return NextResponse.json({ error: 'Erro ao buscar histórico' }, { status: 500 });
    }

    // Se não existe, criar histórico inicial
    if (!historico) {
      const { data: novoHistorico, error: createError } = await supabase
        .from('player_pull_history')
        .insert({
          player_id: playerId,
          moedas: 500,
          boosters_disponiveis: 0,
        })
        .select()
        .single();

      if (createError) {
        console.error('[Boosters API] Erro ao criar histórico:', createError);
        return NextResponse.json({ error: 'Erro ao criar histórico' }, { status: 500 });
      }

      return NextResponse.json({
        pullHistory: formatarHistorico(novoHistorico),
      });
    }

    return NextResponse.json({
      pullHistory: formatarHistorico(historico),
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

    // Buscar histórico atual
    const { data: historico, error: fetchError } = await supabase
      .from('player_pull_history')
      .select('*')
      .eq('player_id', playerId)
      .single();

    if (fetchError) {
      console.error('[Boosters API] Erro ao buscar histórico:', fetchError);
      return NextResponse.json({ error: 'Jogador não encontrado' }, { status: 404 });
    }

    if (acao === 'COMPRAR') {
      return await comprarBooster(supabase, playerId, historico, tamanhoBooster);
    }

    if (acao === 'ABRIR') {
      return await abrirBoosterAction(supabase, playerId, historico, tamanhoBooster);
    }

    if (acao === 'RECOMPENSAR_QUIZ') {
      return await recompensarQuiz(supabase, playerId, historico, boosters, moedas);
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
async function comprarBooster(supabase, playerId, historico, tamanhoBooster) {
  const preco = BOOSTER_CONFIG.PRECOS[tamanhoBooster];

  if (!preco) {
    return NextResponse.json({ error: 'Tamanho de booster inválido' }, { status: 400 });
  }

  if (historico.moedas < preco) {
    return NextResponse.json({ error: 'Moedas insuficientes' }, { status: 400 });
  }

  // Deduzir moedas e adicionar booster
  const { data: atualizado, error } = await supabase
    .from('player_pull_history')
    .update({
      moedas: historico.moedas - preco,
      boosters_disponiveis: historico.boosters_disponiveis + 1,
    })
    .eq('player_id', playerId)
    .select()
    .single();

  if (error) {
    console.error('[Boosters API] Erro ao comprar booster:', error);
    return NextResponse.json({ error: 'Erro ao processar compra' }, { status: 500 });
  }

  return NextResponse.json({
    sucesso: true,
    mensagem: `Booster ${tamanhoBooster} comprado com sucesso!`,
    pullHistory: formatarHistorico(atualizado),
  });
}

/**
 * Recompensar jogador com boosters e moedas do quiz
 */
async function recompensarQuiz(supabase, playerId, historico, boosters, moedas) {
  const { data: atualizado, error } = await supabase
    .from('player_pull_history')
    .update({
      moedas: historico.moedas + (moedas || 0),
      boosters_disponiveis: historico.boosters_disponiveis + (boosters || 0),
    })
    .eq('player_id', playerId)
    .select()
    .single();

  if (error) {
    console.error('[Boosters API] Erro ao recompensar quiz:', error);
    return NextResponse.json({ error: 'Erro ao processar recompensa' }, { status: 500 });
  }

  return NextResponse.json({
    sucesso: true,
    mensagem: 'Recompensas aplicadas com sucesso!',
    pullHistory: formatarHistorico(atualizado),
  });
}

/**
 * Abrir booster
 */
async function abrirBoosterAction(supabase, playerId, historico, tamanhoBooster) {
  const tamanho = BOOSTER_CONFIG.TAMANHOS[tamanhoBooster];

  if (!tamanho) {
    return NextResponse.json({ error: 'Tamanho de booster inválido' }, { status: 400 });
  }

  if (historico.boosters_disponiveis < 1) {
    return NextResponse.json({ error: 'Nenhum booster disponível' }, { status: 400 });
  }

  // Buscar todas as cartas disponíveis
  const [cardsResponse, itemCardsResponse] = await Promise.all([
    supabase.from('cards').select('*'),
    supabase.from('item_cards').select('*'),
  ]);

  const cartasDisponiveis = [
    ...(cardsResponse.data || []),
    ...(itemCardsResponse.data || []),
  ];

  if (cartasDisponiveis.length === 0) {
    return NextResponse.json({ error: 'Nenhuma carta disponível' }, { status: 500 });
  }

  // Abrir booster usando o sistema
  const pityCounters = {
    epico: historico.pity_epico,
    lendario: historico.pity_lendario,
    mitico: historico.pity_mitico,
  };

  const resultado = abrirBooster(tamanho, cartasDisponiveis, pityCounters);

  // Atualizar histórico no banco
  const novoHistorico = {
    pity_epico: resultado.novoPityCounter.epico,
    pity_lendario: resultado.novoPityCounter.lendario,
    pity_mitico: resultado.novoPityCounter.mitico,
    total_pulls: historico.total_pulls + tamanho,
    pulls_comum: historico.pulls_comum + resultado.estatisticas.COMUM,
    pulls_incomum: historico.pulls_incomum + resultado.estatisticas.INCOMUM,
    pulls_raro: historico.pulls_raro + resultado.estatisticas.RARO,
    pulls_epico: historico.pulls_epico + resultado.estatisticas.EPICO,
    pulls_lendario: historico.pulls_lendario + resultado.estatisticas.LENDARIO,
    pulls_mitico: historico.pulls_mitico + resultado.estatisticas.MITICO,
    boosters_disponiveis: historico.boosters_disponiveis - 1,
  };

  const { data: atualizado, error: updateError } = await supabase
    .from('player_pull_history')
    .update(novoHistorico)
    .eq('player_id', playerId)
    .select()
    .single();

  if (updateError) {
    console.error('[Boosters API] Erro ao atualizar histórico:', updateError);
    return NextResponse.json({ error: 'Erro ao processar booster' }, { status: 500 });
  }

  // Registrar pulls individuais
  const registros = resultado.cartas.map((carta) => ({
    player_id: playerId,
    card_id: carta.id,
    raridade: carta.raridadeSorteada,
    booster_type: tamanhoBooster,
    pity_counter_at_pull: pityCounters.lendario,
  }));

  await supabase.from('pull_records').insert(registros);

  // Adicionar cartas à coleção do jogador
  const { data: colecao } = await supabase
    .from('collections')
    .select('cards')
    .eq('uid', playerId)
    .single();

  if (colecao) {
    const cartasAtuais = colecao.cards || [];
    const novasCartasIds = resultado.cartas.map((c) => c.id);
    const cartasAtualizadas = [...new Set([...cartasAtuais, ...novasCartasIds])];

    await supabase
      .from('collections')
      .update({ cards: cartasAtualizadas })
      .eq('uid', playerId);
  }

  return NextResponse.json({
    sucesso: true,
    cartas: resultado.cartas,
    estatisticas: resultado.estatisticas,
    pullHistory: formatarHistorico(atualizado),
  });
}

/**
 * Formatar histórico para resposta
 */
function formatarHistorico(historico) {
  return {
    pityCounters: {
      epico: historico.pity_epico,
      lendario: historico.pity_lendario,
      mitico: historico.pity_mitico,
    },
    total: historico.total_pulls,
    porRaridade: {
      COMUM: historico.pulls_comum,
      INCOMUM: historico.pulls_incomum,
      RARO: historico.pulls_raro,
      EPICO: historico.pulls_epico,
      LENDARIO: historico.pulls_lendario,
      MITICO: historico.pulls_mitico,
    },
    moedas: historico.moedas,
    boostersDisponiveis: historico.boosters_disponiveis,
  };
}

// api de boosters - compra, abertura e gerenciamento
import { NextResponse } from "next/server";
import { requireSupabaseAdmin } from "@/lib/supabase";
import { abrirBooster, BOOSTER_CONFIG } from "@/utils/boosterSystem";

export async function GET(req) {
  try {
    const supabase = requireSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const playerId = searchParams.get("playerId");
    
    if (!playerId) {
      return NextResponse.json(
        { error: "playerId é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar dados do jogador
    const { data: player, error: playerError } = await supabase
      .from("players")
      .select("coins")
      .eq("id", playerId)
      .maybeSingle();

    if (playerError) {
      console.error("[Boosters GET] Erro ao buscar player:", playerError);
      throw playerError;
    }
    
    if (!player) {
      return NextResponse.json(
        { error: "Jogador não encontrado" },
        { status: 404 }
      );
    }

    // Buscar ou criar dados de boosters
    let { data: boosterData, error: boosterError } = await supabase
      .from("player_boosters")
      .select("*")
      .eq("player_id", playerId)
      .maybeSingle();

    if (boosterError) {
      console.error("[Boosters GET] Erro ao buscar player_boosters:", boosterError);
      console.error("[Boosters GET] Detalhes do erro:", JSON.stringify(boosterError, null, 2));
      
      // Se a tabela não existir ou houver erro de permissão, retornar valores padrão
      if (boosterError.code === '42P01' || boosterError.code === 'PGRST116') {
        console.error("[Boosters GET] Tabela player_boosters não encontrada ou sem permissões");
        return NextResponse.json({
          coins: player.coins || 0,
          boostersDisponiveis: 0,
          boosterInicialAberto: false,
          pityMitico: 0,
          aviso: "Sistema de boosters em configuração. Execute o SQL de criação da tabela."
        });
      }
      
      throw boosterError;
    }

    // Se não existe, criar registro inicial
    if (!boosterData) {
      console.log("[Boosters GET] Criando registro inicial para player:", playerId);
      const { data: newBoosterData, error: insertError } = await supabase
        .from("player_boosters")
        .insert({
          player_id: playerId,
          boosters_disponiveis: 0,
          booster_inicial_aberto: false,
          pity_mitico: 0,
        })
        .select()
        .single();

      if (insertError) {
        console.error("[Boosters GET] Erro ao criar registro:", insertError);
        console.error("[Boosters GET] Detalhes:", JSON.stringify(insertError, null, 2));
        throw insertError;
      }
      boosterData = newBoosterData;
    }

    return NextResponse.json({
      coins: player.coins || 0,
      boostersDisponiveis: boosterData.boosters_disponiveis || 0,
      boosterInicialAberto: boosterData.booster_inicial_aberto || false,
      pityMitico: boosterData.pity_mitico || 0,
    });
  } catch (error) {
    console.error("[Boosters GET] Erro:", error);
    console.error("[Boosters GET] Stack:", error.stack);
    return NextResponse.json({ 
      error: "Erro no servidor", 
      detalhes: error.message 
    }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const supabase = requireSupabaseAdmin();
    const body = await req.json();
    const { playerId, acao } = body;

    if (!playerId || !acao) {
      return NextResponse.json(
        { error: "playerId e acao são obrigatórios" },
        { status: 400 }
      );
    }

    // AÇÃO: Comprar booster
    if (acao === "comprar") {
      return await comprarBooster(supabase, playerId);
    }

    // AÇÃO: Abrir booster
    if (acao === "abrir") {
      const { boosterInicial } = body;
      return await abrirBoosterHandler(supabase, playerId, boosterInicial);
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    console.error("[Boosters POST] Erro:", error);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}

// Handler para comprar booster
async function comprarBooster(supabase, playerId) {
  // 1. Verificar saldo do jogador
  const { data: player, error: playerError } = await supabase
    .from("players")
    .select("coins")
    .eq("id", playerId)
    .single();

  if (playerError || !player) {
    return NextResponse.json({ error: "Jogador não encontrado" }, { status: 404 });
  }

  if (player.coins < BOOSTER_CONFIG.PRECO_BOOSTER) {
    return NextResponse.json(
      { error: "Moedas insuficientes" },
      { status: 400 }
    );
  }

  // 2. Deduzir moedas e adicionar booster
  const { error: updatePlayerError } = await supabase
    .from("players")
    .update({ coins: player.coins - BOOSTER_CONFIG.PRECO_BOOSTER })
    .eq("id", playerId);

  if (updatePlayerError) throw updatePlayerError;

  // 3. Incrementar boosters disponíveis
  const { data: boosterData, error: boosterError } = await supabase
    .from("player_boosters")
    .select("boosters_disponiveis")
    .eq("player_id", playerId)
    .single();

  if (boosterError) throw boosterError;

  const { error: updateBoosterError } = await supabase
    .from("player_boosters")
    .update({
      boosters_disponiveis: (boosterData.boosters_disponiveis || 0) + 1,
    })
    .eq("player_id", playerId);

  if (updateBoosterError) throw updateBoosterError;

  return NextResponse.json({
    sucesso: true,
    novoSaldo: player.coins - BOOSTER_CONFIG.PRECO_BOOSTER,
    boostersDisponiveis: (boosterData.boosters_disponiveis || 0) + 1,
  });
}

// Handler para abrir booster
async function abrirBoosterHandler(supabase, playerId, boosterInicial = false) {
  // 1. Buscar dados do jogador
  const { data: boosterData, error: boosterError } = await supabase
    .from("player_boosters")
    .select("*")
    .eq("player_id", playerId)
    .single();

  if (boosterError || !boosterData) {
    return NextResponse.json({ error: "Dados de booster não encontrados" }, { status: 404 });
  }

  // 2. Verificar se é booster inicial
  if (boosterInicial) {
    if (boosterData.booster_inicial_aberto) {
      return NextResponse.json(
        { error: "Booster inicial já foi aberto" },
        { status: 400 }
      );
    }
  } else {
    // Verificar se tem boosters disponíveis
    if (boosterData.boosters_disponiveis < 1) {
      return NextResponse.json(
        { error: "Nenhum booster disponível" },
        { status: 400 }
      );
    }
  }

  // 3. Buscar cartas lendas e itens do banco
  const { data: cartasLendas, error: lendasError } = await supabase
    .from("cards")
    .select("*");

  if (lendasError) throw lendasError;

  const { data: cartasItens, error: itensError } = await supabase
    .from("item_cards")
    .select("*");

  if (itensError) throw itensError;

  // 4. Abrir booster usando o sistema
  const resultado = abrirBooster(
    cartasLendas || [],
    cartasItens || [],
    boosterData.pity_mitico || 0
  );

  // Log para debug - ver estrutura das cartas
  console.log("[Boosters] Cartas sorteadas:", resultado.cartas.map(c => ({
    nome: c.name || c.nome,
    tipo: c.tipo,
    images: c.images,
    raridade: c.raridadeSorteada
  })));

  // 5. Atualizar coleção do jogador (adicionar cartas - permitir repetidas)
  const { data: colecao, error: colecaoError } = await supabase
    .from("collections")
    .select("cards, item_cards")
    .eq("player_id", playerId)
    .maybeSingle();

  if (colecaoError) throw colecaoError;

  const cartasAtuais = colecao?.cards || [];
  const itensAtuais = colecao?.item_cards || [];

  // Adicionar cartas obtidas (permitindo duplicadas)
  resultado.cartas.forEach((carta) => {
    if (carta.tipo === 'lenda') {
      cartasAtuais.push({ id: carta.id, quantidade: 1 });
    } else {
      itensAtuais.push({ id: carta.id, quantidade: 1 });
    }
  });

  // Consolidar cartas repetidas (somar quantidades)
  const cartasConsolidadas = consolidarCartas(cartasAtuais);
  const itensConsolidados = consolidarCartas(itensAtuais);

  // Atualizar coleção
  const { error: updateColecaoError } = await supabase
    .from("collections")
    .upsert({
      player_id: playerId,
      cards: cartasConsolidadas,
      item_cards: itensConsolidados,
    });

  if (updateColecaoError) throw updateColecaoError;

  // 6. Atualizar dados de booster
  const updates = {
    pity_mitico: resultado.novoPityMitico,
    total_boosters_abertos: (boosterData.total_boosters_abertos || 0) + 1,
    total_cartas_obtidas: (boosterData.total_cartas_obtidas || 0) + BOOSTER_CONFIG.CARTAS_POR_BOOSTER,
  };

  if (boosterInicial) {
    updates.booster_inicial_aberto = true;
  } else {
    updates.boosters_disponiveis = boosterData.boosters_disponiveis - 1;
  }

  const { error: updateBoosterError } = await supabase
    .from("player_boosters")
    .update(updates)
    .eq("player_id", playerId);

  if (updateBoosterError) throw updateBoosterError;

  return NextResponse.json({
    sucesso: true,
    cartas: resultado.cartas,
    estatisticas: resultado.estatisticas,
    novoPityMitico: resultado.novoPityMitico,
    boostersRestantes: boosterInicial ? boosterData.boosters_disponiveis : boosterData.boosters_disponiveis - 1,
  });
}

// Função auxiliar para consolidar cartas repetidas
function consolidarCartas(cartas) {
  const mapa = new Map();
  
  cartas.forEach((item) => {
    const id = item.id;
    const quantidadeAtual = mapa.get(id) || 0;
    mapa.set(id, quantidadeAtual + (item.quantidade || 1));
  });

  return Array.from(mapa.entries()).map(([id, quantidade]) => ({
    id,
    quantidade,
  }));
}

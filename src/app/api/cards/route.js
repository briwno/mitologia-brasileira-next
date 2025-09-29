// src/app/api/cards/route.js
import { NextResponse } from 'next/server';
import { requireSupabaseAdmin } from '@/lib/supabase';

/**
 * Converte uma carta do banco para o formato da API
 */
function inferCardPlayCost(card) {
  if (!card) return null;
  const abilitySources = [
    card.abilities?.skill1?.cost,
    card.abilities?.basic?.cost,
    card.abilities?.principal?.cost,
    card.abilities?.ultimate?.cost,
  ];
  const fromAbility = abilitySources.find((value) => typeof value === 'number');
  if (typeof fromAbility === 'number') return fromAbility;
  if (typeof card.cost === 'number') return card.cost; // legado
  return null;
}

function formatCardForAPI(card) {
  // Extrair primeira habilidade para compatibilidade
  const firstSkill = card.abilities?.skill1 || {};
  const computedCost = inferCardPlayCost(card);

  return {
    id: card.id,
    name: card.name,
    region: card.region,
    category: card.category,
    attack: card.attack,
    defense: card.defense,
  life: card.health,
  cost: computedCost,
    ability: firstSkill.name || null,
    abilityDescription: firstSkill.description || null,
    rarity: card.rarity,
    history: card.lore,
    element: card.element,
    image: card.images?.retrato || card.images?.completa || `/images/cards/${card.id}.jpg`,
    images: card.images,
    tags: card.tags,
    cardType: card.card_type,
    abilities: card.abilities,
    unlockCondition: card.unlock_condition,
    seasonalBonus: card.seasonal_bonus,
    isStarter: card.is_starter,
    createdAt: card.created_at,
    updatedAt: card.updated_at
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    const category = searchParams.get('category');
    const rarity = searchParams.get('rarity');
    const element = searchParams.get('element');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit')) || null;
    const offset = parseInt(searchParams.get('offset')) || 0;

    const supabase = requireSupabaseAdmin();
    
    // Construir query
    let query = supabase.from('cards').select('*');
    
    // Aplicar filtros
    if (region && region !== 'all') {
      query = query.eq('region', region);
    }
    
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    
    if (rarity && rarity !== 'all') {
      query = query.eq('rarity', rarity);
    }
    
    if (element && element !== 'all') {
      query = query.eq('element', element);
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%, lore.ilike.%${search}%`);
    }
    
    // Paginação
    if (limit) {
      query = query.range(offset, offset + limit - 1);
    }
    
    // Ordenação
    query = query.order('name');
    
    const { data: cards, error } = await query;

    if (error) {
      console.error('[Cards API] Error fetching cards:', error);
      return NextResponse.json({ error: 'database_error' }, { status: 500 });
    }

    // Formatar cartas para a API
    const formattedCards = cards.map(formatCardForAPI);

    return NextResponse.json({
      cards: formattedCards,
      total: formattedCards.length
    });

  } catch (error) {
    console.error('Cards API error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST: create card OR unlock (legacy action)
export async function POST(request) {
  try {
    const payload = await request.json();
    const { action } = payload || {};
    const supabase = requireSupabaseAdmin();

    if (action === 'unlock') {
      const { cardId, userId } = payload;
      if (!cardId) return NextResponse.json({ error: 'cardId obrigatório' }, { status: 400 });
      const { data: card, error: cardError } = await supabase.from('cards').select('*').eq('id', cardId).single();
      if (cardError || !card) return NextResponse.json({ error: 'Carta não encontrada' }, { status: 404 });

      if (userId) {
        const { data: player, error: playerError } = await supabase.from('players').select('id').eq('id', userId).single();
        if (playerError || !player) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        const { data: collection, error: collectionError } = await supabase.from('collections').select('cards').eq('player_id', userId).single();
        if (collectionError && collectionError.code !== 'PGRST116') {
          console.error('[Cards API] Error fetching collection:', collectionError);
          return NextResponse.json({ error: 'database_error' }, { status: 500 });
        }
        const currentCards = collection?.cards || [];
        if (currentCards.includes(cardId)) {
          return NextResponse.json({ message: 'Carta já desbloqueada', card: formatCardForAPI(card) });
        }
        const newCards = [...currentCards, cardId];
        const { error: updateError } = await supabase.from('collections').upsert({ player_id: userId, cards: newCards }, { onConflict: 'player_id' });
        if (updateError) {
          console.error('[Cards API] Error updating collection:', updateError);
          return NextResponse.json({ error: 'database_error' }, { status: 500 });
        }
      }
      return NextResponse.json({ message: `Carta ${card.name} desbloqueada!`, card: formatCardForAPI(card) });
    }

    // Create card
    const required = ['id', 'name'];
    for (const f of required) if (!payload[f]) return NextResponse.json({ error: `Campo obrigatório: ${f}` }, { status: 400 });
    const insert = {
      id: payload.id,
      name: payload.name,
      region: payload.region || null,
      category: payload.category || null,
      attack: payload.attack ?? 0,
      defense: payload.defense ?? 0,
    health: payload.life ?? payload.health ?? 1,
      rarity: payload.rarity || 'comum',
      lore: payload.history || payload.lore || null,
      element: payload.element || null,
      images: payload.images || null,
      tags: payload.tags || [],
      card_type: payload.cardType || payload.card_type || null,
      abilities: payload.abilities || null,
      unlock_condition: payload.unlockCondition || null,
      seasonal_bonus: payload.seasonalBonus || null,
      is_starter: payload.isStarter ?? false
    };
    const { data, error } = await supabase.from('cards').insert(insert).select('*').single();
    if (error) {
      console.error('[Cards API] Error creating card:', error);
      return NextResponse.json({ error: 'database_error' }, { status: 500 });
    }
    return NextResponse.json({ card: formatCardForAPI(data) }, { status: 201 });
  } catch (error) {
    console.error('Cards POST error:', error);
    return NextResponse.json({ error: 'Erro ao criar carta' }, { status: 500 });
  }
}

// PUT: update card by id
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body || {};
    if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 });
    const supabase = requireSupabaseAdmin();
    if (updates.life && !updates.health) updates.health = updates.life; // alias
    if (updates.history && !updates.lore) updates.lore = updates.history;
  const map = { life: 'health', history: 'lore', cardType: 'card_type', unlockCondition: 'unlock_condition', seasonalBonus: 'seasonal_bonus', isStarter: 'is_starter' };
    const dbUpdates = {};
    for (const k of Object.keys(updates)) {
      if (k === 'cost') continue; // coluna removida
      const target = map[k] || k;
      dbUpdates[target] = updates[k];
    }
    const { data, error } = await supabase.from('cards').update(dbUpdates).eq('id', id).select('*').single();
    if (error) return NextResponse.json({ error: 'Carta não encontrada ou erro ao atualizar' }, { status: 400 });
    return NextResponse.json({ card: formatCardForAPI(data) });
  } catch (e) {
    console.error('Cards PUT error', e);
    return NextResponse.json({ error: 'Erro ao atualizar carta' }, { status: 500 });
  }
}

// DELETE: delete card by id
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 });
    const supabase = requireSupabaseAdmin();
    const { error } = await supabase.from('cards').delete().eq('id', id);
    if (error) {
      console.error('[Cards API] Error deleting card:', error);
      return NextResponse.json({ error: 'database_error' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Cards DELETE error', e);
    return NextResponse.json({ error: 'Erro ao deletar carta' }, { status: 500 });
  }
}

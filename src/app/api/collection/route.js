// src/app/api/collection/route.js
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSupabaseAdmin } from '@/lib/supabase';

// ATUALIZADO: Removido itemCards (sistema de itens desativado)
const UpsertSchema = z.object({
  playerId: z.string().uuid(),
  cards: z.array(z.string().min(1)).default([]),
  // itemCards: z.array(z.string().min(1)).default([]), // REMOVIDO
});

export async function GET(req) {
  console.log('[Collection API] GET request received');
  try {
    const { searchParams } = new URL(req.url);
    const playerId = searchParams.get('playerId');
    console.log('[Collection API] playerId parameter:', playerId);
    
    if (!playerId) {
      console.log('[Collection API] Missing playerId parameter');
      return NextResponse.json({ error: 'playerId required' }, { status: 400 });
    }

    const supabase = requireSupabaseAdmin();
    console.log('[Collection API] Supabase admin client obtained');
    console.log('[Collection API] Querying collections table for playerId:', playerId);

    const { data: row, error } = await supabase
      .from('collections')
      .select('cards') // ATUALIZADO: Removido item_cards
      .eq('player_id', playerId)
      .maybeSingle();
      
    if (error && error.code !== 'PGRST116') {
      console.error('[Collection API] Error querying collections:', error);
      return NextResponse.json({ error: 'database_error', details: error.message }, { status: 500 });
    }

    console.log('[Collection API] Collection data:', row);

    // Novo formato: [{ id: 'cur001', quantidade: 1 }, { id: 'boi001', quantidade: 2 }]
    // Extrair apenas IDs únicos (quantidade é para inventário, não deck)
    // Filtrar objetos inválidos sem 'id'
    let cards = row?.cards || [];
    if (Array.isArray(cards) && cards.length > 0) {
      if (typeof cards[0] === 'object') {
        // Filtrar apenas objetos válidos com 'id' e extrair IDs únicos
        cards = cards
          .filter(c => c && c.id) // Remove objetos sem ID
          .map(c => c.id);
        cards = [...new Set(cards)]; // Remove duplicatas
      } else if (typeof cards[0] === 'string') {
        cards = [...new Set(cards)]; // Já são strings, apenas remove duplicatas
      }
    }

    // REMOVIDO: Sistema de itens desativado
    // let itemCards = row?.item_cards || [];
    const itemCards = []; // Sempre retorna array vazio

    console.log('[Collection API] Returning response:', { cards: cards.length, itemCards: itemCards.length });
    return NextResponse.json({ cards, itemCards });
  } catch (e) {
    console.error('[Collection API] ERROR in GET:', e);
    return NextResponse.json({ error: 'internal', details: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const parsed = UpsertSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const supabase = requireSupabaseAdmin();

    const upsertData = { player_id: parsed.data.playerId, cards: parsed.data.cards };
    // REMOVIDO: Sistema de itens desativado
    // if (parsed.data.itemCards && parsed.data.itemCards.length > 0) {
    //   upsertData.item_cards = parsed.data.itemCards;
    // }
    
    const { data, error } = await supabase
      .from('collections')
      .upsert(upsertData, { onConflict: 'player_id' })
      .select('cards') // ATUALIZADO: Removido item_cards
      .single();
    if (error) {
      console.error('[Collection API] Error upserting collection (POST):', error);
      return NextResponse.json({ error: 'database_error' }, { status: 500 });
    }
    
    // Converter resposta para formato esperado, filtrando objetos inválidos
    let cards = data.cards || [];
    if (Array.isArray(cards) && cards.length > 0) {
      if (typeof cards[0] === 'object') {
        cards = cards
          .filter(c => c && c.id)
          .map(c => c.id);
        cards = [...new Set(cards)];
      }
    }
    
    // REMOVIDO: Sistema de itens desativado
    const itemCards = []; // Sempre retorna array vazio
    
    return NextResponse.json({ cards, itemCards, created: false });
  } catch (e) {
    console.error('[Collection API] Unexpected error in POST:', e);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { playerId, add, remove } = await req.json();
    // REMOVIDO: addItemCard, removeItemCard (sistema de itens desativado)
    if (!playerId) return NextResponse.json({ error: 'playerId required' }, { status: 400 });
    const supabase = requireSupabaseAdmin();

    const { data: existing, error: exErr } = await supabase.from('collections').select('*').eq('player_id', playerId).maybeSingle();
    if (exErr && exErr.code !== 'PGRST116') {
      console.error('[Collection API] Error querying collections (PATCH):', exErr);
      return NextResponse.json({ error: 'database_error' }, { status: 500 });
    }
    
    // Converter formato existente, filtrando objetos inválidos
    let nextCards = existing?.cards || [];
    if (Array.isArray(nextCards) && nextCards.length > 0) {
      if (typeof nextCards[0] === 'object') {
        nextCards = nextCards
          .filter(c => c && c.id)
          .map(c => c.id);
      }
    }

    // REMOVIDO: Sistema de itens desativado
    // let nextItemCards = existing?.item_cards || [];

    // Operações com cards normais
    if (add) {
      const set = new Set(nextCards);
      set.add(String(add));
      nextCards = Array.from(set);
    }
    if (remove) {
      nextCards = nextCards.filter((c) => c !== String(remove));
    }

    // REMOVIDO: Operações com item cards desativadas
    // if (addItemCard) { ... }
    // if (removeItemCard) { ... }

    const upsertData = { player_id: playerId, cards: nextCards };
    // REMOVIDO: item_cards não é mais inserido

    const { data, error } = await supabase
      .from('collections')
      .upsert(upsertData, { onConflict: 'player_id' })
      .select('cards') // ATUALIZADO: Removido item_cards
      .single();
    if (error) {
      console.error('[Collection API] Error upserting collection (PATCH):', error);
      return NextResponse.json({ error: 'database_error' }, { status: 500 });
    }
    
    // Converter resposta para formato esperado, filtrando objetos inválidos
    let cards = data.cards || [];
    if (Array.isArray(cards) && cards.length > 0) {
      if (typeof cards[0] === 'object') {
        cards = cards
          .filter(c => c && c.id)
          .map(c => c.id);
        cards = [...new Set(cards)];
      }
    }
    
    // REMOVIDO: Sistema de itens desativado
    const itemCards = []; // Sempre retorna array vazio
    
    return NextResponse.json({ cards, itemCards, created: !existing });
  } catch (e) {
    console.error('[Collection API] Unexpected error in PATCH:', e);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

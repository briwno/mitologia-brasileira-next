// src/app/api/collection/route.js
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSupabaseAdmin } from '@/lib/supabase';

const UpsertSchema = z.object({
  playerId: z.string().uuid(),
  cards: z.array(z.string().min(1)).default([]),
  itemCards: z.array(z.string().min(1)).default([]),
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
      .select('cards, item_cards')
      .eq('player_id', playerId)
      .maybeSingle();
      
    if (error && error.code !== 'PGRST116') {
      console.error('[Collection API] Error querying collections:', error);
      return NextResponse.json({ error: 'database_error', details: error.message }, { status: 500 });
    }

    console.log('[Collection API] Collection data:', row);

    // Converter formato: [{ id: 'cur001' }] -> ['cur001']
    let cards = row?.cards || [];
    if (Array.isArray(cards) && cards.length > 0 && typeof cards[0] === 'object' && cards[0].id) {
      cards = cards.map((c) => c.id);
    }

    let itemCards = row?.item_cards || [];
    if (Array.isArray(itemCards) && itemCards.length > 0 && typeof itemCards[0] === 'object' && itemCards[0].id) {
      itemCards = itemCards.map((c) => c.id);
    }

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
    if (parsed.data.itemCards && parsed.data.itemCards.length > 0) {
      upsertData.item_cards = parsed.data.itemCards;
    }
    
    const { data, error } = await supabase
      .from('collections')
      .upsert(upsertData, { onConflict: 'player_id' })
      .select('cards, item_cards')
      .single();
    if (error) {
      console.error('[Collection API] Error upserting collection (POST):', error);
      return NextResponse.json({ error: 'database_error' }, { status: 500 });
    }
    
    // Converter resposta para formato esperado
    let cards = data.cards || [];
    if (Array.isArray(cards) && cards.length > 0 && typeof cards[0] === 'object' && cards[0].id) {
      cards = cards.map((c) => c.id);
    }
    
    let itemCards = data.item_cards || [];
    if (Array.isArray(itemCards) && itemCards.length > 0 && typeof itemCards[0] === 'object' && itemCards[0].id) {
      itemCards = itemCards.map((c) => c.id);
    }
    
    return NextResponse.json({ cards, itemCards, created: false });
  } catch (e) {
    console.error('[Collection API] Unexpected error in POST:', e);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { playerId, add, remove, addItemCard, removeItemCard } = await req.json();
    if (!playerId) return NextResponse.json({ error: 'playerId required' }, { status: 400 });
    const supabase = requireSupabaseAdmin();

    const { data: existing, error: exErr } = await supabase.from('collections').select('*').eq('player_id', playerId).maybeSingle();
    if (exErr && exErr.code !== 'PGRST116') {
      console.error('[Collection API] Error querying collections (PATCH):', exErr);
      return NextResponse.json({ error: 'database_error' }, { status: 500 });
    }
    
    // Converter formato existente: [{ id: 'cur001' }] -> ['cur001']
    let nextCards = existing?.cards || [];
    if (Array.isArray(nextCards) && nextCards.length > 0 && typeof nextCards[0] === 'object' && nextCards[0].id) {
      nextCards = nextCards.map((c) => c.id);
    }

    let nextItemCards = existing?.item_cards || [];
    if (Array.isArray(nextItemCards) && nextItemCards.length > 0 && typeof nextItemCards[0] === 'object' && nextItemCards[0].id) {
      nextItemCards = nextItemCards.map((c) => c.id);
    }

    // Operações com cards normais
    if (add) {
      const set = new Set(nextCards);
      set.add(String(add));
      nextCards = Array.from(set);
    }
    if (remove) {
      nextCards = nextCards.filter((c) => c !== String(remove));
    }

    // Operações com item cards
    if (addItemCard) {
      const set = new Set(nextItemCards);
      set.add(String(addItemCard));
      nextItemCards = Array.from(set);
    }
    if (removeItemCard) {
      nextItemCards = nextItemCards.filter((c) => c !== String(removeItemCard));
    }

    const upsertData = { player_id: playerId, cards: nextCards };
    if (nextItemCards.length > 0 || existing?.item_cards) {
      upsertData.item_cards = nextItemCards;
    }

    const { data, error } = await supabase
      .from('collections')
      .upsert(upsertData, { onConflict: 'player_id' })
      .select('cards, item_cards')
      .single();
    if (error) {
      console.error('[Collection API] Error upserting collection (PATCH):', error);
      return NextResponse.json({ error: 'database_error' }, { status: 500 });
    }
    
    // Converter resposta para formato esperado
    let cards = data.cards || [];
    if (Array.isArray(cards) && cards.length > 0 && typeof cards[0] === 'object' && cards[0].id) {
      cards = cards.map((c) => c.id);
    }
    
    let itemCards = data.item_cards || [];
    if (Array.isArray(itemCards) && itemCards.length > 0 && typeof itemCards[0] === 'object' && itemCards[0].id) {
      itemCards = itemCards.map((c) => c.id);
    }
    
    return NextResponse.json({ cards, itemCards, created: !existing });
  } catch (e) {
    console.error('[Collection API] Unexpected error in PATCH:', e);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

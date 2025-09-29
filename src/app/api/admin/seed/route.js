// src/app/api/admin/seed/route.js
import { NextResponse } from 'next/server';
import { requireSupabaseAdmin } from '@/lib/supabase';

function isAuthorized(req) {
  const url = new URL(req.url);
  const qp = url.searchParams.get('token');
  const hp = req.headers.get('x-seed-token');
  const expected = process.env.ADMIN_SEED_TOKEN;
  if (expected) return qp === expected || hp === expected;
  // se não houver token configurado, permitir apenas em desenvolvimento
  return process.env.NODE_ENV !== 'production';
}

export async function POST(req) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const username = body.username || 'admin';
    const email = body.email || 'admin@example.com';
    const password = body.password || 'admin';

    const supabase = requireSupabaseAdmin();
    // procurar player por name ou uid
    let { data: row, error: e1 } = await supabase.from('players').select('*').eq('name', username).maybeSingle();
    if (e1 && e1.code !== 'PGRST116') {
      console.error('[Admin Seed API] Error querying player by name:', e1);
      return NextResponse.json({ error: 'database_error' }, { status: 500 });
    }
    if (!row) {
      const byUid = await supabase.from('players').select('*').eq('uid', email).maybeSingle();
      if (byUid.error && byUid.error.code !== 'PGRST116') {
        console.error('[Admin Seed API] Error querying player by uid:', byUid.error);
        return NextResponse.json({ error: 'database_error' }, { status: 500 });
      }
      row = byUid.data || null;
    }

    if (!row) {
      const ins = await supabase
        .from('players')
        .insert({ uid: email, name: username, password, avatar_url: null, level: 50, xp: 0 })
        .select('*')
        .single();
      if (ins.error) {
        console.error('[Admin Seed API] Error inserting player:', ins.error);
        return NextResponse.json({ error: 'database_error' }, { status: 500 });
      }
      row = ins.data;
    } else {
      const upd = await supabase
        .from('players')
        .update({ name: username, password })
        .eq('id', row.id)
        .select('*')
        .single();
      if (upd.error) {
        console.error('[Admin Seed API] Error updating player:', upd.error);
        return NextResponse.json({ error: 'database_error' }, { status: 500 });
      }
      row = upd.data || row;
    }

    // Buscar todas as cartas disponíveis no banco
    const { data: allCards, error: cardsError } = await supabase
      .from('cards')
      .select('id');
    if (cardsError) {
      console.error('[Admin Seed API] Error fetching cards:', cardsError);
      return NextResponse.json({ error: 'database_error' }, { status: 500 });
    }
    
    const allIds = (allCards || []).map((c) => c.id).filter(Boolean);

    // Buscar todos os item_cards disponíveis
    const { data: allItemCards, error: itemCardsError } = await supabase
      .from('item_cards')
      .select('id');
    if (itemCardsError) console.warn('Erro ao buscar item_cards:', itemCardsError);
    
    const allItemIds = (allItemCards || []).map((i) => i.id).filter(Boolean);

    // upsert coleção
    const upsertData = { player_id: row.id, cards: allIds };
    if (allItemIds.length > 0) {
      upsertData.item_cards = allItemIds;
    }
    
    const up = await supabase
      .from('collections')
      .upsert(upsertData, { onConflict: 'player_id' });
    if (up.error) {
      console.error('[Admin Seed API] Error upserting collection:', up.error);
      return NextResponse.json({ error: 'database_error' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, player: { id: row.id, username: row.name, email: row.uid }, totalCards: allIds.length, totalItemCards: allItemIds.length });
  } catch (e) {
    console.error('admin seed error', e);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

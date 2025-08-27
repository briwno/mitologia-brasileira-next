// src/app/api/admin/seed/route.js
import { NextResponse } from 'next/server';
import { requireSupabaseAdmin } from '@/lib/supabase';
import { bancoDeCartas } from '@/data/cardsDatabase';

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
    if (e1 && e1.code !== 'PGRST116') throw e1;
    if (!row) {
      const byUid = await supabase.from('players').select('*').eq('uid', email).maybeSingle();
      if (byUid.error && byUid.error.code !== 'PGRST116') throw byUid.error;
      row = byUid.data || null;
    }

    if (!row) {
      const ins = await supabase
        .from('players')
        .insert({ uid: email, name: username, password, avatar_url: null, level: 50, xp: 0 })
        .select('*')
        .single();
      if (ins.error) throw ins.error;
      row = ins.data;
    } else {
      const upd = await supabase
        .from('players')
        .update({ name: username, password })
        .eq('id', row.id)
        .select('*')
        .single();
      if (upd.error) throw upd.error;
      row = upd.data || row;
    }

  const allIds = bancoDeCartas.map((c) => c.id).filter(Boolean);

    // upsert coleção
    const up = await supabase
      .from('collections')
      .upsert({ player_id: row.id, cards: allIds }, { onConflict: 'player_id' });
    if (up.error) throw up.error;

    return NextResponse.json({ ok: true, player: { id: row.id, username: row.name, email: row.uid }, totalCards: allIds.length });
  } catch (e) {
    console.error('admin seed error', e);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

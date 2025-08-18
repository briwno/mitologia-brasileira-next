// src/app/api/collection/route.js
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSupabaseAdmin } from '@/lib/supabase';

const UpsertSchema = z.object({
  uid: z.string().min(1),
  cards: z.array(z.string().min(1)).default([]),
});

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');
    if (!uid) return NextResponse.json({ error: 'uid required' }, { status: 400 });

  const supabase = requireSupabaseAdmin();
  const { data: user, error: uerr } = await supabase.from('players').select('*').eq('uid', uid).maybeSingle();
  if (uerr) throw uerr;
  if (!user) return NextResponse.json({ error: 'player not found' }, { status: 404 });

  const { data: row, error } = await supabase.from('collections').select('cards').eq('player_id', user.id).maybeSingle();
  if (error && error.code !== 'PGRST116') throw error;
  return NextResponse.json({ cards: row?.cards || [] });
  } catch (e) {
    console.error('collection GET', e);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const parsed = UpsertSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const supabase = requireSupabaseAdmin();
    const { data: user, error: uerr } = await supabase.from('players').select('*').eq('uid', parsed.data.uid).maybeSingle();
    if (uerr) throw uerr;
    if (!user) return NextResponse.json({ error: 'player not found' }, { status: 404 });

    const { data, error } = await supabase
      .from('collections')
      .upsert({ player_id: user.id, cards: parsed.data.cards }, { onConflict: 'player_id' })
      .select('cards')
      .single();
    if (error) throw error;
    return NextResponse.json({ cards: data.cards, created: false });
  } catch (e) {
    console.error('collection POST', e);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { uid, add, remove } = await req.json();
    if (!uid) return NextResponse.json({ error: 'uid required' }, { status: 400 });
    const supabase = requireSupabaseAdmin();
    const { data: user, error: uerr } = await supabase.from('players').select('*').eq('uid', uid).maybeSingle();
    if (uerr) throw uerr;
    if (!user) return NextResponse.json({ error: 'player not found' }, { status: 404 });

    const { data: existing, error: exErr } = await supabase.from('collections').select('*').eq('player_id', user.id).maybeSingle();
    if (exErr && exErr.code !== 'PGRST116') throw exErr;
    let next = existing?.cards || [];

    if (add) {
      const set = new Set(next);
      set.add(String(add));
      next = Array.from(set);
    }
    if (remove) {
      next = next.filter((c) => c !== String(remove));
    }

    const { data, error } = await supabase
      .from('collections')
      .upsert({ player_id: user.id, cards: next }, { onConflict: 'player_id' })
      .select('cards')
      .single();
    if (error) throw error;
    return NextResponse.json({ cards: data.cards, created: !existing });
  } catch (e) {
    console.error('collection PATCH', e);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

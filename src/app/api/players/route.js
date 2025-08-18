// src/app/api/players/route.js
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSupabaseAdmin } from '@/lib/supabase';

const PlayerCreate = z.object({
  uid: z.string().min(1),
  name: z.string().min(1),
  avatarUrl: z.string().url().optional().or(z.literal('')),
});

const PlayerUpdate = z.object({
  name: z.string().min(1).optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  mmr: z.number().int().min(0).max(5000).optional(),
  banned: z.boolean().optional(),
});

export async function GET(req) {
  try {
    const supabase = requireSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');
    if (uid) {
      const { data: one, error } = await supabase.from('players').select('*').eq('uid', uid).maybeSingle();
      if (error) throw error;
      if (!one) return NextResponse.json({ error: 'not-found' }, { status: 404 });
      const player = { ...one, avatarUrl: one.avatar_url ?? null };
      delete player.avatar_url;
      return NextResponse.json({ player });
    }

    const { data: all, error } = await supabase.from('players').select('*');
    if (error) throw error;
    const mapped = (all || []).map((p) => {
      const obj = { ...p, avatarUrl: p.avatar_url ?? null };
      delete obj.avatar_url;
      return obj;
    });
    return NextResponse.json({ players: mapped });
  } catch (e) {
    console.error('players GET', e);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const parsed = PlayerCreate.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const supabase = requireSupabaseAdmin();
    const { data: exists, error: e1 } = await supabase.from('players').select('*').eq('uid', parsed.data.uid).maybeSingle();
    if (e1 && e1.code !== 'PGRST116') throw e1;
    if (exists) {
      const player = { ...exists, avatarUrl: exists.avatar_url ?? null };
      delete player.avatar_url;
      return NextResponse.json({ player, created: false });
    }

    const { data: inserted, error } = await supabase
      .from('players')
      .insert({ uid: parsed.data.uid, name: parsed.data.name, avatar_url: parsed.data.avatarUrl || null })
      .select('*')
      .single();
  if (error) throw error;
  const player = { ...inserted, avatarUrl: inserted.avatar_url ?? null };
  delete player.avatar_url;
  return NextResponse.json({ player, created: true });
  } catch (e) {
    console.error('players POST', e);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { uid, data } = await req.json();
    if (!uid) return NextResponse.json({ error: 'uid required' }, { status: 400 });
    const parsed = PlayerUpdate.safeParse(data);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const supabase = requireSupabaseAdmin();
    // Map field names to snake_case used in Supabase
    const updates = { ...parsed.data };
    if (Object.prototype.hasOwnProperty.call(updates, 'avatarUrl')) {
      updates.avatar_url = updates.avatarUrl || null;
      delete updates.avatarUrl;
    }
    const { data: res, error } = await supabase
      .from('players')
      .update(updates)
      .eq('uid', uid)
      .select('*')
      .single();
  if (error) throw error;
  const player = { ...res, avatarUrl: res.avatar_url ?? null };
  delete player.avatar_url;
  return NextResponse.json({ player });
  } catch (e) {
    console.error('players PUT', e);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

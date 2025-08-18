// src/app/api/decks/route.js
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSupabaseAdmin } from '@/lib/supabase';

const DeckCreate = z.object({
  ownerId: z.number().int(),
  name: z.string().min(1),
  cards: z.array(z.union([z.string(), z.number()])).min(1),
});

const DeckUpdate = z.object({
  name: z.string().min(1).optional(),
  cards: z.array(z.union([z.string(), z.number()])).min(1).optional(),
});

export async function GET(req) {
  try {
    const supabase = requireSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get('ownerId');
    if (ownerId) {
      const { data, error } = await supabase.from('decks').select('*').eq('owner_id', Number(ownerId));
      if (error) throw error;
      const mapped = (data || []).map((d) => ({ ...d, ownerId: d.owner_id }));
      mapped.forEach((m) => delete m.owner_id);
      return NextResponse.json({ decks: mapped });
    }
    const { data: all, error } = await supabase.from('decks').select('*');
    if (error) throw error;
    const mappedAll = (all || []).map((d) => ({ ...d, ownerId: d.owner_id }));
    mappedAll.forEach((m) => delete m.owner_id);
    return NextResponse.json({ decks: mappedAll });
  } catch (e) {
    console.error('decks GET', e);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const parsed = DeckCreate.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const supabase = requireSupabaseAdmin();
    const { data: inserted, error } = await supabase
      .from('decks')
      .insert({ owner_id: parsed.data.ownerId, name: parsed.data.name, cards: parsed.data.cards })
      .select('*')
      .single();
  if (error) throw error;
  const deck = { ...inserted, ownerId: inserted.owner_id };
  delete deck.owner_id;
  return NextResponse.json({ deck, created: true });
  } catch (e) {
    console.error('decks POST', e);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { id, data } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const parsed = DeckUpdate.safeParse(data);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const supabase = requireSupabaseAdmin();
    const { data: res, error } = await supabase
      .from('decks')
      .update(parsed.data)
      .eq('id', Number(id))
      .select('*')
      .single();
  if (error) throw error;
  const deck = { ...res, ownerId: res.owner_id };
  delete deck.owner_id;
  return NextResponse.json({ deck });
  } catch (e) {
    console.error('decks PUT', e);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
  const supabase = requireSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const { error } = await supabase.from('decks').delete().eq('id', Number(id));
  if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('decks DELETE', e);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

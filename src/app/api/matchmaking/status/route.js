import { NextResponse } from 'next/server';
import { requireSupabaseAdmin } from '@/lib/supabase';

export async function GET(req) {
  try {
  const supabase = requireSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    // log básico do request
    try {
      console.log('[matchmaking/status] GET', { url: req.url, query: Object.fromEntries(searchParams) });
    } catch (lerr) {
      console.log('[matchmaking/status] GET - log error', String(lerr));
    }
    const roomId = searchParams.get('roomId');

    if (!roomId) return NextResponse.json({ error: 'roomId é obrigatório' }, { status: 400 });

    const { data, error } = await supabase.from('matches').select('*').eq('room_id', roomId).maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: 'Sala não encontrada' }, { status: 404 });

    return NextResponse.json({ match: data });
  } catch (err) {
    console.error('Erro status:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

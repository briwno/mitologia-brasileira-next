import { kv } from '@vercel/kv';
import { createClient } from '@supabase/supabase-js';

function normalizeRoomCode(code) {
  return String(code || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8);
}

function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Variáveis de ambiente do Supabase ausentes.');
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomCode = normalizeRoomCode(searchParams.get('roomCode'));

    if (!roomCode) {
      return new Response('roomCode é obrigatório', { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { data: match, error } = await supabase
      .from('matches')
      .select('*')
      .eq('room_id', roomCode)
      .single();

    if (match && !error) {
      return Response.json({ status: 'ready', roomCode, match });
    }

    const key = `matchmaking:room:${roomCode}`;
    const lobby = (await kv.get(key)) || null;

    if (lobby?.playerA && !lobby?.playerB) {
      return Response.json({ status: 'waiting', roomCode, lobby });
    }

    return Response.json({ status: 'not_found', roomCode });
  } catch (err) {
    console.error('[matchmaking/status] error', err);
    return new Response('Erro interno', { status: 500 });
  }
}

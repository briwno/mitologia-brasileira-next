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

export async function POST(request) {
  try {
    const body = await request.json();
    const roomCode = normalizeRoomCode(body?.roomCode);
    const deckId = Number(body?.deckId);
    const playerId = body?.playerId;

    if (!roomCode) {
      return new Response('roomCode é obrigatório', { status: 400 });
    }
    if (!deckId) {
      return new Response('deckId é obrigatório', { status: 400 });
    }
    if (!playerId) {
      return new Response('playerId é obrigatório', { status: 400 });
    }

    const key = `matchmaking:room:${roomCode}`;
    let lobby = (await kv.get(key)) || null;

    // Se não existe lobby, este jogador vira playerA (espera)
    if (!lobby) {
      lobby = {
        roomCode,
        createdAt: Date.now(),
        playerA: { id: playerId, deckId },
        playerB: null,
      };
      await kv.set(key, lobby);
      await kv.expire(key, 600);
      return Response.json({
        status: 'waiting',
        roomCode,
        host: lobby.playerA,
        you: lobby.playerA,
      });
    }

    // Se já tem playerA igual ao atual, permaneça esperando (talvez atualizou deck)
    if (lobby.playerA && String(lobby.playerA.id) === String(playerId)) {
      lobby.playerA.deckId = deckId;
      await kv.set(key, lobby);
      await kv.expire(key, 600);
      return Response.json({
        status: 'waiting',
        roomCode,
        host: lobby.playerA,
        you: lobby.playerA,
      });
    }

    // Se já tem playerB, sala cheia
    if (lobby.playerB) {
      return new Response('Sala já está cheia', { status: 409 });
    }

    // Completar lobby e criar match
    lobby.playerB = { id: playerId, deckId };
    await kv.set(key, lobby);

    // Criar match no Supabase
    const supabase = getSupabaseServerClient();
    const initialState = {
      phase: 'init',
      roomCode,
      playerA: { id: lobby.playerA.id, deckId: lobby.playerA.deckId },
      playerB: { id: lobby.playerB.id, deckId: lobby.playerB.deckId },
    };

    const { data, error } = await supabase
      .from('matches')
      .insert({
        room_id: roomCode,
        status: 'active',
        version: 0,
        state: initialState,
        snapshot: null,
        duration_seconds: null,
        player_a_id: lobby.playerA.id,
        player_b_id: lobby.playerB.id,
        player_a_deck_id: lobby.playerA.deckId,
        player_b_deck_id: lobby.playerB.deckId,
      })
      .select('*')
      .single();

    if (error) {
      console.error('[matchmaking/join] supabase insert error', error);
      return new Response('Falha ao criar match no banco', { status: 500 });
    }

    // Limpar lobby
    await kv.del(key);

    return Response.json({
      status: 'ready',
      roomCode,
      match: data,
    });
  } catch (err) {
    console.error('[matchmaking/join] error', err);
    return new Response('Erro interno', { status: 500 });
  }
}

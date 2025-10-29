import { kv } from '@vercel/kv';

function normalizeRoomCode(code) {
  return String(code || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const roomCode = normalizeRoomCode(body?.roomCode);
    const deckId = body?.deckId;
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
    const existing = (await kv.get(key)) || null;

    if (existing?.playerA && existing?.playerB) {
      return new Response('Sala já está cheia', { status: 409 });
    }

    // Se já existe playerA diferente, apenas confirme waiting
    if (existing?.playerA && String(existing.playerA.id) !== String(playerId)) {
      await kv.expire(key, 600); // 10min TTL
      return Response.json({
        status: 'waiting',
        roomCode,
        host: existing.playerA,
        you: { id: playerId, deckId },
      });
    }

    // Registrar/atualizar playerA
    const lobby = {
      roomCode,
      createdAt: Date.now(),
      playerA: { id: playerId, deckId: Number(deckId) },
      playerB: existing?.playerB || null,
    };
    await kv.set(key, lobby);
    await kv.expire(key, 600); // 10min TTL

    return Response.json({
      status: 'waiting',
      roomCode,
      host: lobby.playerA,
      you: lobby.playerA,
    });
  } catch (err) {
    console.error('[matchmaking/init] error', err);
    return new Response('Erro interno', { status: 500 });
  }
}

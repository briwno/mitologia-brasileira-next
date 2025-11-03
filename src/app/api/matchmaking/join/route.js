import { NextResponse } from 'next/server';
import { requireSupabaseAdmin } from '@/lib/supabase';

export async function POST(req) {
  try {
    const supabase = requireSupabaseAdmin();
  const body = await req.json();
  // log básico do request
  try {
    console.log('[matchmaking/join] POST', { url: req.url, body });
  } catch (lerr) {
    console.log('[matchmaking/join] POST - log error', String(lerr));
  }
  const roomId = body?.roomId;
  const playerId = body?.playerId;
  const deckIdRaw = body?.deckId;
  const deckId = typeof deckIdRaw === 'string' && deckIdRaw.match(/^\d+$/) ? Number(deckIdRaw) : deckIdRaw;

  if (!roomId) return NextResponse.json({ error: 'roomId é obrigatório' }, { status: 400 });
  if (!playerId) return NextResponse.json({ error: 'playerId é obrigatório' }, { status: 400 });
  if (!deckId && deckId !== 0) return NextResponse.json({ error: 'deckId é obrigatório' }, { status: 400 });

    // buscar partida
    const { data: match, error: matchErr } = await supabase.from('matches').select('*').eq('room_id', roomId).maybeSingle();
    if (matchErr) return NextResponse.json({ error: matchErr.message }, { status: 500 });
    if (!match) return NextResponse.json({ error: 'Sala não encontrada' }, { status: 404 });

    // checar se já tem player_b
    if (match.player_b_id) return NextResponse.json({ error: 'Sala já possui adversário' }, { status: 409 });
    if (match.player_a_id === playerId) return NextResponse.json({ error: 'Mesmo player já está na sala' }, { status: 400 });

    // validar deck pertence ao player
    const deckRes = await supabase.from('decks').select('id, owner_id').eq('id', deckId).single();
    if (deckRes.error || !deckRes.data) {
      return NextResponse.json({ error: 'Deck não encontrado' }, { status: 404 });
    }
    if (deckRes.data.owner_id !== playerId) {
      return NextResponse.json({ error: 'Deck não pertence ao player' }, { status: 403 });
    }

    // atualiza a partida com player_b
    const newPlayers = Array.isArray(match.state?.players) ? [...match.state.players, playerId] : [match.player_a_id, playerId];
    const newState = { ...(match.state || {}), players: newPlayers };

    const { data, error } = await supabase
      .from('matches')
      .update({
        player_b_id: playerId,
        player_b_deck_id: deckId,
        state: newState,
        status: 'active', // Enum match_status: 'active', 'finished', 'cancelled'
        started_at: new Date().toISOString(),
        // Inicializar controle de turno quando player_b entrar
        current_player_id: match.player_a_id, // Player A sempre começa
        current_turn: 1
      })
      .eq('room_id', roomId)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ match: data });
  } catch (err) {
    console.error('Erro join:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { requireSupabaseAdmin } from '@/lib/supabase';

export async function POST(req) {
  try {
    const supabase = requireSupabaseAdmin();
  const body = await req.json();
  // log básico do request
  try {
    console.log('[matchmaking/create] POST', { url: req.url, body });
  } catch (lerr) {
    console.log('[matchmaking/create] POST - log error', String(lerr));
  }
  const playerId = body?.playerId;
  const deckIdRaw = body?.deckId;
  const deckId = typeof deckIdRaw === 'string' && deckIdRaw.match(/^\d+$/) ? Number(deckIdRaw) : deckIdRaw;

  if (!playerId) return NextResponse.json({ error: 'playerId é obrigatório' }, { status: 400 });
  if (!deckId && deckId !== 0) return NextResponse.json({ error: 'deckId é obrigatório' }, { status: 400 });

    // validar se o deck existe e pertence ao jogador
    const deckRes = await supabase.from('decks').select('id, owner_id').eq('id', deckId).single();
    if (deckRes.error || !deckRes.data) {
      return NextResponse.json({ error: 'Deck não encontrado' }, { status: 404 });
    }
    if (deckRes.data.owner_id !== playerId) {
      return NextResponse.json({ error: 'Deck não pertence ao player' }, { status: 403 });
    }

    // permite receber roomId desejado (por ex. quando cliente quer usar o código gerado)
    let roomId = body?.roomId;
    if (roomId) roomId = String(roomId).toUpperCase();

    // se fornecer roomId, checar disponibilidade
    if (roomId) {
      const { data: existing } = await supabase.from('matches').select('id').eq('room_id', roomId).maybeSingle();
      if (existing) {
        return NextResponse.json({ error: 'Código de sala já em uso' }, { status: 409 });
      }
    }

    // gera roomId único (tenta algumas vezes se houver colisão ou se roomId não fornecido)
    if (!roomId) {
      for (let i = 0; i < 5; i++) {
        const candidate = Math.random().toString(36).substring(2, 8).toUpperCase();
        const { data: existing } = await supabase.from('matches').select('id').eq('room_id', candidate).maybeSingle();
        if (!existing) { roomId = candidate; break; }
      }
      if (!roomId) return NextResponse.json({ error: 'Não foi possível gerar roomId' }, { status: 500 });
    }

    const initialState = { messages: [], players: [playerId], readyPlayers: [] };

    const { data, error } = await supabase
      .from('matches')
      .insert({
        room_id: roomId,
        state: initialState,
        player_a_id: playerId,
        player_a_deck_id: deckId,
        // player_b_deck_id é NOT NULL no schema atual; usar o mesmo deck como placeholder
        player_b_deck_id: deckId,
        // Inicializar campos de controle de turno
        current_player_id: null, // Será definido quando ambos jogadores entrarem
        current_turn: 1,
        status: 'active' // Enum match_status: 'active', 'finished', 'cancelled'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar sala:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log('✅ Sala criada:', roomId);
    return NextResponse.json({ roomId, match: data });
  } catch (error) {
    console.error('❌ Erro no endpoint create:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// src/app/api/match/route.js
import { NextResponse } from 'next/server';
import { requireSupabaseAdmin } from '@/lib/supabase';

// POST: criar partida (roomId, playerAId, playerBId, initialState)
export async function POST(req) {
  try {
    const { roomId, playerAId, playerBId, state } = await req.json();
    if (!roomId || !playerAId || !playerBId) {
      return NextResponse.json({ error: 'roomId, playerAId e playerBId são obrigatórios' }, { status: 400 });
    }

    const supabase = requireSupabaseAdmin();
    const initial = {
      roomId,
      players: state?.players || [
        { id: playerAId, hp: 20, hand: [], field: [], bench: [], pp: {}, status: {} },
        { id: playerBId, hp: 20, hand: [], field: [], bench: [], pp: {}, status: {} },
      ],
      turn: 1,
      current: 0,
      phase: 'main',
      version: 0,
      status: 'active',
    };

    const { error } = await supabase.from('matches').insert({
      room_id: roomId,
      player_a_id: Number(playerAId),
      player_b_id: Number(playerBId),
      status: 'active',
      version: 0,
      state: initial,
    });
    if (error) {
      console.error('[Match API] Error creating match:', error);
      return NextResponse.json({ error: 'database_error' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, state: initial });
  } catch (err) {
    console.error('match POST error', err);
    return NextResponse.json({ error: 'Erro ao criar partida' }, { status: 500 });
  }
}

// GET: obter estado atual (roomId)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');
    if (!roomId) return NextResponse.json({ error: 'roomId é obrigatório' }, { status: 400 });

    const supabase = requireSupabaseAdmin();
    const { data, error } = await supabase.from('matches').select('state').eq('room_id', roomId).maybeSingle();
    if (error) {
      console.error('[Match API] Error fetching match state:', error);
      return NextResponse.json({ error: 'database_error' }, { status: 500 });
    }
    const state = data?.state;
    if (!state) return NextResponse.json({ error: 'Partida não encontrada' }, { status: 404 });
    return NextResponse.json({ state });
  } catch (err) {
    console.error('match GET error', err);
    return NextResponse.json({ error: 'Erro ao buscar estado' }, { status: 500 });
  }
}

// PATCH: aplicar atualização com controle de versão
export async function PATCH(req) {
  try {
    const { roomId, expectedVersion, patch } = await req.json();
    if (!roomId || typeof expectedVersion !== 'number' || !patch) {
      return NextResponse.json({ error: 'roomId, expectedVersion e patch são obrigatórios' }, { status: 400 });
    }

    const supabase = requireSupabaseAdmin();
    // obter estado atual e versão
    const { data: row, error: getErr } = await supabase
      .from('matches')
      .select('id, state, version, status')
      .eq('room_id', roomId)
      .maybeSingle();
    if (getErr) {
      console.error('[Match API] Error fetching match:', getErr);
      return NextResponse.json({ error: 'database_error' }, { status: 500 });
    }
    if (!row) return NextResponse.json({ error: 'Partida não encontrada' }, { status: 404 });

    const current = row.state || {};
    const currentVersion = row.version || 0;
    if (currentVersion !== expectedVersion) {
      return NextResponse.json({ error: 'Conflito de versão', state: current }, { status: 409 });
    }

    // aplicar patch
    const next = { ...current };
    if (patch.turn != null) next.turn = patch.turn;
    if (patch.current != null) next.current = patch.current;
    if (patch.phase) next.phase = patch.phase;
    if (patch.players) next.players = patch.players;
    if (patch.status) next.status = patch.status;
    next.version = currentVersion + 1;

    // atualizar atomically: checar versão no where
    const { data: updated, error: upErr } = await supabase
      .from('matches')
      .update({ state: next, version: next.version, status: next.status || row.status })
      .eq('room_id', roomId)
      .eq('version', currentVersion)
      .select('state, version, status')
      .maybeSingle();
    if (upErr) {
      console.error('[Match API] Error updating match:', upErr);
      return NextResponse.json({ error: 'database_error' }, { status: 500 });
    }
    if (!updated) {
      return NextResponse.json({ error: 'Conflito de versão', state: current }, { status: 409 });
    }

    // finalizar partida se status=finished
    if (next.status === 'finished') {
      await supabase
        .from('matches')
        .update({ finished_at: new Date(), snapshot: next })
        .eq('room_id', roomId);
    }

    return NextResponse.json({ ok: true, state: updated.state });
  } catch (err) {
    console.error('match PATCH error', err);
    return NextResponse.json({ error: 'Erro ao atualizar partida' }, { status: 500 });
  }
}

// DELETE: encerrar e limpar
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');
    if (!roomId) return NextResponse.json({ error: 'roomId é obrigatório' }, { status: 400 });

    const supabase = requireSupabaseAdmin();
    const { error } = await supabase
      .from('matches')
      .update({ status: 'canceled', finished_at: new Date() })
      .eq('room_id', roomId);
    if (error) {
      console.error('[Match API] Error deleting match:', error);
      return NextResponse.json({ error: 'database_error' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('match DELETE error', err);
    return NextResponse.json({ error: 'Erro ao excluir partida' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { requireSupabaseAdmin } from '@/lib/supabase';

export async function POST(req) {
  try {
    const supabase = requireSupabaseAdmin();
    const { playerId } = await req.json();

    if (!playerId) {
      return NextResponse.json({ error: 'playerId é obrigatório' }, { status: 400 });
    }

    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase(); // ex: 'A1B2C3'

    const { data, error } = await supabase
      .from('matches')
      .insert({
        room_id: roomId,
        state: { messages: [], players: [playerId], readyPlayers: [] }
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

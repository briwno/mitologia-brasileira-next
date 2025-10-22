import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(req) {
  const supabase = createClient();
  const { roomId, playerId } = await req.json();

  const { data, error } = await supabase
    .from('matches')
    .update({
      state: {
        players: [playerId], // em teste, sobrescreve só pra validar conexão
      }
    })
    .eq('room_id', roomId)
    .select()
    .single();

  if (error) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json({ match: data });
}

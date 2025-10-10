// src/app/api/players/route.js
// API simplificada para gerenciar dados dos jogadores
import { NextResponse } from 'next/server';
import { requireSupabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/players
 * Buscar jogadores
 * Query params:
 * - id: buscar por ID
 * - uid: buscar por UID
 * - username: buscar por username
 * - (sem params): listar top 100 por MMR
 */
export async function GET(req) {
  try {
    const supabase = requireSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    
    const id = searchParams.get('id');
    const uid = searchParams.get('uid');
    const username = searchParams.get('username');

    // Buscar por ID
    if (id) {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return NextResponse.json({ error: 'Jogador não encontrado' }, { status: 404 });
      
      return NextResponse.json({ player: data });
    }

    // Buscar por UID
    if (uid) {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('uid', uid)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return NextResponse.json({ error: 'Jogador não encontrado' }, { status: 404 });
      
      return NextResponse.json({ player: data });
    }

    // Buscar por username
    if (username) {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('username', username)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return NextResponse.json({ error: 'Jogador não encontrado' }, { status: 404 });
      
      return NextResponse.json({ player: data });
    }

    // Listar top players (ranking)
    const { data, error } = await supabase
      .from('players')
      .select('id, uid, username, avatar_url, level, xp, mmr, title, coins')
      .eq('banned', false)
      .order('mmr', { ascending: false })
      .order('level', { ascending: false })
      .order('xp', { ascending: false })
      .limit(100);

    if (error) throw error;

    return NextResponse.json({ players: data || [] });

  } catch (error) {
    console.error('[Players API] Erro GET:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

/**
 * PUT /api/players
 * Atualizar dados do jogador
 * Body: { playerId, data: { xp?, level?, coins?, mmr?, title?, avatar_url? } }
 */
export async function PUT(req) {
  try {
    const { playerId, data } = await req.json();

    if (!playerId) {
      return NextResponse.json({ error: 'ID do jogador obrigatório' }, { status: 400 });
    }

    if (!data || Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Dados para atualização obrigatórios' }, { status: 400 });
    }

    // Validar campos permitidos
    const allowedFields = ['xp', 'level', 'coins', 'mmr', 'title', 'avatar_url'];
    const updates = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key)) {
        updates[key] = value;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nenhum campo válido para atualizar' }, { status: 400 });
    }

    const supabase = requireSupabaseAdmin();

    const { data: updated, error } = await supabase
      .from('players')
      .update(updates)
      .eq('id', playerId)
      .select('*')
      .single();

    if (error) throw error;
    if (!updated) {
      return NextResponse.json({ error: 'Jogador não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      player: updated,
      updated: Object.keys(updates)
    });

  } catch (error) {
    console.error('[Players API] Erro PUT:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

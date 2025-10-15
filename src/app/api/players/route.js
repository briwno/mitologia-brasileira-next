// src/app/api/players/route.js
// API simplificada para gerenciar dados dos jogadores
import { NextResponse } from 'next/server';
import { requireSupabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/players
 * Buscar jogadores
 * Query params:
 * - id: buscar por ID (UUID)
 * - nickname: buscar por nickname
 * - (sem params): listar top 100 por MMR
 */
export async function GET(req) {
  try {
    const supabase = requireSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    
    const id = searchParams.get('id');
    const nickname = searchParams.get('nickname');

    // Buscar por ID (UUID)
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

    // Buscar por nickname
    if (nickname) {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('nickname', nickname)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return NextResponse.json({ error: 'Jogador não encontrado' }, { status: 404 });
      
      return NextResponse.json({ player: data });
    }

    // Listar top players (ranking)
    const { data, error } = await supabase
      .from('players')
      .select('id, nickname, avatar_url, level, xp, mmr, title, coins')
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
 * POST /api/players
 * Provisionar perfil de jogador após registro via Supabase Auth
 * Body: { id (UUID), nickname?, avatar_url? }
 */
export async function POST(req) {
  try {
    const { id, nickname, avatar_url } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'ID (UUID) do jogador obrigatório' }, { status: 400 });
    }

    const supabase = requireSupabaseAdmin();

    // Verificar se já existe
    const { data: existing } = await supabase
      .from('players')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Jogador já existe' }, { status: 409 });
    }

    // Criar novo perfil
    const newPlayer = {
      id,
      nickname: nickname || 'Jogador',
      avatar_url: avatar_url || '/images/avatars/default.png',
      level: 1,
      xp: 0,
      mmr: 1000,
      coins: 100,
      title: 'Aspirante',
      banned: false
    };

    const { data: created, error } = await supabase
      .from('players')
      .insert(newPlayer)
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      player: created 
    }, { status: 201 });

  } catch (error) {
    console.error('[Players API] Erro POST:', error);
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

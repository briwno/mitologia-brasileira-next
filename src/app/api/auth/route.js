// src/app/api/auth/route.js (DB-backed)
import { NextResponse } from 'next/server';
import { requireSupabaseAdmin } from '@/lib/supabase';

// Nota: este fluxo mantém a superfície atual do cliente (POST login/register)
// e usa players.uid como identificador (por agora, uid=email). Tokens são mockados.

export async function POST(request) {
  try {
  const { action, email, password, username } = await request.json();
  const supabase = requireSupabaseAdmin();

    if (!['login', 'register'].includes(action)) {
      return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
    }

    if (action === 'register') {
      const uid = String(email || '').trim().toLowerCase();
      if (!uid) return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 });
      if (!username) return NextResponse.json({ error: 'Username obrigatório' }, { status: 400 });
      if (!password) return NextResponse.json({ error: 'Senha obrigatória' }, { status: 400 });

      // Verificar se email já existe
      const { data: existsByEmail } = await supabase.from('players').select('id').eq('uid', uid).maybeSingle();
      if (existsByEmail) {
        return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 });
      }

      // Verificar se nome de usuário já existe
      const { data: existsByName } = await supabase.from('players').select('id').eq('name', username).maybeSingle();
      if (existsByName) {
        return NextResponse.json({ error: 'Nome de usuário já está em uso' }, { status: 400 });
      }

      const { data: inserted, error: insErr } = await supabase
        .from('players')
        .insert({ uid, name: username, password, avatar_url: null })
        .select('*')
        .single();
      if (insErr) throw insErr;
      const p = inserted;
      // seed coleção inicial simples
      await supabase
        .from('collections')
        .upsert({ player_id: p.id, cards: ['sac001', 'iar001', 'cur001'] }, { onConflict: 'player_id' });
      const token = `token_${p.id}_${Date.now()}`;
      return NextResponse.json({ user: { id: p.id, username: p.name, email: uid, level: p.level, xp: p.xp }, token });
    }

    if (action === 'login') {
      // Login por username + password
      if (!username) return NextResponse.json({ error: 'Username obrigatório' }, { status: 400 });
      if (!password) return NextResponse.json({ error: 'Senha obrigatória' }, { status: 400 });

      const { data: p, error } = await supabase.from('players').select('*').eq('name', username).maybeSingle();
      if (error) throw error;
      if (!p) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
      if (!p.password || p.password !== password) {
        return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
      }
      const token = `token_${p.id}_${Date.now()}`;
      return NextResponse.json({ user: { id: p.id, username: p.name, email: p.uid, level: p.level, xp: p.xp }, token });
    }
  } catch (error) {
    console.error('Auth error:', error);
    
    // Tratar erros específicos de constraint
    if (error.code === '23505') {
      if (error.message.includes('players_name_key') || error.message.includes('players_name_unique')) {
        return NextResponse.json({ error: 'Nome de usuário já está em uso' }, { status: 400 });
      }
      if (error.message.includes('players_uid_key') || error.message.includes('players_uid_unique')) {
        return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 });
      }
    }
    
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
  }
  const token = authHeader.substring(7);
  if (!token.startsWith('token_')) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }
  const userId = Number(token.split('_')[1]);
  if (!userId) return NextResponse.json({ error: 'Token inválido' }, { status: 401 });

  // buscar player por id
  try {
    const supabase = requireSupabaseAdmin();
    const { data: p, error } = await supabase.from('players').select('*').eq('id', userId).single();
    if (error) throw error;
    if (!p) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
  return NextResponse.json({ user: { id: p.id, username: p.name, email: p.uid, level: p.level, xp: p.xp } });
  } catch (e) {
    console.error('Auth GET error', e);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

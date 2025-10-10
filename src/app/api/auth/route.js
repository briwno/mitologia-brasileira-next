// src/app/api/auth/route.js
// API unificada de autenticação - Login, Registro e Validação
import { NextResponse } from 'next/server';
import { requireSupabaseAdmin } from '@/lib/supabase';

/**
 * Gera um UID único para novo jogador
 * Formato: timestamp (ms) + random (4 dígitos)
 * Exemplo: 1738425478123456
 */
function gerarUID() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${timestamp}${random}`;
}

/**
 * POST /api/auth
 * Ações: 'login' | 'register'
 */
export async function POST(request) {
  try {
    const { action, email, password, username } = await request.json();
    const supabase = requireSupabaseAdmin();

    if (!['login', 'register'].includes(action)) {
      return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
    }

    // === REGISTRO ===
    if (action === 'register') {
      if (!username?.trim()) {
        return NextResponse.json({ error: 'Nome de usuário obrigatório' }, { status: 400 });
      }
      if (!email?.trim()) {
        return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 });
      }
      if (!password) {
        return NextResponse.json({ error: 'Senha obrigatória' }, { status: 400 });
      }

      const emailLower = email.trim().toLowerCase();
      const usernameTrim = username.trim();

      // Verificar duplicatas
      const { data: existsEmail } = await supabase
        .from('players')
        .select('id')
        .eq('email', emailLower)
        .maybeSingle();

      if (existsEmail) {
        return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 });
      }

      const { data: existsUsername } = await supabase
        .from('players')
        .select('id')
        .eq('username', usernameTrim)
        .maybeSingle();

      if (existsUsername) {
        return NextResponse.json({ error: 'Nome de usuário já está em uso' }, { status: 400 });
      }

      // Gerar UID único
      const uid = gerarUID();

      // Inserir novo jogador
      const { data: player, error: insertError } = await supabase
        .from('players')
        .insert({
          uid,
          username: usernameTrim,
          email: emailLower,
          password, // nao vai ter hash
          avatar_url: 'https://img.icons8.com/color/96/user.png',
          mmr: 1000,
          level: 1,
          xp: 0,
          coins: 500,
          title: 'Iniciante',
          banned: false
        })
        .select('*')
        .single();

      if (insertError) {
        console.error('[Auth] Erro ao registrar:', insertError);
        return NextResponse.json({ error: 'Erro ao criar conta' }, { status: 500 });
      }

      // Criar coleção inicial
      await supabase
        .from('collections')
        .insert({ player_id: player.id, cards: ['sac001', 'iar001', 'cur001'] })
        .select()
        .single();

      // Gerar token
      const token = `token_${player.id}_${Date.now()}`;

      return NextResponse.json({
        user: {
          id: player.id,
          uid: player.uid,
          username: player.username,
          email: player.email,
          level: player.level,
          xp: player.xp,
          coins: player.coins,
          avatar_url: player.avatar_url,
          title: player.title
        },
        token
      });
    }

    // === LOGIN ===
    if (action === 'login') {
      if (!username?.trim()) {
        return NextResponse.json({ error: 'Nome de usuário obrigatório' }, { status: 400 });
      }
      if (!password) {
        return NextResponse.json({ error: 'Senha obrigatória' }, { status: 400 });
      }

      const usernameTrim = username.trim();

      // Buscar jogador
      const { data: player, error } = await supabase
        .from('players')
        .select('*')
        .eq('username', usernameTrim)
        .maybeSingle();

      if (error) {
        console.error('[Auth] Erro ao buscar jogador:', error);
        return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 });
      }

      if (!player) {
        return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
      }

      if (player.banned) {
        return NextResponse.json({ error: 'Conta banida' }, { status: 403 });
      }

      if (player.password !== password) {
        return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
      }

      // Atualizar último login
      await supabase
        .from('players')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', player.id);

      // Gerar token
      const token = `token_${player.id}_${Date.now()}`;

      return NextResponse.json({
        user: {
          id: player.id,
          uid: player.uid,
          username: player.username,
          email: player.email,
          level: player.level,
          xp: player.xp,
          coins: player.coins,
          avatar_url: player.avatar_url,
          title: player.title,
          mmr: player.mmr
        },
        token
      });
    }

  } catch (error) {
    console.error('[Auth] Erro:', error);

    // Tratar erros de constraint unique
    if (error.code === '23505') {
      if (error.message.includes('username')) {
        return NextResponse.json({ error: 'Nome de usuário já está em uso' }, { status: 400 });
      }
      if (error.message.includes('email')) {
        return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 });
      }
    }

    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

/**
 * GET /api/auth
 * Validar token e retornar dados do usuário
 * Header: Authorization: Bearer token_123_1234567890
 */
export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    if (!token.startsWith('token_')) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const userId = parseInt(token.split('_')[1]);

    if (!userId || isNaN(userId)) {
      return NextResponse.json({ error: 'Token malformado' }, { status: 401 });
    }

    const supabase = requireSupabaseAdmin();

    const { data: player, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('[Auth] Erro ao validar token:', error);
      return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 });
    }

    if (!player) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    if (player.banned) {
      return NextResponse.json({ error: 'Conta banida' }, { status: 403 });
    }

    return NextResponse.json({
      user: {
        id: player.id,
        uid: player.uid,
        username: player.username,
        email: player.email,
        level: player.level,
        xp: player.xp,
        coins: player.coins,
        avatar_url: player.avatar_url,
        title: player.title,
        mmr: player.mmr
      }
    });

  } catch (error) {
    console.error('[Auth] Erro GET:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

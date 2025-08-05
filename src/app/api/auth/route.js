// src/app/api/auth/route.js
import { NextResponse } from 'next/server';

// Mock database - em produção, use um banco real
const users = new Map();

export async function POST(request) {
  try {
    const { action, email, password, username } = await request.json();

    if (action === 'login') {
      const user = Array.from(users.values()).find(u => u.email === email);
      
      if (!user || user.password !== password) {
        return NextResponse.json(
          { error: 'Credenciais inválidas' },
          { status: 401 }
        );
      }

      // Em produção, use JWT tokens
      const token = `token_${user.id}_${Date.now()}`;
      
      return NextResponse.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          level: user.level,
          xp: user.xp
        },
        token
      });
    }

    if (action === 'register') {
      // Verificar se usuário já existe
      const existingUser = Array.from(users.values()).find(u => u.email === email);
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email já cadastrado' },
          { status: 400 }
        );
      }

      const userId = `user_${Date.now()}`;
      const newUser = {
        id: userId,
        username,
        email,
        password, // Em produção, hash a senha
        level: 1,
        xp: 0,
        createdAt: new Date().toISOString(),
        stats: {
          gamesPlayed: 0,
          wins: 0,
          losses: 0
        },
        collection: [],
        achievements: []
      };

      users.set(userId, newUser);

      const token = `token_${userId}_${Date.now()}`;

      return NextResponse.json({
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          level: newUser.level,
          xp: newUser.xp
        },
        token
      });
    }

    return NextResponse.json(
      { error: 'Ação inválida' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Token não fornecido' },
      { status: 401 }
    );
  }

  const token = authHeader.substring(7);
  
  // Em produção, validar JWT token
  if (!token.startsWith('token_')) {
    return NextResponse.json(
      { error: 'Token inválido' },
      { status: 401 }
    );
  }

  const userId = token.split('_')[1];
  const user = users.get(userId);

  if (!user) {
    return NextResponse.json(
      { error: 'Usuário não encontrado' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      level: user.level,
      xp: user.xp,
      stats: user.stats
    }
  });
}

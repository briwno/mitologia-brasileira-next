// src/app/api/user/route.js
import { NextResponse } from 'next/server';

// Mock data dos usuários
const users = new Map();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');

    if (action === 'ranking') {
      // Retornar ranking global
      const allUsers = Array.from(users.values());
      const sortedUsers = allUsers
        .sort((a, b) => (b.stats?.rankPoints || 0) - (a.stats?.rankPoints || 0))
        .slice(0, 100);

      return NextResponse.json({
        ranking: sortedUsers.map((user, index) => ({
          rank: index + 1,
          username: user.username,
          points: user.stats?.rankPoints || 0,
          tier: user.stats?.tier || 'Bronze I',
          winRate: user.stats?.winRate || 0,
          region: user.profile?.region || 'Nacional'
        }))
      });
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    const user = users.get(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    if (action === 'profile') {
      return NextResponse.json({
        user: {
          id: user.id,
          username: user.username,
          level: user.level || 1,
          xp: user.xp || 0,
          stats: user.stats || {
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            winRate: 0,
            currentStreak: 0,
            bestStreak: 0
          },
          collection: user.collection || [],
          achievements: user.achievements || [],
          decks: user.decks || {},
          createdAt: user.createdAt
        }
      });
    }

    if (action === 'stats') {
      return NextResponse.json({
        stats: user.stats || {
          gamesPlayed: 0,
          wins: 0,
          losses: 0,
          winRate: 0
        }
      });
    }

    return NextResponse.json(
      { error: 'Ação inválida' },
      { status: 400 }
    );

  } catch (error) {
    console.error('User GET error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { userId, action, data } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    const user = users.get(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    if (action === 'update-stats') {
      const { result, opponent, duration } = data;
      
      user.stats = user.stats || {
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        currentStreak: 0,
        bestStreak: 0,
        rankPoints: 1000
      };

      user.stats.gamesPlayed++;
      
      if (result === 'win') {
        user.stats.wins++;
        user.stats.currentStreak++;
        user.stats.rankPoints += 25;
        
        if (user.stats.currentStreak > user.stats.bestStreak) {
          user.stats.bestStreak = user.stats.currentStreak;
        }
      } else {
        user.stats.losses++;
        user.stats.currentStreak = 0;
        user.stats.rankPoints = Math.max(0, user.stats.rankPoints - 15);
      }

      user.stats.winRate = Math.round((user.stats.wins / user.stats.gamesPlayed) * 100);

      // Adicionar XP
      const xpGain = result === 'win' ? 50 : 25;
      user.xp = (user.xp || 0) + xpGain;

      // Verificar level up
      const xpForNextLevel = user.level * 1000;
      if (user.xp >= xpForNextLevel) {
        user.level++;
        user.xp -= xpForNextLevel;
      }

      // Adicionar à história de partidas
      user.matchHistory = user.matchHistory || [];
      user.matchHistory.unshift({
        result,
        opponent,
        duration,
        date: new Date().toISOString(),
        xpGained: xpGain
      });

      // Manter apenas últimas 50 partidas
      if (user.matchHistory.length > 50) {
        user.matchHistory = user.matchHistory.slice(0, 50);
      }

      return NextResponse.json({
        stats: user.stats,
        level: user.level,
        xp: user.xp,
        xpGained: xpGain
      });
    }

    if (action === 'save-deck') {
      const { deckName, cards } = data;
      
      user.decks = user.decks || {};
      user.decks[deckName] = {
        name: deckName,
        cards: cards,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };

      return NextResponse.json({
        message: 'Deck salvo com sucesso',
        deck: user.decks[deckName]
      });
    }

    if (action === 'unlock-achievement') {
      const { achievementId } = data;
      
      user.achievements = user.achievements || [];
      
      if (!user.achievements.includes(achievementId)) {
        user.achievements.push(achievementId);
        
        // Recompensa por conquista
        const xpReward = 100;
        user.xp = (user.xp || 0) + xpReward;

        return NextResponse.json({
          message: 'Conquista desbloqueada!',
          achievement: achievementId,
          xpReward
        });
      }

      return NextResponse.json({
        message: 'Conquista já desbloqueada'
      });
    }

    if (action === 'add-to-collection') {
      const { cardId } = data;
      
      user.collection = user.collection || [];
      
      if (!user.collection.includes(cardId)) {
        user.collection.push(cardId);
        
        return NextResponse.json({
          message: 'Carta adicionada à coleção!',
          cardId
        });
      }

      return NextResponse.json({
        message: 'Carta já está na coleção'
      });
    }

    return NextResponse.json(
      { error: 'Ação inválida' },
      { status: 400 }
    );

  } catch (error) {
    console.error('User PUT error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

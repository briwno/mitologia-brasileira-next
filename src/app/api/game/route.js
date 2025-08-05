// src/app/api/game/route.js
import { NextResponse } from 'next/server';

// Mock data para salas de jogo
const gameRooms = new Map();
const activeGames = new Map();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'rooms') {
      // Retornar salas disponíveis
      const availableRooms = Array.from(gameRooms.values()).filter(room => 
        room.players.length < 2 && room.status === 'waiting'
      );

      return NextResponse.json({
        rooms: availableRooms,
        total: availableRooms.length
      });
    }

    if (action === 'stats') {
      return NextResponse.json({
        onlinePlayers: 1247,
        activeRooms: gameRooms.size,
        gamesInProgress: activeGames.size
      });
    }

    return NextResponse.json(
      { error: 'Ação inválida' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Game GET error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { action, roomId, playerId, deck } = await request.json();

    if (action === 'create-room') {
      const newRoomId = 'ROOM' + Math.random().toString(36).substr(2, 6).toUpperCase();
      
      const newRoom = {
        id: newRoomId,
        host: playerId,
        players: [playerId],
        maxPlayers: 2,
        status: 'waiting',
        mode: 'casual',
        createdAt: new Date().toISOString(),
        settings: {
          timeLimit: 300, // 5 minutos por turno
          deckSize: 30
        }
      };

      gameRooms.set(newRoomId, newRoom);

      return NextResponse.json({
        roomId: newRoomId,
        room: newRoom
      });
    }

    if (action === 'join-room') {
      const room = gameRooms.get(roomId);
      
      if (!room) {
        return NextResponse.json(
          { error: 'Sala não encontrada' },
          { status: 404 }
        );
      }

      if (room.players.length >= room.maxPlayers) {
        return NextResponse.json(
          { error: 'Sala lotada' },
          { status: 400 }
        );
      }

      if (room.players.includes(playerId)) {
        return NextResponse.json(
          { error: 'Jogador já está na sala' },
          { status: 400 }
        );
      }

      room.players.push(playerId);
      
      // Se a sala estiver cheia, iniciar o jogo
      if (room.players.length === room.maxPlayers) {
        room.status = 'starting';
        
        // Criar estado do jogo
        const gameState = {
          id: roomId,
          players: room.players.map(p => ({
            id: p,
            health: 20,
            mana: 1,
            hand: [],
            deck: deck || [],
            field: []
          })),
          turn: 0,
          currentPlayer: 0,
          phase: 'draw',
          status: 'active',
          createdAt: new Date().toISOString()
        };

        activeGames.set(roomId, gameState);
      }

      return NextResponse.json({
        room: room,
        gameStarted: room.status === 'starting'
      });
    }

    if (action === 'leave-room') {
      const room = gameRooms.get(roomId);
      
      if (room) {
        room.players = room.players.filter(p => p !== playerId);
        
        if (room.players.length === 0) {
          gameRooms.delete(roomId);
          activeGames.delete(roomId);
        } else if (room.host === playerId && room.players.length > 0) {
          room.host = room.players[0];
        }
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'play-card') {
      const game = activeGames.get(roomId);
      
      if (!game) {
        return NextResponse.json(
          { error: 'Jogo não encontrado' },
          { status: 404 }
        );
      }

      // Lógica simplificada para jogar carta
      // Em produção, implementar validações completas
      
      return NextResponse.json({
        success: true,
        gameState: game
      });
    }

    if (action === 'end-turn') {
      const game = activeGames.get(roomId);
      
      if (!game) {
        return NextResponse.json(
          { error: 'Jogo não encontrado' },
          { status: 404 }
        );
      }

      // Passar turno para o próximo jogador
      game.currentPlayer = (game.currentPlayer + 1) % game.players.length;
      game.turn++;

      return NextResponse.json({
        success: true,
        gameState: game
      });
    }

    return NextResponse.json(
      { error: 'Ação inválida' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Game POST error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return NextResponse.json(
        { error: 'ID da sala é obrigatório' },
        { status: 400 }
      );
    }

    gameRooms.delete(roomId);
    activeGames.delete(roomId);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Game DELETE error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

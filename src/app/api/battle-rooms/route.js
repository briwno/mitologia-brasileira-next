// src/app/api/battle-rooms/route.js
import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

// Armazenamento temporário de salas de batalha (em produção usar Redis ou DB)
const battleRooms = new Map();

// Limpar salas antigas (após 2 horas para dar tempo suficiente)
const ROOM_EXPIRY = 2 * 60 * 60 * 1000; // 2 horas

function cleanExpiredRooms() {
  const now = Date.now();
  for (const [roomId, room] of battleRooms.entries()) {
    const timeSinceCreated = now - room.createdAt;
    const timeSinceActivity = now - (room.lastActivity || room.createdAt);
    
    // Remover sala se:
    // 1. Passou do tempo de expiração OU
    // 2. Está inativa há mais de 30 minutos e não está em batalha ativa
    const shouldExpire = timeSinceCreated > ROOM_EXPIRY || 
      (timeSinceActivity > 30 * 60 * 1000 && room.status !== 'active');
    
    if (shouldExpire) {
      console.log(`[Battle Room] Limpeza automática: ${roomId} (idade: ${Math.floor(timeSinceCreated / 60000)}min, inativo: ${Math.floor(timeSinceActivity / 60000)}min)`);
      battleRooms.delete(roomId);
    }
  }
}

// POST - Criar sala de batalha
export async function POST(request) {
  try {
    const { gameMode, deck, difficulty, playerId, playerName } = await request.json();

    // Validar dados obrigatórios
    if (!gameMode || !deck || !Array.isArray(deck)) {
      return NextResponse.json(
        { error: 'gameMode e deck são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar deck
    if (deck.length !== 25) {
      return NextResponse.json(
        { error: 'Deck deve ter exatamente 25 cartas' },
        { status: 400 }
      );
    }

    // Gerar ID da sala baseado no modo
    let roomId;
    if (gameMode === 'bot') {
      roomId = `bot${nanoid(4)}`;
    } else if (gameMode === 'pvp') {
      roomId = `pvp${nanoid(4)}`;
    } else {
      return NextResponse.json(
        { error: 'Modo de jogo inválido' },
        { status: 400 }
      );
    }

    // Criar configuração da sala
    const roomConfig = {
      id: roomId,
      gameMode,
      deck,
      difficulty: difficulty || 'normal',
      playerId: playerId || 'guest',
      playerName: playerName || 'Jogador',
      createdAt: Date.now(),
      lastActivity: Date.now(),
      status: 'waiting', // waiting, active, finished
      players: gameMode === 'bot' ? 1 : 0, // Para bot já temos 1 player
      maxPlayers: gameMode === 'bot' ? 1 : 2
    };

    // Salvar sala
    battleRooms.set(roomId, roomConfig);

    // Limpar salas antigas periodicamente
    cleanExpiredRooms();

    console.log(`[Battle Room] Sala criada: ${roomId}`, {
      gameMode,
      deckSize: deck.length,
      difficulty,
      expiresIn: `${ROOM_EXPIRY / (60 * 1000)} minutos`
    });

    return NextResponse.json({
      success: true,
      roomId,
      gameMode,
      redirectUrl: `/pvp/game/${roomId}`
    });

  } catch (error) {
    console.error('Erro ao criar sala de batalha:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET - Buscar dados da sala
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return NextResponse.json(
        { error: 'roomId é obrigatório' },
        { status: 400 }
      );
    }

    // Limpar salas antigas
    cleanExpiredRooms();

    const room = battleRooms.get(roomId);
    if (!room) {
      return NextResponse.json(
        { error: 'Sala não encontrada ou expirada' },
        { status: 404 }
      );
    }

    const ageMinutes = Math.floor((Date.now() - room.createdAt) / (60 * 1000));
    console.log(`[Battle Room] Dados da sala solicitados: ${roomId} (idade: ${ageMinutes}min)`);

    return NextResponse.json({
      success: true,
      room: {
        id: room.id,
        gameMode: room.gameMode,
        deck: room.deck,
        difficulty: room.difficulty,
        playerId: room.playerId,
        playerName: room.playerName,
        status: room.status,
        players: room.players,
        maxPlayers: room.maxPlayers,
        createdAt: room.createdAt
      }
    });

  } catch (error) {
    console.error('Erro ao buscar sala de batalha:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar status da sala
export async function PATCH(request) {
  try {
    const { roomId, status } = await request.json();

    if (!roomId) {
      return NextResponse.json(
        { error: 'roomId é obrigatório' },
        { status: 400 }
      );
    }

    const room = battleRooms.get(roomId);
    if (!room) {
      return NextResponse.json(
        { error: 'Sala não encontrada' },
        { status: 404 }
      );
    }

    // Atualizar status
    room.status = status || room.status;
    room.lastActivity = Date.now();

    console.log(`[Battle Room] Status da sala ${roomId} atualizado para: ${room.status}`);

    return NextResponse.json({
      success: true,
      room: {
        id: room.id,
        status: room.status,
        lastActivity: room.lastActivity
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar sala de batalha:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Remover sala
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return NextResponse.json(
        { error: 'roomId é obrigatório' },
        { status: 400 }
      );
    }

    const room = battleRooms.get(roomId);
    const deleted = battleRooms.delete(roomId);
    
    const ageMinutes = room ? Math.floor((Date.now() - room.createdAt) / (60 * 1000)) : 0;
    console.log(`[Battle Room] Sala removida: ${roomId} - ${deleted ? 'sucesso' : 'não encontrada'} (idade: ${ageMinutes}min)`);

    return NextResponse.json({
      success: true,
      deleted
    });

  } catch (error) {
    console.error('Erro ao remover sala de batalha:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
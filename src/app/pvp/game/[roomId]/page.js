// src/app/pvp/game/[roomId]/page.js
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BattleScreen from '@/components/Game/BattleScreen';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useGameState } from '@/hooks/useGameState';
import { cardsAPI } from '@/utils/api';

export default function BattleRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const roomId = params.roomId;
  
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playerCards, setPlayerCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);

  // Carregar dados da sala
  useEffect(() => {
    async function loadRoomData() {
      if (!roomId) {
        setError('ID da sala não fornecido');
        setLoading(false);
        return;
      }

      try {
        console.log(`[Battle Room] Carregando dados da sala: ${roomId}`);
        
        const response = await fetch(`/api/battle-rooms?roomId=${encodeURIComponent(roomId)}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao carregar dados da sala');
        }

        if (!data.success) {
          throw new Error('Dados da sala inválidos');
        }

        console.log('[Battle Room] Dados carregados:', data.room);
        setRoomData(data.room);

        // Marcar sala como ativa quando os dados são carregados
        try {
          await fetch('/api/battle-rooms', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId, status: 'active' })
          });
          console.log(`[Battle Room] Sala ${roomId} marcada como ativa`);
        } catch (err) {
          console.warn('Erro ao marcar sala como ativa:', err);
        }

        // Carregar dados das cartas após ter os dados da sala
        await loadPlayerCards(data.room.deck);

      } catch (err) {
        console.error('Erro ao carregar sala:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    // Função para carregar os dados detalhados das cartas do deck
    async function loadPlayerCards(deckIds) {
      if (!deckIds || !Array.isArray(deckIds)) {
        setLoadingCards(false);
        return;
      }

      try {
        setLoadingCards(true);
        console.log('[Battle Room] Carregando dados das cartas:', deckIds);

        // Buscar cartas regulares e item cards
        const [cardsResponse, itemCardsResponse] = await Promise.all([
          cardsAPI.getAll(),
          fetch('/api/item-cards').then(res => res.json())
        ]);

        const allAvailableCards = [
          ...(cardsResponse.cards || []).map(c => ({...c, category: 'lenda', type: 'lenda'})),
          ...(itemCardsResponse.itemCards || []).map(c => ({...c, category: 'item', type: 'item'}))
        ];

        // Mapear IDs do deck para dados completos das cartas
        const deckCards = deckIds
          .map(cardId => {
            const card = allAvailableCards.find(c => c.id === cardId);
            if (!card) {
              console.warn(`[Battle Room] Cart não encontrada: ${cardId}`);
              return null;
            }

            // Converter para formato esperado pelo BattleScreen
            return {
              id: card.id,
              tipo: card.category === 'lenda' ? 'lenda' : 'item',
              nome: card.name || card.nome,
              imagem: card.images?.retrato || card.image || '/images/placeholder.svg',
              ataque: card.attack || card.ataque || 0,
              defesa: card.defense || card.defesa || 0,
              vida: card.life || card.vida || 0,
              custo: card.cost || card.custo || 1,
              tipo_item: card.category === 'item' ? (card.type_item || 'neutro') : null,
              valor: card.value || card.valor || 1,
              habilidade: card.ability || card.habilidade,
              descricao: card.description || card.descricao || card.history || card.historia
            };
          })
          .filter(Boolean);

        console.log('[Battle Room] Cartas do deck carregadas:', deckCards);
        setPlayerCards(deckCards);

      } catch (err) {
        console.error('Erro ao carregar cartas:', err);
        setPlayerCards([]);
      } finally {
        setLoadingCards(false);
      }
    }

    loadRoomData();
  }, [roomId]);

  // Cleanup da sala apenas quando realmente necessário
  useEffect(() => {
    let isCleanupNeeded = true;

    const handleBeforeUnload = () => {
      if (roomId && isCleanupNeeded) {
        // Usar sendBeacon para cleanup confiável
        if (navigator.sendBeacon) {
          const data = new FormData();
          data.append('roomId', roomId);
          navigator.sendBeacon('/api/battle-rooms', data);
        }
      }
    };

    // Só fazer cleanup se o usuário realmente sair
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Não fazer cleanup automático no unmount - deixar a sala expirar naturalmente
      isCleanupNeeded = false;
    };
  }, [roomId]);

  // Criar jogadores mock baseados nos dados da sala
  const mockPlayers = useMemo(() => {
    if (!roomData || !playerCards.length || loadingCards) return [];

    const player = {
      id: roomData.playerId,
      nome: roomData.playerName,
      avatar: '/images/avatars/player.jpg',
      ranking: 'Bronze II',
      energia: 3,
      deck: playerCards
    };

    // Criar oponente baseado no modo de jogo
    let opponent;
    if (roomData.gameMode === 'bot') {
      // Bot com deck gerado
      const botCards = playerCards.map(card => ({
        ...card,
        // Pequenas variações para o bot
        nome: `Bot ${card.nome}`,
        ataque: Math.max(1, (card.ataque || 0) + Math.floor(Math.random() * 3) - 1),
        defesa: Math.max(1, (card.defesa || 0) + Math.floor(Math.random() * 3) - 1)
      }));

      opponent = {
        id: 'bot',
        nome: `Bot ${roomData.difficulty.charAt(0).toUpperCase() + roomData.difficulty.slice(1)}`,
        avatar: '/images/avatars/player.jpg',
        ranking: roomData.difficulty === 'easy' ? 'Bronze I' : roomData.difficulty === 'normal' ? 'Prata II' : 'Ouro I',
        energia: roomData.difficulty === 'easy' ? 2 : roomData.difficulty === 'normal' ? 3 : 4,
        deck: botCards
      };
    } else {
      // PvP - oponente genérico (será substituído quando outro jogador entrar)
      opponent = {
        id: 'waiting',
        nome: 'Aguardando oponente...',
        avatar: '/images/avatars/player.jpg',
        ranking: '???',
        energia: 3,
        deck: []
      };
    }

    return [player, opponent];
  }, [roomData, playerCards, loadingCards]);

  // Hook de estado do jogo
  const { gameState, executeAction, endTurn, currentPlayer, opponent } = useGameState(
    mockPlayers,
    roomData?.gameMode || 'bot'
  );

  // Função para sair da batalha
  const handleExitBattle = useCallback(async () => {
    if (confirm('Tem certeza que deseja sair da batalha?')) {
      // Cleanup da sala ao sair voluntariamente
      if (roomId) {
        try {
          await fetch(`/api/battle-rooms?roomId=${encodeURIComponent(roomId)}`, {
            method: 'DELETE'
          });
          console.log(`[Battle Room] Sala ${roomId} removida ao sair`);
        } catch (error) {
          console.warn('Erro ao limpar sala:', error);
        }
      }
      router.push('/pvp/deck');
    }
  }, [router, roomId]);

  // Estados de loading e erro
  if (loading || loadingCards) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner text={loadingCards ? "Carregando cartas..." : "Preparando batalha..."} />
          <p className="text-white/70 mt-4">Sala: {roomId}</p>
          {roomData && (
            <p className="text-white/50 mt-2">
              {roomData.gameMode === 'bot' ? '🤖 vs Bot' : '⚔️ PvP'} • {roomData.deck?.length || 0} cartas
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-900 to-purple-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-4">Sala não encontrada</h1>
          <p className="text-white/70 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/pvp/deck')}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Voltar à Seleção de Deck
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Ir ao Menu Principal
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎮</div>
          <h1 className="text-2xl font-bold text-white mb-4">Dados da sala não disponíveis</h1>
          <button
            onClick={() => router.push('/pvp/deck')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Voltar à Seleção de Deck
          </button>
        </div>
      </div>
    );
  }

  // Verificar se temos dados suficientes para começar a batalha
  if (!gameState || !currentPlayer || !opponent || mockPlayers.length !== 2) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚔️</div>
          <h1 className="text-2xl font-bold text-white mb-4">Preparando batalha...</h1>
          <p className="text-white/70">Carregando dados dos jogadores...</p>
        </div>
      </div>
    );
  }

  console.log('[Battle Room] Iniciando batalha:', {
    roomId: roomData.id,
    gameMode: roomData.gameMode,
    playersReady: mockPlayers.length,
    cardsLoaded: playerCards.length
  });

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-900 to-purple-900">
      {/* Header da sala */}
      <div className="absolute top-0 left-0 right-0 bg-black/30 backdrop-blur-sm border-b border-white/10 p-4 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleExitBattle}
              className="text-white/70 hover:text-white transition-colors"
              title="Sair da batalha"
            >
              ← Voltar
            </button>
            <div>
              <h1 className="text-white font-bold">
                {roomData.gameMode === 'bot' ? '🤖 Batalha vs Bot' : '⚔️ Batalha PvP'}
              </h1>
              <p className="text-white/70 text-sm">
                Sala: {roomData.id} • {roomData.difficulty ? `Dificuldade: ${roomData.difficulty}` : 'PvP'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-sm">Jogador: {roomData.playerName}</p>
            <p className="text-white/70 text-xs">Deck: {roomData.deck.length} cartas</p>
          </div>
        </div>
      </div>

      {/* BattleScreen com dados reais */}
      <div className="pt-20">
        <BattleScreen
          gameState={gameState}
          currentPlayer={currentPlayer}
          opponent={opponent}
          onAction={executeAction}
          onEndTurn={endTurn}
          mode={roomData.gameMode}
        />
      </div>
    </div>
  );
}
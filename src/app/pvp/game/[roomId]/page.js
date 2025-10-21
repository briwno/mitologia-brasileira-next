// src/app/pvp/game/[roomId]/page.js
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BattleScreen from '@/components/Game/BattleScreen';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useGameState } from '@/hooks/useGameState';
import { cardsAPI, itemCardsAPI } from '@/utils/api';
import { inferirCustoParaJogar } from '@/utils/cardUtils';

export default function BattleRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const roomId = params.roomId;
  
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playerCards, setPlayerCards] = useState([]);
  const [botCards, setBotCards] = useState([]);
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
          setError(data.error || 'Erro ao carregar dados da sala');
          return;
        }

        if (!data.success) {
          setError('Dados da sala inválidos');
          return;
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
        await loadPlayerCards(data.room.deck, data.room.gameMode, data.room.difficulty);

      } catch (err) {
        console.error('Erro ao carregar sala:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados da sala');
      } finally {
        setLoading(false);
      }
    }

    // Função para carregar os dados detalhados das cartas do deck
    async function loadPlayerCards(deckIds, gameMode, difficulty) {
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
          itemCardsAPI.getAll()
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
              console.warn(`[Battle Room] Carta não encontrada: ${cardId}`);
              return null;
            }

            const inferredCost = inferirCustoParaJogar(card);
            const finalCost = typeof inferredCost === 'number'
              ? inferredCost
              : (card.value || card.valor || 1);

            // Converter para formato esperado pelo BattleScreen
            return {
              id: card.id,
              tipo: card.category === 'lenda' ? 'lenda' : 'item',
              nome: card.name || card.nome,
              imagem: card.images?.retrato || card.image || '/images/placeholder.svg',
              ataque: card.attack || card.ataque || 0,
              defesa: card.defense || card.defesa || 0,
              vida: card.life || card.vida || 0,
              custo: finalCost,
              tipo_item: card.category === 'item' ? (card.type_item || '') : null,
              valor: card.value || card.valor || 1,
              habilidade: card.ability || card.habilidade,
              descricao: card.description || card.descricao || card.history || card.historia,
              habilidades: card.abilities || card.habilidades || null,
              abilities: card.abilities || null,
              elemento: card.element || card.elemento || 'neutro',
              regiao: card.region || card.regiao || 'brasil',
            };
          })
          .filter(Boolean);

        console.log('[Battle Room] Cartas do deck carregadas:', deckCards);
        setPlayerCards(deckCards);
        
        // Se for modo bot, gerar deck do bot
        if (gameMode === 'bot') {
          const botDeck = generateBotDeckFromAllCards(
            allAvailableCards, 
            difficulty || 'normal', 
            deckCards.length
          );
          console.log('[Battle Room] Deck do bot gerado:', botDeck.length, 'cartas');
          setBotCards(botDeck);
        }

      } catch (err) {
        console.error('Erro ao carregar cartas:', err);
        setPlayerCards([]);
        setBotCards([]);
      } finally {
        setLoadingCards(false);
      }
    }
    
    // Função auxiliar para gerar deck do bot
    function generateBotDeckFromAllCards(allCards, difficulty, targetSize) {
      const lendas = allCards.filter(c => c.category === 'lenda');
      const itens = allCards.filter(c => c.category === 'item');

      const lendasCount = Math.min(5, Math.floor(targetSize * 0.2));
      const itensCount = targetSize - lendasCount;

      const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      };

      let selectedLendas = [];
      let selectedItens = [];

      switch (difficulty) {
        case 'easy':
          selectedLendas = lendas
            .sort((a, b) => (a.attack || 0) - (b.attack || 0))
            .slice(0, lendasCount);
          selectedItens = shuffleArray(itens).slice(0, itensCount);
          break;

        case 'hard':
          selectedLendas = lendas
            .sort((a, b) => (b.attack || 0) - (a.attack || 0))
            .slice(0, lendasCount);
          selectedItens = itens
            .sort((a, b) => (b.value || 0) - (a.value || 0))
            .slice(0, itensCount);
          break;

        default:
          selectedLendas = shuffleArray(lendas).slice(0, lendasCount);
          selectedItens = shuffleArray(itens).slice(0, itensCount);
          break;
      }

      const selectedCards = [...selectedLendas, ...selectedItens];
      
      return selectedCards.map(card => {
        const inferredCost = inferirCustoParaJogar(card);
        const finalCost = typeof inferredCost === 'number'
          ? inferredCost
          : (card.value || card.valor || 1);

        return {
          id: card.id,
          tipo: card.category === 'lenda' ? 'lenda' : 'item',
          nome: card.name || card.nome,
          imagem: card.images?.retrato || card.image || '/images/placeholder.svg',
          ataque: card.attack || card.ataque || 0,
          defesa: card.defense || card.defesa || 0,
          vida: card.life || card.vida || 0,
          custo: finalCost,
          tipo_item: card.category === 'item' ? (card.type_item || 'utilitario') : null,
          valor: card.value || card.valor || 1,
          habilidade: card.ability || card.habilidade,
          descricao: card.description || card.descricao || card.history || card.historia,
          habilidades: card.abilities || card.habilidades || null,
          abilities: card.abilities || null,
          elemento: card.element || card.elemento || 'neutro',
          regiao: card.region || card.regiao || 'brasil',
        };
      });
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

  // Função para gerar deck aleatório do bot
  const generateBotDeck = useCallback((allCards, difficulty, targetSize) => {
    const lendas = allCards.filter(c => c.category === 'lenda');
    const itens = allCards.filter(c => c.category === 'item');

    const lendasCount = Math.min(5, Math.floor(targetSize * 0.2));
    const itensCount = targetSize - lendasCount;

    let selectedLendas = [];
    let selectedItens = [];

    // Função auxiliar para embaralhar array
    const shuffleArray = (array) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    switch (difficulty) {
      case 'easy':
        // Bot fácil: cartas mais fracas
        selectedLendas = lendas
          .sort((a, b) => (a.attack || 0) - (b.attack || 0))
          .slice(0, lendasCount);
        selectedItens = shuffleArray(itens).slice(0, itensCount);
        break;

      case 'hard':
        // Bot difícil: cartas mais fortes
        selectedLendas = lendas
          .sort((a, b) => (b.attack || 0) - (a.attack || 0))
          .slice(0, lendasCount);
        selectedItens = itens
          .sort((a, b) => (b.value || 0) - (a.value || 0))
          .slice(0, itensCount);
        break;

      default:
        // Bot normal: cartas aleatórias
        selectedLendas = shuffleArray(lendas).slice(0, lendasCount);
        selectedItens = shuffleArray(itens).slice(0, itensCount);
        break;
    }

    return [...selectedLendas, ...selectedItens];
  }, []);

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
      opponent = {
        id: 'bot',
        nome: `Bot ${(roomData.difficulty || 'normal').charAt(0).toUpperCase() + (roomData.difficulty || 'normal').slice(1)}`,
        avatar: '/images/avatars/player.jpg',
        ranking: roomData.difficulty === 'easy' ? 'Bot' : roomData.difficulty === 'normal' ? 'Bot' : 'Bot',
        mmr: roomData.difficulty === 'easy' ? 800 : roomData.difficulty === 'normal' ? 1200 : 1600,
        energia: roomData.difficulty === 'easy' ? 2 : roomData.difficulty === 'normal' ? 3 : 4,
        deck: botCards.length > 0 ? botCards : playerCards // Usar deck do bot se disponível
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

    console.log('[Battle Room] Jogadores criados:', {
      player: { nome: player.nome, cartas: player.deck.length },
      opponent: { nome: opponent.nome, cartas: opponent.deck.length, isBot: roomData.gameMode === 'bot' },
      cartasIguais: roomData.gameMode === 'bot' && player.deck[0]?.id === opponent.deck[0]?.id
    });

    return [player, opponent];
  }, [roomData, playerCards, loadingCards, botCards]);

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
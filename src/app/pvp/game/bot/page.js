// src/app/pvp/game/bot/page.js
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BattleScreen from '@/components/Game/BattleScreen';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useGameState } from '@/hooks/useGameState';
import { useBotAI } from '@/hooks/useBotAI';
import { cardsAPI, itemCardsAPI, decksAPI } from '@/utils/api';
import { inferirCustoParaJogar } from '@/utils/cardUtils';
import { FASES_DO_JOGO } from '@/utils/constants';

export default function BotBattlePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const deckId = searchParams.get('deck');
  const difficulty = searchParams.get('difficulty') || 'normal';
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [playerCards, setPlayerCards] = useState([]);
  const [botCards, setBotCards] = useState([]);

  // Gerar ID da sala com prefixo bot
  useEffect(() => {
    const botRoomId = `bot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setRoomId(botRoomId);
    console.log('[Bot Battle] Sala criada:', botRoomId);
  }, []);

  // Gerar deck do bot baseado na dificuldade
  const generateBotDeck = useMemo(() => {
    return (allCards, difficulty, targetSize) => {
      const lendas = allCards.filter(c => c.category === 'lenda');
      const itens = allCards.filter(c => c.category === 'item');

      const lendasCount = Math.min(5, Math.floor(targetSize * 0.2));
      const itensCount = targetSize - lendasCount;

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

      const botDeck = [...selectedLendas, ...selectedItens].map(c => normalizeCard(c));
      return botDeck;
    };
  }, []);

  function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Carregar deck do jogador e gerar deck do bot
  useEffect(() => {
    async function loadBattleData() {
      if (!deckId || !user) {
        setError('Deck não selecionado ou usuário não autenticado');
        setLoading(false);
        return;
      }

      try {
        console.log('[Bot Battle] Carregando deck:', deckId);
        
        // Buscar deck do jogador
        const deckResponse = await decksAPI.getById(deckId);
        if (!deckResponse.success || !deckResponse.deck) {
          throw new Error('Deck não encontrado');
        }

        const playerDeck = deckResponse.deck;
        console.log('[Bot Battle] Deck carregado:', playerDeck);

        // Buscar todas as cartas disponíveis
        const [cardsResponse, itemCardsResponse] = await Promise.all([
          cardsAPI.getAll(),
          itemCardsAPI.getAll()
        ]);

        const allCards = [
          ...(cardsResponse.cards || []).map(c => ({ ...c, category: 'lenda', type: 'lenda' })),
          ...(itemCardsResponse.itemCards || []).map(c => ({ ...c, category: 'item', type: 'item' }))
        ];

        // Mapear cartas do deck do jogador
        const playerDeckCards = (playerDeck.card_ids || [])
          .map(cardId => {
            const card = allCards.find(c => c.id === cardId);
            if (!card) return null;
            return normalizeCard(card);
          })
          .filter(Boolean);

        setPlayerCards(playerDeckCards);

        // Gerar deck do bot baseado na dificuldade
        const botDeckCards = generateBotDeck(allCards, difficulty, playerDeckCards.length);
        setBotCards(botDeckCards);

        console.log('[Bot Battle] Decks prontos:', {
          player: playerDeckCards.length,
          bot: botDeckCards.length
        });

      } catch (err) {
        console.error('[Bot Battle] Erro ao carregar dados:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar batalha');
      } finally {
        setLoading(false);
      }
    }

    loadBattleData();
  }, [deckId, user, difficulty, generateBotDeck]);

  // Normalizar carta para formato esperado pelo jogo
  function normalizeCard(card) {
    const inferredCost = inferirCustoParaJogar(card);
    const finalCost = typeof inferredCost === 'number' ? inferredCost : (card.value || card.valor || 1);

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
  }

  // Criar jogadores para o jogo
  const mockPlayers = useMemo(() => {
    if (!playerCards.length || !botCards.length) return [];

    const player = {
      id: user?.id || 'player',
      nome: user?.nome || user?.name || 'Jogador',
      avatar: user?.avatar_url || '/images/avatars/player.jpg',
      ranking: 'Bronze II',
      energia: 3,
      deck: playerCards
    };

    const bot = {
      id: 'bot',
      nome: `Bot ${difficulty === 'easy' ? 'Fácil' : difficulty === 'hard' ? 'Difícil' : 'Normal'}`,
      avatar: '/images/avatars/bot.jpg',
      ranking: difficulty === 'easy' ? 'Bronze I' : difficulty === 'hard' ? 'Ouro I' : 'Prata II',
      energia: difficulty === 'easy' ? 2 : difficulty === 'hard' ? 4 : 3,
      deck: botCards,
      isBot: true
    };

    return [player, bot];
  }, [playerCards, botCards, user, difficulty]);

  // Hook de estado do jogo
  const { gameState, executeAction, endTurn, currentPlayer, opponent } = useGameState(
    mockPlayers,
    'bot'
  );

  // Hook de IA do bot
  const { botAction, isBotTurn } = useBotAI(
    gameState,
    opponent,
    currentPlayer,
    difficulty
  );

  // Executar ação do bot automaticamente
  useEffect(() => {
    if (isBotTurn && botAction && !gameState?.gameOver) {
      // Delay para simular "pensamento" do bot
      const delay = difficulty === 'easy' ? 2000 : difficulty === 'hard' ? 1000 : 1500;
      
      const timer = setTimeout(() => {
        console.log('[Bot Battle] Bot executando ação:', botAction);
        
        if (botAction.type === 'END_TURN') {
          endTurn();
        } else {
          executeAction(botAction);
          // Após executar ação, passar turno
          setTimeout(() => endTurn(), 500);
        }
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isBotTurn, botAction, difficulty, executeAction, endTurn, gameState]);

  // Voltar ao menu
  function handleExitBattle() {
    if (confirm('Deseja sair da batalha?')) {
      router.push('/pvp');
    }
  }

  // Estados de carregamento
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner text="Preparando batalha contra bot..." />
          {roomId && (
            <p className="text-white/70 mt-4 text-sm">Sala: {roomId}</p>
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
          <h1 className="text-2xl font-bold text-white mb-4">Erro ao Iniciar Batalha</h1>
          <p className="text-white/70 mb-6">{error}</p>
          <button
            onClick={() => router.push('/pvp/deck')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Voltar à Seleção de Deck
          </button>
        </div>
      </div>
    );
  }

  if (!gameState || !currentPlayer || !opponent || mockPlayers.length !== 2) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-purple-900 flex items-center justify-center">
        <LoadingSpinner text="Inicializando jogo..." />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-black/40 backdrop-blur-sm border-b border-white/10 p-3 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={handleExitBattle}
            className="text-white/80 hover:text-white transition-colors text-sm"
          >
            ← Sair
          </button>
          <div className="text-center">
            <h1 className="text-white font-bold text-lg">
              🤖 Batalha vs Bot
            </h1>
            <p className="text-white/70 text-xs">
              Dificuldade: {difficulty === 'easy' ? '🟢 Fácil' : difficulty === 'hard' ? '🔴 Difícil' : '🟡 Normal'}
            </p>
          </div>
          <div className="text-white/70 text-xs">
            Sala: {roomId?.substring(0, 8)}...
          </div>
        </div>
      </div>

      {/* Tela de batalha */}
      <div className="pt-16">
        <BattleScreen
          gameState={gameState}
          currentPlayer={currentPlayer}
          opponent={opponent}
          onAction={executeAction}
          onEndTurn={endTurn}
          mode="bot"
        />
      </div>

      {/* Indicador de turno do bot */}
      {isBotTurn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-purple-900/90 border-2 border-purple-500 rounded-xl p-6 text-center">
            <div className="text-4xl mb-3 animate-bounce">🤖</div>
            <p className="text-white font-bold text-xl">Turno do Bot</p>
            <p className="text-purple-200 text-sm mt-2">Pensando na melhor jogada...</p>
          </div>
        </div>
      )}

      {/* Tela de vitória/derrota */}
      {gameState?.gameOver && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gradient-to-b from-blue-900 to-purple-900 border-4 border-yellow-500 rounded-2xl p-8 text-center max-w-md">
            <div className="text-6xl mb-4">
              {gameState.winner?.id === user?.id ? '🎉' : '😢'}
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {gameState.winner?.id === user?.id ? 'VITÓRIA!' : 'DERROTA'}
            </h2>
            <p className="text-white/80 mb-6">
              {gameState.winner?.id === user?.id
                ? 'Você derrotou o bot!'
                : 'O bot venceu desta vez.'}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/pvp/game/bot?' + searchParams.toString())}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
              >
                Jogar Novamente
              </button>
              <button
                onClick={() => router.push('/pvp')}
                className="w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors"
              >
                Voltar ao Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

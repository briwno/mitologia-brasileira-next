"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BattleScreen from '@/components/PvP/BattleScreen';
import { carregarDadosDeCartas } from '@/services/cartasServico';
import { useAuth } from '@/hooks/useAuth';
import { formatRoomCodeDisplay } from '@/utils/roomCodes';

function BattlePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const mode = searchParams.get('mode') || 'bot';
  const roomCode = searchParams.get('roomCode') || '';
  const deckId = searchParams.get('deckId') || '';
  const botDifficulty = searchParams.get('botDifficulty') || 'normal';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [battleData, setBattleData] = useState(null);

  useEffect(() => {
    async function initBattle() {
      try {
        setLoading(true);

        // Carregar cartas do banco
        const dados = await carregarDadosDeCartas();

        // Carregar deck do jogador
        let playerCards = [];
        
        // Se é deck "starter" fictício, usar cartas starter do banco
        if (deckId === 'starter') {
          // Pegar primeiras 5 lendas starter
          const starterLegends = dados.cartas.filter(c => c.is_starter).slice(0, 5);
          playerCards = starterLegends.length >= 5 
            ? starterLegends 
            : dados.cartas.slice(0, 5); // Fallback para as primeiras 5 cartas
        } else {
          // Carregar deck do banco de dados usando query param
          const deckResponse = await fetch(`/api/decks?id=${deckId}`);
          if (!deckResponse.ok) {
            const errorText = await deckResponse.text();
            throw new Error(`Deck não encontrado (ID: ${deckId})`);
          }
          const deckData = await deckResponse.json();

          // O deck.cards é um array de strings com IDs: ["tupa001", "sac001", ...]
          // Deck tem 25 cartas: 5 lendas + 20 itens
          const allDeckCards = deckData.deck.cards || [];
          
          console.log('[Battle] Deck carregado:', {
            deckId,
            totalCards: allDeckCards.length,
            cardIds: allDeckCards
          });
          
          // Separar lendas dos itens baseado no padrão do ID
          // Lendas: não começam com "item_" (ex: "tupa001", "sac001")
          // Itens: começam com "item_" (ex: "item_001", "item_002")
          const legendIds = allDeckCards.filter(cardId => 
            !String(cardId).startsWith('item_')
          );
          
          const itemIds = allDeckCards.filter(cardId => 
            String(cardId).startsWith('item_')
          );
          
          console.log('[Battle] Separação:', {
            legendIds: legendIds.length,
            itemIds: itemIds.length,
            legends: legendIds,
            items: itemIds
          });
          
          // Usar apenas as primeiras 5 lendas
          const selectedLegendIds = legendIds.slice(0, 5);
          
          // Mapear IDs para objetos de carta completos
          playerCards = selectedLegendIds.map(cardId => {
            const card = dados.cartas.find(c => 
              String(c.id) === String(cardId) || c.id == cardId
            );
            if (!card) {
              console.warn(`[Battle] Carta não encontrada no banco: ${cardId}`);
            }
            return card;
          }).filter(Boolean);
          
          console.log('[Battle] Player cards:', {
            count: playerCards.length,
            cards: playerCards.map(c => ({ id: c.id, nome: c.nome || c.name }))
          });
          
          // Verificar se temos 5 lendas
          if (playerCards.length < 5) {
            throw new Error(`Deck incompleto: apenas ${playerCards.length} lendas encontradas (necessário 5 lendas). IDs encontrados: ${selectedLegendIds.join(', ')}`);
          }
        }

        // Carregar deck do oponente
        let opponentCards = [];
        if (mode === 'bot') {
          // Bot usa lendas aleatórias ou starter baseado na dificuldade
          if (botDifficulty === 'easy') {
            opponentCards = dados.cartas.filter(c => c.is_starter).slice(0, 5);
          } else if (botDifficulty === 'normal') {
            opponentCards = dados.cartas.slice(5, 10);
          } else {
            // Difícil: cartas mais fortes (maior ataque)
            opponentCards = [...dados.cartas]
              .sort((a, b) => (b.ataque || 0) - (a.ataque || 0))
              .slice(0, 5);
          }
          
          // Fallback se não tiver cartas suficientes
          if (opponentCards.length < 5) {
            opponentCards = dados.cartas.slice(0, 5);
          }
        } else {
          // TODO: Para ranked/custom, carregar deck do oponente real
          opponentCards = dados.cartas.slice(5, 10);
        }

        // Validar que temos dados suficientes
        if (playerCards.length < 5) {
          throw new Error('Deck do jogador incompleto');
        }
        if (opponentCards.length < 5) {
          throw new Error('Deck do oponente incompleto');
        }

        setBattleData({
          mode,
          roomCode,
          playerDeck: playerCards,
          opponentDeck: opponentCards,
          botDifficulty,
          allCards: dados.cartas,
          allItems: dados.itens
        });

      } catch (err) {
        console.error('Erro ao iniciar batalha:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (deckId) {
      initBattle();
    }
  }, [deckId, mode, roomCode, botDifficulty]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a2332] to-[#0a1118] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-xl text-white mb-2">⚔️ Preparando Batalha...</p>
          <p className="text-sm text-gray-400">
            Sala: {formatRoomCodeDisplay(roomCode)}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a2332] to-[#0a1118] flex items-center justify-center p-4">
        <div className="bg-red-900/30 border-2 border-red-600 rounded-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-400 mb-2">Erro</h2>
          <p className="text-white mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
          >
            ← Voltar
          </button>
        </div>
      </div>
    );
  }

  if (!battleData) {
    return null;
  }

  return (
    <BattleScreen
      mode={mode}
      roomCode={roomCode}
      playerDeck={battleData.playerDeck}
      opponentDeck={battleData.opponentDeck}
      botDifficulty={botDifficulty}
      allCards={battleData.allCards}
      allItems={battleData.allItems}
      onExit={() => router.push('/pvp')}
    />
  );
}

export default function BattlePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#1a2332] to-[#0a1118] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-yellow-400"></div>
      </div>
    }>
      <BattlePageContent />
    </Suspense>
  );
}

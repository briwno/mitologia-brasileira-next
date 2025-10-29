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
  const roomCodeParam = searchParams.get('roomCode') || '';
  // roomCodeParam can be either 'CUSTOM_XXXXX' or just 'XXXXX' depending on how it was passed.
  // For API calls we need the raw id (without prefix). Keep roomCodeParam for display.
  const roomIdForApi = roomCodeParam.includes('_') ? roomCodeParam.split('_')[1] : roomCodeParam;
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

        // Helpers
        const extractFiveLegendsFromDeck = (deckJsonCards, allCards) => {
          const allDeckCards = deckJsonCards || [];
          const legendIds = allDeckCards.filter((cardId) => !String(cardId).startsWith('item_'));
          const selectedLegendIds = legendIds.slice(0, 5);
          const legends = selectedLegendIds
            .map((cardId) => {
              const card = allCards.find((c) => String(c.id) === String(cardId) || c.id == cardId);
              if (!card) {
                console.warn(`[Battle] Carta não encontrada no banco: ${cardId}`);
              }
              return card;
            })
            .filter(Boolean);
          return legends;
        };

        // Fluxo 1: BOT
        if (mode === 'bot') {
          // Deck do jogador (usa deckId param)
          let playerCards = [];
          if (deckId === 'starter') {
            const starterLegends = dados.cartas.filter((c) => c.is_starter).slice(0, 5);
            playerCards = starterLegends.length >= 5 ? starterLegends : dados.cartas.slice(0, 5);
          } else {
            const deckResponse = await fetch(`/api/decks?id=${deckId}`);
            if (!deckResponse.ok) {
              const errorText = await deckResponse.text();
              throw new Error(`Deck não encontrado (ID: ${deckId})`);
            }
            const deckData = await deckResponse.json();
            playerCards = extractFiveLegendsFromDeck(deckData.deck.cards, dados.cartas);
            if (playerCards.length < 5) {
              throw new Error(
                `Deck incompleto: apenas ${playerCards.length} lendas encontradas (necessário 5 lendas).`
              );
            }
          }

          // Deck do oponente (bot)
          let opponentCards = [];
          if (botDifficulty === 'easy') {
            opponentCards = dados.cartas.filter((c) => c.is_starter).slice(0, 5);
          } else if (botDifficulty === 'normal') {
            opponentCards = dados.cartas.slice(5, 10);
          } else {
            opponentCards = [...dados.cartas].sort((a, b) => (b.ataque || 0) - (a.ataque || 0)).slice(0, 5);
          }
          if (opponentCards.length < 5) {
            opponentCards = dados.cartas.slice(0, 5);
          }

          setBattleData({
            mode,
            roomCode: roomCodeParam,
            playerDeck: playerCards,
            opponentDeck: opponentCards,
            botDifficulty,
            allCards: dados.cartas,
            allItems: dados.itens,
          });
          return;
        }

        // Fluxo 2: CUSTOM/RANKED (PvP real)
        if (!roomCodeParam) {
          throw new Error('Código da sala ausente.');
        }
        if (!user?.id) {
          throw new Error('Usuário não autenticado.');
        }

        // Buscar match pela roomId (normalizamos aceitando custom_ prefix)
        const matchRes = await fetch(`/api/matchmaking/status?roomId=${encodeURIComponent(roomIdForApi)}`, {
          method: 'GET',
        });
        if (!matchRes.ok) {
          const txt = await matchRes.text();
          throw new Error(txt || 'Não foi possível carregar a partida.');
        }
        const { match } = await matchRes.json();
        if (!match) {
          throw new Error('Partida ainda não está pronta. Aguarde o oponente entrar.');
        }

  const isPlayerA = String(match.player_a_id) === String(user.id);
  const myDeckId = isPlayerA ? match.player_a_deck_id : match.player_b_deck_id;
  const oppDeckId = isPlayerA ? match.player_b_deck_id : match.player_a_deck_id;
  const oppPlayerId = isPlayerA ? match.player_b_id : match.player_a_id;

        // Carregar os dois decks do banco
        const [myDeckRes, oppDeckRes] = await Promise.all([
          fetch(`/api/decks?id=${myDeckId}`),
          fetch(`/api/decks?id=${oppDeckId}`),
        ]);
        if (!myDeckRes.ok) {
          throw new Error(`Não foi possível carregar seu deck (ID: ${myDeckId}).`);
        }
        if (!oppDeckRes.ok) {
          throw new Error(`Não foi possível carregar o deck do oponente (ID: ${oppDeckId}).`);
        }
        const [myDeckData, oppDeckData] = await Promise.all([myDeckRes.json(), oppDeckRes.json()]);

        const playerCards = extractFiveLegendsFromDeck(myDeckData.deck.cards, dados.cartas);
        const opponentCards = extractFiveLegendsFromDeck(oppDeckData.deck.cards, dados.cartas);

        // Buscar dados do jogador oponente (perfil: nickname, avatar, mmr)
        let opponentProfile = null;
        try {
          if (oppPlayerId) {
            const pRes = await fetch(`/api/players?id=${oppPlayerId}`);
            if (pRes.ok) {
              const pj = await pRes.json();
              opponentProfile = pj.player || null;
            }
          }
        } catch (e) {
          console.warn('Não foi possível carregar perfil do oponente:', e);
        }

        if (playerCards.length < 5) {
          throw new Error('Deck do jogador incompleto');
        }
        if (opponentCards.length < 5) {
          throw new Error('Deck do oponente incompleto');
        }

        setBattleData({
          mode,
          roomCode: roomCodeParam,
          playerDeck: playerCards,
          opponentDeck: opponentCards,
          opponentProfile,
          botDifficulty,
          allCards: dados.cartas,
          allItems: dados.itens,
        });
      } catch (err) {
        console.error('Erro ao iniciar batalha:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    // Para modo custom precisamos do user.id e roomCode; para bot, deckId é obrigatório
    if ((mode === 'bot' && deckId) || (mode !== 'bot' && roomCodeParam && user?.id)) {
      initBattle();
    }
  }, [deckId, mode, roomCodeParam, roomIdForApi, botDifficulty, user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a2332] to-[#0a1118] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-xl text-white mb-2">⚔️ Preparando Batalha...</p>
          <p className="text-sm text-gray-400">
            Sala: {formatRoomCodeDisplay(roomCodeParam)}
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
      roomCode={roomCodeParam}
      playerDeck={battleData.playerDeck}
      opponentDeck={battleData.opponentDeck}
      opponentProfile={battleData.opponentProfile}
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

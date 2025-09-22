"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LayoutDePagina from "../../../components/UI/PageLayout";
import DeckBuilder from "@/components/Deck/DeckBuilder";
import { useAuth } from "@/hooks/useAuth";
import { useCollection } from "@/hooks/useCollection";
import { cardsAPI } from "@/utils/api";
import Icon from "@/components/UI/Icon";
import { nanoid } from "nanoid";
import { validateDeck, DECK_RULES } from "@/utils/deckValidation";

export default function SelecaoDeDeck() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameMode = searchParams.get("mode") || "bot";

  const { user, isAuthenticated } = useAuth();
  const { cards: ownedCardIds, loading: loadingCollection } = useCollection();

  const [decksCarregando, setDecksCarregando] = useState(true);
  const [decksSalvos, setDecksSalvos] = useState([]);
  const [deckSelecionado, setDeckSelecionado] = useState(null);
  const [showDeckBuilder, setShowDeckBuilder] = useState(false);
  const [allCards, setAllCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [botDifficulty, setBotDifficulty] = useState('normal');

  // Carregar todas as cartas da API
  useEffect(() => {
    const loadCards = async () => {
      try {
        const data = await cardsAPI.getAll();
        setAllCards(data.cards || []);
      } catch (error) {
        console.error('Erro ao carregar cartas:', error);
      } finally {
        setLoadingCards(false);
      }
    };
    
    loadCards();
  }, []);

  // Monta a coleção disponível
  const availableCards = useMemo(() => {
    if (loadingCards) return [];
    
    if (isAuthenticated() && !loadingCollection && ownedCardIds?.length) {
      const cardMap = new Map(allCards.map(c => [c.id, c]));
      return ownedCardIds
        .map(id => cardMap.get(id))
        .filter(Boolean);
    }
    
    // Fallback para cartas starter
    return allCards.filter(c => c?.is_starter || c?.id).slice(0, 30);
  }, [allCards, loadingCards, ownedCardIds, isAuthenticated, loadingCollection]);

  // Carregar decks salvos
  useEffect(() => {
    async function carregarDecks() {
      if (!isAuthenticated() || !user?.id) {
        // Deck demo usando cartas starter
        // Criar deck inicial balanceado
        const lendas = availableCards.filter(c => {
          const category = (c.category || '').toLowerCase();
          const type = (c.type || '').toLowerCase();
          return category === 'lenda' || type === 'lenda' || category === 'legend' || type === 'legend';
        }).slice(0, DECK_RULES.REQUIRED_LENDAS);
        
        const itens = availableCards.filter(c => {
          const category = (c.category || '').toLowerCase();
          const type = (c.type || '').toLowerCase();
          return category === 'item' || type === 'item' || category === 'itens' || type === 'itens';
        }).slice(0, DECK_RULES.REQUIRED_ITENS);
        
        const starterCards = [...lendas.map(c => c.id), ...itens.map(c => c.id)];
        const decksFicticios = [
          {
            id: "starter",
            name: "Deck Iniciante",
            cards: starterCards,
            isDefault: true,
          }
        ];

        setDecksSalvos(decksFicticios);
        setDeckSelecionado("starter");
        setDecksCarregando(false);
        return;
      }

      try {
        const res = await fetch(`/api/decks?ownerId=${user.id}`);
        const data = await res.json();
        setDecksSalvos(data.decks || []);

        // Define o primeiro deck como selecionado por padrão
        if (data.decks?.length > 0) {
          const defaultDeck =
            data.decks.find((d) => d.isDefault) || data.decks[0];
          setDeckSelecionado(defaultDeck.id);
        }
      } catch (error) {
        console.error("Erro ao carregar decks:", error);
      } finally {
        setDecksCarregando(false);
      }
    }

    if (availableCards.length > 0) {
      carregarDecks();
    }
  }, [user, isAuthenticated, availableCards]);

  const iniciarPartida = () => {
    if (!deckSelecionado) return;

    const deck = decksSalvos.find((d) => d.id === deckSelecionado);
    if (!deck || !deck.cards?.length) {
      alert("Deck inválido! Nenhuma carta encontrada.");
      return;
    }

    // Usar nova validação
    const validation = validateDeck(deck.cards, availableCards);
    if (!validation.isValid) {
      alert(`Deck inválido!\n\n${validation.errors.join('\n')}`);
      return;
    }

    // Criar ID da sala baseado no modo
    let roomId;
    if (gameMode === 'bot') {
      roomId = `BOT_${botDifficulty}_${nanoid(6)}`;
    } else {
      roomId = nanoid(8);
    }

    const query = new URLSearchParams({
      mode: gameMode,
      deck: JSON.stringify(deck.cards),
      ...(gameMode === 'bot' && { difficulty: botDifficulty })
    });

    router.push(`/pvp/game/${roomId}?${query.toString()}`);
  };

  const handleSaveDeck = async (cardIds) => {
    try {
      if (!isAuthenticated() || !user?.id) {
        alert('Você precisa estar logado para salvar decks!');
        return;
      }
      
      const payload = {
        ownerId: Number(user.id),
        name: `Deck ${gameMode.toUpperCase()} - ${new Date().toLocaleString('pt-BR')}`,
        cards: cardIds
      };
      
      const response = await fetch('/api/decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        // Recarregar decks
        const res = await fetch(`/api/decks?ownerId=${user.id}`);
        const data = await res.json();
        setDecksSalvos(data.decks || []);
        alert('Deck salvo com sucesso!');
      } else {
        throw new Error('Erro ao salvar deck');
      }
    } catch (error) {
      console.error('Erro ao salvar deck:', error);
      alert('Erro ao salvar deck. Tente novamente.');
    }
  };

  if (decksCarregando) {
    return (
      <LayoutDePagina>
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-xl text-gray-300">Carregando decks...</p>
        </div>
      </LayoutDePagina>
    );
  }

  return (
    <LayoutDePagina>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            🎯 Escolha seu Deck
          </h1>
          <p className="text-xl text-gray-300">
            {gameMode === "bot" && "🤖 Prepare-se para batalhar contra a IA"}
            {gameMode === "ranked" && "🏆 Partida ranqueada - escolha seu melhor deck!"}
            {gameMode === "custom" && "🏠 Partida personalizada"}
          </p>
          <div className="text-sm text-green-300 mt-2">
            Regras: {DECK_RULES.REQUIRED_LENDAS} lendas + {DECK_RULES.REQUIRED_ITENS} itens = {DECK_RULES.MAX_SIZE} cartas • 1 cópia por carta • Apenas cartas da sua coleção
          </div>
        </div>

        {/* Controles específicos do modo bot */}
        {gameMode === 'bot' && (
          <div className="mb-6 flex justify-center">
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-gray-600/30">
              <div className="text-sm text-gray-300 mb-2 text-center">Dificuldade do Bot:</div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setBotDifficulty('easy')}
                  className={`px-3 py-2 rounded text-sm font-semibold transition-all ${
                    botDifficulty === 'easy' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  😊 Fácil
                </button>
                <button
                  onClick={() => setBotDifficulty('normal')}
                  className={`px-3 py-2 rounded text-sm font-semibold transition-all ${
                    botDifficulty === 'normal' 
                      ? 'bg-yellow-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  🤔 Normal
                </button>
                <button
                  onClick={() => setBotDifficulty('hard')}
                  className={`px-3 py-2 rounded text-sm font-semibold transition-all ${
                    botDifficulty === 'hard' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  😈 Difícil
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Decks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {decksSalvos.map((deck) => (
            <div
              key={deck.id}
              className={`bg-black/30 backdrop-blur-sm rounded-lg border p-6 cursor-pointer transition-all hover:scale-105 ${
                deckSelecionado === deck.id
                  ? "border-yellow-400 shadow-lg shadow-yellow-400/20"
                  : "border-gray-600/30 hover:border-gray-500"
              }`}
              onClick={() => setDeckSelecionado(deck.id)}
            >
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-b from-yellow-600 to-yellow-800 rounded-lg flex items-center justify-center">
                  <Icon name="cards" size={32} />
                </div>

                <h3 className="text-xl font-bold mb-2">{deck.name}</h3>

                <div className="text-gray-400 text-sm mb-4">
                  {deck.cards?.length || 0} cartas no deck
                  {deck.isDefault && (
                    <span className="text-yellow-400 ml-2">⭐ Padrão</span>
                  )}
                  {/* Contagem de lendas e itens */}
                  {availableCards.length > 0 && deck.cards && (
                    <div className="text-xs mt-1 flex gap-3">
                      <span className="text-purple-300">
                        L: {deck.cards.filter(cardId => {
                          const card = availableCards.find(c => c.id == cardId);
                          const category = (card?.category || '').toLowerCase();
                          const type = (card?.type || '').toLowerCase();
                          return category === 'lenda' || type === 'lenda' || category === 'legend' || type === 'legend';
                        }).length}/5
                      </span>
                      <span className="text-blue-300">
                        I: {deck.cards.filter(cardId => {
                          const card = availableCards.find(c => c.id == cardId);
                          const category = (card?.category || '').toLowerCase();
                          const type = (card?.type || '').toLowerCase();
                          return category === 'item' || type === 'item' || category === 'itens' || type === 'itens';
                        }).length}/20
                      </span>
                    </div>
                  )}
                </div>

                {/* Status do deck */}
                {(() => {
                  let isValid = false;
                  if (availableCards.length > 0 && deck.cards) {
                    const validation = validateDeck(deck.cards, availableCards);
                    isValid = validation.isValid;
                  }
                  
                  return (
                    <div className={`text-xs px-2 py-1 rounded mb-2 ${
                      isValid ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                    }`}>
                      {isValid ? '✓ Válido' : '⚠ Inválido'}
                    </div>
                  );
                })()}

                {deckSelecionado === deck.id && (
                  <div className="text-green-400 text-sm">
                    ✓ Deck selecionado
                  </div>
                )}

                {/* Preview das cartas */}
                <div className="mt-3 text-xs text-gray-500">
                  {availableCards.length > 0 && deck.cards?.slice(0, 3).map(cardId => {
                    const card = availableCards.find(c => c.id == cardId);
                    return card?.name || cardId;
                  }).join(" • ")}
                  {deck.cards?.length > 3 && "..."}
                </div>
              </div>
            </div>
          ))}

          {/* Botão Criar Novo Deck */}
          <div
            className="bg-black/20 backdrop-blur-sm rounded-lg border border-dashed border-gray-500 p-6 cursor-pointer transition-all hover:scale-105 hover:border-yellow-400"
            onClick={() => setShowDeckBuilder(true)}
          >
            <div className="text-center text-gray-400 hover:text-yellow-400 transition-colors">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-700 rounded-lg flex items-center justify-center">
                <Icon name="plus" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Novo Deck</h3>
              <p className="text-sm">Criar deck personalizado</p>
            </div>
          </div>
        </div>

        {/* Informações do deck selecionado */}
        {deckSelecionado && (
          <div className="max-w-md mx-auto mb-8 bg-black/20 backdrop-blur-sm rounded-lg border border-gray-600/30 p-4">
            <h3 className="text-lg font-bold mb-2 text-center">
              Deck Selecionado
            </h3>
            {(() => {
              const deck = decksSalvos.find((d) => d.id === deckSelecionado);
              return (
                <div className="text-center">
                  <p className="text-yellow-400 font-semibold">{deck?.name}</p>
                  <p className="text-gray-400 text-sm mb-2">
                    {deck?.cards?.length || 0} cartas
                  </p>
                  <div className="text-xs text-gray-500">
                    {deck?.cards?.join(" • ")}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Ações */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <Icon name="back" size={20} />
            Voltar
          </button>

          <button
            onClick={iniciarPartida}
            disabled={!deckSelecionado}
            className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors font-semibold flex items-center gap-2"
          >
            <Icon name="battle" size={20} />
            Iniciar Batalha!
          </button>
        </div>

        {/* Deck Builder */}
        <DeckBuilder
          isOpen={showDeckBuilder}
          onClose={() => setShowDeckBuilder(false)}
          onSave={handleSaveDeck}
          availableCards={availableCards}
          title={`Construir Deck para ${gameMode.toUpperCase()}`}
          subtitle="Monte um deck poderoso para suas batalhas"
        />
      </div>
    </LayoutDePagina>
  );
}

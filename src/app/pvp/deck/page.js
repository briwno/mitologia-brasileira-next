// src/app/pvp/deck/page.js
"use client";

import Link from 'next/link';
import { useMemo, useState } from 'react';
import LayoutDePagina from '../../../components/UI/PageLayout';
import { useAuth } from '@/hooks/useAuth';
import { useCollection } from '@/hooks/useCollection';
import { bancoDeCartas } from '@/data/cardsDatabase';

// Construtor de Deck para o modo PvP
export default function ConstrutorDeDeck() {
  const { user, isAuthenticated } = useAuth();
  const { cards: idsPossuidos, loading: carregandoColecao } = useCollection();
  const [deckSelecionado, setDeckSelecionado] = useState('deck1');
  const [abaAtiva, setAbaAtiva] = useState('collection');
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('all');

  // Deriva a coleção real do usuário quando autenticado
  const colecaoReal = useMemo(() => {
    if (!isAuthenticated() || !idsPossuidos?.length) return [];
  const porId = new Map(bancoDeCartas.map(c => [c.id, c]));
    return idsPossuidos
      .map(id => porId.get(id))
      .filter(Boolean)
      .map(card => ({
        id: card.id,
        nome: card.nome,
        categoria: card.categoria,
        ataque: card.ataque,
        defesa: card.defesa,
        vida: card.vida,
        owned: 1, // coleção atual não controla duplicatas
        inDeck: 0,
      }));
  }, [idsPossuidos, isAuthenticated]);

  // Fallback fictício para quando não autenticado
  const colecaoFicticia = [
    { id: 'cur001', name: 'Curupira', category: 'Guardiões da Floresta', attack: 7, defense: 8, life: 15, owned: 1, inDeck: 0 },
    { id: 'iar001', name: 'Iara', category: 'Espíritos das Águas', attack: 6, defense: 5, life: 12, owned: 1, inDeck: 0 },
    { id: 'sac001', name: 'Saci-Pererê', category: 'Assombrações', attack: 5, defense: 6, life: 10, owned: 1, inDeck: 0 },
    { id: 'boi001', name: 'Boitatá', category: 'Guardiões da Floresta', attack: 9, defense: 7, life: 18, owned: 1, inDeck: 0 },
  ];

  const colecaoDoJogador = isAuthenticated() ? colecaoReal : colecaoFicticia;

  // Decks salvos
  const [decks, setDecks] = useState({
    deck1: {
      name: 'Deck Amazônico',
      cards: [
        // vazio por padrão (vamos montar a partir da coleção)
      ]
    },
    deck2: {
      name: 'Deck Assombrado',
      cards: []
    }
  });

  const categorias = useMemo(() => {
    const set = new Set(['all']);
    colecaoDoJogador.forEach(c => set.add(c.categoria));
    return Array.from(set);
  }, [colecaoDoJogador]);

  const obterDeckAtual = () => decks[deckSelecionado];
  const obterCartasDoDeckAtual = () => {
    const deck = obterDeckAtual();
    return deck.cards.map(deckCard => {
      const cardData = colecaoDoJogador.find(card => card.id === deckCard.id);
      return { ...cardData, quantity: deckCard.quantity };
    });
  };

  const colecaoFiltrada = colecaoDoJogador.filter(card => {
    const combinaBusca = (card.nome || '').toLowerCase().includes(termoBusca.toLowerCase());
    const combinaCategoria = filtroCategoria === 'all' || card.categoria === filtroCategoria;
    return combinaBusca && combinaCategoria;
  });

  const adicionarCartaAoDeck = (cardId) => {
    const card = colecaoDoJogador.find(c => c.id === cardId);
    const deckAtual = obterDeckAtual();
    const cartaAtual = deckAtual.cards.find(c => c.id === cardId);
    const totalCartas = deckAtual.cards.reduce((sum, c) => sum + c.quantity, 0);

    if (totalCartas >= 30) {
      alert('Deck não pode ter mais de 30 cartas!');
      return;
    }

    // Se for coleção real: limitar a 1 cópia; mock mantém limite simples de 1 também
    if (cartaAtual || (card?.owned ?? 1) <= 0) {
      alert('Você já adicionou a quantidade máxima desta carta.');
      return;
    }
    deckAtual.cards.push({ id: cardId, quantity: 1 });

    setDecks({ ...decks });
  };

  const removerCartaDoDeck = (cardId) => {
    const deckAtual = obterDeckAtual();
    const cardIndex = deckAtual.cards.findIndex(c => c.id === cardId);
    
    if (cardIndex !== -1) {
      const card = deckAtual.cards[cardIndex];
      if (card.quantity > 1) {
        card.quantity--;
      } else {
        deckAtual.cards.splice(cardIndex, 1);
      }
      setDecks({ ...decks });
    }
  };

  const obterTotalDeCartas = () => obterDeckAtual().cards.reduce((sum, card) => sum + card.quantity, 0);
  const obterAtaqueMedio = () => {
    const cartasDeck = obterCartasDoDeckAtual();
    if (cartasDeck.length === 0) return 0;
  const totalAtaque = cartasDeck.reduce((sum, card) => sum + ((card?.ataque || 0) * card.quantity), 0);
    const totalCartas = cartasDeck.reduce((sum, card) => sum + card.quantity, 0);
    return (totalAtaque / totalCartas).toFixed(1);
  };

  return (
    <LayoutDePagina>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            ⚙️ Construtor de Deck
          </h1>
          <p className="text-xl text-purple-300">
            Monte seu baralho perfeito para as batalhas
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coleção de Cartas */}
          <div className="lg:col-span-2">
            <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-gray-600/30">
              {/* Tabs */}
              <div className="flex border-b border-gray-600/30">
                <button
                  onClick={() => setAbaAtiva('collection')}
                  className={`flex-1 p-4 font-semibold transition-colors ${
                    abaAtiva === 'collection' 
                      ? 'text-blue-400 border-b-2 border-blue-400' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  🃏 Coleção
                </button>
                <button
                  onClick={() => setAbaAtiva('deck')}
                  className={`flex-1 p-4 font-semibold transition-colors ${
                    abaAtiva === 'deck' 
                      ? 'text-green-400 border-b-2 border-green-400' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  📋 Deck Atual ({obterTotalDeCartas()}/30)
                </button>
              </div>

              <div className="p-6">
                {abaAtiva === 'collection' && (
                  <>
                    {/* Filtros */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <input
                        type="text"
                        placeholder="Buscar cartas..."
                        value={termoBusca}
                        onChange={(e) => setTermoBusca(e.target.value)}
                        className="px-3 py-2 bg-black/50 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                      />
                      <select
                        value={filtroCategoria}
                        onChange={(e) => setFiltroCategoria(e.target.value)}
                        className="px-3 py-2 bg-black/50 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                      >
                        {categorias.map(cat => (
                          <option key={cat} value={cat}>
                            {cat === 'all' ? 'Todas as Categorias' : cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Grid de Cartas */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {colecaoFiltrada.map(card => (
                        <div
                          key={card.id}
                          className="bg-black/40 rounded-lg p-3 border border-gray-600/30 hover:border-blue-500/50 transition-all cursor-pointer"
                          onClick={() => adicionarCartaAoDeck(card.id)}
                        >
                          <div className="text-center">
                            <div className="w-full h-20 bg-gradient-to-b from-gray-700 to-gray-800 rounded mb-2 flex items-center justify-center">
                              <span className="text-2xl">🎭</span>
                            </div>
                            <h4 className="font-bold text-sm mb-1">{card.nome}</h4>
                            <div className="text-xs text-gray-400 mb-2">{card.categoria}</div>
                            <div className="grid grid-cols-3 gap-1 text-xs mb-2">
                              <div className="bg-red-900/50 p-1 rounded">{card.ataque}</div>
                              <div className="bg-blue-900/50 p-1 rounded">{card.defesa}</div>
                              <div className="bg-green-900/50 p-1 rounded">{card.vida}</div>
                            </div>
                            {isAuthenticated() && (
                              <div className="flex justify-end items-center text-xs">
                                <span className="text-gray-400">{Math.max(0, (card.owned || 1) - (card.inDeck || 0))} restantes</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {abaAtiva === 'deck' && (
                  <>
                    <h3 className="text-xl font-bold mb-4">Cartas no Deck</h3>
                    {obterCartasDoDeckAtual().length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <div className="text-4xl mb-4">📋</div>
                        <p>Seu deck está vazio. Adicione cartas da sua coleção!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {obterCartasDoDeckAtual().map(card => (
                          <div
                            key={card.id}
                            className="bg-black/40 p-3 rounded-lg border border-gray-600/30 flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gradient-to-b from-gray-700 to-gray-800 rounded flex items-center justify-center">
                                <span className="text-lg">🎭</span>
                              </div>
                              <div>
                                <div className="font-semibold">{card.nome}</div>
                                <div className="text-sm text-gray-400">{card.categoria}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-sm">x{card.quantity}</span>
                              <button
                                onClick={() => removerCartaDoDeck(card.id)}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
                              >
                                Remover
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Painel do Deck */}
          <div className="space-y-6">
            {/* Seletor de Deck */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-gray-600/30">
              <h3 className="text-xl font-bold mb-4">📚 Decks Salvos</h3>
              <div className="space-y-3">
                {Object.entries(decks).map(([id, deck]) => (
                  <button
                    key={id}
                    onClick={() => setDeckSelecionado(id)}
                    className={`w-full p-3 rounded-lg border transition-all text-left ${
                      deckSelecionado === id 
                        ? 'border-green-500 bg-green-500/20' 
                        : 'border-gray-600 bg-black/40 hover:border-gray-500'
                    }`}
                  >
                    <div className="font-semibold">{deck.name}</div>
                    <div className="text-sm text-gray-400">
                      {deck.cards.reduce((sum, card) => sum + card.quantity, 0)} cartas
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Estatísticas do Deck */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-gray-600/30">
              <h3 className="text-xl font-bold mb-4">📊 Estatísticas</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total de Cartas:</span>
                  <span className="font-bold">{obterTotalDeCartas()}/30</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Ataque Médio:</span>
                  <span className="font-bold text-yellow-400">⚔️{obterAtaqueMedio()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cartas Únicas:</span>
                  <span className="font-bold">{obterDeckAtual().cards.length}</span>
                </div>
              </div>

              {/* Barra de Progresso */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progresso do Deck</span>
                  <span>{Math.round((obterTotalDeCartas() / 30) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${(obterTotalDeCartas() / 30) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-gray-600/30">
              <h3 className="text-xl font-bold mb-4">⚡ Ações</h3>
              <div className="space-y-3">
                <button
                  disabled={obterTotalDeCartas() < 20}
                  className="w-full py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors"
                >
                  💾 Salvar Deck
                </button>
                <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors">
                  📤 Exportar Deck
                </button>
                <button className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 rounded transition-colors">
                  🎲 Deck Aleatório
                </button>
                <button className="w-full py-2 bg-red-600 hover:bg-red-700 rounded transition-colors">
                  🗑️ Limpar Deck
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            href="/pvp"
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-semibold"
          >
            ← Voltar ao Lobby PvP
          </Link>
        </div>
      </div>
    </LayoutDePagina>
  );
}

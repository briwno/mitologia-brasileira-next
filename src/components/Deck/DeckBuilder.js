// src/components/Deck/DeckBuilder.js
"use client";

import { useState, useMemo, useCallback } from 'react';
import { cardsAPI } from '@/utils/api';
import { DECK_RULES } from '@/utils/deckValidation';
import CardImage from '@/components/Card/CardImage';

const DECK_MIN_SIZE = DECK_RULES.MIN_SIZE; // 15
const DECK_MAX_SIZE = DECK_RULES.MAX_SIZE; // 15

export default function DeckBuilder({
  isOpen,
  onClose,
  onSave,
  availableCards = [],
  initialDeck = [],
  title = "Editor de Deck",
  subtitle = `Selecione ${DECK_RULES.REQUIRED_LENDAS} lendas e ${DECK_RULES.REQUIRED_ITENS} itens (${DECK_RULES.MAX_SIZE} cartas total)`
}) {
  const [deckCards, setDeckCards] = useState(() => 
    initialDeck.map(cardId => ({ id: cardId, quantity: 1 }))
  );
  const [saving, setSaving] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const deckCount = useMemo(() => 
    deckCards.reduce((sum, card) => sum + card.quantity, 0), 
    [deckCards]
  );

  const isValidDeck = useMemo(() => 
    deckCount >= DECK_MIN_SIZE && deckCount <= DECK_MAX_SIZE,
    [deckCount]
  );

  // Filtrar cartas disponíveis
  const filteredCards = useMemo(() => {
    return availableCards.filter(card => {
      const matchesSearch = !searchFilter || 
        card.name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        card.category?.toLowerCase().includes(searchFilter.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || 
        card.category?.toLowerCase() === categoryFilter.toLowerCase();
      
      return matchesSearch && matchesCategory;
    });
  }, [availableCards, searchFilter, categoryFilter]);

  // Categorias únicas para filtro
  const categories = useMemo(() => {
    const cats = new Set(['all']);
    availableCards.forEach(card => {
      if (card.category) cats.add(card.category.toLowerCase());
    });
    return Array.from(cats);
  }, [availableCards]);

  const addCardToDeck = useCallback((card) => {
    setDeckCards(prev => {
      // Verificar se já atingiu o limite máximo
      if (deckCount >= DECK_MAX_SIZE) return prev;
      
      // Verificar se a carta já está no deck (máximo 1 de cada)
      if (prev.some(c => c.id === card.id)) return prev;
      
      return [...prev, { id: card.id, quantity: 1 }];
    });
  }, [deckCount]);

  const removeCardFromDeck = useCallback((cardId) => {
    setDeckCards(prev => prev.filter(c => c.id !== cardId));
  }, []);

  const clearDeck = useCallback(() => {
    setDeckCards([]);
  }, []);

  const autoCompleteDeck = useCallback(() => {
    const remaining = DECK_MIN_SIZE - deckCount;
    if (remaining <= 0) return;

    const availableToAdd = filteredCards.filter(card => 
      !deckCards.some(dc => dc.id === card.id)
    );

    const toAdd = availableToAdd.slice(0, remaining).map(card => ({
      id: card.id,
      quantity: 1
    }));

    setDeckCards(prev => [...prev, ...toAdd]);
  }, [deckCount, filteredCards, deckCards]);

  const handleSave = useCallback(async () => {
    if (!isValidDeck) return;
    
    setSaving(true);
    try {
      const cardIds = deckCards.map(c => c.id);
      await onSave?.(cardIds);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar deck:', error);
    } finally {
      setSaving(false);
    }
  }, [isValidDeck, deckCards, onSave, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div 
        className="bg-[#101c2a] rounded-xl shadow-lg p-6 md:p-8 w-[95vw] md:w-[1100px] max-h-[90vh] overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-white">{title}</h2>
            <p className="text-sm text-white/70">{subtitle}</p>
          </div>
          <button 
            type="button" 
            className="text-white text-2xl hover:text-red-400 transition-colors" 
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <input
            type="text"
            placeholder="Buscar cartas..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="flex-1 px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white placeholder-white/60"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'Todas as Categorias' : cat}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Coleção - 3/4 do espaço */}
          <div className="lg:col-span-3 border border-white/10 rounded-lg p-3 bg-black/30">
            <h3 className="font-semibold mb-3 text-white">Coleção Disponível</h3>
            <div className="overflow-y-auto" style={{ maxHeight: '60vh' }}>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredCards.map(card => {
                  const isInDeck = deckCards.some(c => c.id === card.id);
                  const canAdd = !isInDeck && deckCount < DECK_MAX_SIZE;
                  
                  // Função auxiliar para determinar a raridade e frame
                  const getRarityFrame = (rarity) => {
                    const rarityLower = (rarity || '').toLowerCase();
                    if (rarityLower.includes('mítico') || rarityLower.includes('mythic')) {
                      return 'border-purple-500/50 bg-purple-900/10 text-purple-400';
                    } else if (rarityLower.includes('lendário') || rarityLower.includes('legendary')) {
                      return 'border-yellow-500/50 bg-yellow-900/10 text-yellow-400';
                    } else if (rarityLower.includes('épico') || rarityLower.includes('epic')) {
                      return 'border-orange-500/50 bg-orange-900/10 text-orange-400';
                    }
                    return 'border-gray-500/50 bg-gray-900/10 text-gray-400';
                  };

                  const rarityFrame = getRarityFrame(card.rarity || card.raridade);
                  
                  return (
                    <div
                      key={card.id}
                      onClick={() => canAdd && addCardToDeck(card)}
                      className={`bg-black/30 backdrop-blur-sm rounded-lg p-3 border-2 transition-all hover:scale-105 cursor-pointer relative ${
                        isInDeck 
                          ? 'border-green-500/50 bg-green-900/20' 
                          : canAdd 
                            ? `${rarityFrame} hover:border-yellow-400` 
                            : 'border-gray-700/50 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="text-center">
                        <div className="mb-3">
                          <CardImage card={card} size="medium" className="mx-auto" />
                        </div>
                        <h4 className="text-sm font-bold mb-1 text-white truncate">{card.name || card.nome}</h4>
                        <div className="text-xs text-gray-400 mb-1 truncate">
                          {card.region || card.regiao} • {card.category || card.categoria}
                        </div>
                        <div className={`text-xs font-semibold mb-2 ${rarityFrame.split(' ')[2] || 'text-gray-400'}`}>
                          {card.rarity || card.raridade || 'Comum'}
                        </div>
                        {(card.attack != null || card.defense != null || card.life != null) && (
                          <div className="grid grid-cols-3 gap-1 text-xs">
                            <div className="bg-red-900/40 p-1 rounded">ATQ: {card.attack || card.ataque || '-'}</div>
                            <div className="bg-blue-900/40 p-1 rounded">DEF: {card.defense || card.defesa || '-'}</div>
                            <div className="bg-green-900/40 p-1 rounded">VIDA: {card.life || card.vida || '-'}</div>
                          </div>
                        )}
                        {isInDeck && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Deck Atual - 1/4 do espaço */}
          <div className="border border-white/10 rounded-lg p-3 bg-black/30 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">Deck Atual</h3>
              <div className="text-xs text-white space-y-1">
                <div className={`px-2 py-1 rounded ${
                  isValidDeck ? 'bg-green-900/50 text-green-300' : 
                  deckCount < 15 ? 'bg-yellow-900/50 text-yellow-300' :
                  'bg-red-900/50 text-red-300'
                }`}>
                  Total: {deckCount}/15
                </div>
                <div className="flex gap-2">
                  <span className="text-purple-300">
                    L: {deckCards.filter(({ id }) => {
                      const card = availableCards.find(c => c.id === id);
                      const category = (card?.categoria || card?.category || '').toLowerCase();
                      const type = (card?.tipo || card?.type || '').toLowerCase();
                      return category === 'lenda' || type === 'lenda' || category === 'legend' || type === 'legend';
                    }).length}/5
                  </span>
                  <span className="text-blue-300">
                    I: {deckCards.filter(({ id }) => {
                      const card = availableCards.find(c => c.id === id);
                      const category = (card?.categoria || card?.category || '').toLowerCase();
                      const type = (card?.tipo || card?.type || '').toLowerCase();
                      return category === 'item' || type === 'item' || category === 'itens' || type === 'itens';
                    }).length}/10
                  </span>
                </div>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 pr-1" style={{ maxHeight: '50vh' }}>
              {deckCards.length === 0 ? (
                <div className="text-xs text-white/60 text-center py-4">
                  Seu deck está vazio.<br/>
                  Clique nas cartas para adicionar.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {deckCards.map(deckCard => {
                    const card = availableCards.find(c => c.id === deckCard.id);
                    
                    // Função auxiliar para determinar a raridade e frame
                    const getRarityFrame = (rarity) => {
                      const rarityLower = (rarity || '').toLowerCase();
                      if (rarityLower.includes('mítico') || rarityLower.includes('mythic')) {
                        return 'border-purple-500/50 bg-purple-900/20';
                      } else if (rarityLower.includes('lendário') || rarityLower.includes('legendary')) {
                        return 'border-yellow-500/50 bg-yellow-900/20';
                      } else if (rarityLower.includes('épico') || rarityLower.includes('epic')) {
                        return 'border-orange-500/50 bg-orange-900/20';
                      }
                      return 'border-gray-500/50 bg-gray-900/20';
                    };

                    const rarityFrame = getRarityFrame(card?.rarity || card?.raridade);
                    
                    return (
                      <div key={deckCard.id} className={`bg-black/40 backdrop-blur-sm rounded-lg p-2 border relative ${rarityFrame}`}>
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-15 bg-gradient-to-b from-gray-700 to-gray-800 rounded flex items-center justify-center flex-shrink-0">
                            <span className="text-sm">🎭</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-white truncate">
                              {card?.name || card?.nome || `Carta ${deckCard.id}`}
                            </div>
                            <div className="text-[10px] text-white/60 truncate">
                              {card?.category || card?.categoria}
                            </div>
                            <div className="text-[10px] text-white/40 truncate">
                              {card?.rarity || card?.raridade || 'Comum'}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCardFromDeck(deckCard.id)}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-xs text-white transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Ações do Deck */}
            <div className="mt-3 space-y-2">
              {deckCount < DECK_MIN_SIZE && availableCards.length > 0 && (
                <button
                  type="button"
                  className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white transition-colors"
                  onClick={autoCompleteDeck}
                >
                  🤖 Auto-completar ({DECK_MIN_SIZE - deckCount} cartas)
                </button>
              )}
              
              <button
                type="button"
                className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white transition-colors"
                onClick={clearDeck}
                disabled={deckCards.length === 0}
              >
                🗑️ Limpar Deck
              </button>
              
              <button
                type="button"
                className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm text-white disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                disabled={!isValidDeck || saving}
                onClick={handleSave}
              >
                {saving ? '⏳ Salvando...' : '💾 Salvar Deck'}
              </button>
              
              {!isValidDeck && deckCount > 0 && (
                <p className="text-xs text-center text-yellow-300">
                  {deckCount < DECK_MIN_SIZE 
                    ? `Adicione pelo menos ${DECK_MIN_SIZE - deckCount} cartas`
                    : `Remova ${deckCount - DECK_MAX_SIZE} cartas`
                  }
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
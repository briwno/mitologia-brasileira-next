"use client";
// src/components/Deck/DeckBuilder.js
import { useState, useMemo, useCallback, useEffect } from 'react';
import { cardsAPI } from '@/utils/api'; // ATUALIZADO: Removido itemCardsAPI
import { DECK_RULES } from '@/utils/deckValidation';
import ImagemDaCarta from '@/components/Card/CardImage';
import { useCollection } from '@/hooks/useCollection';
import { mapearCartaDaApi, inferirCustoParaJogar } from '@/utils/cardUtils';

const DECK_MIN_SIZE = DECK_RULES.MIN_SIZE; // 25
const DECK_MAX_SIZE = DECK_RULES.MAX_SIZE; // 25

export default function DeckBuilder({
  isOpen,
  onClose,
  onSave,
  initialDeck = [],
  title = "Editor de Deck",
  subtitle = `Selecione ${DECK_RULES.REQUIRED_LENDAS} lendas únicas`
}) {
  // ATUALIZADO: Removido itemCards (sistema de itens desativado)
  const { cards: ownedCardIds, loading: collectionLoading } = useCollection();
  const [allCards, setAllCards] = useState([]);
  const [availableCards, setAvailableCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(false);

  // Debug logs
  console.log('[DeckBuilder] Collection data:', { 
    ownedCardIds, 
    collectionLoading,
    allCardsLength: allCards.length,
    availableCardsLength: availableCards.length
  });

  // Carregar todas as cartas disponíveis
  useEffect(() => {
    const loadAllCards = async () => {
      setLoadingCards(true);
      try {
        // ATUALIZADO: Apenas cartas de lendas (sistema de itens desativado)
        const cardsResponse = await cardsAPI.getAll();
        
        console.log('[DeckBuilder] API Response:', { cardsResponse });
        
        let allCardsData = [];
        
        // Adicionar cartas regulares (lendas) usando mapearCartaDaApi para consistência
        if (cardsResponse?.cards) {
          const mappedCards = cardsResponse.cards.map(card => {
            const localCard = mapearCartaDaApi(card);
            // Garantir compatibilidade de campos para DeckBuilder e marcar como lenda
            return {
              ...localCard,
              name: localCard.nome || card.name,
              category: 'lenda', // Marcar como lenda
              type: 'lenda',
              region: localCard.regiao || card.region,
              rarity: localCard.raridade || card.rarity,
              attack: localCard.ataque || card.attack,
              defense: localCard.defesa || card.defense,
              life: localCard.vida || card.life,
              ability: localCard.habilidade || card.ability,
              abilityDescription: localCard.descricaoHabilidade || card.abilityDescription,
              description: localCard.descricao || card.description,
              history: localCard.historia || card.history,
              // Garantir que as imagens estejam no formato correto
              images: card.images || {
                retrato: card.image,
                completa: card.image
              },
              imagens: localCard.imagens || {
                retrato: card.image,
                completa: card.image
              }
            };
          });
          allCardsData = [...allCardsData, ...mappedCards];
        }
        
        // REMOVIDO: Sistema de itens desativado
        // Não carrega mais item_cards
        
        console.log('[DeckBuilder] All cards loaded:', allCardsData);
        setAllCards(allCardsData);
      } catch (error) {
        console.error('Erro ao carregar cartas:', error);
      } finally {
        setLoadingCards(false);
      }
    };

    if (isOpen) {
      loadAllCards();
    }
  }, [isOpen]);

  // Filtrar cartas disponíveis baseado na coleção do usuário
  useEffect(() => {
    console.log('[DeckBuilder] Filtering available cards:', {
      allCardsLength: allCards.length,
      collectionLoading,
      ownedCardIds
    });
    
    if (allCards.length > 0 && !collectionLoading) {
      // ATUALIZADO: Apenas lendas (sistema de itens desativado)
      const userCards = allCards.filter(card => {
        const cardId = card.id;
        const category = (card.category || '').toLowerCase();
        
        console.log('[DeckBuilder] Checking card:', { cardId, category, card });
        
        if (category === 'lenda' || category === 'legend') {
          const hasCard = ownedCardIds.includes(cardId);
          console.log('[DeckBuilder] Legend card check:', { cardId, hasCard });
          return hasCard;
        }
        
        return false;
      });
      
      console.log('[DeckBuilder] Filtered available cards:', userCards);
      setAvailableCards(userCards);
    }
  }, [allCards, ownedCardIds, collectionLoading]);

  // Função para limpar o deck
  const clearDeck = useCallback(() => {
    setDeckCards([]);
  }, []);
  
  const [deckCards, setDeckCards] = useState(() => 
    initialDeck.map(cardId => ({ id: cardId, quantity: 1 }))
  );
  const [saving, setSaving] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [previewCard, setPreviewCard] = useState(null);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });
  const previewCost = useMemo(() => inferirCustoParaJogar(previewCard), [previewCard]);

  const deckCount = useMemo(() => 
    deckCards.reduce((sum, card) => sum + card.quantity, 0), 
    [deckCards]
  );

  const isValidDeck = useMemo(() => 
    deckCount >= DECK_MIN_SIZE && deckCount <= DECK_MAX_SIZE,
    [deckCount]
  );

  // ATUALIZADO: Apenas lendas (sistema de itens desativado)
  const legendCards = useMemo(() => {
    return availableCards.filter(card => {
      const category = (card.category || '').toLowerCase();
      const type = (card.type || '').toLowerCase();
      return category === 'lenda' || type === 'lenda' || category === 'legend' || type === 'legend';
    });
  }, [availableCards]);

  // Filtrar lendas
  const filteredLegends = useMemo(() => {
    return legendCards.filter(card => {
      const matchesSearch = !searchFilter || 
        card.name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        card.category?.toLowerCase().includes(searchFilter.toLowerCase());
      
      return matchesSearch;
    });
  }, [legendCards, searchFilter]);

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

  // Função para auto-completar deck até o mínimo de cartas
  const autoCompleteDeck = useCallback(() => {
    const remaining = DECK_MIN_SIZE - deckCount;
    if (remaining <= 0) return;
    
    const availableToAdd = availableCards.filter(card =>
      !deckCards.some(dc => dc.id === card.id)
    );
    
    const legendsToAdd = DECK_RULES.REQUIRED_LENDAS - deckCards.length;
    
    const legends = availableToAdd
      .filter(card => {
        const category = (card.category || '').toLowerCase();
        const type = (card.type || '').toLowerCase();
        return category === 'lenda' || type === 'lenda' || category === 'legend' || type === 'legend';
      })
      .slice(0, legendsToAdd);
    
    setDeckCards(prev => [...prev, ...legends.map(card => ({ id: card.id, quantity: 1 }))]);
  }, [deckCount, deckCards, availableCards]);

  const addCardToDeck = useCallback((card) => {
    setDeckCards(prev => {
      // Verificar se a carta já está no deck (máximo 1 de cada)
      if (prev.some(c => c.id === card.id)) return prev;

      // ATUALIZADO: Apenas lendas (sistema de itens desativado)
      const category = (card.category || '').toLowerCase();
      const type = (card.type || '').toLowerCase();
      const isLegend = category === 'lenda' || type === 'lenda' || category === 'legend' || type === 'legend';
      
      // Verificar se pode adicionar mais lendas
      if (isLegend && prev.length >= DECK_RULES.REQUIRED_LENDAS) {
        return prev; // Não pode adicionar mais lendas
      }
      
      if (!isLegend) {
        return prev; // Não adiciona itens (sistema desativado)
      }
      
      return [...prev, { id: card.id, quantity: 1 }];
    });
  }, []);

  const removeCardFromDeck = useCallback((cardId) => {
    setDeckCards(prev => prev.filter(card => card.id !== cardId));
  }, []);

  // Funções para preview de cartas
  const handleCardHover = useCallback((card, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPreviewPosition({
      x: rect.right + 10,
      y: rect.top
    });
    setPreviewCard(card);
  }, []);

  const handleCardLeave = useCallback(() => {
    setPreviewCard(null);
  }, []);

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

  const isLoading = loadingCards || collectionLoading;

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
            placeholder="🔍 Buscar lendas..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="flex-1 px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white placeholder-white/60"
          />
          <div className="flex gap-2 text-sm text-white bg-black/30 px-3 py-2 rounded-lg border border-white/10">
            <span className="text-purple-300">🔮 {filteredLegends.length} Lendas</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-white">Carregando sua coleção...</p>
            </div>
          </div>
        ) : availableCards.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-white mb-2">Coleção Vazia</h3>
            <p className="text-gray-400 mb-4">Você ainda não possui cartas para montar um deck.</p>
            <p className="text-sm text-gray-500">Visite o museu ou complete conquistas para conseguir cartas!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Coleção - 2/3 do espaço */}
            <div className="lg:col-span-2 space-y-4">
            {/* Seção de Lendas */}
            <div className={`border rounded-lg p-4 bg-black/30 transition-all duration-300 ${
              deckCards.length >= DECK_RULES.REQUIRED_LENDAS 
                ? 'border-purple-400/60 bg-purple-900/20 shadow-lg shadow-purple-500/10' 
                : 'border-purple-500/20'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-purple-300 flex items-center gap-2">
                  🔮 Lendas Disponíveis
                  {deckCards.length >= DECK_RULES.REQUIRED_LENDAS && (
                    <span className="text-green-400 text-xs">✓ COMPLETO</span>
                  )}
                </h3>
                <div className={`text-sm px-2 py-1 rounded transition-colors ${
                  deckCards.length >= DECK_RULES.REQUIRED_LENDAS
                    ? 'text-green-300 bg-green-900/30 border border-green-500/30'
                    : 'text-purple-300 bg-purple-900/30'
                }`}>
                  {deckCards.length} / 5 selecionadas
                </div>
              </div>
              
              <div className="overflow-y-auto" style={{ maxHeight: '60vh' }}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3">
                  {filteredLegends.length === 0 ? (
                    <div className="col-span-full text-center text-purple-300/60 py-8">
                      <div className="text-2xl mb-2">🔮</div>
                      <div>Nenhuma lenda encontrada</div>
                      <div className="text-xs mt-1">Total de cartas: {availableCards.length}</div>
                    </div>
                  ) : (
                    filteredLegends.map(card => {
                    const isInDeck = deckCards.some(c => c.id === card.id);
                    const canAdd = !isInDeck && deckCards.length < DECK_RULES.REQUIRED_LENDAS;
                    const rarityFrame = getRarityFrame(card.rarity || card.raridade);
                    
                    return (
                      <div
                        key={card.id}
                        onClick={() => canAdd && addCardToDeck(card)}
                        onMouseEnter={(e) => handleCardHover(card, e)}
                        onMouseLeave={handleCardLeave}
                        className={`bg-black/30 backdrop-blur-sm rounded-lg p-3 border-2 transition-all duration-300 cursor-pointer relative ${
                          isInDeck 
                            ? 'border-purple-400/70 bg-purple-900/30 shadow-lg shadow-purple-500/20 ring-2 ring-purple-400/30' 
                            : canAdd 
                              ? `${rarityFrame} hover:border-purple-400 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20` 
                              : 'border-gray-700/30 opacity-40 cursor-not-allowed grayscale hover:grayscale-0 hover:opacity-60'
                        }`}
                        title={!canAdd && !isInDeck ? `Limite de lendas atingido (5/5)` : ''}
                      >
                        <div className="text-center">
                          <div className="mb-2 relative">
                            <ImagemDaCarta 
                              card={card} 
                              size="small" 
                              className="mx-auto transition-transform hover:scale-110" 
                              showPlaceholder={true}
                              priority={false}
                            />
                            {/* Badge de categoria */}
                            <div className="absolute -top-1 -left-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-[8px] font-bold">L</span>
                            </div>
                          </div>
                          <h4 className="text-xs font-bold mb-1 text-white truncate" title={card.name || card.nome}>
                            {card.name || card.nome}
                          </h4>
                          <div className="text-[10px] text-gray-400 mb-1 truncate" title={card.region || card.regiao}>
                            {card.region || card.regiao}
                          </div>
                          <div className={`text-[10px] font-semibold ${rarityFrame.split(' ')[2] || 'text-gray-400'}`}>
                            {card.rarity || card.raridade || 'Comum'}
                          </div>
                          {(card.attack != null || card.defense != null || card.life != null) && (
                            <div className="grid grid-cols-3 gap-1 text-[9px] mt-1">
                              <div className="bg-red-900/40 p-1 rounded">ATQ: {card.attack || card.ataque || '-'}</div>
                              <div className="bg-blue-900/40 p-1 rounded">DEF: {card.defense || card.defesa || '-'}</div>
                              <div className="bg-green-900/40 p-1 rounded">VIDA: {card.life || card.vida || '-'}</div>
                            </div>
                          )}
                          {isInDeck && (
                            <div className="absolute top-1 right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-[10px]">✓</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }))}
                </div>
              </div>
            </div>
          </div>

          {/* Deck Atual - 1/3 do espaço */}
          <div className="border border-white/10 rounded-lg p-3 bg-black/30 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">Deck Atual</h3>
              <div className="text-xs text-white space-y-1">
                <div className={`px-2 py-1 rounded ${
                  isValidDeck ? 'bg-green-900/50 text-green-300' : 
                  deckCount < 5 ? 'bg-yellow-900/50 text-yellow-300' :
                  'bg-red-900/50 text-red-300'
                }`}>
                  {deckCount}/5 Lendas
                </div>
              </div>
            </div>

            {/* Slots das Lendas */}
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-purple-300 mb-2">🔮 Lendas (5)</h4>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 5 }).map((_, index) => {
                  const legendCard = deckCards[index];
                  const card = legendCard ? availableCards.find(c => c.id === legendCard.id) : null;

                  return (
                    <div
                      key={`legend-${index}`}
                      className={`aspect-[3/4] border-2 border-dashed rounded-lg flex items-center justify-center relative group transition-all duration-200 ${
                        card ? 'border-purple-500/50 bg-purple-900/20 hover:bg-purple-900/30' : 'border-purple-500/30 bg-purple-900/10'
                      }`}
                    >
                      {card ? (
                        <div className="text-center p-1">
                          <ImagemDaCarta 
                            card={card} 
                            size="small" 
                            className="mx-auto mb-1" 
                            showPlaceholder={true}
                            priority={true}
                          />
                          <div className="text-[8px] text-white truncate" title={card.name}>
                            {card.name}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeCardFromDeck(legendCard.id);
                            }}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-full flex items-center justify-center text-xs text-white transition-all hover:scale-125 shadow-lg shadow-red-500/50 border border-red-400/30 opacity-0 group-hover:opacity-100"
                            title="Remover lenda do deck"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="text-purple-400/50 text-xs text-center">
                          <div className="mb-1">🔮</div>
                          <div>Vazio</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ações do Deck */}
            <div className="mt-3 space-y-2">
              {deckCount < DECK_MIN_SIZE && availableCards.length > 0 && (
                <button
                  type="button"
                  className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg text-sm text-white transition-all transform hover:scale-[1.02] shadow-lg shadow-blue-500/20"
                  onClick={autoCompleteDeck}
                >
                  🤖 Auto-completar ({DECK_MIN_SIZE - deckCount} lendas)
                </button>
              )}
              
              <button
                type="button"
                className="w-full px-3 py-2 bg-gradient-to-r from-red-600/80 to-red-700/80 hover:from-red-700 hover:to-red-800 rounded-lg text-sm text-white transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-red-500/20"
                onClick={clearDeck}
                disabled={deckCards.length === 0}
                title={deckCards.length === 0 ? "Deck já está vazio" : "Remover todas as cartas do deck"}
              >
                🗑️ Limpar Deck ({deckCount} cartas)
              </button>
              
              <button
                type="button"
                className={`w-full px-3 py-2 rounded-lg text-sm text-white transition-all transform shadow-lg ${
                  isValidDeck && !saving
                    ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:scale-[1.02] shadow-green-500/20'
                    : 'bg-gray-600 cursor-not-allowed opacity-75'
                }`}
                disabled={!isValidDeck || saving}
                onClick={handleSave}
                title={
                  saving ? "Salvando deck..." :
                  !isValidDeck ? `Deck deve ter exatamente ${DECK_MIN_SIZE} cartas` :
                  "Salvar deck atual"
                }
              >
                {saving ? '⏳ Salvando...' : '💾 Salvar Deck'}
              </button>
              
              {!isValidDeck && deckCount > 0 && (
                <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-2">
                  <p className="text-xs text-center text-yellow-300 flex items-center justify-center gap-1">
                    <span>⚠️</span>
                    {deckCount < DECK_MIN_SIZE 
                      ? `Adicione ${DECK_MIN_SIZE - deckCount} carta${DECK_MIN_SIZE - deckCount > 1 ? 's' : ''}`
                      : `Remova ${deckCount - DECK_MAX_SIZE} carta${deckCount - DECK_MAX_SIZE > 1 ? 's' : ''}`
                    }
                  </p>
                </div>
              )}
              
              {isValidDeck && (
                <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-2">
                  <p className="text-xs text-center text-green-300 flex items-center justify-center gap-1">
                    <span>✅</span>
                    Deck válido - pronto para salvar!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        )}

        {/* Preview Card Modal */}
        {previewCard && (
          <div 
            className="fixed z-[70] pointer-events-none"
            style={{
              left: previewPosition.x,
              top: previewPosition.y,
              transform: previewPosition.x > window.innerWidth / 2 ? 'translateX(-100%)' : 'none'
            }}
          >
            <div className="bg-gradient-to-br from-[#0f1419] to-[#1a2332] border-2 border-white/30 rounded-xl p-5 shadow-2xl max-w-md backdrop-blur-sm animate-in fade-in-0 zoom-in-95 duration-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <ImagemDaCarta 
                    card={previewCard} 
                    size="medium" 
                    className="shadow-lg" 
                    preferFull={true}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-bold text-lg leading-tight">
                      {previewCard.name || previewCard.nome}
                    </h3>
                    <div className="flex items-center gap-1">
                      {previewCost != null && !Number.isNaN(previewCost) && (
                        <div className="bg-yellow-600/80 text-white text-xs px-2 py-1 rounded-full font-bold">
                          {previewCost}⚡
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-300 mb-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400">📍</span>
                      <span>{previewCard.region || previewCard.regiao}</span>
                      <span className="text-gray-500">•</span>
                      <span className="capitalize">{previewCard.category || previewCard.categoria}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>✨</span>
                      <span className={`font-semibold ${
                        (previewCard.rarity || previewCard.raridade) === 'LEGENDARY' ? 'text-yellow-400' :
                        (previewCard.rarity || previewCard.raridade) === 'EPIC' ? 'text-purple-400' :
                        'text-gray-400'
                      }`}>
                        {previewCard.rarity || previewCard.raridade || 'Comum'}
                      </span>
                    </div>
                    {previewCard.element && (
                      <div className="flex items-center gap-2">
                        <span>{previewCard.element === 'FIRE' ? '🔥' : previewCard.element === 'WATER' ? '💧' : previewCard.element === 'EARTH' ? '🌍' : '🌟'}</span>
                        <span className="text-gray-400">{previewCard.element}</span>
                      </div>
                    )}
                  </div>
                  
                  {(previewCard.attack != null || previewCard.defense != null || previewCard.life != null) && (
                    <div className="grid grid-cols-3 gap-2 text-xs mb-4">
                      <div className="bg-gradient-to-b from-red-800/60 to-red-900/60 p-2 rounded-lg text-center border border-red-700/30">
                        <div className="text-red-300 font-semibold mb-1">⚔️ ATQ</div>
                        <div className="text-white font-bold text-lg">{previewCard.attack || previewCard.ataque || '-'}</div>
                      </div>
                      <div className="bg-gradient-to-b from-blue-800/60 to-blue-900/60 p-2 rounded-lg text-center border border-blue-700/30">
                        <div className="text-blue-300 font-semibold mb-1">🛡️ DEF</div>
                        <div className="text-white font-bold text-lg">{previewCard.defense || previewCard.defesa || '-'}</div>
                      </div>
                      <div className="bg-gradient-to-b from-green-800/60 to-green-900/60 p-2 rounded-lg text-center border border-green-700/30">
                        <div className="text-green-300 font-semibold mb-1">❤️ VIDA</div>
                        <div className="text-white font-bold text-lg">{previewCard.life || previewCard.vida || '-'}</div>
                      </div>
                    </div>
                  )}
                  
                  {(previewCard.ability || previewCard.habilidade || previewCard.abilities) && (
                    <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 p-3 rounded-lg mb-3 border border-purple-700/30">
                      <div className="text-purple-300 font-semibold text-xs mb-1">
                        🔮 {previewCard.ability || previewCard.habilidade || 'Habilidade Especial'}
                      </div>
                      <div className="text-gray-300 text-xs">
                        {previewCard.abilityDescription || 
                         previewCard.descricaoHabilidade || 
                         previewCard.abilities?.skill1?.description ||
                         'Sem descrição disponível'}
                      </div>
                      {/* Mostrar habilidade passiva se existir */}
                      {previewCard.abilities?.passive && (
                        <div className="mt-2 text-amber-300 text-xs">
                          <span className="font-semibold">🛡️ Passiva:</span> {previewCard.abilities.passive.description}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {(previewCard.description || previewCard.descricao || previewCard.history || previewCard.historia) && (
                    <div className="bg-black/40 p-3 rounded-lg border border-gray-700/30">
                      <div className="text-xs text-gray-300 leading-relaxed">
                        {previewCard.description || previewCard.descricao || previewCard.history || previewCard.historia}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
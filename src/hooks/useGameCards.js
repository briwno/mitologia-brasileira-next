// src/hooks/useGameCards.js
"use client";

import { useState, useEffect } from 'react';
import { cardsAPI } from '@/utils/api';
import { mapApiCardToLocal } from '@/utils/cardUtils';

export function useGameCards() {
  const [cards, setCards] = useState({
    lendas: [],
    items: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadGameCards = async () => {
      try {
        setLoading(true);
        setError(null);

        // Carregar cartas principais (lendas) da API
        const cardsResponse = await cardsAPI.getAll();
        
        // Carregar itens da API
        const itemsResponse = await fetch('/api/item-cards');
        if (!itemsResponse.ok) throw new Error('Falha ao carregar itens');
        const itemsData = await itemsResponse.json();
        
        // Mapear cartas para formato local
        const mappedCards = (cardsResponse.cards || []).map(card => {
          const localCard = mapApiCardToLocal(card);
          return {
            ...localCard,
            // Garantir compatibilidade com BattleCard
            imagem: localCard.imagens?.retrato || localCard.imagens?.completa || localCard.image || card.image || '/images/placeholder.svg',
            nome: localCard.nome || card.name,
            ataque: localCard.ataque || card.attack || 3,
            defesa: localCard.defesa || card.defense || 3,
            vida: localCard.vida || card.life || localCard.defesa || 3,
            elemento: localCard.elemento || card.element,
            raridade: localCard.raridade || card.rarity || 'Comum',
            // Garantir que as estruturas de imagem estão corretas para CardImage
            imagens: {
              retrato: localCard.imagens?.retrato || card.images?.portrait || card.image,
              completa: localCard.imagens?.completa || card.images?.full || card.images?.completa
            },
            images: {
              portrait: localCard.imagens?.retrato || card.images?.portrait || card.image,
              full: localCard.imagens?.completa || card.images?.full || card.images?.completa
            }
          };
        });

        // Mapear itens para formato local
        const mappedItems = (itemsData.items || []).map(item => ({
          id: item.id,
          nome: item.name,
          imagem: item.image || '/images/placeholder.svg',
          tipo: 'item',
          tipo_item: item.type || 'consumível',
          efeito: item.effect,
          valor: item.value || 1,
          raridade: item.rarity || 'Comum',
          custo: item.cost || 1,
          descricao: item.description
        }));

        setCards({
          lendas: mappedCards,
          items: mappedItems
        });

      } catch (err) {
        console.error('Erro ao carregar cartas do jogo:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadGameCards();
  }, []);

  // Função para obter cartas aleatórias para um deck
  const getRandomDeck = (playerName = 'Jogador') => {
    if (cards.lendas.length === 0) return null;

    // Selecionar 5 lendas aleatórias
    const shuffledLendas = [...cards.lendas].sort(() => Math.random() - 0.5);
    const selectedLendas = shuffledLendas.slice(0, Math.min(5, shuffledLendas.length));
    
    // Selecionar 20 itens aleatórios
    const shuffledItems = [...cards.items].sort(() => Math.random() - 0.5);
    const selectedItems = shuffledItems.slice(0, Math.min(20, shuffledItems.length));

    // Preencher com placeholders se necessário
    while (selectedLendas.length < 5) {
      selectedLendas.push({
        nome: `Lenda ${selectedLendas.length + 1}`,
        imagem: '/images/placeholder.svg',
        ataque: 3,
        defesa: 3,
        vida: 3,
        raridade: 'Comum'
      });
    }

    while (selectedItems.length < 20) {
      selectedItems.push({
        nome: `Item ${selectedItems.length + 1}`,
        imagem: '/images/placeholder.svg',
        tipo: 'item',
        valor: 1,
        raridade: 'Comum'
      });
    }

    return {
      lendas: selectedLendas,
      items: selectedItems
    };
  };

  // Função para obter dados do jogador com cartas reais
  const getPlayerData = (playerName = 'Jogador', avatar = '/images/avatars/player.jpg', ranking = 'Bronze II') => {
    const deck = getRandomDeck(playerName);
    if (!deck) return null;

    return {
      nome: playerName,
      avatar,
      ranking,
      zonas: {
        LENDA_ATIVA: deck.lendas[0], // Primeira lenda como ativa
        BANCO_LENDAS: deck.lendas.slice(1, 5), // Outras 4 lendas no banco
        MAO_ITENS: deck.items.slice(0, 3), // 3 itens na mão
        PILHA_ITENS: deck.items.slice(3) // Resto na pilha
      }
    };
  };

  return {
    cards,
    loading,
    error,
    getRandomDeck,
    getPlayerData
  };
}
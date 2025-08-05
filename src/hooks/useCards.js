// src/hooks/useCards.js
"use client";

import { useState, useEffect } from 'react';
import { cards as staticCards } from '../data/cards';

export function useCards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      setLoading(true);
      setError(null);

      // Tentar carregar da API primeiro, senão usar dados estáticos
      try {
        const response = await fetch('/api/cards');
        if (response.ok) {
          const data = await response.json();
          setCards(data.cards);
        } else {
          throw new Error('API não disponível');
        }
      } catch (apiError) {
        // Fallback para dados estáticos
        setCards(staticCards);
      }
    } catch (err) {
      setError(err.message);
      setCards(staticCards); // Sempre ter dados como fallback
    } finally {
      setLoading(false);
    }
  };

  const getCardById = (id) => {
    return cards.find(card => card.id === id);
  };

  const getCardsByCategory = (category) => {
    return cards.filter(card => card.category === category);
  };

  const getCardsByRegion = (region) => {
    return cards.filter(card => card.region === region);
  };

  const getCardsByRarity = (rarity) => {
    return cards.filter(card => card.rarity === rarity);
  };

  const searchCards = (searchTerm) => {
    if (!searchTerm) return cards;
    
    const term = searchTerm.toLowerCase();
    return cards.filter(card => 
      card.name.toLowerCase().includes(term) ||
      card.history.toLowerCase().includes(term) ||
      card.category.toLowerCase().includes(term) ||
      card.region.toLowerCase().includes(term)
    );
  };

  const filterCards = (filters) => {
    let filteredCards = [...cards];

    if (filters.category && filters.category !== 'all') {
      filteredCards = filteredCards.filter(card => card.category === filters.category);
    }

    if (filters.region && filters.region !== 'all') {
      filteredCards = filteredCards.filter(card => card.region === filters.region);
    }

    if (filters.rarity && filters.rarity !== 'all') {
      filteredCards = filteredCards.filter(card => card.rarity === filters.rarity);
    }

    if (filters.search) {
      const term = filters.search.toLowerCase();
      filteredCards = filteredCards.filter(card => 
        card.name.toLowerCase().includes(term) ||
        card.history.toLowerCase().includes(term)
      );
    }

    if (filters.minCost !== undefined) {
      filteredCards = filteredCards.filter(card => card.cost >= filters.minCost);
    }

    if (filters.maxCost !== undefined) {
      filteredCards = filteredCards.filter(card => card.cost <= filters.maxCost);
    }

    return filteredCards;
  };

  const getUniqueValues = (property) => {
    return [...new Set(cards.map(card => card[property]))];
  };

  const getCardStats = () => {
    return {
      total: cards.length,
      byCategory: getUniqueValues('category').reduce((acc, category) => {
        acc[category] = getCardsByCategory(category).length;
        return acc;
      }, {}),
      byRegion: getUniqueValues('region').reduce((acc, region) => {
        acc[region] = getCardsByRegion(region).length;
        return acc;
      }, {}),
      byRarity: getUniqueValues('rarity').reduce((acc, rarity) => {
        acc[rarity] = getCardsByRarity(rarity).length;
        return acc;
      }, {}),
      averageCost: cards.reduce((sum, card) => sum + card.cost, 0) / cards.length,
      averageAttack: cards.reduce((sum, card) => sum + card.attack, 0) / cards.length,
      averageDefense: cards.reduce((sum, card) => sum + card.defense, 0) / cards.length
    };
  };

  return {
    cards,
    loading,
    error,
    loadCards,
    getCardById,
    getCardsByCategory,
    getCardsByRegion,
    getCardsByRarity,
    searchCards,
    filterCards,
    getUniqueValues,
    getCardStats
  };
}

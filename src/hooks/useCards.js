// src/hooks/useCards.js
"use client";

import { useState, useEffect } from 'react';
import { cards as cartasEstaticas } from '../data/cards';

export function useCards() {
  const [cartas, definirCartas] = useState([]);
  const [carregando, definirCarregando] = useState(true);
  const [erro, definirErro] = useState(null);

  useEffect(() => {
    carregarCartas();
  }, []);

  const carregarCartas = async () => {
    try {
      definirCarregando(true);
      definirErro(null);

      // Tentar carregar da API primeiro, senão usar dados estáticos
      try {
        const response = await fetch('/api/cards');
        if (response.ok) {
          const data = await response.json();
          definirCartas(data.cards);
        } else {
          throw new Error('API não disponível');
        }
      } catch (apiError) {
        // Fallback para dados estáticos
        definirCartas(cartasEstaticas);
      }
    } catch (err) {
      definirErro(err.message);
      definirCartas(cartasEstaticas); // Sempre ter dados como fallback
    } finally {
      definirCarregando(false);
    }
  };

  const obterCartaPorId = (id) => {
    return cartas.find((carta) => carta.id === id);
  };

  const obterCartasPorCategoria = (categoria) => {
  return cartas.filter((carta) => (carta.categoria || carta.category) === categoria);
  };

  const obterCartasPorRegiao = (regiao) => {
  return cartas.filter((carta) => (carta.regiao || carta.region) === regiao);
  };

  const obterCartasPorRaridade = (raridade) => {
  return cartas.filter((carta) => (carta.raridade || carta.rarity) === raridade);
  };

  const buscarCartas = (termoBusca) => {
    if (!termoBusca) return cartas;
    
    const termo = termoBusca.toLowerCase();
    return cartas.filter((carta) =>
  (carta.nome || carta.name).toLowerCase().includes(termo) ||
      carta.history.toLowerCase().includes(termo) ||
  (carta.categoria || carta.category).toLowerCase().includes(termo) ||
  (carta.regiao || carta.region).toLowerCase().includes(termo)
    );
  };

  const filtrarCartas = (filtros) => {
    let cartasFiltradas = [...cartas];

    if (filtros.category && filtros.category !== 'all') {
      cartasFiltradas = cartasFiltradas.filter((carta) => (carta.categoria || carta.category) === filtros.category);
    }

    if (filtros.region && filtros.region !== 'all') {
      cartasFiltradas = cartasFiltradas.filter((carta) => (carta.regiao || carta.region) === filtros.region);
    }

    if (filtros.rarity && filtros.rarity !== 'all') {
      cartasFiltradas = cartasFiltradas.filter((carta) => (carta.raridade || carta.rarity) === filtros.rarity);
    }

    if (filtros.search) {
      const termo = filtros.search.toLowerCase();
      cartasFiltradas = cartasFiltradas.filter((carta) =>
  (carta.nome || carta.name).toLowerCase().includes(termo) ||
        carta.history.toLowerCase().includes(termo)
      );
    }

    if (filtros.minCost !== undefined) {
  // Sem custo por carta: ignorar filtro de custo mínimo
    }

    if (filtros.maxCost !== undefined) {
  // Sem custo por carta: ignorar filtro de custo máximo
    }

    return cartasFiltradas;
  };

  const obterValoresUnicos = (propriedade) => {
    return [...new Set(cartas.map((carta) => carta[propriedade]))];
  };

  const obterEstatisticasDasCartas = () => {
    return {
      total: cartas.length,
      byCategory: obterValoresUnicos('category').reduce((acc, categoria) => {
        acc[categoria] = obterCartasPorCategoria(categoria).length;
        return acc;
      }, {}),
      byRegion: obterValoresUnicos('region').reduce((acc, regiao) => {
        acc[regiao] = obterCartasPorRegiao(regiao).length;
        return acc;
      }, {}),
      byRarity: obterValoresUnicos('rarity').reduce((acc, raridade) => {
        acc[raridade] = obterCartasPorRaridade(raridade).length;
        return acc;
      }, {}),
  // Sem custo por carta; manter campo se usado em UI (0 como default)
  averageCost: 0,
  averageAttack: cartas.reduce((soma, carta) => soma + (carta.ataque || carta.attack), 0) / cartas.length,
  averageDefense: cartas.reduce((soma, carta) => soma + (carta.defesa || carta.defense), 0) / cartas.length
    };
  };

  return {
    cards: cartas,
    loading: carregando,
    error: erro,
    loadCards: carregarCartas,
    getCardById: obterCartaPorId,
    getCardsByCategory: obterCartasPorCategoria,
    getCardsByRegion: obterCartasPorRegiao,
    getCardsByRarity: obterCartasPorRaridade,
    searchCards: buscarCartas,
    filterCards: filtrarCartas,
    getUniqueValues: obterValoresUnicos,
    getCardStats: obterEstatisticasDasCartas
  };
}

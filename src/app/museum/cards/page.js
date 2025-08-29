// src/app/museum/cards/page.js
"use client";

import Link from 'next/link';
import { useState } from 'react';
import LayoutDePagina from '../../../components/UI/PageLayout';
import { bancoDeCartas, CATEGORIAS_CARTAS, REGIOES, getCardStats } from '../../../data/cardsDatabase';
import CardImage from '../../../components/Card/CardImage';
import CardDetail from '../../../components/Card/CardDetail';
import EventBanner from '../../../components/UI/EventBanner';

// Catálogo de cartas do Museu
export default function CatalogoDeCartas() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedCard, setSelectedCard] = useState(null);

  const cards = bancoDeCartas;
  const stats = getCardStats();

  const categories = ['all', ...Object.values(CATEGORIAS_CARTAS)];
  const regions = ['all', ...Object.values(REGIOES)];

  const filteredCards = cards.filter(card => {
    const categoryMatch = selectedCategory === 'all' || card.categoria === selectedCategory;
    const regionMatch = selectedRegion === 'all' || card.regiao === selectedRegion;
    return categoryMatch && regionMatch;
  });

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Épico': return 'border-purple-500 text-purple-400';
      case 'Lendário': return 'border-yellow-500 text-yellow-400';
      case 'Mítico': return 'border-red-500 text-red-400';
      default: return 'border-gray-500 text-gray-400';
    }
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  return (
    <LayoutDePagina>
      {/* Banner de eventos */}
      <EventBanner />
      
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="text-center mb-6 sm:mb-8 px-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            🃏 Catálogo de Cartas
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-green-300">
            Descubra todas as criaturas da mitologia brasileira
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-600/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                Categoria
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-black/50 border border-gray-600 rounded-md text-white focus:border-green-500 focus:outline-none"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'Todas as Categorias' : category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                Região
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-black/50 border border-gray-600 rounded-md text-white focus:border-green-500 focus:outline-none"
              >
                {regions.map(region => (
                  <option key={region} value={region}>
                    {region === 'all' ? 'Todas as Regiões' : region}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Grid de Cartas */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {filteredCards.map(card => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              className={`bg-black/30 backdrop-blur-sm rounded-lg p-3 sm:p-4 border-2 transition-all hover:scale-105 cursor-pointer ${getRarityColor(card.raridade)}`}
            >
              <div className="text-center">
                <div className="mb-3 sm:mb-4">
                  <CardImage card={{ ...card, discovered: true }} size="medium" className="mx-auto" />
                </div>
                <h3 className="text-sm sm:text-base lg:text-lg font-bold mb-2">{card.nome}</h3>
                <div className="text-xs sm:text-sm text-gray-400 mb-2">
                  {card.regiao} • {card.categoria}
                </div>
                <div className={`text-xs font-semibold mb-2 sm:mb-3 ${getRarityColor(card.raridade).split(' ')[1]}`}>
                  {card.raridade}
                </div>
                {card.tipo === 'creature' && (
                  <div className="grid grid-cols-3 gap-1 sm:gap-2 text-xs mb-2 sm:mb-3">
                    <div className="bg-red-900/50 p-1 rounded text-xs">ATQ: {card.ataque}</div>
                    <div className="bg-blue-900/50 p-1 rounded text-xs">DEF: {card.defesa}</div>
                    <div className="bg-green-900/50 p-1 rounded text-xs">VIDA: {card.vida}</div>
                  </div>
                )}
                {card.elemento && (
                  <div className="text-xs text-yellow-400 line-clamp-2">{card.elemento}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Estatísticas */}
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-600/30">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 text-center">📊 Progresso da Coleção</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-center">
            <div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-400">{stats.discovered}</div>
              <div className="text-xs sm:text-sm text-gray-400">Cartas Descobertas</div>
            </div>
            <div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-400">{stats.total}</div>
              <div className="text-xs sm:text-sm text-gray-400">Total de Cartas</div>
            </div>
            <div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-400">{stats.progress}%</div>
              <div className="text-xs sm:text-sm text-gray-400">Progresso</div>
            </div>
            <div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-400">{stats.byRarity['Lendário'] || 0}</div>
              <div className="text-xs sm:text-sm text-gray-400">Cartas Lendárias</div>
            </div>
          </div>
        </div>

        {/* Modal de Detalhes da Carta */}
        {selectedCard && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedCard(null)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <CardDetail 
                card={selectedCard} 
                onClose={() => setSelectedCard(null)} 
              />
            </div>
          </div>
        )}

        <div className="text-center pb-4">
          <Link
            href="/museum"
            className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-semibold text-sm sm:text-base"
          >
            ← Voltar ao Museu
          </Link>
        </div>
      </div>
    </LayoutDePagina>
  );
}

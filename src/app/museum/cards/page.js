// src/app/museum/cards/page.js
"use client";

import Link from 'next/link';
import { useState } from 'react';

export default function CardCatalog() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');

  const cards = [
    {
      id: 1,
      name: 'Curupira',
      region: 'Amazônia',
      category: 'Guardiões da Floresta',
      attack: 7,
      defense: 8,
      life: 15,
      ability: 'Confusão da Floresta',
      discovered: true,
      rarity: 'Épico'
    },
    {
      id: 2,
      name: 'Iara',
      region: 'Amazônia',
      category: 'Espíritos das Águas',
      attack: 6,
      defense: 5,
      life: 12,
      ability: 'Canto Hipnótico',
      discovered: true,
      rarity: 'Raro'
    },
    {
      id: 3,
      name: 'Saci-Pererê',
      region: 'Nacional',
      category: 'Assombrações',
      attack: 5,
      defense: 6,
      life: 10,
      ability: 'Travessura',
      discovered: true,
      rarity: 'Comum'
    },
    {
      id: 4,
      name: 'Boitatá',
      region: 'Sul/Sudeste',
      category: 'Guardiões da Floresta',
      attack: 9,
      defense: 7,
      life: 18,
      ability: 'Fogo Protetor',
      discovered: false,
      rarity: 'Lendário'
    },
    {
      id: 5,
      name: 'Cuca',
      region: 'Sudeste',
      category: 'Assombrações',
      attack: 8,
      defense: 9,
      life: 16,
      ability: 'Pesadelo',
      discovered: false,
      rarity: 'Épico'
    }
  ];

  const categories = ['all', 'Guardiões da Floresta', 'Espíritos das Águas', 'Assombrações'];
  const regions = ['all', 'Amazônia', 'Nacional', 'Sul/Sudeste', 'Nordeste', 'Centro-Oeste'];

  const filteredCards = cards.filter(card => {
    const categoryMatch = selectedCategory === 'all' || card.category === selectedCategory;
    const regionMatch = selectedRegion === 'all' || card.region === selectedRegion;
    return categoryMatch && regionMatch;
  });

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Comum': return 'border-gray-500 text-gray-400';
      case 'Raro': return 'border-blue-500 text-blue-400';
      case 'Épico': return 'border-purple-500 text-purple-400';
      case 'Lendário': return 'border-yellow-500 text-yellow-400';
      default: return 'border-gray-500 text-gray-400';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-900 via-blue-900 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            🃏 Catálogo de Cartas
          </h1>
          <p className="text-xl text-green-300">
            Descubra todas as criaturas da mitologia brasileira
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 mb-8 border border-gray-600/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Categoria
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-black/50 border border-gray-600 rounded-md text-white focus:border-green-500 focus:outline-none"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'Todas as Categorias' : category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Região
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-3 py-2 bg-black/50 border border-gray-600 rounded-md text-white focus:border-green-500 focus:outline-none"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {filteredCards.map(card => (
            <div
              key={card.id}
              className={`bg-black/30 backdrop-blur-sm rounded-lg p-4 border-2 transition-all hover:scale-105 ${
                card.discovered ? getRarityColor(card.rarity) : 'border-gray-700 opacity-50'
              }`}
            >
              <div className="text-center">
                <div className="w-full h-32 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg mb-4 flex items-center justify-center">
                  {card.discovered ? (
                    <div className="text-4xl">🎭</div>
                  ) : (
                    <div className="text-4xl">❓</div>
                  )}
                </div>
                
                <h3 className="text-lg font-bold mb-2">
                  {card.discovered ? card.name : '???'}
                </h3>
                
                {card.discovered ? (
                  <>
                    <div className="text-sm text-gray-400 mb-2">
                      {card.region} • {card.category}
                    </div>
                    <div className={`text-xs font-semibold mb-3 ${getRarityColor(card.rarity).split(' ')[1]}`}>
                      {card.rarity}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                      <div className="bg-red-900/50 p-1 rounded">
                        ATQ: {card.attack}
                      </div>
                      <div className="bg-blue-900/50 p-1 rounded">
                        DEF: {card.defense}
                      </div>
                      <div className="bg-green-900/50 p-1 rounded">
                        VIDA: {card.life}
                      </div>
                    </div>
                    <div className="text-xs text-yellow-400">
                      {card.ability}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-500">
                    Complete desafios para desbloquear
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Estatísticas */}
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 mb-8 border border-gray-600/30">
          <h2 className="text-2xl font-bold mb-4 text-center">📊 Progresso da Coleção</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">12</div>
              <div className="text-sm text-gray-400">Cartas Descobertas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">30</div>
              <div className="text-sm text-gray-400">Total de Cartas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">40%</div>
              <div className="text-sm text-gray-400">Progresso</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">5</div>
              <div className="text-sm text-gray-400">Cartas Raras</div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/museum"
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-semibold"
          >
            ← Voltar ao Museu
          </Link>
        </div>
      </div>
    </main>
  );
}

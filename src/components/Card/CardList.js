// src/components/Card/CardList.js
"use client";

import { useState } from 'react';
import Card from './Card';

export default function CardList({ cards, onCardClick, showFilters = true }) {
  const [filters, setFilters] = useState({
    category: 'all',
    region: 'all',
    rarity: 'all',
    search: ''
  });

  const categories = ['all', 'Guardiões da Floresta', 'Espíritos das Águas', 'Assombrações', 'Criaturas Noturnas'];
  const regions = ['all', 'Amazônia', 'Nacional', 'Sul/Sudeste', 'Nordeste', 'Centro-Oeste'];
  const rarities = ['all', 'Épico', 'Lendário', 'Mítico'];

  const filteredCards = cards.filter(card => {
    const matchesCategory = filters.category === 'all' || card.category === filters.category;
    const matchesRegion = filters.region === 'all' || card.region === filters.region;
    const matchesRarity = filters.rarity === 'all' || card.rarity === filters.rarity;
    const matchesSearch = !filters.search || 
      card.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      card.history.toLowerCase().includes(filters.search.toLowerCase());

    return matchesCategory && matchesRegion && matchesRarity && matchesSearch;
  });

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  return (
    <div className="space-y-6">
      {showFilters && (
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-gray-600/30">
          <h3 className="text-lg font-bold mb-4">🔍 Filtros</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Busca */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Buscar
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Nome da carta..."
                className="w-full px-3 py-2 bg-black/50 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Categoria
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 bg-black/50 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'Todas as Categorias' : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Região */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Região
              </label>
              <select
                value={filters.region}
                onChange={(e) => handleFilterChange('region', e.target.value)}
                className="w-full px-3 py-2 bg-black/50 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
              >
                {regions.map(region => (
                  <option key={region} value={region}>
                    {region === 'all' ? 'Todas as Regiões' : region}
                  </option>
                ))}
              </select>
            </div>

            {/* Raridade */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Raridade
              </label>
              <select
                value={filters.rarity}
                onChange={(e) => handleFilterChange('rarity', e.target.value)}
                className="w-full px-3 py-2 bg-black/50 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
              >
                {rarities.map(rarity => (
                  <option key={rarity} value={rarity}>
                    {rarity === 'all' ? 'Todas as Raridades' : rarity}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Estatísticas dos filtros */}
          <div className="mt-4 pt-4 border-t border-gray-600/30">
            <div className="text-sm text-gray-400">
              Mostrando {filteredCards.length} de {cards.length} cartas
            </div>
          </div>
        </div>
      )}

      {/* Grid de Cartas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredCards.map(card => (
          <Card
            key={card.id}
            card={card}
            onClick={() => onCardClick && onCardClick(card)}
          />
        ))}
      </div>

      {filteredCards.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-bold mb-2">Nenhuma carta encontrada</h3>
          <p className="text-gray-400">
            Tente ajustar os filtros ou buscar por outros termos
          </p>
        </div>
      )}
    </div>
  );
}

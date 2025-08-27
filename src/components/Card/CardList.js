// src/components/Card/CardList.js
"use client";

import { useState } from 'react';
import Card from './Card';

// Lista de cartas com filtros locais (somente UI)
export default function ListaDeCartas({ cards, onCardClick, showFilters = true }) {
  // Estado de filtros aplicados
  const [filtros, definirFiltros] = useState({
    category: 'all',
    region: 'all',
    rarity: 'all',
    search: '',
  });

  // Opções disponíveis nos filtros
  const categorias = ['all', 'Guardiões da Floresta', 'Espíritos das Águas', 'Assombrações', 'Criaturas Noturnas'];
  const regioes = ['all', 'Amazônia', 'Nacional', 'Sul/Sudeste', 'Nordeste', 'Centro-Oeste'];
  const raridades = ['all', 'Épico', 'Lendário', 'Mítico'];

  // Derivado: lista filtrada conforme os filtros atuais
  const cartasFiltradas = cards.filter((card) => {
    const combinaCategoria = filtros.category === 'all' || card.category === filtros.category;
    const combinaRegiao = filtros.region === 'all' || card.region === filtros.region;
    const combinaRaridade = filtros.rarity === 'all' || card.rarity === filtros.rarity;
    const combinaBusca =
      !filtros.search ||
      card.name.toLowerCase().includes(filtros.search.toLowerCase()) ||
      card.history.toLowerCase().includes(filtros.search.toLowerCase());

    return combinaCategoria && combinaRegiao && combinaRaridade && combinaBusca;
  });

  // Atualiza um filtro específico
  const alterarFiltro = (tipo, valor) => {
    definirFiltros((anterior) => ({
      ...anterior,
      [tipo]: valor,
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
              <label className="block text-sm font-medium text-gray-300 mb-2">Buscar</label>
              <input
                type="text"
                value={filtros.search}
                onChange={(e) => alterarFiltro('search', e.target.value)}
                placeholder="Nome da carta..."
                className="w-full px-3 py-2 bg-black/50 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Categoria</label>
              <select
                value={filtros.category}
                onChange={(e) => alterarFiltro('category', e.target.value)}
                className="w-full px-3 py-2 bg-black/50 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
              >
                {categorias.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria === 'all' ? 'Todas as Categorias' : categoria}
                  </option>
                ))}
              </select>
            </div>

            {/* Região */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Região</label>
              <select
                value={filtros.region}
                onChange={(e) => alterarFiltro('region', e.target.value)}
                className="w-full px-3 py-2 bg-black/50 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
              >
                {regioes.map((regiao) => (
                  <option key={regiao} value={regiao}>
                    {regiao === 'all' ? 'Todas as Regiões' : regiao}
                  </option>
                ))}
              </select>
            </div>

            {/* Raridade */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Raridade</label>
              <select
                value={filtros.rarity}
                onChange={(e) => alterarFiltro('rarity', e.target.value)}
                className="w-full px-3 py-2 bg-black/50 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
              >
                {raridades.map((raridade) => (
                  <option key={raridade} value={raridade}>
                    {raridade === 'all' ? 'Todas as Raridades' : raridade}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Estatísticas dos filtros */}
          <div className="mt-4 pt-4 border-t border-gray-600/30">
            <div className="text-sm text-gray-400">
              Mostrando {cartasFiltradas.length} de {cards.length} cartas
            </div>
          </div>
        </div>
      )}

      {/* Grid de Cartas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {cartasFiltradas.map((card) => (
          <Card key={card.id} card={card} onClick={() => onCardClick && onCardClick(card)} />
        ))}
      </div>

      {cartasFiltradas.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-bold mb-2">Nenhuma carta encontrada</h3>
          <p className="text-gray-400">Tente ajustar os filtros ou buscar por outros termos</p>
        </div>
      )}
    </div>
  );
}

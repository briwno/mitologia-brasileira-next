// src/app/museum/cards/page.js
"use client";
import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import LayoutDePagina from '@/components/UI/PageLayout';
import CardModal from '@/components/Card/CardModal';
import ItemCard from '@/components/Card/ItemCard';
import { cardsAPI } from '@/utils/api';
import {
  TRANSLATION_MAPS,
  translate,
  formatEnumLabel
} from '@/utils/cardUtils';

// Card estilo "story quest"
function StoryCard({ card, onClick, idx = 0 }) {
  // Escolhe a melhor fonte disponível: preferir a imagem completa se existir (maior resolução), senão retrato
  const fullSrc = card.images?.completa || card.imagens?.completa || card.images?.full || card.imagens?.full;
  const portrait = card.images?.retrato || card.imagens?.retrato || card.images?.portrait || card.imagens?.portrait || card.image || card.imagem;
  const imgSrc = fullSrc || portrait || '/images/placeholder.svg';
  const rarityStyles = {
    'Épico': 'from-purple-500/50 to-purple-900/60 border-purple-400/40' ,
    'Lendário': 'from-amber-400/60 to-amber-800/60 border-amber-400/40',
    'Mítico': 'from-rose-500/60 to-rose-900/60 border-rose-400/40'
  };
  const rare = card.raridade || card.rarity;
  const style = rarityStyles[rare] || 'from-slate-400/30 to-slate-800/60 border-slate-400/30';
  const isMythic = rare === 'Mítico' || rare === 'MYTHIC';

  // Build a CSS gradient matching rarityStyles colors for the OUTER animated border
  const getRarityGradient = (r) => {
    if (r === 'Mítico' || r === 'MYTHIC') {
      return 'linear-gradient(135deg, rgba(244,63,94,0.6), rgba(255, 0, 0, 0.6))'; 
    }
    if (r === 'Lendário' || r === 'LEGENDARY') {
      return 'linear-gradient(135deg, rgba(231, 178, 2, 0.97), rgba(255, 180, 67, 0.6))'; 
    }
    if (r === 'Épico' || r === 'EPIC') {
      return 'linear-gradient(135deg, rgba(168,85,247,0.5), rgba(144, 0, 255, 0.6))'; 
    }
    return 'linear-gradient(135deg, rgba(148,163,184,0.3), rgba(51,65,85,0.6))'; 
  };
  const borderStyle = {
    backgroundImage: getRarityGradient(rare),
    backgroundSize: isMythic ? '200% 200%' : undefined,
    animation: isMythic ? 'mb-gradient-shift 6s linear infinite' : undefined,
  };

  return (
    <div
      className={`relative rounded-xl p-[2px] transition-all group transform duration-200 will-change-transform hover:scale-[1.03]`}
      style={borderStyle}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <style jsx>{`
        @keyframes mb-gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <div className={`relative w-full aspect-[7/11] rounded-xl overflow-hidden backdrop-blur-sm bg-gradient-to-b ${style} shadow-lg focus:outline-none ring-0`}>
      {/* Glow on hover */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300">
        <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-white/10 via-white/5 to-white/10 blur-xl" />
      </div>
      <Image
        src={imgSrc}
        alt={card.nome || card.name}
        fill
        className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.04]"
        sizes="(min-width:1536px) 22vw, (min-width:1280px) 24vw, (min-width:1024px) 28vw, (min-width:640px) 44vw, 92vw"
        quality={100}
        priority={idx < 8}
        loading={idx < 8 ? 'eager' : 'lazy'}
        fetchPriority={idx < 8 ? 'high' : 'auto'}
        unoptimized={typeof imgSrc === 'string' && imgSrc.startsWith('http')}
      />
  <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/30 to-black/75" />
      <div className="absolute bottom-0 inset-x-0 p-3 flex flex-col gap-1 text-left">
  <span className="text-[10px] tracking-wide font-semibold text-white/60 uppercase line-clamp-1">{card.regiao || card.region || '—'}</span>
  <h3 className="text-sm font-bold leading-snug drop-shadow-sm line-clamp-2">{card.nome || card.name}</h3>
  <span className="text-[10px] font-semibold text-white/70 tracking-wide">{card.raridade || card.rarity}</span>
      </div>
      {card.novo && (
        <div className="absolute top-2 right-2 bg-orange-600 text-[10px] px-2 py-1 rounded-full font-bold shadow">NOVO</div>
      )}
      </div>
    </div>
  );
}

export default function CatalogoComContos() {
  const [selected, setSelected] = useState(null);
  const [selectedTab, setSelectedTab] = useState('cards'); // 'cards' | 'items'
  const [cards, setCards] = useState([]);
  const [itemCards, setItemCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados dos filtros
  const [filters, setFilters] = useState({
    search: '',
    rarity: 'todas',
    region: 'todas',
    category: 'todas',
    itemType: 'todos',
    element: 'todos'
  });
  const [showFilters, setShowFilters] = useState(false);

  const isSelectedItem = useMemo(() => {
    if (!selected) return false;
    if (selected.itemType != null || selected.effects != null) return true;

    const tipo = (selected.tipo || selected.type || selected.cardType || '').toString().toLowerCase();
    if (tipo === 'item' || tipo === 'itens') return true;

    const categoria = (selected.categoria || selected.category || '').toString().toLowerCase();
    return categoria.includes('item') || categoria.includes('equipamento') || categoria.includes('consum') || categoria.includes('artefato');
  }, [selected]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        
        // Fetch regular cards usando API client
        const cardsData = await cardsAPI.getAll();
        
        // Fetch item cards
        const itemsRes = await fetch('/api/item-cards');
        if (!itemsRes.ok) throw new Error('Falha ao carregar itens');
        const itemsData = await itemsRes.json();

        const mappedCards = (cardsData.cards || []).map((c, idx) => {
          const sb = c.seasonalBonus || c.seasonal_bonus;
          const seasonKey = sb?.season || sb?.estacao;
          const bonusSazonal = sb ? {
            estacao: translate(seasonKey, TRANSLATION_MAPS.SEASON) || formatEnumLabel(seasonKey),
            descricao: sb.description || sb.descricao || sb.text || '',
            multiplicador: sb.multiplier || sb.multiplicador || sb.bonus || null
          } : null;
          return {
            id: c.id,
            nome: c.name,
            regiao: translate(c.region, TRANSLATION_MAPS.REGION),
            categoria: translate(c.category, TRANSLATION_MAPS.CATEGORY),
            raridade: translate(c.rarity, TRANSLATION_MAPS.RARITY),
            historia: c.history,
            imagens: c.images,
            imagem: c.image,
            elemento: translate(c.element, TRANSLATION_MAPS.ELEMENT),
            habilidades: c.abilities || {},
            tipo: (c.cardType || c.card_type || 'CREATURE').toString().toLowerCase(),
            novo: idx == 5,
            tags: c.tags,
            bonusSazonal
          };
        });

        // Mapear os item cards para tradução
        const mappedItems = (itemsData.itemCards || []).map((item) => ({
          ...item,
          itemType: translate(item.itemType, TRANSLATION_MAPS.ITEM_TYPE),
          rarity: translate(item.rarity, TRANSLATION_MAPS.RARITY),
        }));

        if (!cancelled) {
          setCards(mappedCards);
          setItemCards(mappedItems);
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Filtrar cartas baseado nos filtros selecionados
  const filteredCards = useMemo(() => {
    let filtered = [...cards];
    
    // Filtro de busca por nome
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(card => 
        (card.nome || '').toLowerCase().includes(searchLower)
      );
    }
    
    // Filtro por raridade
    if (filters.rarity !== 'todas') {
      filtered = filtered.filter(card => card.raridade === filters.rarity);
    }
    
    // Filtro por região
    if (filters.region !== 'todas') {
      filtered = filtered.filter(card => card.regiao === filters.region);
    }
    
    // Filtro por categoria
    if (filters.category !== 'todas') {
      filtered = filtered.filter(card => card.categoria === filters.category);
    }
    
    // Filtro por elemento
    if (filters.element !== 'todos') {
      filtered = filtered.filter(card => card.elemento === filters.element);
    }
    
    // Coloca cartas marcadas como "novo" no topo; mantém ordem relativa para o restante
    filtered.sort((a, b) => (b.novo === true) - (a.novo === true));
    return filtered;
  }, [cards, filters]);

  // Filtrar itens baseado nos filtros selecionados
  const filteredItems = useMemo(() => {
    let filtered = [...itemCards];
    
    // Filtro de busca por nome
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(item => 
        (item.name || item.nome || '').toLowerCase().includes(searchLower)
      );
    }
    
    // Filtro por raridade
    if (filters.rarity !== 'todas') {
      filtered = filtered.filter(item => item.rarity === filters.rarity);
    }
    
    // Filtro por tipo de item
    if (filters.itemType !== 'todos') {
      filtered = filtered.filter(item => item.itemType === filters.itemType);
    }
    
    return filtered;
  }, [itemCards, filters]);

  const displayItems = selectedTab === 'items' ? filteredItems : filteredCards;

  // Função para limpar filtros
  const clearFilters = () => {
    setFilters({
      search: '',
      rarity: 'todas',
      region: 'todas',
      category: 'todas',
      itemType: 'todos',
      element: 'todos'
    });
  };

  // Contar itens ativos após filtros
  const activeFiltersCount = Object.values(filters).filter(val => 
    val !== 'todas' && val !== 'todos' && val !== ''
  ).length;
  
  return (
    <LayoutDePagina>
      <div className="container mx-auto px-4 py-8">
        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500">🃏 Coleção Completa</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Explore todas as cartas de personagens e itens da mitologia brasileira.
          </p>
        </div>

        {/* Tabs e Controles */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-4">
          {/* Tabs */}
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-1 flex">
            <button
              onClick={() => setSelectedTab('cards')}
              className={`px-6 py-2 rounded-md font-semibold transition-all ${
                selectedTab === 'cards'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              🃏 Cartas ({filteredCards.length}/{cards.length})
            </button>
            <button
              onClick={() => setSelectedTab('items')}
              className={`px-6 py-2 rounded-md font-semibold transition-all ${
                selectedTab === 'items'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              📦 Itens ({filteredItems.length}/{itemCards.length})
            </button>
          </div>

          {/* Controles de Filtro */}
          <div className="flex items-center gap-3">
            {/* Busca */}
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Buscar..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                className="bg-black/30 border border-white/20 rounded-lg px-4 py-2 pr-10 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 w-64"
              />
              {filters.search && (
                <button
                  onClick={() => setFilters(prev => ({...prev, search: ''}))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  ×
                </button>
              )}
            </div>

            {/* Botão de Filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative px-4 py-2 rounded-lg font-semibold transition-all ${
                showFilters
                  ? 'bg-yellow-600 text-white'
                  : 'bg-black/30 border border-white/20 text-gray-300 hover:text-white hover:border-white/40'
              }`}
            >
              🔧 Filtros
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Painel de Filtros */}
        {showFilters && (
          <div className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">🔧 Filtros Avançados</h3>
              <div className="flex gap-2">
                <button
                  onClick={clearFilters}
                  className="text-sm px-3 py-1 bg-red-600/20 border border-red-500/50 text-red-400 hover:text-red-300 rounded"
                >
                  Limpar Todos
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-sm px-3 py-1 bg-gray-600/20 border border-gray-500/50 text-gray-400 hover:text-gray-300 rounded"
                >
                  Fechar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {/* Filtro por Raridade */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Raridade</label>
                <select
                  value={filters.rarity}
                  onChange={(e) => setFilters(prev => ({...prev, rarity: e.target.value}))}
                  className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="todas">Todas as Raridades</option>
                  <option value="Épico">💜 Épico</option>
                  <option value="Lendário">🟡 Lendário</option>
                  <option value="Mítico">🔴 Mítico</option>
                </select>
              </div>

              {/* Filtros específicos para cartas */}
              {selectedTab === 'cards' && (
                <>
                  {/* Filtro por Região */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Região</label>
                    <select
                      value={filters.region}
                      onChange={(e) => setFilters(prev => ({...prev, region: e.target.value}))}
                      className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="todas">Todas as Regiões</option>
                      <option value="Amazônia">🌳 Amazônia</option>
                      <option value="Nordeste">☀️ Nordeste</option>
                      <option value="Sudeste">🏙️ Sudeste</option>
                      <option value="Sul">❄️ Sul</option>
                      <option value="Centro-Oeste">🌾 Centro-Oeste</option>
                      <option value="Nacional">🇧🇷 Nacional</option>
                    </select>
                  </div>

                  {/* Filtro por Categoria */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Categoria</label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters(prev => ({...prev, category: e.target.value}))}
                      className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="todas">Todas as Categorias</option>
                      <option value="Guardiões da Floresta">🌲 Guardiões da Floresta</option>
                      <option value="Espíritos das Águas">🌊 Espíritos das Águas</option>
                      <option value="Assombrações">👻 Assombrações</option>
                      <option value="Protetores Humanos">🛡️ Protetores Humanos</option>
                      <option value="Entidades Místicas">✨ Entidades Místicas</option>
                    </select>
                  </div>

                  {/* Filtro por Elemento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Elemento</label>
                    <select
                      value={filters.element}
                      onChange={(e) => setFilters(prev => ({...prev, element: e.target.value}))}
                      className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="todos">Todos os Elementos</option>
                      <option value="Terra">🟫 Terra</option>
                      <option value="Água">🔵 Água</option>
                      <option value="Fogo">🔴 Fogo</option>
                      <option value="Ar">⚪ Ar</option>
                      <option value="Espírito">🟣 Espírito</option>
                    </select>
                  </div>
                </>
              )}

              {/* Filtros específicos para itens */}
              {selectedTab === 'items' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Item</label>
                  <select
                    value={filters.itemType}
                    onChange={(e) => setFilters(prev => ({...prev, itemType: e.target.value}))}
                    className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="todos">Todos os Tipos</option>
                    <option value="Consumível">🧪 Consumível</option>
                    <option value="Equipamento">⚔️ Equipamento</option>
                    <option value="Artefato">🔮 Artefato</option>
                    <option value="Relíquia">🏺 Relíquia</option>
                    <option value="Pergaminho">📜 Pergaminho</option>
                  </select>
                </div>
              )}
            </div>

            {/* Resumo dos Filtros Ativos */}
            {activeFiltersCount > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-sm text-gray-300 mb-2">Filtros ativos:</div>
                <div className="flex flex-wrap gap-2">
                  {filters.search && (
                    <span className="bg-blue-600/20 border border-blue-500/50 text-blue-300 px-2 py-1 rounded text-xs">
                      Busca: &quot;{filters.search}&quot;
                    </span>
                  )}
                  {filters.rarity !== 'todas' && (
                    <span className="bg-purple-600/20 border border-purple-500/50 text-purple-300 px-2 py-1 rounded text-xs">
                      Raridade: {filters.rarity}
                    </span>
                  )}
                  {filters.region !== 'todas' && (
                    <span className="bg-green-600/20 border border-green-500/50 text-green-300 px-2 py-1 rounded text-xs">
                      Região: {filters.region}
                    </span>
                  )}
                  {filters.category !== 'todas' && (
                    <span className="bg-yellow-600/20 border border-yellow-500/50 text-yellow-300 px-2 py-1 rounded text-xs">
                      Categoria: {filters.category}
                    </span>
                  )}
                  {filters.element !== 'todos' && (
                    <span className="bg-cyan-600/20 border border-cyan-500/50 text-cyan-300 px-2 py-1 rounded text-xs">
                      Elemento: {filters.element}
                    </span>
                  )}
                  {filters.itemType !== 'todos' && (
                    <span className="bg-orange-600/20 border border-orange-500/50 text-orange-300 px-2 py-1 rounded text-xs">
                      Tipo: {filters.itemType}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Lista estilo "story quests" - grid 4 colunas */}
        {loading ? (
          <div className="text-center text-gray-400 py-20">Carregando coleção...</div>
        ) : error ? (
          <div className="text-center text-red-400 py-20">Erro: {error}</div>
        ) : displayItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              Nenhum {selectedTab === 'cards' ? 'carta' : 'item'} encontrado
            </h3>
            <p className="text-gray-400 mb-6">
              Tente ajustar os filtros para encontrar o que você procura.
            </p>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                Limpar Filtros
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Informações de Resultados */}
            <div className="text-center mb-6">
              <p className="text-sm text-gray-400">
                Mostrando {displayItems.length} de {selectedTab === 'cards' ? cards.length : itemCards.length} {selectedTab === 'cards' ? 'cartas' : 'itens'}
                {activeFiltersCount > 0 && ` (${activeFiltersCount} filtro${activeFiltersCount > 1 ? 's' : ''} ativo${activeFiltersCount > 1 ? 's' : ''})`}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {selectedTab === 'cards' ? (
                filteredCards.map((card, i) => (
                  <StoryCard
                    key={card.id}
                    card={card}
                    idx={i}
                    onClick={() => {
                      setSelected(card);
                    }}
                  />
                ))
              ) : (
                filteredItems.map((item, i) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onClick={() => {
                      setSelected(item);
                    }}
                    className="aspect-[3/4]"
                  />
                ))
              )}
            </div>
          </>
        )}

        <div className="text-center mt-10">
          <Link href="/museum" className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors">← Voltar ao Museu</Link>
        </div>
      </div>

      <CardModal
        card={selected}
        onClose={() => setSelected(null)}
        mode={selectedTab === 'cards' ? 'museum' : 'museum-item'}
        showStories={Boolean(selected) && !isSelectedItem}
      />
    </LayoutDePagina>
  );
}

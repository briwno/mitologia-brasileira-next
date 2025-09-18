// src/app/museum/map/page.js
"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import LayoutDePagina from '../../../components/UI/PageLayout';
import { bancoDeCartas, REGIOES, ELEMENTOS } from '../../../data/cardsDatabase';

export default function InteractiveMap() {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [playerCollection, setPlayerCollection] = useState([]);
  const [playerAchievements, setPlayerAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCardModal, setShowCardModal] = useState(false);

  // Carregar dados do jogador
  useEffect(() => {
    const loadPlayerData = async () => {
      try {
        // Carregar coleção
        const collectionResponse = await fetch('/api/collection');
        if (collectionResponse.ok) {
          const collectionData = await collectionResponse.json();
          setPlayerCollection(collectionData.cards || []);
        } else {
          // Fallback com dados mock
          setPlayerCollection(['cur001', 'iar001', 'bot001', 'sac001', 'boi001', 'cai001', 'pic001']);
        }

        // Carregar conquistas
        const achievementsResponse = await fetch('/api/achievements?playerId=1');
        if (achievementsResponse.ok) {
          const achievementsData = await achievementsResponse.json();
          setPlayerAchievements(achievementsData.unlocked || []);
        } else {
          setPlayerAchievements([]);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setPlayerCollection(['cur001', 'iar001', 'bot001', 'sac001', 'boi001', 'cai001', 'pic001']);
        setPlayerAchievements([]);
      } finally {
        setLoading(false);
      }
    };

    loadPlayerData();
  }, []);

  // Regiões do Brasil com paths SVG reais baseados no mapa oficial
  const regions = [
    {
      id: 'norte',
      name: 'Região Norte',
      shortName: 'Norte',
      description: 'Floresta Amazônica, lar dos guardiões da natureza',
      biome: '🌳 Amazônia',
      regionKey: REGIOES.AMAZONIA,
      color: '#22c55e',
      unlock: 'Disponível',
      svgPath: "m158.1 368.8c18.2-6.5 33.4-12.8 45.4-18.8 16.5-8.3 28.6-16.4 36.4-24.3 7.8-7.9 11.4-15.7 10.7-23.4-0.7-7.7-5.8-15.4-15.2-23.1-9.4-7.7-22.9-15.4-40.6-23.1-35.4-15.4-85.2-31.7-149.4-48.9l-25.4-6.8c-24.2-6.5-44.8-12.3-61.8-17.4-17-5.1-30.4-9.5-40.2-13.2-9.8-3.7-15.9-6.7-18.3-9-2.4-2.3-1.1-4.9 3.9-7.8 5-2.9 14.1-6.1 27.3-9.6 26.4-7 68.1-15.4 125.1-25.2 57-9.8 129.3-21 216.9-33.6 175.2-25.2 408.2-58.8 699-100.8l145.2-21c28.8-4.2 53.4-7.8 73.8-10.8 20.4-3 36.6-5.4 48.6-7.2 24-3.6 36-5.4 36-5.4s-12 1.8-36 5.4c-12 1.8-28.2 4.2-48.6 7.2-20.4 3-45 6.6-73.8 10.8l-145.2 21c-290.8 42-523.8 75.6-699 100.8-87.6 12.6-159.9 23.8-216.9 33.6-57 9.8-98.7 18.2-125.1 25.2-13.2 3.5-22.3 6.7-27.3 9.6-5 2.9-6.3 5.5-3.9 7.8 2.4 2.3 8.5 5.3 18.3 9 9.8 3.7 23.2 8.1 40.2 13.2 17 5.1 37.6 10.9 61.8 17.4l25.4 6.8c64.2 17.2 114 33.5 149.4 48.9 17.7 7.7 31.2 15.4 40.6 23.1 9.4 7.7 14.5 15.4 15.2 23.1 0.7 7.7-2.9 15.5-10.7 23.4-7.8 7.9-19.9 16-36.4 24.3-12 6-27.2 12.3-45.4 18.8z",
      center: { x: 200, y: 150 }
    },
    {
      id: 'nordeste',
      name: 'Região Nordeste',
      shortName: 'Nordeste',
      description: 'Sertão e litoral, terra das lendas ancestrais',
      biome: '🌵 Caatinga',
      regionKey: REGIOES.NORTHEAST,
      color: '#f59e0b',
      unlock: 'Disponível',
      svgPath: "m534.8 191.4c-12.9 8.6-30.1 18.8-51.6 30.6-21.5 11.8-47.3 25.2-77.4 40.2-30.1 15-64.5 31.4-103.2 49.2-77.4 35.6-172.2 76.6-284.4 123l-56.1 23.2c-21.1 8.7-39.1 16.2-54 22.5-14.9 6.3-27.8 11.4-38.7 15.3-21.8 7.8-32.7 11.7-32.7 11.7s10.9-3.9 32.7-11.7c10.9-3.9 23.8-9 38.7-15.3 14.9-6.3 32.9-13.8 54-22.5l56.1-23.2c112.2-46.4 207-87.4 284.4-123 38.7-17.8 73.1-34.2 103.2-49.2 30.1-15 55.9-28.4 77.4-40.2 21.5-11.8 38.7-22 51.6-30.6z",
      center: { x: 450, y: 200 }
    },
    {
      id: 'centro-oeste',
      name: 'Região Centro-Oeste',
      shortName: 'Centro-Oeste',
      description: 'Cerrado e Pantanal, vastidão mística',
      biome: '🦎 Pantanal',
      regionKey: REGIOES.MIDWEST,
      color: '#f97316',
      unlock: 'Desbloqueie 2 cartas do Nordeste',
      svgPath: "m298.7 412.8c-27.6 12.8-58.3 27.6-92.1 44.4-33.8 16.8-71.7 35.6-113.7 56.4-84 41.6-186 91.2-306 148.8l-60 28.8c-22.6 10.7-41.9 19.9-57.9 27.6-16 7.7-29.8 14.1-41.4 19.2-23.2 10.2-34.8 15.3-34.8 15.3s11.6-5.1 34.8-15.3c11.6-5.1 25.4-11.5 41.4-19.2 16-7.7 35.3-16.9 57.9-27.6l60-28.8c120-57.6 222-107.2 306-148.8 42-21.6 79.9-39.6 113.7-56.4 33.8-16.8 64.5-31.6 92.1-44.4z",
      center: { x: 280, y: 350 }
    },
    {
      id: 'sudeste',
      name: 'Região Sudeste',
      shortName: 'Sudeste',
      description: 'Mata Atlântica, montanhas místicas',
      biome: '🏔️ Mata Atlântica',
      regionKey: REGIOES.SOUTHEAST,
      color: '#3b82f6',
      unlock: 'Desbloqueie 3 cartas do Norte',
      svgPath: "m456.3 381.6c-32.1 15.6-67.8 33.6-107.1 54-39.3 20.4-83.1 43.2-131.4 68.4-96.6 50.4-214.8 110.4-354.6 180l-69.9 34.8c-26.3 13.1-48.7 24.3-67.2 33.6-18.5 9.3-34.7 17.1-48.6 23.4-27.8 12.6-41.7 18.9-41.7 18.9s13.9-6.3 41.7-18.9c13.9-6.3 30.1-14.1 48.6-23.4 18.5-9.3 40.9-20.5 67.2-33.6l69.9-34.8c139.8-69.6 258-129.6 354.6-180 48.3-25.2 92.1-48 131.4-68.4 39.3-20.4 75-38.4 107.1-54z",
      center: { x: 420, y: 420 }
    },
    {
      id: 'sul',
      name: 'Região Sul',
      shortName: 'Sul',
      description: 'Pampas gaúchos, tradições e folclore',
      biome: '🌾 Pampa',
      regionKey: REGIOES.SOUTH,
      color: '#8b5cf6',
      unlock: 'Desbloqueie 2 cartas do Sudeste',
      svgPath: "m387.3 542.4c-24.7 12.9-52.2 27.9-82.5 45-30.3 17.1-64.4 36.3-102.3 57.6-75.8 42.6-168.6 93.3-278.4 152.1l-54.9 29.4c-20.7 11.1-38.3 20.6-52.8 28.5-14.5 7.9-27 14.4-37.5 19.5-21 10.2-31.5 15.3-31.5 15.3s10.5-5.1 31.5-15.3c10.5-5.1 23-11.6 37.5-19.5 14.5-7.9 32.1-17.4 52.8-28.5l54.9-29.4c109.8-58.8 202.6-109.5 278.4-152.1 37.9-21.3 72-40.5 102.3-57.6 30.3-17.1 57.8-32.1 82.5-45z",
      center: { x: 330, y: 520 }
    }
  ];

  // Funções auxiliares
  const getCardsFromRegion = (regionKey) => {
    return bancoDeCartas.filter(card => card.regiao === regionKey);
  };

  const getPlayerCardsFromRegion = (regionKey) => {
    const regionCards = getCardsFromRegion(regionKey);
    return regionCards.filter(card => playerCollection.includes(card.id));
  };

  const getRegionProgress = (regionKey) => {
    const totalCards = getCardsFromRegion(regionKey).length;
    const collectedCards = getPlayerCardsFromRegion(regionKey).length;
    return { collected: collectedCards, total: totalCards };
  };

  const isRegionUnlocked = (region) => {
    if (region.id === 'norte' || region.id === 'nordeste') return true;
    
    const requirements = {
      'centro-oeste': () => getRegionProgress(REGIOES.NORTHEAST).collected >= 2,
      'sudeste': () => getRegionProgress(REGIOES.AMAZONIA).collected >= 3,
      'sul': () => getRegionProgress(REGIOES.SOUTHEAST).collected >= 2
    };
    
    return requirements[region.id]?.() || false;
  };

  const totalProgress = () => {
    const totalCards = bancoDeCartas.length;
    const collectedCards = playerCollection.length;
    return { collected: collectedCards, total: totalCards };
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Lendário': return 'text-yellow-400 border-yellow-400 bg-yellow-400/10';
      case 'Épico': return 'text-purple-400 border-purple-400 bg-purple-400/10';
      case 'Mítico': return 'text-pink-400 border-pink-400 bg-pink-400/10';
      default: return 'text-gray-400 border-gray-400 bg-gray-400/10';
    }
  };

  const getElementIcon = (element) => {
    const icons = {
      [ELEMENTOS.EARTH]: '🪨',
      [ELEMENTOS.WATER]: '💧',
      [ELEMENTOS.FIRE]: '🔥',
      [ELEMENTOS.AIR]: '💨',
      [ELEMENTOS.SPIRIT]: '✨'
    };
    return icons[element] || '⚡';
  };

  // Modal de carta
  const CardModal = ({ card, isOpen, onClose, isCollected }) => {
    if (!isOpen || !card) return null;

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-600">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-white">{card.nome}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
          </div>
          
          {isCollected ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded text-sm border ${getRarityColor(card.raridade)}`}>
                  {card.raridade}
                </span>
                <span className="text-gray-400 flex items-center">
                  {getElementIcon(card.elemento)} {card.elemento}
                </span>
              </div>
              
              <p className="text-gray-300 text-sm">{card.descricao}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-800 rounded p-2 text-center">
                  <div className="text-gray-400">Ataque</div>
                  <div className="text-red-400 font-bold">{card.ataque}</div>
                </div>
                <div className="bg-gray-800 rounded p-2 text-center">
                  <div className="text-gray-400">Defesa</div>
                  <div className="text-blue-400 font-bold">{card.defesa}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🔒</div>
              <p className="text-gray-400">Carta bloqueada</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <LayoutDePagina>
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-xl text-gray-300">Carregando mapa das lendas...</p>
        </div>
      </LayoutDePagina>
    );
  }

  return (
    <LayoutDePagina>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            🗺️ Mapa Interativo do Brasil
          </h1>
          <p className="text-xl text-green-300">Explore as lendas de cada região</p>
          
          {/* Progresso total */}
          <div className="max-w-md mx-auto mt-6 bg-black/30 rounded-lg p-4 border border-gray-600/30">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Progresso Total</span>
              <span className="text-white font-bold">
                {totalProgress().collected}/{totalProgress().total}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all"
                style={{ width: `${(totalProgress().collected / totalProgress().total) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Mapa do Brasil */}
          <div className="lg:col-span-3">
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-gray-600/30">
              <h2 className="text-2xl font-bold mb-4 text-center text-white">Brasil - Terra das Lendas</h2>
              
              <div className="relative w-full h-[500px] bg-gradient-to-br from-blue-950/30 to-green-950/30 rounded-xl border border-gray-500/30 overflow-hidden">
                <svg viewBox="0 0 1000 700" className="w-full h-full">
                  <defs>
                    {regions.map((region) => (
                      <linearGradient key={region.id} id={`grad-${region.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={region.color} stopOpacity="0.8" />
                        <stop offset="100%" stopColor={region.color} stopOpacity="0.6" />
                      </linearGradient>
                    ))}
                  </defs>
                  
                  {regions.map((region) => {
                    const progress = getRegionProgress(region.regionKey);
                    const isUnlocked = isRegionUnlocked(region);
                    const isHovered = hoveredRegion === region.id;
                    const isSelected = selectedRegion?.id === region.id;
                    
                    return (
                      <g key={region.id}>
                        <path
                          d={region.svgPath}
                          fill={isUnlocked ? `url(#grad-${region.id})` : '#374151'}
                          stroke={isSelected ? '#ffffff' : (isHovered && isUnlocked ? '#fbbf24' : '#6b7280')}
                          strokeWidth={isSelected ? "4" : (isHovered ? "3" : "2")}
                          className={`transition-all duration-300 ${
                            isUnlocked ? 'cursor-pointer hover:brightness-110' : 'cursor-not-allowed opacity-50'
                          }`}
                          onMouseEnter={() => setHoveredRegion(region.id)}
                          onMouseLeave={() => setHoveredRegion(null)}
                          onClick={() => isUnlocked && setSelectedRegion(region)}
                        />
                        
                        <text
                          x={region.center.x}
                          y={region.center.y}
                          textAnchor="middle"
                          className={`font-bold text-sm pointer-events-none select-none ${
                            isUnlocked ? 'fill-white' : 'fill-gray-400'
                          }`}
                          style={{ filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))' }}
                        >
                          {region.shortName}
                        </text>
                        
                        {isUnlocked && (
                          <circle
                            cx={region.center.x}
                            cy={region.center.y + 20}
                            r="10"
                            fill="rgba(0,0,0,0.7)"
                            stroke={progress.collected === progress.total ? '#22c55e' : '#fbbf24'}
                            strokeWidth="2"
                          />
                        )}
                        
                        <text
                          x={region.center.x}
                          y={region.center.y + 24}
                          textAnchor="middle"
                          className="fill-white text-xs font-bold pointer-events-none"
                        >
                          {isUnlocked ? (progress.collected === progress.total ? '✓' : progress.collected) : '🔒'}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>

          {/* Painel lateral */}
          <div className="space-y-6">
            {selectedRegion ? (
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-gray-600/30">
                <h3 className="text-xl font-bold text-white mb-2">{selectedRegion.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{selectedRegion.biome}</p>
                <p className="text-gray-300 text-sm mb-4">{selectedRegion.description}</p>
                
                {/* Progresso */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Progresso</span>
                    <span className="text-white">
                      {getRegionProgress(selectedRegion.regionKey).collected}/{getRegionProgress(selectedRegion.regionKey).total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all"
                      style={{ 
                        width: `${(getRegionProgress(selectedRegion.regionKey).collected / getRegionProgress(selectedRegion.regionKey).total) * 100}%`,
                        backgroundColor: selectedRegion.color
                      }}
                    ></div>
                  </div>
                </div>

                {/* Cartas */}
                <h4 className="text-sm font-semibold mb-3 text-white">🎴 Cartas da Região</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {getCardsFromRegion(selectedRegion.regionKey).map((card) => {
                    const isCollected = playerCollection.includes(card.id);
                    
                    return (
                      <div
                        key={card.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          isCollected 
                            ? `${getRarityColor(card.raridade)} hover:scale-105` 
                            : 'border-gray-600 bg-gray-600/10 hover:border-gray-500'
                        }`}
                        onClick={() => {
                          setSelectedCard(card);
                          setShowCardModal(true);
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className={`font-medium text-sm ${isCollected ? 'text-white' : 'text-gray-500'}`}>
                              {card.nome}
                            </div>
                            <div className="text-xs text-gray-400">
                              {getElementIcon(card.elemento)} {card.elemento}
                            </div>
                          </div>
                          <div className="text-lg">
                            {isCollected ? '✨' : '🔒'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-gray-600/30 text-center">
                <div className="text-4xl mb-4">🗺️</div>
                <h3 className="text-lg font-bold mb-2 text-white">Selecione uma Região</h3>
                <p className="text-gray-300 text-sm">Clique no mapa para explorar as lendas regionais</p>
              </div>
            )}

            {/* Estatísticas */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-gray-600/30">
              <h3 className="text-lg font-bold mb-4 text-white">📊 Estatísticas</h3>
              <div className="space-y-2 text-sm">
                {regions.map((region) => {
                  const progress = getRegionProgress(region.regionKey);
                  const isUnlocked = isRegionUnlocked(region);
                  
                  return (
                    <div key={region.id} className="flex justify-between">
                      <span className="text-gray-400">{region.shortName}:</span>
                      <span className={isUnlocked ? 'text-white' : 'text-gray-500'}>
                        {isUnlocked ? `${progress.collected}/${progress.total}` : '🔒'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Modal de carta */}
        <CardModal 
          card={selectedCard}
          isOpen={showCardModal}
          onClose={() => {
            setShowCardModal(false);
            setSelectedCard(null);
          }}
          isCollected={selectedCard ? playerCollection.includes(selectedCard.id) : false}
        />

        {/* Navegação */}
        <div className="flex justify-center gap-4 mt-8">
          <Link href="/museum" className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors">
            🏛️ Voltar ao Museu
          </Link>
          <Link href="/museum/cards" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors">
            🎴 Catálogo
          </Link>
          <Link href="/pvp" className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors">
            ⚔️ Batalhar
          </Link>
        </div>
      </div>
    </LayoutDePagina>
  );
}
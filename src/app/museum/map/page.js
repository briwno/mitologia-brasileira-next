// src/app/museum/map/page.js
"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import LayoutDePagina from '@/components/UI/PageLayout';
import CardModal from '@/components/Card/CardModal';
import { useAuth } from '@/hooks/useAuth';
import { useCollection } from '@/hooks/useCollection';
import { cardsAPI } from '@/utils/api';
import { mapearCartaDaApi, obterGradienteDeRaridade } from '@/utils/cardUtils';
import BrazilMap from '@/components/Museum/BrazilMap';

export default function MapaInterativo() {
  const { user, isAuthenticated } = useAuth();
  const { cards: playerCollection, loading: loadingCollection } = useCollection();
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Ref para a seção de cartas
  const cardsRef = useRef(null);

  // Carregar cartas da API
  // Handler para clique na região
  const handleRegionClick = (regionData) => {
    // Encontrar a região completa nos dados
    const fullRegion = regions.find(r => r.id === regionData.id);
    setSelectedRegion(fullRegion);
    
    // Scroll suave para a seção de cartas após um pequeno delay
    setTimeout(() => {
      if (cardsRef.current) {
        // Calcula a posição considerando um offset para não colar no topo
        const yOffset = -100; // 100px de espaço do topo
        const element = cardsRef.current;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        
        window.scrollTo({
          top: y,
          behavior: 'smooth'
        });
      }
    }, 200);
  };

  useEffect(() => {
    let cancelled = false;
    const loadCards = async () => {
      try {
        const cardsData = await cardsAPI.getAll();

        // Usar função utilitária para mapear cartas
  const mappedCards = (cardsData.cards || []).map(mapearCartaDaApi);

        if (!cancelled) {
          setCards(mappedCards);
        }
      } catch (error) {
        console.error('Erro ao carregar cartas:', error);
        if (!cancelled) {
          setCards([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCards();
    
    return () => { cancelled = true; };
  }, []);

  // Combinar os estados de loading
  const isLoading = loading || loadingCollection;

  // Regiões do Brasil simplificadas
  const regions = [
    {
      id: 'norte',
      name: 'Região Norte',
      description: 'Floresta Amazônica, lar dos guardiões da natureza',
      biome: '🌳 Amazônia',
      regionKey: 'Amazônia',
      color: '#22c55e',
      emoji: '🌳',
      unlock: 'Disponível'
    },
    {
      id: 'nordeste',
      name: 'Região Nordeste',
      description: 'Sertão e litoral, terra das lendas ancestrais',
      biome: '🌵 Caatinga',
      regionKey: 'Nordeste',
      color: '#f59e0b',
      emoji: '🌵',
      unlock: 'Disponível'
    },
    {
      id: 'centro-oeste',
      name: 'Região Centro-Oeste',
      description: 'Cerrado e Pantanal, vastidão mística',
      biome: '🦎 Pantanal',
      regionKey: 'Centro-Oeste',
      color: '#f97316',
      emoji: '🦎',
      unlock: 'Desbloqueie 2 cartas do Nordeste'
    },
    {
      id: 'sudeste',
      name: 'Região Sudeste',
      description: 'Mata Atlântica, montanhas místicas',
      biome: '🏔️ Mata Atlântica',
      regionKey: 'Sudeste',
      color: '#3b82f6',
      emoji: '🏔️',
      unlock: 'Desbloqueie 3 cartas do Norte'
    },
    {
      id: 'sul',
      name: 'Região Sul',
      description: 'Pampas gaúchos, tradições e folclore',
      biome: '🌾 Pampa',
      regionKey: 'Sul',
      color: '#8b5cf6',
      emoji: '🌾',
      unlock: 'Desbloqueie 2 cartas do Sudeste'
    }
  ];

  // Se não estiver autenticado, usar dados mock para demonstração
  const effectiveCollection = isAuthenticated() ? playerCollection : ['cur001', 'iar001', 'bot001'];

  // Funções auxiliares
  const getCardsFromRegion = (regionKey) => {
    return cards.filter(card => card.regiao === regionKey);
  };

  const getPlayerCardsFromRegion = (regionKey) => {
    const regionCards = getCardsFromRegion(regionKey);
    return regionCards.filter(card => effectiveCollection.includes(card.id));
  };

  const getRegionProgress = (regionKey) => {
    const totalCards = getCardsFromRegion(regionKey).length;
    const collectedCards = getPlayerCardsFromRegion(regionKey).length;
    return { collected: collectedCards, total: totalCards };
  };

  const isRegionUnlocked = (region) => {
    if (region.id === 'norte' || region.id === 'nordeste') return true;
    
    const requirements = {
      'centro-oeste': () => getRegionProgress('Nordeste').collected >= 1,
      'sudeste': () => getRegionProgress('Amazônia').collected >= 3,
      'sul': () => getRegionProgress('Sudeste').collected >= 2
    };
    
    return requirements[region.id]?.() || false;
  };

  const totalProgress = () => {
    const totalCards = cards.length;
    const collectedCards = effectiveCollection.length;
    return { collected: collectedCards, total: totalCards };
  };

  // Componente de carta seguindo o padrão das outras telas
  const RegionCard = ({ card, onClick, isCollected }) => {
    // Escolhe a melhor fonte de imagem disponível
    const fullSrc = card.imagens?.completa || card.imagens?.full;
    const portrait = card.imagens?.retrato || card.imagens?.portrait;
    const imgSrc = fullSrc || portrait || '/images/placeholder.svg';

    const bgColor = isCollected 
      ? obterGradienteDeRaridade(card.raridade)
      : 'from-gray-600/10 to-gray-800/20 border-gray-600/30';

    return (
      <div
        className={`relative rounded-xl border cursor-pointer transition-all duration-300 bg-gradient-to-br ${bgColor} hover:scale-105 hover:shadow-lg overflow-hidden group`}
        onClick={onClick}
      >
        {/* Imagem da carta */}
        <div className="relative w-full aspect-[7/11] mb-3">
          <Image
            src={imgSrc}
            alt={card.nome}
            fill
            className={`object-cover object-center transition-all duration-300 ${
              isCollected ? 'group-hover:scale-105' : 'grayscale opacity-60'
            }`}
            sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            unoptimized={typeof imgSrc === 'string' && imgSrc.startsWith('http')}
          />
          {!isCollected && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="text-4xl">🔒</div>
            </div>
          )}
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
          
          {/* Indicador de coleção */}
          <div className="absolute top-2 right-2">
            <div className="text-lg">
              {isCollected ? '✨' : '🔒'}
            </div>
          </div>
        </div>

        {/* Informações da carta */}
        <div className="p-4 pt-0">
          <h4 className={`font-bold text-sm mb-1 ${isCollected ? 'text-white' : 'text-gray-500'}`}>
            {card.nome}
          </h4>
          
          <p className={`text-xs mb-2 ${isCollected ? 'text-gray-300' : 'text-gray-600'}`}>
            {card.elemento} • {card.raridade}
          </p>
          
          {isCollected && (
            <div className="flex justify-between text-xs">
              <span className="text-red-400">ATK: {card.ataque}</span>
              <span className="text-blue-400">DEF: {card.defesa}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Modal de detalhes da carta usando o componente existente
  const closeCardModal = () => {
    setSelectedCard(null);
  };

  if (isLoading) {
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
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            🗺️ Mapa Interativo do Brasil
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-green-300 mb-2 sm:mb-4 px-2">Explore as lendas de cada região</p>
          
          {/* Dica de interação */}
          <div className="mb-4 sm:mb-6 text-xs sm:text-sm text-gray-400 px-2">
            {selectedRegion ? (
              <div className="inline-flex flex-col sm:flex-row items-center gap-2 bg-black/30 rounded-lg px-3 sm:px-4 py-2 border border-gray-600/30 max-w-full">
                <div className="flex items-center gap-2">
                  <span>{selectedRegion.emoji}</span>
                  <span className="text-center sm:text-left">
                    Região <strong className="text-white">{selectedRegion.name}</strong> selecionada
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedRegion(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            ) : (
              <span>Clique em uma região do mapa ou nos cards abaixo para explorar</span>
            )}
          </div>
          
           <BrazilMap onRegionClick={handleRegionClick} selectedRegion={selectedRegion} />
          
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
                className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full duration-500"
                style={{ width: `${(totalProgress().collected / totalProgress().total) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Grid de regiões */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          {regions.map((region) => {
            const progress = getRegionProgress(region.regionKey);
            const isUnlocked = isRegionUnlocked(region);
            const isSelected = selectedRegion?.id === region.id;
            const progressPercentage = progress.total > 0 ? (progress.collected / progress.total) * 100 : 0;
            
            return (
              <div
                key={region.id}
                className={`relative p-6 rounded-xl border transition-all duration-300 cursor-pointer ${
                  isUnlocked 
                    ? isSelected
                      ? `bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-2 hover:scale-105 ring-2 ring-opacity-50`
                      : 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-600/50 hover:border-green-400/50 hover:scale-105'
                    : 'bg-gradient-to-br from-gray-700/30 to-gray-800/30 border-gray-700/50 opacity-60 cursor-not-allowed'
                }`}
                style={isSelected ? { 
                  borderColor: region.color, 
                  ringColor: region.color 
                } : {}}
                onClick={() => isUnlocked && handleRegionClick({ id: region.id })}
              >
                {/* Header da região */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{region.emoji}</span>
                    <div>
                      <h3 className={`font-bold ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                        {region.name}
                      </h3>
                      <p className="text-gray-400 text-sm">{region.biome}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {isUnlocked ? (
                      <div className="text-white font-bold">
                        {progress.collected}/{progress.total}
                      </div>
                    ) : (
                      <div className="text-2xl">🔒</div>
                    )}
                  </div>
                </div>

                {/* Progresso */}
                {isUnlocked && (
                  <div className="mb-4">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${progressPercentage}%`,
                          backgroundColor: region.color
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Descrição */}
                <p className={`text-sm mb-3 ${isUnlocked ? 'text-gray-300' : 'text-gray-600'}`}>
                  {region.description}
                </p>

                {/* Botão Ver Cartas ou Unlock requirement */}
                {isUnlocked ? (
                  <button
                    className={`w-full py-2 px-4 rounded-lg text-white text-sm font-medium transition-all duration-200 hover:scale-105 ${
                      isSelected 
                        ? 'bg-gray-600 cursor-default' 
                        : 'hover:shadow-lg'
                    }`}
                    style={{ 
                      backgroundColor: isSelected ? '#4b5563' : region.color,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRegionClick({ id: region.id });
                    }}
                  >
                    {isSelected ? '✓ Região Selecionada' : '👁️ Ver Cartas'}
                  </button>
                ) : (
                  <div className="mt-3 text-xs text-yellow-400 bg-yellow-900/20 rounded px-2 py-1">
                    {region.unlock}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Seção de cartas da região selecionada */}
        {selectedRegion && (
          <div 
            ref={cardsRef}
            className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-gray-600/30 animate-in fade-in-50 duration-500 scroll-mt-24"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  {selectedRegion.emoji} {selectedRegion.name}
                </h2>
                <p className="text-gray-400">{selectedRegion.description}</p>
                <div className="mt-2 text-sm text-gray-500">
                  {getPlayerCardsFromRegion(selectedRegion.regionKey).length} de {getCardsFromRegion(selectedRegion.regionKey).length} cartas coletadas
                </div>
              </div>
              <button
                onClick={() => setSelectedRegion(null)}
                className="text-gray-400 hover:text-white transition-colors text-xl hover:scale-110"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {getCardsFromRegion(selectedRegion.regionKey).map((card) => {
                const isCollected = effectiveCollection.includes(card.id);
                
                return (
                  <RegionCard
                    key={card.id}
                    card={card}
                    isCollected={isCollected}
                    onClick={() => isCollected && setSelectedCard(card)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Modal de detalhes da carta */}
        <CardModal 
          card={selectedCard}
          onClose={closeCardModal}
          mode="lore"
        />
      </div>
    </LayoutDePagina>
  );
}
"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import LegendCard from './LegendCard';
import BattleLog from './BattleLog';
import ItemHand from './ItemHand';
import BenchSlots from './BenchSlots';
import SkillPanel from './SkillPanel';
import TurnController from './TurnController';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import BattleDecorations from './BattleDecorations';

/**
 * Componente principal da tela de batalha PvP
 * Implementa sistema completo de batalha baseado no documento batalha.md
 */
export default function BattleScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  // Parâmetros da batalha
  const roomCode = searchParams.get('room');
  const mode = searchParams.get('mode') || 'pvp';
  const deckId = searchParams.get('deck');

  const [playerDeck, setPlayerDeck] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null); // Carta clicada para mostrar skills
  const [showSkillPanel, setShowSkillPanel] = useState(false);
  const [cards, setCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);

  // Hook principal do estado do jogo
  const {
    gameState,
    isMyTurn,
    currentPhase,
    battleLog,
    isLoading,
    error,
    actions
  } = useGameState(roomCode, user?.id, playerDeck, mode);

  // Carregar deck do jogador
  useEffect(() => {
    if (!deckId) return;

    const loadDeck = async () => {
      // TODO: Buscar deck do Supabase
      // Por enquanto, usar dados de teste
      const testDeck = {
        legends: [
          {
            id: 'saci',
            name: 'Saci-Pererê',
            image: '/images/cards/portraits/saci.jpg',
            hp: 80,
            maxHp: 80,
            atk: 7,
            def: 5,
            element: 'Ar',
            skills: [
              {
                id: 'redemoinho',
                name: 'Redemoinho',
                description: 'Causa dano de vento no oponente',
                power: 25,
                element: 'Ar',
                cooldown: 0
              },
              {
                id: 'travessura',
                name: 'Travessura',
                description: 'Reduz defesa do oponente',
                power: 15,
                element: 'Ar',
                cooldown: 0
              }
            ],
            ultimate: {
              name: 'Furacão do Saci',
              description: 'Ultimate devastadora de vento',
              power: 60,
              requiredTurns: 5
            },
            passive: {
              name: 'Pulo da Sorte',
              description: 'Ganha evasão extra',
              effect: 'buff_def',
              value: 0.1,
              trigger: 'turn_start'
            }
          },
          // Adicionar mais lendas...
        ],
        items: [
          {
            id: 'pocao_cura',
            name: 'Poção de Cura',
            type: 'heal',
            value: 30,
            description: 'Restaura 30 HP',
            uses: 1
          },
          // Adicionar mais itens...
        ]
      };
      
      setPlayerDeck(testDeck);
    };

    loadDeck();
  }, [deckId]);

  // Carregar cartas do banco de dados para enriquecer dados
  useEffect(() => {
    async function loadCards() {
      try {
        const { data, error } = await supabase
          .from('cards')
          .select('*')
          .limit(10);

        if (error) throw error;
        
        if (data && data.length > 0) {
          setCards(data);
        }
      } catch (error) {
        console.error('Erro ao carregar cartas do banco:', error);
      } finally {
        setLoadingCards(false);
      }
    }

    loadCards();
  }, []);

  // Função para transformar dados do banco em formato de batalha
  const transformCardData = (card, hp, maxHp) => ({
    id: card.id,
    name: card.name || card.nome,
    image: card.image_url || `/images/cards/portraits/${card.id}.jpg`,
    hp: hp || card.hp || 80,
    maxHp: maxHp || card.max_hp || card.hp || 100,
    atk: card.atk || card.attack || 7,
    def: card.def || card.defense || 5,
    element: card.element || card.elemento || 'Neutro',
    shields: card.shields || 0,
    statusEffects: [],
    skills: card.skills || [
      { 
        id: 'skill1', 
        name: card.skill1_name || 'Ataque Básico', 
        description: card.skill1_description || 'Ataque simples', 
        power: card.skill1_power || 20,
        element: card.element || 'Neutro',
        cooldown: 0 
      },
      ...(card.skill2_name ? [{
        id: 'skill2',
        name: card.skill2_name,
        description: card.skill2_description || '',
        power: card.skill2_power || 25,
        element: card.element || 'Neutro',
        cooldown: 1
      }] : [])
    ],
    ultimate: {
      name: card.ultimate_name || 'Ultimate',
      description: card.ultimate_description || 'Poder supremo',
      power: card.ultimate_power || 60,
      requiredTurns: 3
    },
    passive: {
      name: card.passive_name || 'Passiva',
      description: card.passive_description || 'Efeito passivo',
      effect: 'buff',
      value: 0.1,
      trigger: 'turn_start'
    }
  });

  if (isLoading || !gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a2332] via-[#0f1821] to-[#0a1118] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a2332] via-[#0f1821] to-[#0a1118] flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Erro</h2>
          <p>{error}</p>
          <button 
            onClick={() => router.push('/pvp')}
            className="mt-4 px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-full"
          >
            Voltar ao Menu
          </button>
        </div>
      </div>
    );
  }

  const myPlayer = gameState.players.find(p => p.id === user?.id);
  const opponent = gameState.players.find(p => p.id !== user?.id);

  if (!myPlayer) {
    return <div>Erro: Jogador não encontrado</div>;
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#1a2332] via-[#0f1821] to-[#0a1118] text-white overflow-hidden">
      {/* Background mais claro */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[url('/images/banners/battle-bg.jpg')] bg-cover bg-center" />
      </div>

      {/* Decorações */}
      <BattleDecorations />

      {/* Botão de saída */}
      <div className="absolute top-4 left-4 z-50">
        <button 
          onClick={() => router.push('/pvp')}
          className="px-3 py-1.5 bg-red-600/90 hover:bg-red-700 text-xs font-semibold rounded-lg transition-colors shadow-lg"
        >
          ← Sair da Batalha
        </button>
      </div>

      {/* Loading Indicator */}
      {loadingCards && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-black/80 px-4 py-2 rounded-lg">
          <div className="text-cyan-400 text-sm animate-pulse">⏳ Carregando cartas...</div>
        </div>
      )}

      {/* Layout Principal - NOVO TCG */}
      <div className="relative z-10 h-screen flex flex-col py-4">
        
        {/* ========== TOPO: OPONENTE + BANCO ========== */}
        <div className="px-6 flex items-start justify-between mb-2">
          {/* HUD Oponente + Banco Horizontal */}
          {opponent && (
            <div className="flex items-center gap-4">
              {/* Avatar Oponente */}
              <div className="bg-orange-600/80 border-2 border-orange-400 rounded-xl px-3 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-black/30 border-2 border-orange-300 flex items-center justify-center">
                    <span className="text-lg">👤</span>
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">{opponent.name || 'Oponente'}</div>
                    <div className="text-[9px] text-orange-200">Rank: Bronze</div>
                  </div>
                </div>
              </div>

              {/* Banco do Oponente - 4 cartas horizontais */}
              <div className="flex gap-2">
                {opponent.bench?.slice(0, 4).map((legend, i) => (
                  <div
                    key={i}
                    className={`relative w-14 h-20 rounded-lg overflow-hidden border-2 bg-black/50 hover:border-orange-400 transition-all cursor-pointer ${
                      selectedCard?.id === legend.id ? 'border-yellow-400 animate-pulse' : 'border-orange-500/60'
                    }`}
                    title={legend.name}
                    onClick={() => setSelectedCard(selectedCard?.id === legend.id ? null : legend)}
                  >
                    <img src={legend.image} alt={legend.name} className="w-full h-full object-cover" />
                    {legend.hp === 0 && (
                      <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                        <span className="text-xl">💀</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Itens Oponente */}
          {opponent && (
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`w-10 h-14 rounded border ${
                    i < (opponent.itemHand?.length || 0)
                      ? 'bg-green-900/30 border-green-600/50'
                      : 'bg-black/20 border-neutral-700/30 opacity-40'
                  } flex items-center justify-center`}
                >
                  {i < (opponent.itemHand?.length || 0) && <span className="text-xs text-green-400">?</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ========== CENTRO: CAMPO DE BATALHA ========== */}
        <div className="flex-1 relative flex items-center justify-center">
          {/* Oval Grande */}
          <div className="absolute w-[900px] h-[500px] rounded-full border-4 border-yellow-600/40 opacity-60" />

          {/* Carta Oponente - TOPO */}
          {opponent && (
            <div className="absolute" style={{ top: '10%', left: '50%', transform: 'translateX(-50%)' }}>
              <LegendCard
                legend={opponent.activeLegend}
                isActive={true}
                isEnemy={true}
                onClick={() => {
                  setSelectedTarget(opponent.activeLegend);
                  setSelectedCard(selectedCard?.id === opponent.activeLegend.id ? null : opponent.activeLegend);
                }}
                showStats={true}
              />
            </div>
          )}

          {/* Painel de Skills do Oponente - Ao lado da carta */}
          {selectedCard && opponent && selectedCard.id === opponent.activeLegend?.id && (
            <div 
              className="absolute z-30 bg-black/95 border-2 border-red-500/70 rounded-xl p-4 shadow-2xl"
              style={{ top: '10%', left: 'calc(50% + 180px)' }}
            >
              <div className="text-red-400 font-bold text-sm mb-3 flex items-center gap-2">
                <span>⚔️</span>
                <span>Skills de {selectedCard.name}</span>
                <button 
                  onClick={() => setSelectedCard(null)}
                  className="ml-2 text-neutral-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2 max-w-[280px]">
                {selectedCard.skills?.map((skill, i) => (
                  <div key={i} className="bg-red-900/30 border border-red-500/40 rounded-lg p-2">
                    <div className="font-bold text-xs text-red-300">{skill.name}</div>
                    <div className="text-[10px] text-neutral-300 mt-1">{skill.description}</div>
                    <div className="flex gap-2 mt-2 text-[9px]">
                      <span className="text-orange-400">⚡ {skill.power}</span>
                      <span className="text-cyan-400">🔄 CD: {skill.cooldown}</span>
                    </div>
                  </div>
                ))}
                {selectedCard.ultimate && (
                  <div className="bg-purple-900/40 border border-purple-500/50 rounded-lg p-2">
                    <div className="font-bold text-xs text-purple-300">💫 {selectedCard.ultimate.name}</div>
                    <div className="text-[10px] text-neutral-300 mt-1">{selectedCard.ultimate.description}</div>
                    <div className="text-[9px] text-orange-400 mt-2">⚡ {selectedCard.ultimate.power}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Label Central */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="bg-black/80 border-2 border-yellow-600/60 rounded-full px-8 py-1.5">
              <div className="text-yellow-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                <span>⚔️</span>
                <span>Campo de Batalha</span>
                <span>⚔️</span>
              </div>
              <div className="text-xs text-neutral-300 mt-0.5 text-center">
                Turno {gameState.turn} - {isMyTurn ? 'Sua Vez!' : 'Oponente'}
              </div>
            </div>
          </div>

          {/* Carta Jogador - BASE */}
          {myPlayer && (
            <div className="absolute" style={{ bottom: '10%', left: '50%', transform: 'translateX(-50%)' }}>
              <LegendCard
                legend={myPlayer.activeLegend}
                isActive={true}
                isEnemy={false}
                onClick={() => {
                  setSelectedCard(selectedCard?.id === myPlayer.activeLegend.id ? null : myPlayer.activeLegend);
                }}
                showStats={true}
              />
            </div>
          )}

          {/* Painel de Skills do Jogador - Ao lado da carta */}
          {selectedCard && myPlayer && selectedCard.id === myPlayer.activeLegend?.id && (
            <div 
              className="absolute z-30 bg-black/95 border-2 border-cyan-500/70 rounded-xl p-4 shadow-2xl"
              style={{ bottom: '10%', left: 'calc(50% + 180px)' }}
            >
              <div className="text-cyan-400 font-bold text-sm mb-3 flex items-center gap-2">
                <span>⚔️</span>
                <span>Skills de {selectedCard.name}</span>
                <button 
                  onClick={() => setSelectedCard(null)}
                  className="ml-2 text-neutral-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2 max-w-[280px]">
                {selectedCard.skills?.map((skill, i) => (
                  <div 
                    key={i} 
                    className={`bg-cyan-900/30 border border-cyan-500/40 rounded-lg p-2 transition-all ${
                      isMyTurn ? 'hover:bg-cyan-800/40 cursor-pointer' : 'opacity-60 cursor-not-allowed'
                    }`}
                    onClick={() => {
                      if (isMyTurn && selectedTarget) {
                        actions.useSkill(skill.id, selectedTarget.id);
                        setSelectedCard(null);
                        setSelectedTarget(null);
                      }
                    }}
                  >
                    <div className="font-bold text-xs text-cyan-300">{skill.name}</div>
                    <div className="text-[10px] text-neutral-300 mt-1">{skill.description}</div>
                    <div className="flex gap-2 mt-2 text-[9px]">
                      <span className="text-orange-400">⚡ {skill.power}</span>
                      <span className="text-cyan-400">🔄 CD: {skill.cooldown}</span>
                    </div>
                  </div>
                ))}
                {selectedCard.ultimate && (
                  <div 
                    className={`bg-purple-900/40 border border-purple-500/50 rounded-lg p-2 transition-all ${
                      isMyTurn && (myPlayer.turnsPlayed || 0) >= 3 
                        ? 'hover:bg-purple-800/50 cursor-pointer' 
                        : 'opacity-60 cursor-not-allowed'
                    }`}
                    onClick={() => {
                      if (isMyTurn && (myPlayer.turnsPlayed || 0) >= 3 && selectedTarget) {
                        actions.useUltimate(selectedTarget.id);
                        setSelectedCard(null);
                        setSelectedTarget(null);
                      }
                    }}
                  >
                    <div className="font-bold text-xs text-purple-300">💫 {selectedCard.ultimate.name}</div>
                    <div className="text-[10px] text-neutral-300 mt-1">{selectedCard.ultimate.description}</div>
                    <div className="text-[9px] text-orange-400 mt-2">⚡ {selectedCard.ultimate.power}</div>
                    {(myPlayer.turnsPlayed || 0) < 3 && (
                      <div className="text-[9px] text-red-400 mt-1">Requer 3 turnos</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Log de Batalha */}
          <div className="absolute right-4 top-4">
            <BattleLog logs={battleLog} />
          </div>
        </div>

        {/* ========== BASE: JOGADOR + BANCO + ITENS ========== */}
        <div className="px-6 flex items-end justify-between gap-6 mb-2">
          
          {/* HUD Jogador */}
          {myPlayer && (
            <div className="bg-cyan-600/80 border-2 border-cyan-400 rounded-xl px-3 py-2 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-black/30 border-2 border-cyan-300 flex items-center justify-center">
                  <span className="text-lg">🎮</span>
                </div>
                <div>
                  <div className="font-bold text-xs text-white">{myPlayer.name || 'Jogador 1'}</div>
                  <div className="text-[9px] text-cyan-200">Rank: Bronze II</div>
                </div>
              </div>
            </div>
          )}

          {/* BANCO + ITENS - CENTRO */}
          {myPlayer && (
            <div className="flex-1 flex flex-col items-center gap-3">
              {/* Banco de Cartas */}
              <div className="bg-cyan-900/40 border border-cyan-500/60 rounded-xl px-4 py-2 shadow-lg">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">Banco de Cartas</span>
                  <div className="flex gap-2">
                    <BenchSlots
                      legends={myPlayer.bench}
                      onSelectLegend={(legend) => {
                        if (isMyTurn) {
                          actions.switchLegend(legend.id);
                        }
                      }}
                      disabled={!isMyTurn}
                    />
                  </div>
                </div>
              </div>

              {/* Seus Itens */}
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-emerald-400 uppercase font-semibold">Seus Itens</span>
                <ItemHand
                  items={myPlayer.itemHand}
                  onUseItem={(item) => {
                    if (isMyTurn && selectedTarget) {
                      actions.useItem(item.id, selectedTarget.id);
                      setSelectedTarget(null);
                    }
                  }}
                  disabled={!isMyTurn}
                />
              </div>
            </div>
          )}

          {/* Controle Turno */}
          <div>
            <TurnController
              isMyTurn={isMyTurn}
              currentTurn={gameState.turn}
              currentPhase={currentPhase}
              onEndTurn={actions.endTurn}
              disabled={!isMyTurn || currentPhase !== 'ACAO'}
            />
          </div>
        </div>
      </div>

      {/* Indicador de Target Selecionado */}
      {selectedTarget && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-cyan-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg flex items-center gap-2 animate-bounce">
            <span>🎯 Alvo:</span>
            <span>{selectedTarget.name}</span>
            <button onClick={() => setSelectedTarget(null)} className="ml-2 hover:text-red-300">✕</button>
          </div>
        </div>
      )}

      {/* Hint de interação */}
      {isMyTurn && !selectedCard && (
        <div className="fixed bottom-4 left-4 z-50 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-neutral-300">
          💡 Clique nas cartas para ver skills
        </div>
      )}
    </div>
  );
}

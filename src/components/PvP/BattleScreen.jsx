"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import LegendCard from './LegendCard';
import BattleLog from './BattleLog';
// import ItemHand from './ItemHand'; // DESATIVADO: Sistema de itens
import TurnController from './TurnController';
import BattleDecorations from './BattleDecorations';
import PlayerHUD from './PlayerHUD';
import BenchRow from './BenchRow';
import { generateRelicPool, drawRelic } from '@/utils/relicSystem';
import { formatRoomCodeDisplay } from '@/utils/roomCodes';

/**
 * Componente principal da tela de batalha PvP
 * Implementa sistema completo de batalha usando dados reais dos decks
 * @param {string} mode - Modo de jogo: 'bot', 'ranked', 'custom'
 * @param {string} roomCode - Código da sala
 * @param {Array} playerDeck - Deck do jogador (5 lendas)
 * @param {Array} opponentDeck - Deck do oponente (5 lendas)
 * @param {string} botDifficulty - Dificuldade do bot (se mode='bot')
 * @param {Array} allCards - Todas as cartas disponíveis
 * @param {Array} allItems - Todos os itens disponíveis
 * @param {Function} onExit - Callback ao sair da batalha
 */
export default function BattleScreen({ 
  mode,
  roomCode,
  playerDeck,
  opponentDeck,
  botDifficulty = 'normal',
  allCards = [],
  allItems = [],
  onExit
}) {
  const router = useRouter();
  const { user } = useAuth();

  const [selectedTarget, setSelectedTarget] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isMyTurn, setIsMyTurn] = useState(true);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [logs, setLogs] = useState([
    { type: 'inicio', text: 'Batalha iniciada!', timestamp: new Date().toISOString(), formatted: 'A batalha começou!' }
  ]);

  // Transformar dados das cartas do deck para formato de batalha
  const transformCardData = (card, hp, maxHp) => {
    if (!card) return null;
    
    const nome = card.nome || card.name || 'Carta Desconhecida';
    const imagem = card.imagens?.retrato || card.images?.portrait || card.imagem || `/images/cards/portraits/${card.id}.jpg`;
    
    // ✅ Acessar habilidades como no CardDetail
    const habilidades = card.habilidades || {};
    
    // ✅ Extrair skills 1-5
    const blocos = [
      habilidades.skill1,
      habilidades.skill2,
      habilidades.skill3,
      habilidades.skill4,
      habilidades.skill5,
    ].filter(Boolean);
    
    const skills = blocos.map((habilidade, indice) => ({
      id: `skill${indice + 1}`,
      name: habilidade.name,
      description: habilidade.description || '',
      power: habilidade.power || habilidade.damage || 0,
      pp: habilidade.pp || habilidade.cost || (indice + 2),
      maxPP: habilidade.ppMax || habilidade.maxPP || (indice + 2),
      cooldown: habilidade.cooldown || indice,
      image: habilidade.image,
      isUltimate: indice === 4
    }));
    
    // ✅ Habilidade Passiva
    const passive = habilidades.passive ? {
      name: habilidades.passive.name,
      description: habilidades.passive.description || '',
      effect: habilidades.passive.effect || 'buff',
      value: habilidades.passive.value || 0.1,
      trigger: habilidades.passive.trigger || 'turn_start',
      image: habilidades.passive.image
    } : null;
    
    return {
      id: card.id,
      name: nome,
      image: imagem,
      hp: hp !== undefined ? hp : (card.vida || card.life || card.hp || 100),
      maxHp: maxHp !== undefined ? maxHp : (card.vida || card.life || card.max_hp || card.hp || 100),
      atk: card.ataque || card.attack || card.atk || 7,
      def: card.defesa || card.defense || card.def || 5,
      element: card.elemento || card.element || 'Neutro',
      shields: 0,
      statusEffects: [],
      skills: skills,
      passive: passive
    };
  };

  // Inicializar dados da batalha
  const [battleData, setBattleData] = useState(() => {
    // Preparar lendas do jogador (5 cartas)
    const myLegends = playerDeck.slice(0, 5).map((card, i) => 
      transformCardData(card, undefined, undefined)
    );
    
    // Preparar lendas do oponente (5 cartas)
    const enemyLegends = opponentDeck.slice(0, 5).map((card, i) => 
      transformCardData(card, undefined, undefined)
    );
    
    // DESATIVADO: Sistema de itens
    // const myItems = [
    //   { id: 'pocao', name: 'Poção de Cura', type: 'heal', value: 30, description: 'Restaura 30 HP', uses: 1 },
    //   { id: 'escudo', name: 'Escudo Místico', type: 'defensivo', value: 15, description: 'Adiciona 15 de defesa', uses: 2 }
    // ];

    return {
      myPlayer: {
        name: user?.nickname || user?.email || 'Jogador',
        activeLegend: myLegends[0], // Primeira lenda ativa
        bench: myLegends.slice(1), // Outras 4 no banco
        relicPool: generateRelicPool(10),
        storedRelic: null,
        // itemHand: myItems, // DESATIVADO
        turnsPlayed: 0
      },
      opponent: {
        name: mode === 'bot' ? 'Bot' : 'Oponente',
        difficulty: mode === 'bot' ? botDifficulty : undefined,
        isBot: mode === 'bot',
        activeLegend: enemyLegends[0],
        bench: enemyLegends.slice(1),
        relicPool: generateRelicPool(10),
        storedRelic: null,
        // itemHand: [{}, {}, {}] // DESATIVADO
      }
    };
  });

  // Start-of-turn processing: se for sua vez e não tiver relíquia guardada, comprar uma
  // Observa: mantemos pity/turnos e demais regras no futuro em gameLogic
  useEffect(() => {
    if (!isMyTurn) return;

    setBattleData(prev => {
      const me = { ...prev.myPlayer };
      if (!me.storedRelic && Array.isArray(me.relicPool) && me.relicPool.length > 0) {
        const { relic, pool } = drawRelic(me.relicPool);
        me.storedRelic = relic || null;
        me.relicPool = pool;
        const newLogs = [...logs, { type: 'relic_draw', text: `${me.name} recebeu uma Relíquia guardada: ${relic?.name || 'Desconhecida'}`, timestamp: new Date().toLocaleTimeString('pt-BR'), formatted: '' }];
        setLogs(newLogs);
      }
      return { ...prev, myPlayer: me };
    });
  }, [isMyTurn]);

  const handleAddLog = (type, message) => {
    setLogs(prev => [...prev, {
      type,
      text: message,
      formatted: message,
      timestamp: new Date().toLocaleTimeString('pt-BR')
    }]);
  };

  const handleUseSkill = (skill) => {
    if (!isMyTurn) return;
    
    handleAddLog('usar_skill', `${battleData.myPlayer.name} usou ${skill.name}`);
    // TODO: Implementar lógica de dano, PP, etc
  };

  const handleSwitchLegend = (legend) => {
    if (!isMyTurn) return;
    
    handleAddLog('trocar_lenda', `${battleData.myPlayer.name} trocou para ${legend.name}`);
    setBattleData(prev => ({
      ...prev,
      myPlayer: {
        ...prev.myPlayer,
        activeLegend: legend,
        bench: [prev.myPlayer.activeLegend, ...prev.myPlayer.bench.filter(l => l.id !== legend.id)]
      }
    }));
    setIsMyTurn(false);
  };

  const handleEndTurn = () => {
    handleAddLog('fim_turno', `${battleData.myPlayer.name} encerrou o turno`);
    setIsMyTurn(false);
    setCurrentTurn(prev => prev + 1);
    setBattleData(prev => ({
      ...prev,
      myPlayer: {
        ...prev.myPlayer,
        turnsPlayed: prev.myPlayer.turnsPlayed + 1
      }
    }));
    
    // TODO: Lógica do oponente (bot ou realtime)
    setTimeout(() => {
      setIsMyTurn(true);
    }, 2000);
  };

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
          onClick={onExit || (() => router.push('/pvp'))}
          className="px-3 py-1.5 bg-red-600/90 hover:bg-red-700 text-xs font-semibold rounded-lg transition-colors shadow-lg"
        >
          ← Sair da Batalha
        </button>
      </div>

      {/* Info da Sala */}
      <div className="absolute left-1/2 top-1 -translate-x-1/2 z-50">
        <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 border border-yellow-600/30">
          <div className="text-xs text-gray-400">Sala</div>
          <div className="text-sm font-mono font-bold text-yellow-400">
            {formatRoomCodeDisplay(roomCode)}
          </div>
          <div className="text-xs text-gray-500">{mode === 'bot' ? '🤖 vs Bot' : mode === 'ranked' ? '🏆 Ranqueada' : '🏠 Personalizada'}</div>
        </div>
      </div>

      {/* Layout Principal - TCG */}
      <div className="relative z-10 h-screen flex flex-col py-4">
        
        {/* ========== TOPO: OPONENTE + BANCO ========== */}
        <div className="px-6 flex items-start justify-between mb-2">
          <div className="flex items-center gap-4">
            <PlayerHUD player={battleData.opponent} isEnemy={true} />
            <BenchRow 
              legends={battleData.opponent.bench}
              onSelectCard={(legend) => setSelectedCard(selectedCard?.id === legend.id ? null : legend)}
              selectedCard={selectedCard}
              isEnemy={true}
            />
          </div>

          {/* DESATIVADO: Itens Oponente */}
          {/* <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-10 h-14 rounded border ${
                  i < 2
                    ? 'bg-green-900/30 border-green-600/50'
                    : 'bg-black/20 border-neutral-700/30 opacity-40'
                } flex items-center justify-center`}
              >
                {i < 2 && <span className="text-xs text-green-400">?</span>}
              </div>
            ))}
          </div> */}
        </div>

        {/* ========== CENTRO: CAMPO DE BATALHA ========== */}
        <div className="flex-1 relative flex items-center justify-center">
          <div className="absolute w-[900px] h-[500px] rounded-full border-4 border-yellow-600/40 opacity-60" />

          {/* Carta Oponente - TOPO */}
          {battleData.opponent?.activeLegend && (
            <div className="absolute" style={{ top: '4%', left: '50%', transform: 'translateX(-50%)' }}>
              <LegendCard
                legend={battleData.opponent.activeLegend}
                isActive={true}
                isEnemy={true}
                onClick={() => {
                  setSelectedTarget(battleData.opponent.activeLegend);
                  setSelectedCard(selectedCard?.id === battleData.opponent.activeLegend.id ? null : battleData.opponent.activeLegend);
                }}
                showStats={true}
              />
            </div>
          )}

          {/* Painel de Skills do Oponente - Ao lado da carta */}
          {selectedCard && battleData.opponent && selectedCard.id === battleData.opponent.activeLegend?.id && (
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
                Turno {currentTurn} - {isMyTurn ? 'Sua Vez!' : 'Oponente'}
              </div>
            </div>
          </div>

          {/* Carta Jogador - BASE */}
          {battleData.myPlayer?.activeLegend && (
            <div className="absolute" style={{ bottom: '4%', left: '50%', transform: 'translateX(-50%)' }}>
              <LegendCard
                legend={battleData.myPlayer.activeLegend}
                isActive={true}
                isEnemy={false}
                onClick={() => {
                  setSelectedCard(selectedCard?.id === battleData.myPlayer.activeLegend.id ? null : battleData.myPlayer.activeLegend);
                }}
                showStats={true}
              />
            </div>
          )}

          {/* Painel de Skills do Jogador - Ao lado da carta */}
          {selectedCard && battleData.myPlayer && selectedCard.id === battleData.myPlayer.activeLegend?.id && (
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
                      isMyTurn && (battleData.myPlayer.turnsPlayed || 0) >= 3 
                        ? 'hover:bg-purple-800/50 cursor-pointer' 
                        : 'opacity-60 cursor-not-allowed'
                    }`}
                    onClick={() => {
                      if (isMyTurn && (battleData.myPlayer.turnsPlayed || 0) >= 3 && selectedTarget) {
                        actions.useUltimate(selectedTarget.id);
                        setSelectedCard(null);
                        setSelectedTarget(null);
                      }
                    }}
                  >
                    <div className="font-bold text-xs text-purple-300">💫 {selectedCard.ultimate.name}</div>
                    <div className="text-[10px] text-neutral-300 mt-1">{selectedCard.ultimate.description}</div>
                    <div className="text-[9px] text-orange-400 mt-2">⚡ {selectedCard.ultimate.power}</div>
                    {(battleData.myPlayer.turnsPlayed || 0) < 3 && (
                      <div className="text-[9px] text-red-400 mt-1">Requer 3 turnos</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Log de Batalha */}
          <div className="absolute right-20 top-40">
            <BattleLog logs={logs} />
          </div>
        </div>

        {/* ========== BASE: JOGADOR + BANCO + ITENS ========== */}
        <div className="px-8 flex items-end justify-between gap-6 mb-2">
          
          {/* HUD Jogador */}
          <PlayerHUD 
            player={battleData.myPlayer}
            isOpponent={false}
          />

          {/* BANCO + ITENS - CENTRO */}
          {battleData.myPlayer && (
            <div className="flex-1 flex flex-col ml-115 pb-2 gap-3">
              {/* Banco de Cartas */}
              <BenchRow
                legends={battleData.myPlayer.bench}
                onSelectCard={(legend) => {
                  if (isMyTurn) {
                    handleSwitchLegend(legend);
                  }
                }}
                selectedCard={selectedCard}
                disabled={!isMyTurn}
                isEnemy={false}
              />

              {/* DESATIVADO: Seus Itens */}
              {/* <div className="flex items-center gap-2">
                <span className="text-[9px] text-emerald-400 uppercase font-semibold">Seus Itens</span>
                <ItemHand
                  items={battleData.myPlayer.itemHand}
                  onUseItem={(item) => {
                    if (isMyTurn && selectedTarget) {
                      handleAddLog('item', `Item ${item.name} usado`);
                      setSelectedTarget(null);
                    }
                  }}
                  disabled={!isMyTurn}
                />
              </div> */}
            </div>
          )}

          {/* Controle Turno */}
          <div>
            <TurnController
              isMyTurn={isMyTurn}
              currentTurn={currentTurn}
              currentPhase="ACAO"
              onEndTurn={handleEndTurn}
              disabled={!isMyTurn}
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
        <div className="fixed bottom-40 left-4 z-50 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-neutral-300">
          💡 Clique nas cartas para ver skills
        </div>
      )}
    </div>
  );
}

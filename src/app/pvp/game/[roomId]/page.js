// src/app/pvp/game/[roomId]/page_new.js
"use client";

import Link from 'next/link';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { bancoDeCartas } from '../../../../data/cardsDatabase';
import { FieldIndicator, ActiveZone, Playmat, PlayerHUD, EndTurnButton, BenchZone } from '../../../../components/Game';
import SkillOrbs from '../../../../components/Game/SkillOrbs';
import CombatLog from '../../../../components/Game/CombatLog';
import Mascot from '../../../../components/Game/Mascot';
import PlayerHand from '../../../../components/Game/PlayerHand';
import CardDetail from '../../../../components/Card/CardDetail';

// Componente do Painel de Habilidades estilo Genshin TCG
function SkillPanel({ card, skills, onSkillUse, onSwitch, onPassTurn, gameState, canUseSkill }) {
  const [expanded, setExpanded] = useState(true);

  const getSkillIcon = (skill, index) => {
    const icons = ['⚔️', '🔥', '⚡', '💫', '🌟'];
    return icons[index] || '⚔️';
  };

  const getSkillColor = (skill, index) => {
    const colors = [
      'from-blue-600/80 to-blue-700/80 hover:from-blue-500/80 hover:to-blue-600/80',
      'from-green-600/80 to-green-700/80 hover:from-green-500/80 hover:to-green-600/80',
      'from-purple-600/80 to-purple-700/80 hover:from-purple-500/80 hover:to-purple-600/80',
      'from-orange-600/80 to-orange-700/80 hover:from-orange-500/80 hover:to-orange-600/80',
      'from-yellow-600/80 to-yellow-700/80 hover:from-yellow-500/80 hover:to-yellow-600/80'
    ];
    return colors[index] || colors[0];
  };

  if (!card) return null;

  return (
    <div className="absolute bottom-6 left-6 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mb-2 w-12 h-12 rounded-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/50 flex items-center justify-center text-2xl hover:border-slate-500 transition-all duration-200 backdrop-blur-sm shadow-lg"
        title={expanded ? "Ocultar Habilidades" : "Mostrar Habilidades"}
      >
        {expanded ? '🎯' : '⚔️'}
      </button>

      {/* Skills Panel */}
      {expanded && (
        <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-md border border-slate-600/50 rounded-2xl p-4 shadow-2xl min-w-[280px] max-w-[320px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-sm font-bold">
                {card.nome?.charAt(0) || 'E'}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{card.nome}</div>
                <div className="text-xs text-slate-300">Turnos em campo: {card.onFieldTurns || 0}</div>
              </div>
            </div>
            <button
              onClick={() => setExpanded(false)}
              className="text-slate-400 hover:text-white text-lg"
            >
              ✕
            </button>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {skills.map((skill, index) => {
              const disabled = gameState.actionUsed || !canUseSkill('player', skill) || (gameState.playerStun ?? 0) > 0;
              const isUltimate = skill.key === 'skill5';
              
              return (
                <button
                  key={skill.key}
                  onClick={() => onSkillUse(index)}
                  disabled={disabled || skill.locked}
                  title={skill.description} // Tooltip com descrição completa
                  className={`
                    relative group p-3 rounded-xl border transition-all duration-200 transform
                    ${disabled || skill.locked 
                      ? 'bg-slate-700/50 border-slate-600/50 cursor-not-allowed opacity-50' 
                      : `bg-gradient-to-br ${getSkillColor(skill, index)} border-slate-500/50 hover:scale-105 hover:shadow-lg active:scale-95`
                    }
                    ${isUltimate && !skill.locked && !disabled ? 'ring-2 ring-yellow-400/60 ring-offset-1 ring-offset-slate-900' : ''}
                  `}
                >
                  {/* Skill Icon */}
                  <div className="text-2xl mb-1">{getSkillIcon(skill, index)}</div>
                  
                  {/* Skill Name */}
                  <div className="text-xs font-semibold text-white mb-1 leading-tight">
                    {skill.name}
                  </div>
                  
                  {/* PP Counter e Custo */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <div className="text-xs text-yellow-200 font-bold">
                        {skill.pp}/{skill.ppMax}
                      </div>
                      <div className="text-xs text-slate-300">PP</div>
                    </div>
                  </div>
                  
                  {/* Skill Info */}
                  <div className="text-[10px] text-slate-300 leading-tight">
                    {skill.kind === 'damage' && skill.base > 0 && `+${skill.base} dano`}
                    {skill.kind === 'stun' && skill.stun > 0 && `Atordoa ${skill.stun}T`}
                    {skill.kind === 'debuff' && 'Enfraquece'}
                  </div>
                  
                  {/* Lock Indicator */}
                  {skill.locked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
                      <div className="text-center">
                        <div className="text-lg">🔒</div>
                        <div className="text-xs text-yellow-300 font-bold">
                          {skill.unlockIn}T
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Ultimate Glow */}
                  {isUltimate && !skill.locked && !disabled && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-yellow-400/20 to-orange-400/20 animate-pulse"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={onSwitch}
              disabled={gameState.actionUsed}
              className={`
                w-full p-2 rounded-lg border text-sm font-semibold transition-all duration-200
                ${gameState.actionUsed 
                  ? 'bg-slate-700/50 border-slate-600/50 text-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-emerald-600/80 to-emerald-700/80 hover:from-emerald-500/80 hover:to-emerald-600/80 border-emerald-500/50 text-white hover:scale-[1.02]'
                }
              `}
            >
              🔄 Trocar Encantado
            </button>
            
            <button
              onClick={onPassTurn}
              disabled={gameState.actionUsed}
              className={`
                w-full p-2 rounded-lg border text-sm font-semibold transition-all duration-200
                ${gameState.actionUsed 
                  ? 'bg-slate-700/50 border-slate-600/50 text-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-slate-600/80 to-slate-700/80 hover:from-slate-500/80 hover:to-slate-600/80 border-slate-500/50 text-white hover:scale-[1.02]'
                }
              `}
            >
              ⏭️ Passar Turno
            </button>
          </div>

          {/* Status Effects */}
          {(gameState.playerStun > 0) && (
            <div className="mt-3 p-2 bg-red-900/50 border border-red-600/50 rounded-lg">
              <div className="text-xs text-red-200 font-semibold text-center">
                😵‍💫 Atordoado por {gameState.playerStun} turno(s)
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function GameRoom({ params }) {
  const [gameState, setGameState] = useState({
    turn: 'player',
    playerHealth: 100,
    opponentHealth: 100,
    playerUltimate: 0,
    opponentUltimate: 0,
    turnNumber: 1,
  actionUsed: false,
  playerStun: 0,
  opponentStun: 0
  });

  // Função para buscar carta por id e garantir todos os campos necessários
  function getCardData(cardID) {
    if (!cardID) return null;
    const card = bancoDeCartas.find(c => c.id === cardID);
    if (!card) return null;
    // Mapeia 'habilidades' para 'abilities' para compatibilidade
    const abilities = card.habilidades || card.abilities || {};
    return { ...card, abilities };
  }

  // PP defaults baseados no custo da habilidade ou valores padrão
  const getDefaultMaxPP = (skill, slotIdx) => {
    if (skill && skill.cost) {
      // PP inicial é inversamente proporcional ao custo (habilidades mais caras têm menos PP)
      return Math.max(1, Math.ceil(10 / skill.cost));
    }
    // Fallback para valores padrão por slot
    switch (slotIdx) {
      case 0: return 10; // skill1
      case 1: return 8;  // skill2
      case 2: return 5;  // skill3
      case 3: return 3;  // skill4
      case 4: return 1;  // skill5 (ultimate)
      default: return 1;
    }
  };

  const buildAbilityPP = (card) => {
    const ab = card?.abilities || card?.habilidades || {};
    const pp = {};
    const skills = [ab.skill1, ab.skill2, ab.skill3, ab.skill4, ab.skill5];
    skills.forEach((skill, idx) => {
      if (skill || idx === 4) { // garante slot para a 5ª (genérica pode existir)
        const key = `skill${idx + 1}`;
        // Usa ppMax da database se disponível, caso contrário usa valores padrão
        const max = skill?.ppMax || getDefaultMaxPP(skill, idx);
        pp[key] = { current: max, max };
      }
    });
    return pp;
  };

  // Party model: 1 ativo + 5 banco; sem compra de deck
  function withState(card, revealed = false) {
    if (!card) return null;
    return {
      ...card,
      foiRevelada: !!revealed,
      onFieldTurns: 0,
      vida: card.vida || 15, // Garante que vida está definida
      vidaMaxima: card.vida || 15, // Define vida máxima baseada na vida original
      abilities: card.habilidades || card.abilities, // Normaliza o campo de habilidades
      abilityPP: buildAbilityPP(card)
    };
  }

  const [activeCards, setActiveCards] = useState({
    player: withState(getCardData('cur001'), true),
    opponent: withState(getCardData('boi001'), true)
  });

  const [playerBench, setPlayerBench] = useState([
    withState(getCardData('cuc001')),
    withState(getCardData('mul001')),
    withState(getCardData('sac001')),
    withState(getCardData('iar001')),
    withState(getCardData('bot001'))
  ]);

  const [opponentBench, setOpponentBench] = useState([
    withState(getCardData('enc001')),
    withState(getCardData('mul001')),
    withState(getCardData('sac001')),
    withState(getCardData('iar001')),
    withState(getCardData('cur001'))
  ]);

  // Deck e descarte não utilizados neste modo

  // Estados para o novo visual
  const [currentField, setCurrentField] = useState('floresta');
  const [fieldChangeCountdown, setFieldChangeCountdown] = useState(2);
  const [fieldTransitioning, setFieldTransitioning] = useState(false);

  // Campos disponíveis com seus efeitos
  const fields = useMemo(() => ({
    floresta: { 
      name: 'Floresta Misteriosa', 
      icon: '🌲', 
      bg: 'from-green-800/40 to-green-900/40',
      effect: 'Curupira +2 Defesa'
    },
    rio: { 
      name: 'Correnteza do Rio', 
      icon: '🌊', 
      bg: 'from-blue-800/40 to-blue-900/40',
      effect: 'Iara +2 Ataque'
    },
    caatinga: { 
      name: 'Caatinga Seca', 
      icon: '🌵', 
      bg: 'from-yellow-800/40 to-orange-900/40',
      effect: 'Saci +1 Velocidade'
    },
    pantanal: { 
      name: 'Pântano Sombrio', 
      icon: '🐊', 
      bg: 'from-purple-800/40 to-gray-900/40',
      effect: 'Boto +3 Vida'
    },
    lua: { 
      name: 'Lua Cheia Ascendente', 
      icon: '🌕', 
      bg: 'from-indigo-800/40 to-purple-900/40',
      effect: 'Todos +1 Habilidade'
    }
  }), []);

  const [showSkillMenu, setShowSkillMenu] = useState(false);
  const [skillCooldown, setSkillCooldown] = useState(0);
  const [awaitingSwitch, setAwaitingSwitch] = useState(false);
  const [forcePromotionFor, setForcePromotionFor] = useState(null); // 'player' | 'opponent' | null
  const [lastKOSide, setLastKOSide] = useState(null);
  const [benchFlipPlayer, setBenchFlipPlayer] = useState(new Set());
  const [benchFlipOpponent, setBenchFlipOpponent] = useState(new Set());
  const [detailCard, setDetailCard] = useState(null);
  const [logEntries, setLogEntries] = useState([]);
  const [mascotMood, setMascotMood] = useState('neutral');
  const [showOrbs, setShowOrbs] = useState(false);

  // Reseta humor do mascote após curto período
  useEffect(() => {
    if (mascotMood === 'neutral') return;
    const t = setTimeout(() => setMascotMood('neutral'), 1500);
    return () => clearTimeout(t);
  }, [mascotMood]);

  // Esconde as orbes quando o turno muda, ação é usada ou o jogador está atordoado
  useEffect(() => {
    setShowOrbs(false);
  }, [gameState.turn, gameState.actionUsed, gameState.playerStun]);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  
  // Contador de turnos em campo para liberar a 5ª habilidade (Ultimate) após 3 turnos
  const incrementOnFieldTurns = useCallback((side) => {
    setActiveCards(prev => {
      const next = { ...prev };
      if (next[side]) {
        const curr = next[side].onFieldTurns || 0;
        next[side] = { ...next[side], onFieldTurns: curr + 1 };
      }
      return next;
    });
  }, []);

  // Inicia contando o primeiro turno do jogador
  useEffect(() => {
    incrementOnFieldTurns('player');
  }, [incrementOnFieldTurns]);

  // Helpers: field effects and modifiers (lightweight implementation)
  const hasFieldBuff = useCallback((card) => {
    if (!card) return false;
    switch (currentField) {
      case 'floresta':
        return card.id === 'cur001'; // Curupira gets defense buff
      case 'rio':
        return card.id === 'iar001'; // Iara gets attack buff
      case 'caatinga':
        return card.id === 'sac001'; // Saci gets speed (visual highlight only)
      case 'pantanal':
        return card.id === 'bot001'; // Boto gets life/mitigation
      case 'lua':
        return true; // Everyone benefits from ability charge boost
      default:
        return false;
    }
  }, [currentField]);

  const getAttackWithField = useCallback((card) => {
    if (!card) return 0;
  let atk = card.ataque || card.attack || 0;
    if (currentField === 'rio' && card.id === 'iar001') atk += 2; // Iara +2 attack on river
    return atk;
  }, [currentField]);

  // Reduce incoming damage based on field/card synergy (simple shield for Boto on Pantanal)
  const mitigateIncomingDamage = useCallback((targetCard, amount) => {
    let dmg = amount;
    if (targetCard && currentField === 'pantanal' && targetCard.id === 'bot001') {
      dmg = Math.max(0, dmg - 3); // Boto gets 3 damage mitigation
    }
    return dmg;
  }, [currentField]);

  // Dados dos jogadores para o HUD
  const playerData = {
    name: "Você",
    hp: gameState.playerHealth,
    ultimate: gameState.playerUltimate,
    isActive: gameState.turn === 'player',
    level: 42,
    gamesWon: 15
  };

  const opponentData = {
    name: "Oponente",
    hp: gameState.opponentHealth,
    ultimate: gameState.opponentUltimate,
    isActive: gameState.turn === 'opponent',
    level: 38,
    gamesWon: 12
  };

  // Funções do jogo
  // Troca de Encantado: seleciona do banco e move ao ativo
  const switchActive = useCallback((side, benchIndex) => {
    if (side === 'player') {
      setPlayerBench(prev => {
        const next = [...prev];
        const incoming = next[benchIndex];
        if (!incoming || incoming.isDead) return prev; // Não permite trocar com carta morta
        const outgoing = activeCards.player;
        // revelar se necessário
  const revealedIncoming = { ...incoming, foiRevelada: true, onFieldTurns: 0 };
        setActiveCards(a => ({ ...a, player: revealedIncoming }));
  next[benchIndex] = outgoing ? { ...outgoing, onFieldTurns: 0 } : null;
        // anima flip
        setBenchFlipPlayer(s => new Set([...Array.from(s), benchIndex]));
        setTimeout(() => setBenchFlipPlayer(new Set()), 550);
        return next;
      });
    } else {
      setOpponentBench(prev => {
        const next = [...prev];
        const incoming = next[benchIndex];
        if (!incoming || incoming.isDead) return prev; // Não permite trocar com carta morta
        const outgoing = activeCards.opponent;
  const revealedIncoming = { ...incoming, foiRevelada: true, onFieldTurns: 0 };
        setActiveCards(a => ({ ...a, opponent: revealedIncoming }));
  next[benchIndex] = outgoing ? { ...outgoing, onFieldTurns: 0 } : null;
        setBenchFlipOpponent(s => new Set([...Array.from(s), benchIndex]));
        setTimeout(() => setBenchFlipOpponent(new Set()), 550);
        return next;
      });
    }
  }, [activeCards.player, activeCards.opponent]);

  // Damage helpers
  const calculateDamage = useCallback((attacker, target, base = 0) => {
    const atk = getAttackWithField(attacker);
  const def = target?.defesa || target?.defense || 0;
    const raw = atk + base - def;
    return Math.max(1, raw);
  }, [getAttackWithField]);

  // Normaliza habilidades: usa as habilidades reais das cartas
  const getSkills = useCallback((card) => {
    if (!card) return [];
    const ab = card.abilities || card.habilidades || {};
    const turns = card.onFieldTurns || 0;
    const ultimateUnlocked = turns >= 3;
    
    // Mapeia todas as 5 habilidades
    const allSkills = [ab.skill1, ab.skill2, ab.skill3, ab.skill4, ab.skill5];
    const mapped = [];
    
    allSkills.forEach((skill, idx) => {
      const key = `skill${idx + 1}`;
      const isUltimate = idx === 4; // skill5 é sempre ultimate
      
      if (skill) {
        // Usa habilidade real da carta
        const ppInfo = card.abilityPP?.[key] || { current: skill.ppMax || getDefaultMaxPP(skill, idx), max: skill.ppMax || getDefaultMaxPP(skill, idx) };
        mapped.push({
          key: skill.key || key,
          idxKey: key,
          name: skill.name,
          description: skill.description,
          kind: skill.kind || 'damage',
          base: skill.base ?? 0,
          stun: skill.stun ?? 0,
          chance: skill.chance,
          cost: skill.cost,
          pp: ppInfo.current,
          ppMax: ppInfo.max,
          locked: isUltimate ? !ultimateUnlocked : false,
          unlockIn: isUltimate ? Math.max(0, 3 - turns) : 0
        });
      } else {
        // Habilidade genérica se não existir
        const genericSkills = [
          { name: 'Golpe', description: 'Ataque básico.', cost: 1, kind: 'damage', base: 0 },
          { name: 'Golpe Potente', description: 'Ataque reforçado.', cost: 2, kind: 'damage', base: 2 },
          { name: 'Atordoar', description: 'Atordoa o alvo por 1 turno.', cost: 3, kind: 'stun', stun: 1 },
          { name: 'Golpe Supremo', description: 'Ataque devastador.', cost: 4, kind: 'damage', base: 5 },
          { name: 'Despertar Mítico', description: 'Libera o poder total após 3 turnos em campo.', cost: 6, kind: 'damage', base: 8, stun: 1 }
        ];
        
        const genericSkill = genericSkills[idx] || genericSkills[0];
        const ppInfo = card.abilityPP?.[key] || { current: getDefaultMaxPP(genericSkill, idx), max: getDefaultMaxPP(genericSkill, idx) };
        
        mapped.push({
          key: key,
          idxKey: key,
          name: genericSkill.name,
          description: genericSkill.description,
          kind: genericSkill.kind || 'damage',
          base: genericSkill.base ?? 0,
          stun: genericSkill.stun ?? 0,
          cost: genericSkill.cost,
          pp: ppInfo.current,
          ppMax: ppInfo.max,
          locked: isUltimate ? !ultimateUnlocked : false,
          unlockIn: isUltimate ? Math.max(0, 3 - turns) : 0
        });
      }
    });
    
    return mapped.slice(0, 5);
  }, []);

  const canUseSkill = useCallback((side, skill) => {
    if (!skill) return false;
    if (skill.locked) return false;
    const card = side === 'player' ? activeCards.player : activeCards.opponent;
    if (!card) return false;
    const key = skill.idxKey || 'skill1';
    const slot = card.abilityPP?.[key];
    const current = slot?.current ?? getDefaultMaxPP(skill, parseInt(key.replace('skill',''),10)-1);
    return current > 0;
  }, [activeCards.player, activeCards.opponent]);

  // Consome 1 PP da habilidade usada
  const spendPP = useCallback((side, idxKey) => {
    setActiveCards(prev => {
      const next = { ...prev };
      const card = next[side];
      if (!card) return prev;
      const abilityPP = { ...(card.abilityPP || {}) };
      const skillIndex = parseInt(idxKey.replace('skill',''),10)-1;
      const skill = card.abilities?.[idxKey];
      const slot = abilityPP[idxKey] || { 
        current: getDefaultMaxPP(skill, skillIndex), 
        max: getDefaultMaxPP(skill, skillIndex) 
      };
      abilityPP[idxKey] = { ...slot, current: Math.max(0, (slot.current ?? slot.max) - 1) };
      next[side] = { ...card, abilityPP };
      return next;
    });
  }, []);

  const pushLog = useCallback((entry) => {
    setLogEntries((prev) => [...prev, entry].slice(-20));
  }, []);

  const applyDamage = useCallback((source, targetSide, amount) => {
    setActiveCards(prev => {
      const targetCard = prev[targetSide];
      if (!targetCard) return prev;
      const adjusted = mitigateIncomingDamage(targetCard, amount);
      const newHealth = (targetCard.vida || 0) - adjusted;
      if (newHealth <= 0) {
        // Marca carta como morta e adiciona ao banco sem remover outras cartas
        const deadCard = { ...targetCard, vida: 0, isDead: true };
        if (targetSide === 'player') {
          setPlayerBench(prev => {
            const next = [...prev];
            // Adiciona a carta morta ao final se houver espaço, ou substitui a primeira carta vazia
            const emptySlot = next.findIndex(card => !card);
            if (emptySlot >= 0) {
              next[emptySlot] = deadCard;
            } else {
              // Se não há slot vazio, adiciona ao final (expandindo o banco temporariamente)
              next.push(deadCard);
            }
            return next;
          });
        } else {
          setOpponentBench(prev => {
            const next = [...prev];
            const emptySlot = next.findIndex(card => !card);
            if (emptySlot >= 0) {
              next[emptySlot] = deadCard;
            } else {
              next.push(deadCard);
            }
            return next;
          });
        }
        setLastKOSide(targetSide);
        pushLog({ side: source === 'player' ? 'player' : 'opponent', type: 'damage', title: `K.O. em ${targetCard.nome || targetCard.name}`, desc: `Dano ${adjusted}` });
        if (source === 'player') setMascotMood('happy'); else setMascotMood('worried');
        return { ...prev, [targetSide]: null };
      }
      pushLog({ side: source === 'player' ? 'player' : 'opponent', type: 'damage', title: `Dano em ${targetCard.nome || targetCard.name}`, desc: `-${adjusted} HP` });
      if (source === 'player') setMascotMood('happy'); else setMascotMood('worried');
      return { ...prev, [targetSide]: { ...targetCard, vida: newHealth } };
    });
  }, [mitigateIncomingDamage, pushLog]);

  // Mudança de campo no início de turnos pares + passivas simples
  const applyPassivesOnFieldChange = useCallback(() => {
    // Exemplo: Iara regenera 1 de vida em ambiente aquático
    if (currentField === 'rio') {
      setActiveCards(prev => {
        const upd = { ...prev };
  if (upd.player && upd.player.id === 'iar001') upd.player = { ...upd.player, vida: (upd.player.vida || 0) + 1 };
  if (upd.opponent && upd.opponent.id === 'iar001') upd.opponent = { ...upd.opponent, vida: (upd.opponent.vida || 0) + 1 };
        return upd;
      });
  setPlayerBench(prev => prev.map(c => (c && c.id === 'iar001') ? { ...c, vida: (c.vida || 0) + 1 } : c));
  setOpponentBench(prev => prev.map(c => (c && c.id === 'iar001') ? { ...c, vida: (c.vida || 0) + 1 } : c));
    }
  }, [currentField]);

  const endTurn = useCallback(() => {
    if (gameState.turn !== 'player') return;

    // Reset skill cooldown
    if (skillCooldown > 0) {
      setSkillCooldown(prev => Math.max(0, prev - 1));
    }

    // Próximo turno (incrementa contador global)
  setGameState(prev => ({
      ...prev,
      turn: 'opponent',
      turnNumber: prev.turnNumber + 1,
      actionUsed: false,
      playerUltimate: prev.playerUltimate
    }));
  // Início do turno do oponente: incrementa contador de turnos em campo
  setTimeout(() => incrementOnFieldTurns('opponent'), 0);
  // PP não regenera por turno

    // Simular turno do oponente
  setTimeout(() => {
      // Início do turno do oponente: checa mudança de campo em turnos pares
      setFieldTransitioning(false);
      const isEven = ((gameState.turnNumber) % 2 === 0); // já incrementado acima
      if (isEven) {
        setFieldTransitioning(true);
        setTimeout(() => {
          const fieldKeys = Object.keys(fields).filter(k => k !== currentField);
          const next = fieldKeys[Math.floor(Math.random() * fieldKeys.length)];
          setCurrentField(next);
          setFieldTransitioning(false);
          // aplica passivas simples
          applyPassivesOnFieldChange();
        }, 500);
      }

  // Opponent simple AI: usa habilidade disponível com PP; respeita atordoamento e lock
      setTimeout(() => {
        setGameState(prev => {
          // Se o oponente está atordoado, consome o stun e passa o turno
          if (prev.opponentStun > 0) {
            return { ...prev, opponentStun: prev.opponentStun - 1 };
          }
          return prev;
        });

        setActiveCards(prev => {
          const ac = { ...prev };
          if (ac.opponent && ac.player) {
            const skills = getSkills(ac.opponent);
            // escolhe skill que pode pagar (prioriza 5ª se disponível, depois stun, depois dano)
            const usable = skills.filter(s => canUseSkill('opponent', s));
            let chosen = usable.find(s => s.key === 'skill5') || usable.find(s => s.kind === 'stun') || usable[usable.length - 1] || usable[0];
      if (chosen) {
              // consome PP
              spendPP('opponent', chosen.idxKey || 'skill1');
              if (chosen.kind === 'stun') {
                // aplica stun no jogador
        setGameState(g => ({ ...g, playerStun: (g.playerStun ?? 0) + (chosen.stun ?? 1) }));
        pushLog({ side: 'opponent', type: 'stun', title: `${chosen.name}`, desc: `Você fica atordoado por ${chosen.stun ?? 1}T` });
        setMascotMood('worried');
              } else {
                // dano
                const dmg = calculateDamage(ac.opponent, ac.player, chosen.base ?? 0);
                const newHealth = (ac.player.vida || 0) - mitigateIncomingDamage(ac.player, dmg);
                if (newHealth <= 0) {
                  // Marca carta como morta e adiciona ao banco sem remover outras cartas
                  const deadCard = { ...ac.player, vida: 0, isDead: true };
                  setPlayerBench(prev => {
                    const next = [...prev];
                    const emptySlot = next.findIndex(card => !card);
                    if (emptySlot >= 0) {
                      next[emptySlot] = deadCard;
                    } else {
                      next.push(deadCard);
                    }
                    return next;
                  });
                  setLastKOSide('player');
                  pushLog({ side: 'opponent', type: 'damage', title: `K.O. em ${ac.player.nome || ac.player.name}`, desc: `Dano ${dmg}` });
                  setMascotMood('worried');
                  ac.player = null;
                } else {
                  ac.player = { ...ac.player, vida: newHealth };
                  pushLog({ side: 'opponent', type: 'damage', title: `${chosen.name}`, desc: `-${dmg} HP em você` });
                  setMascotMood('worried');
                }
              }
            }
          }
          return ac;
        });
      }, 300);
      // Transição de volta para o jogador: incrementa turno e verifica campo par
  setGameState(prev => ({
        ...prev,
        turn: 'player',
        turnNumber: prev.turnNumber + 1,
        opponentUltimate: prev.opponentUltimate,
        // reduz atordoamento do jogador no início do turno dele
        playerStun: Math.max(0, (prev.playerStun ?? 0) - 1)
      }));
  // Início do turno do jogador: incrementa contador de turnos em campo
  setTimeout(() => incrementOnFieldTurns('player'), 0);
  // PP não regenera por turno

      const willBeEven = ((gameState.turnNumber + 1) % 2 === 0);
      if (willBeEven) {
        setFieldTransitioning(true);
        setTimeout(() => {
          const fieldKeys = Object.keys(fields).filter(k => k !== currentField);
          const next = fieldKeys[Math.floor(Math.random() * fieldKeys.length)];
          setCurrentField(next);
          setFieldTransitioning(false);
          applyPassivesOnFieldChange();
        }, 500);
      }
    }, 1500);
  }, [gameState.turn, gameState.turnNumber, skillCooldown, fields, currentField, calculateDamage, mitigateIncomingDamage, applyPassivesOnFieldChange, getSkills, canUseSkill, incrementOnFieldTurns, spendPP, pushLog]);

  const castSkill = useCallback((index) => {
    if (gameState.turn !== 'player' || gameState.actionUsed || !activeCards.player) return;
    // Se jogador está atordoado, não pode agir
    if ((gameState.playerStun ?? 0) > 0) return;
    const skills = getSkills(activeCards.player);
    const skill = skills[index];
    if (!skill) return;
    if (!canUseSkill('player', skill)) return;
  // Consome PP
  spendPP('player', skill.idxKey || 'skill1');
    if (skill.kind === 'stun') {
      // Aplica stun no oponente
      setGameState(prev => ({ ...prev, opponentStun: (prev.opponentStun ?? 0) + (skill.stun ?? 1), actionUsed: true }));
      pushLog({ side: 'player', type: 'stun', title: `${skill.name}`, desc: `Atordoa por ${skill.stun ?? 1}T` });
      setMascotMood('happy');
    } else {
      const damage = calculateDamage(activeCards.player, activeCards.opponent, skill.base ?? 0);
      applyDamage('player', 'opponent', damage);
      setGameState(prev => ({ ...prev, actionUsed: true }));
      pushLog({ side: 'player', type: 'damage', title: `${skill.name}`, desc: `Dano base +${skill.base ?? 0}` });
    }
  // Ao usar, fechar as orbes
  setShowOrbs(false);
    setTimeout(() => endTurn(), 400);
  }, [gameState.turn, gameState.actionUsed, gameState.playerStun, activeCards.player, activeCards.opponent, getSkills, canUseSkill, spendPP, calculateDamage, applyDamage, endTurn, pushLog]);

  // Ação: Trocar (inicia seleção do banco)
  const startSwitch = useCallback(() => {
    if (gameState.turn !== 'player' || gameState.actionUsed) return;
    setAwaitingSwitch(true);
  setShowSwitchModal(true);
  }, [gameState.turn, gameState.actionUsed]);

  // Ação: Passar o turno
  const passTurn = useCallback(() => {
    if (gameState.turn !== 'player' || gameState.actionUsed) return;
    setGameState(prev => ({ ...prev, actionUsed: true }));
    setTimeout(() => endTurn(), 100);
  }, [gameState.turn, gameState.actionUsed, endTurn]);

  

  // Pilhas de deck/descarte removidas neste modo

  // Troca via clique no banco (quando aguardando seleção)
  const onPlayerBenchClick = useCallback((card, index) => {
    if (!card || card.isDead) return; // Não permite selecionar cartas mortas
    if (!awaitingSwitch && forcePromotionFor !== 'player') return;
    switchActive('player', index);
    setAwaitingSwitch(false);
  setShowSwitchModal(false);
    setForcePromotionFor(null);
    // Troca encerra imediatamente o turno
    if (gameState.turn === 'player') {
      setGameState(prev => ({ ...prev, actionUsed: true }));
      setTimeout(() => endTurn(), 100);
    }
  }, [awaitingSwitch, forcePromotionFor, switchActive, gameState.turn, endTurn]);

  // KO -> promoção forçada
  useEffect(() => {
    if (!lastKOSide) return;
    if (lastKOSide === 'player') {
      const hasBench = playerBench.some(c => c && !c.isDead); // Só considera cartas vivas
      if (hasBench) setForcePromotionFor('player');
      else console.log('Derrota: sem encantados vivos no banco');
    } else if (lastKOSide === 'opponent') {
      const idx = opponentBench.findIndex(c => c && !c.isDead); // Só considera cartas vivas
      if (idx >= 0) switchActive('opponent', idx);
    }
    setLastKOSide(null);
  }, [lastKOSide, playerBench, opponentBench, switchActive]);

  

  return (
    <div className="h-screen bg-gradient-to-br from-[#09131d] via-[#0c1f31] to-[#09131d] text-white overflow-hidden relative">
      <Playmat transitioning={fieldTransitioning} />
      <FieldIndicator currentField={currentField} fields={fields} fieldTransitioning={fieldTransitioning} />
      {/* Backdrop para fechar orbes ao clicar fora */}
      {showOrbs && (
        <div
          className="fixed inset-0 z-30 bg-transparent"
          onClick={() => setShowOrbs(false)}
          aria-hidden="true"
        />
      )}
    {/* Layout: palco central sempre centrado; Mascote/Log em overlay absoluto (não empurram o centro) */}
      <div
        className="
          relative h-full
      grid grid-cols-1 grid-rows-[auto,1fr,auto]
      items-stretch gap-2
        "
      >
        {/* Acentos laterais para preencher o espaço e manter imersão */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-cyan-900/20 via-transparent to-transparent blur-2xl" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-cyan-900/20 via-transparent to-transparent blur-2xl" />
        {/* HUDs */}
  <div className="absolute top-2 left-2 md:top-4 md:left-4 z-30">
          <PlayerHUD player={opponentData} position="top-left" />
        </div>
  <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 z-30">
          <PlayerHUD player={playerData} position="bottom-right" />
        </div>
        {/* Esquerda: Mascote (overlay) */}
        <div className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 z-30">
          <Mascot type="saci" mood={mascotMood} />
        </div>

  {/* Centro - topo: Oponente com ativo e banco (centrado) */}
  <div className="row-start-1 flex flex-col items-center justify-end px-3 md:px-6">
          <div className="w-full max-w-6xl flex flex-col items-center">
            <div className="w-full flex justify-center mb-3">
              <BenchZone
                cards={opponentBench}
                position="opponent"
                canSeeHidden={false}
                flipIndices={benchFlipOpponent}
        onCardContextMenu={(card) => setDetailCard(card?.foiRevelada ? card : null)}
              />
            </div>
            <div className="w-full flex justify-center">
              <div className="min-h-44 min-w-[20rem] flex items-center justify-center">
                <div className={`${hasFieldBuff(activeCards.opponent) ? 'ring-2 ring-offset-2 ring-offset-black/30 ring-red-400/80 rounded-xl' : ''}`}>
                  <ActiveZone
                    card={activeCards.opponent}
                    position="opponent"
          onCardClick={() => console.log('Opponent active card clicked')}
          onCardContextMenu={(card) => setDetailCard(card)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

  {/* Linha do meio: botão de turno central */}
  <div className="row-start-2 flex items-center justify-center z-10 px-3 mt-2 md:mt-3">
          <EndTurnButton
            onEndTurn={endTurn}
            disabled={gameState.actionUsed}
            isPlayerTurn={gameState.turn === 'player'}
          />
        </div>

  {/* Centro - base: Jogador com ativo e banco + orbes de habilidade */}
  <div className="row-start-3 flex flex-col items-center justify-start px-3 md:px-6">
          <div className="w-full max-w-6xl flex flex-col items-center">
            <div className="w-full flex justify-center relative z-20">
              <div className="min-h-48 min-w-[22rem] flex items-center justify-center">
                <div className="relative">
                  <div className={`${hasFieldBuff(activeCards.player) ? 'ring-2 ring-offset-2 ring-offset-black/30 ring-emerald-400/80 rounded-xl' : ''}`}>
                    <ActiveZone
                      card={activeCards.player}
                      position="player"
                      isPlayerTurn={gameState.turn === 'player'}
                      onCardClick={() => {
                        if (gameState.turn !== 'player') return;
                        if (gameState.actionUsed) return;
                        if ((gameState.playerStun ?? 0) > 0) return;
                        if (!activeCards.player) return;
                        setShowOrbs(v => !v);
                      }}
                      onCardContextMenu={(card) => setDetailCard(card)}
                    />
                  </div>
                  {/* Orbes flutuantes ao redor da carta ativa do jogador */}
                  {activeCards.player && gameState.turn === 'player' && showOrbs && (
                    <SkillOrbs
                      skills={getSkills(activeCards.player)}
                      canUseSkill={canUseSkill}
                      onUse={castSkill}
                      disabled={gameState.actionUsed || (gameState.playerStun ?? 0) > 0}
                    />
                  )}
                </div>
              </div>
            </div>
            {/* Banco do jogador */}
            <div className="w-full flex justify-center mt-3">
              <BenchZone
                cards={playerBench}
                position="player"
                canSeeHidden={true}
                onCardClick={onPlayerBenchClick}
                flipIndices={benchFlipPlayer}
                onCardContextMenu={(card) => setDetailCard(card)}
                highlightSelectable={awaitingSwitch}
              />
            </div>
            {awaitingSwitch && (
              <div className="mt-2 text-xs text-emerald-300 bg-emerald-800/30 border border-emerald-600 rounded-full px-3 py-1 shadow">Selecione um Encantado do banco para trocar</div>
            )}
          </div>
        </div>

        {/* Mão em leque do jogador (rodapé, arco) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[100vw] px-2">
          <div className="relative z-30 max-w-[100vw] overflow-x-hidden">
            <PlayerHand
              cards={[activeCards.player, ...playerBench.filter(Boolean).slice(0, 5)]}
              selectedCard={null}
              onCardSelect={() => {}}
              onCardPlay={() => {}}
              bonusGlow={gameState.turn === 'player'}
              onCardContextMenu={(card) => setDetailCard(card)}
            />
          </div>
        </div>

        {/* Direita: Tomo do Cronista (overlay) */}
        <div className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 z-30">
          <CombatLog entries={logEntries} />
        </div>

    {/* Modal simples para promoção forçada */}
    {forcePromotionFor === 'player' && (
      <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-4 w-[520px] max-w-[95vw]">
          <div className="text-sm font-bold mb-2">Escolha um Encantado para Promover</div>
          <div className="flex justify-center">
            <BenchZone
              cards={playerBench}
              position="player"
              canSeeHidden={true}
              onCardClick={onPlayerBenchClick}
              flipIndices={benchFlipPlayer}
              onCardContextMenu={(card) => setDetailCard(card)}
              highlightSelectable={true}
            />
          </div>
          <div className="mt-3 text-xs text-emerald-300 bg-emerald-800/30 border border-emerald-600 rounded-full px-3 py-1 shadow inline-block">Escolha um Encantado para promover</div>
          <div className="text-xs text-neutral-300 mt-2 text-center">Selecione uma carta do banco para ocupar o slot Ativo.</div>
        </div>
      </div>
    )}

    {/* Modal de troca (estilo Pokémon) */}
    {showSwitchModal && !forcePromotionFor && (
      <div className="absolute inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-4 w-[560px] max-w-[95vw]">
          <div className="text-sm font-bold mb-3">Trocar Encantado — Escolha do Banco</div>
          <BenchZone
            cards={playerBench}
            position="player"
            canSeeHidden={true}
            onCardClick={onPlayerBenchClick}
            flipIndices={benchFlipPlayer}
            onCardContextMenu={(card) => setDetailCard(card)}
          />
          <div className="flex justify-end mt-3">
            <button
              onClick={() => { setShowSwitchModal(false); setAwaitingSwitch(false); }}
              className="px-3 py-1 text-sm rounded border border-neutral-600 bg-neutral-800 hover:bg-neutral-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Modal de detalhes da carta (botão direito) */}
    {detailCard && (
      <div className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center" onClick={() => setDetailCard(null)}>
        <div className="max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
          <CardDetail card={detailCard} onClose={() => setDetailCard(null)} />
        </div>
      </div>
    )}

        {/* Menu de opções */}
        <div className="absolute top-4 right-4 z-40">
          <OptionsMenu />
        </div>
        
        {/* Debug Panel */}
        <DebugPanel
          gameState={gameState}
          setGameState={setGameState}
          activeCards={activeCards}
          setActiveCards={setActiveCards}
          playerBench={playerBench}
          setPlayerBench={setPlayerBench}
          opponentBench={opponentBench}
          setOpponentBench={setOpponentBench}
          currentField={currentField}
          setCurrentField={setCurrentField}
          fields={fields}
          setLastKOSide={setLastKOSide}
          buildAbilityPP={buildAbilityPP}
        />
      </div>
    </div>
  );
}

// Debug Panel para testes
function DebugPanel({ 
  gameState, 
  setGameState, 
  activeCards, 
  setActiveCards, 
  playerBench, 
  setPlayerBench,
  opponentBench,
  setOpponentBench,
  currentField, 
  setCurrentField, 
  fields,
  setLastKOSide,
  buildAbilityPP
}) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('game');

  const healCard = (side, slot = 'active') => {
    if (slot === 'active') {
      setActiveCards(prev => ({
        ...prev,
        [side]: prev[side] ? { ...prev[side], vida: prev[side].vidaMaxima || 100, isDead: false } : prev[side]
      }));
    }
  };

  const killCard = (side, slot = 'active') => {
    if (slot === 'active') {
      setActiveCards(prev => {
        const card = prev[side];
        if (!card) return prev;
        
        const deadCard = { ...card, vida: 0, isDead: true };
        
        // Move carta morta para o banco
        if (side === 'player') {
          setPlayerBench(benchPrev => {
            const next = [...benchPrev];
            const emptySlot = next.findIndex(card => !card);
            if (emptySlot >= 0) {
              next[emptySlot] = deadCard;
            } else {
              next.push(deadCard);
            }
            return next;
          });
        } else {
          setOpponentBench(benchPrev => {
            const next = [...benchPrev];
            const emptySlot = next.findIndex(card => !card);
            if (emptySlot >= 0) {
              next[emptySlot] = deadCard;
            } else {
              next.push(deadCard);
            }
            return next;
          });
        }
        
        setLastKOSide(side);
        return { ...prev, [side]: null };
      });
    }
  };

  const reviveAllCards = (side) => {
    if (side === 'player') {
      setPlayerBench(prev => prev.map(card => 
        card && card.isDead ? { ...card, vida: card.vidaMaxima || 100, isDead: false } : card
      ));
    } else {
      setOpponentBench(prev => prev.map(card => 
        card && card.isDead ? { ...card, vida: card.vidaMaxima || 100, isDead: false } : card
      ));
    }
  };

  const restorePP = (side) => {
    setActiveCards(prev => {
      const card = prev[side];
      if (!card) return prev;
      const newPP = {};
      Object.keys(card.abilityPP || {}).forEach(key => {
        const slot = card.abilityPP[key];
        newPP[key] = { ...slot, current: slot.max };
      });
      return {
        ...prev,
        [side]: { ...card, abilityPP: newPP }
      };
    });
  };

  const changeCard = (side, cardId, slot = 'active') => {
    const cardData = bancoDeCartas.find(c => c.id === cardId);
    if (!cardData) return;
    
    const newCard = {
      ...cardData,
      foiRevelada: true,
      onFieldTurns: 0,
      vida: cardData.vida || 15,
      vidaMaxima: cardData.vida || 15,
      abilityPP: buildAbilityPP(cardData)
    };

    if (slot === 'active') {
      setActiveCards(prev => ({ ...prev, [side]: newCard }));
    }
  };

  const addTurns = (side, amount) => {
    setActiveCards(prev => ({
      ...prev,
      [side]: prev[side] ? { 
        ...prev[side], 
        onFieldTurns: Math.max(0, (prev[side].onFieldTurns || 0) + amount)
      } : prev[side]
    }));
  };

  const cardOptions = bancoDeCartas.slice(0, 10).map(c => ({ id: c.id, name: c.nome }));

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-3 py-1 bg-red-600/80 hover:bg-red-500/80 text-white text-xs rounded border border-red-400 backdrop-blur-sm"
      >
        🐛 Debug
      </button>
    );
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 bg-black/90 backdrop-blur-md border border-neutral-600 rounded-xl p-4 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">🐛 Debug Panel</h3>
        <button
          onClick={() => setOpen(false)}
          className="text-neutral-400 hover:text-white text-xl"
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { id: 'game', label: '🎮 Game' },
          { id: 'cards', label: '🃏 Cartas' },
          { id: 'field', label: '🌍 Campo' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1 rounded text-sm font-semibold ${
              activeTab === tab.id 
                ? 'bg-blue-600 text-white' 
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Game Tab */}
      {activeTab === 'game' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-bold text-white mb-2">Estado do Jogo</h4>
            <div className="space-y-2">
              <button
                onClick={() => setGameState(prev => ({ ...prev, turn: prev.turn === 'player' ? 'opponent' : 'player' }))}
                className="w-full px-2 py-1 bg-blue-600/80 hover:bg-blue-500/80 text-white text-xs rounded"
              >
                Trocar Turno ({gameState.turn})
              </button>
              <button
                onClick={() => setGameState(prev => ({ ...prev, actionUsed: !prev.actionUsed }))}
                className="w-full px-2 py-1 bg-purple-600/80 hover:bg-purple-500/80 text-white text-xs rounded"
              >
                Toggle Ação ({gameState.actionUsed ? 'Usada' : 'Disponível'})
              </button>
              <button
                onClick={() => setGameState(prev => ({ ...prev, playerStun: 0, opponentStun: 0 }))}
                className="w-full px-2 py-1 bg-green-600/80 hover:bg-green-500/80 text-white text-xs rounded"
              >
                Limpar Stun
              </button>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-2">Vida</h4>
            <div className="text-xs text-neutral-300 mb-2">
              Player: {activeCards.player?.vida || 0}/{activeCards.player?.vidaMaxima || 100} | Oponente: {activeCards.opponent?.vida || 0}/{activeCards.opponent?.vidaMaxima || 100}
            </div>
            <div className="space-y-2">
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    console.log('Player +10 clicked, current card health:', activeCards.player?.vida);
                    setActiveCards(prev => ({
                      ...prev,
                      player: prev.player ? { 
                        ...prev.player, 
                        vida: Math.min(prev.player.vidaMaxima || 100, (prev.player.vida || 0) + 10),
                        isDead: false
                      } : prev.player
                    }));
                  }}
                  className="flex-1 px-2 py-1 bg-green-600/80 hover:bg-green-500/80 text-white text-xs rounded"
                >
                  Player +10
                </button>
                <button
                  onClick={() => {
                    console.log('Player -10 clicked, current card health:', activeCards.player?.vida);
                    setActiveCards(prev => {
                      const newHealth = Math.max(0, (prev.player?.vida || 0) - 10);
                      const updatedPlayer = prev.player ? { 
                        ...prev.player, 
                        vida: newHealth,
                        isDead: newHealth <= 0
                      } : prev.player;

                      // Se a carta morreu, move para o banco
                      if (newHealth <= 0 && prev.player) {
                        const deadCard = { ...updatedPlayer, isDead: true };
                        setPlayerBench(benchPrev => {
                          const next = [...benchPrev];
                          const emptySlot = next.findIndex(card => !card);
                          if (emptySlot >= 0) {
                            next[emptySlot] = deadCard;
                          } else {
                            next.push(deadCard);
                          }
                          return next;
                        });
                        setLastKOSide('player');
                        return { ...prev, player: null };
                      }

                      return { ...prev, player: updatedPlayer };
                    });
                  }}
                  className="flex-1 px-2 py-1 bg-red-600/80 hover:bg-red-500/80 text-white text-xs rounded"
                >
                  Player -10
                </button>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    console.log('Opponent +10 clicked, current card health:', activeCards.opponent?.vida);
                    setActiveCards(prev => ({
                      ...prev,
                      opponent: prev.opponent ? { 
                        ...prev.opponent, 
                        vida: Math.min(prev.opponent.vidaMaxima || 100, (prev.opponent.vida || 0) + 10),
                        isDead: false
                      } : prev.opponent
                    }));
                  }}
                  className="flex-1 px-2 py-1 bg-green-600/80 hover:bg-green-500/80 text-white text-xs rounded"
                >
                  Oponente +10
                </button>
                <button
                  onClick={() => {
                    console.log('Opponent -10 clicked, current card health:', activeCards.opponent?.vida);
                    setActiveCards(prev => {
                      const newHealth = Math.max(0, (prev.opponent?.vida || 0) - 10);
                      const updatedOpponent = prev.opponent ? { 
                        ...prev.opponent, 
                        vida: newHealth,
                        isDead: newHealth <= 0
                      } : prev.opponent;

                      // Se a carta morreu, move para o banco
                      if (newHealth <= 0 && prev.opponent) {
                        const deadCard = { ...updatedOpponent, isDead: true };
                        setOpponentBench(benchPrev => {
                          const next = [...benchPrev];
                          const emptySlot = next.findIndex(card => !card);
                          if (emptySlot >= 0) {
                            next[emptySlot] = deadCard;
                          } else {
                            next.push(deadCard);
                          }
                          return next;
                        });
                        setLastKOSide('opponent');
                        return { ...prev, opponent: null };
                      }

                      return { ...prev, opponent: updatedOpponent };
                    });
                  }}
                  className="flex-1 px-2 py-1 bg-red-600/80 hover:bg-red-500/80 text-white text-xs rounded"
                >
                  Oponente -10
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cards Tab */}
      {activeTab === 'cards' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-bold text-white mb-2">Jogador</h4>
            <div className="space-y-2">
              <div className="text-xs text-neutral-300">
                Ativo: {activeCards.player?.nome || 'Nenhum'} (T: {activeCards.player?.onFieldTurns || 0})
              </div>
              <div className="flex gap-1">
                <button onClick={() => healCard('player')} className="flex-1 px-2 py-1 bg-green-600/80 text-white text-xs rounded">Curar</button>
                <button onClick={() => killCard('player')} className="flex-1 px-2 py-1 bg-red-600/80 text-white text-xs rounded">Matar</button>
              </div>
              <button onClick={() => restorePP('player')} className="w-full px-2 py-1 bg-blue-600/80 text-white text-xs rounded">Restaurar PP</button>
              <button onClick={() => reviveAllCards('player')} className="w-full px-2 py-1 bg-purple-600/80 text-white text-xs rounded">Reviver Mortas</button>
              <div className="flex gap-1">
                <button onClick={() => addTurns('player', 1)} className="flex-1 px-2 py-1 bg-yellow-600/80 text-white text-xs rounded">+1T</button>
                <button onClick={() => addTurns('player', -1)} className="flex-1 px-2 py-1 bg-orange-600/80 text-white text-xs rounded">-1T</button>
              </div>
              <select 
                onChange={(e) => changeCard('player', e.target.value)}
                className="w-full px-2 py-1 bg-neutral-700 text-white text-xs rounded"
                defaultValue=""
              >
                <option value="">Trocar carta...</option>
                {cardOptions.map(card => (
                  <option key={card.id} value={card.id}>{card.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-2">Oponente</h4>
            <div className="space-y-2">
              <div className="text-xs text-neutral-300">
                Ativo: {activeCards.opponent?.nome || 'Nenhum'} (T: {activeCards.opponent?.onFieldTurns || 0})
              </div>
              <div className="flex gap-1">
                <button onClick={() => healCard('opponent')} className="flex-1 px-2 py-1 bg-green-600/80 text-white text-xs rounded">Curar</button>
                <button onClick={() => killCard('opponent')} className="flex-1 px-2 py-1 bg-red-600/80 text-white text-xs rounded">Matar</button>
              </div>
              <button onClick={() => restorePP('opponent')} className="w-full px-2 py-1 bg-blue-600/80 text-white text-xs rounded">Restaurar PP</button>
              <button onClick={() => reviveAllCards('opponent')} className="w-full px-2 py-1 bg-purple-600/80 text-white text-xs rounded">Reviver Mortas</button>
              <div className="flex gap-1">
                <button onClick={() => addTurns('opponent', 1)} className="flex-1 px-2 py-1 bg-yellow-600/80 text-white text-xs rounded">+1T</button>
                <button onClick={() => addTurns('opponent', -1)} className="flex-1 px-2 py-1 bg-orange-600/80 text-white text-xs rounded">-1T</button>
              </div>
              <select 
                onChange={(e) => changeCard('opponent', e.target.value)}
                className="w-full px-2 py-1 bg-neutral-700 text-white text-xs rounded"
                defaultValue=""
              >
                <option value="">Trocar carta...</option>
                {cardOptions.map(card => (
                  <option key={card.id} value={card.id}>{card.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Field Tab */}
      {activeTab === 'field' && (
        <div>
          <h4 className="text-sm font-bold text-white mb-2">Campo Atual: {fields[currentField]?.name}</h4>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(fields).map(([key, field]) => (
              <button
                key={key}
                onClick={() => setCurrentField(key)}
                className={`px-3 py-2 rounded text-xs font-semibold ${
                  currentField === key 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                }`}
              >
                {field.icon} {field.name}
              </button>
            ))}
          </div>
          <div className="mt-3 text-xs text-neutral-300">
            Efeito: {fields[currentField]?.effect}
          </div>
        </div>
      )}
    </div>
  );
}

function OptionsMenu() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-10 h-10 rounded-full bg-neutral-800/80 border border-neutral-600 text-neutral-200 flex items-center justify-center text-xl hover:bg-neutral-700 transition"
        title="Opções"
      >
        ⚙️
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-neutral-900/95 border border-neutral-700 rounded-lg shadow-2xl p-2 flex flex-col gap-1 text-sm z-50 backdrop-blur-sm">
          <Link href="/pvp" className="block" onClick={() => setOpen(false)}>
            <span className="w-full text-left px-3 py-2 rounded hover:bg-red-600/25 hover:text-red-300 flex items-center gap-2 cursor-pointer">
              ❌ <span>Sair da Partida</span>
            </span>
          </Link>
          <button
            className="w-full text-left px-3 py-2 rounded hover:bg-neutral-700/60 flex items-center gap-2 text-neutral-300"
            onClick={() => setOpen(false)}
          >
            ✖ Fechar
          </button>
        </div>
      )}
    </div>
  );
}


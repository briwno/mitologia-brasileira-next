// src/app/pvp/game/[roomId]/page_new.js
"use client";

import Link from 'next/link';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { bancoDeCartas } from '../../../../data/cardsDatabase';
// Mana removed; using PP per habilidade
import { FieldIndicator, ActiveZone, Playmat, PlayerHUD, EndTurnButton, BenchZone } from '../../../../components/Game';
import CardDetail from '../../../../components/Card/CardDetail';

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
  // Mantém o objeto de habilidades como está (para suportar skill1..skill4 + passive)
  return { ...card, abilities: card.abilities ? { ...card.abilities } : {} };
  }

  // PP defaults por slot (inspirado em Pokémon)
  const getDefaultMaxPP = (slotIdx) => {
    switch (slotIdx) {
      case 0: return 10; // skill1
      case 1: return 10; // skill2
      case 2: return 5;  // skill3
      case 3: return 3;  // skill4
      case 4: return 1;  // skill5 (ultimate)
      default: return 1;
    }
  };

  const buildAbilityPP = (card) => {
    const ab = card?.abilities || {};
    const pp = {};
    const arr = [ab.skill1, ab.skill2, ab.skill3, ab.skill4, ab.skill5];
    arr.forEach((s, idx) => {
      if (s || idx === 4) { // garante slot para a 5ª (genérica pode existir)
        const key = `skill${idx + 1}`;
        const max = getDefaultMaxPP(idx);
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
  
  // Fechar menu de ações com ESC
  useEffect(() => {
    if (!showSkillMenu) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setShowSkillMenu(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showSkillMenu]);

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
        if (!incoming) return prev;
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
        if (!incoming) return prev;
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

  // Normaliza habilidades: usa skill1..skill4 e adiciona uma 5ª (Ultimate) que desbloqueia após 3 turnos em campo
  const getSkills = useCallback((card) => {
    if (!card) return [];
    const ab = card.abilities || {};
    const turns = card.onFieldTurns || 0;
    const ultimateUnlocked = turns >= 3;
    const hasNewSchema = ab.skill1 || ab.skill2 || ab.skill3 || ab.skill4;
    if (hasNewSchema) {
      const mapped = [ab.skill1, ab.skill2, ab.skill3, ab.skill4]
        .filter(Boolean)
        .map((s, idx) => ({
          key: s.key || `s${idx + 1}`,
          idxKey: `skill${idx + 1}`,
          name: s.name,
          description: s.description,
          kind: s.kind || 'damage',
          base: s.base ?? 0,
          stun: s.stun ?? 0,
          chance: s.chance,
          pp: card.abilityPP?.[`skill${idx + 1}`]?.current ?? getDefaultMaxPP(idx),
          ppMax: card.abilityPP?.[`skill${idx + 1}`]?.max ?? getDefaultMaxPP(idx)
        }));
      // Garante 4 entradas (preenche com genéricos se faltar)
      while (mapped.length < 4) {
        const i = mapped.length;
        const gens = [
          { key: 'basic', name: 'Golpe', description: 'Ataque básico.', cost: 1, kind: 'damage', base: 0 },
          { key: 'power', name: 'Golpe Potente', description: 'Ataque reforçado.', cost: 2, kind: 'damage', base: 2 },
          { key: 'stun', name: 'Atordoar', description: 'Atordoa o alvo por 1 turno.', cost: 3, kind: 'stun', stun: 1 },
          { key: 'ultimate', name: 'Golpe Supremo', description: 'Ataque devastador.', cost: 4, kind: 'damage', base: 5 }
        ];
        mapped.push(gens[i] || gens[0]);
      }
      // 5ª habilidade: usa ab.skill5 se existir, senão cria uma genérica
      const ult = ab.skill5 ? {
        key: 'skill5',
        idxKey: 'skill5',
        name: ab.skill5.name,
        description: ab.skill5.description,
        kind: ab.skill5.kind || 'damage',
        base: ab.skill5.base ?? 8,
        stun: ab.skill5.stun ?? 1,
      } : {
        key: 'skill5',
        idxKey: 'skill5',
        name: 'Despertar Mítico',
        description: 'Libera o poder total após 3 turnos em campo.',
        kind: 'damage',
        base: 8,
        stun: 1,
      };
      const idx = 4;
      const ppInfo = card.abilityPP?.skill5 || { current: getDefaultMaxPP(idx), max: getDefaultMaxPP(idx) };
      mapped.push({ ...ult, locked: !ultimateUnlocked, unlockIn: Math.max(0, 3 - turns), pp: ppInfo.current, ppMax: ppInfo.max });
      return mapped.slice(0, 5);
    }
    // Fallback antigo (basic, power, stun, ultimate)
    const legacy = [];
    if (ab.basic) {
      legacy.push({ key: 'basic', idxKey: 'skill1', name: ab.basic.name, description: ab.basic.description, kind: 'damage', base: 0, pp: card.abilityPP?.skill1?.current ?? getDefaultMaxPP(0), ppMax: card.abilityPP?.skill1?.max ?? getDefaultMaxPP(0) });
    } else {
      legacy.push({ key: 'basic', idxKey: 'skill1', name: 'Golpe', description: 'Ataque básico.', kind: 'damage', base: 0, pp: card.abilityPP?.skill1?.current ?? getDefaultMaxPP(0), ppMax: card.abilityPP?.skill1?.max ?? getDefaultMaxPP(0) });
    }
    legacy.push({ key: 'power', idxKey: 'skill2', name: 'Golpe Potente', description: 'Ataque reforçado.', kind: 'damage', base: 2, pp: card.abilityPP?.skill2?.current ?? getDefaultMaxPP(1), ppMax: card.abilityPP?.skill2?.max ?? getDefaultMaxPP(1) });
    legacy.push({ key: 'stun', idxKey: 'skill3', name: 'Atordoar', description: 'Atordoa o alvo por 1 turno.', kind: 'stun', stun: 1, pp: card.abilityPP?.skill3?.current ?? getDefaultMaxPP(2), ppMax: card.abilityPP?.skill3?.max ?? getDefaultMaxPP(2) });
    if (ab.ultimate) {
      legacy.push({ key: 'ultimate', idxKey: 'skill4', name: ab.ultimate.name, description: ab.ultimate.description, kind: 'damage', base: 5, pp: card.abilityPP?.skill4?.current ?? getDefaultMaxPP(3), ppMax: card.abilityPP?.skill4?.max ?? getDefaultMaxPP(3) });
    } else {
      legacy.push({ key: 'ultimate', idxKey: 'skill4', name: 'Golpe Supremo', description: 'Ataque devastador.', kind: 'damage', base: 5, pp: card.abilityPP?.skill4?.current ?? getDefaultMaxPP(3), ppMax: card.abilityPP?.skill4?.max ?? getDefaultMaxPP(3) });
    }
    const pp5 = card.abilityPP?.skill5 || { current: getDefaultMaxPP(4), max: getDefaultMaxPP(4) };
    legacy.push({ key: 'skill5', idxKey: 'skill5', name: 'Despertar Mítico', description: 'Libera após 3 turnos em campo.', kind: 'damage', base: 8, stun: 1, locked: turns < 3, unlockIn: Math.max(0, 3 - turns), pp: pp5.current, ppMax: pp5.max });
    return legacy.slice(0, 5);
  }, []);

  const canUseSkill = useCallback((side, skill) => {
    if (!skill) return false;
    if (skill.locked) return false;
    const card = side === 'player' ? activeCards.player : activeCards.opponent;
    if (!card) return false;
    const key = skill.idxKey || 'skill1';
    const slot = card.abilityPP?.[key];
    const current = slot?.current ?? getDefaultMaxPP(key === 'skill5' ? 4 : (parseInt(key.replace('skill',''),10)-1));
    return current > 0;
  }, [activeCards.player, activeCards.opponent]);

  // Consome 1 PP da habilidade usada
  const spendPP = useCallback((side, idxKey) => {
    setActiveCards(prev => {
      const next = { ...prev };
      const card = next[side];
      if (!card) return prev;
      const abilityPP = { ...(card.abilityPP || {}) };
      const slot = abilityPP[idxKey] || { current: getDefaultMaxPP(idxKey === 'skill5' ? 4 : (parseInt(idxKey.replace('skill',''),10)-1)), max: getDefaultMaxPP(idxKey === 'skill5' ? 4 : (parseInt(idxKey.replace('skill',''),10)-1)) };
      abilityPP[idxKey] = { ...slot, current: Math.max(0, (slot.current ?? slot.max) - 1) };
      next[side] = { ...card, abilityPP };
      return next;
    });
  }, []);

  const applyDamage = useCallback((source, targetSide, amount) => {
    setActiveCards(prev => {
      const targetCard = prev[targetSide];
      if (!targetCard) return prev;
      const adjusted = mitigateIncomingDamage(targetCard, amount);
  const newHealth = (targetCard.vida || 0) - adjusted;
      if (newHealth <= 0) {
        // Knockout -> move to discard
        setDiscardPile(dp => [...dp, targetCard]);
        // marca KO para promoção forçada
        setLastKOSide(targetSide);
        return { ...prev, [targetSide]: null };
      }
  return { ...prev, [targetSide]: { ...targetCard, vida: newHealth } };
    });
  }, [mitigateIncomingDamage]);

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
              } else {
                // dano
                const dmg = calculateDamage(ac.opponent, ac.player, chosen.base ?? 0);
                const newHealth = (ac.player.vida || 0) - mitigateIncomingDamage(ac.player, dmg);
                if (newHealth <= 0) {
                  setDiscardPile(dp => [...dp, ac.player]);
                  setLastKOSide('player');
                  ac.player = null;
                } else {
                  ac.player = { ...ac.player, vida: newHealth };
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
  }, [gameState.turn, gameState.turnNumber, skillCooldown, fields, currentField, calculateDamage, mitigateIncomingDamage, applyPassivesOnFieldChange, getSkills, canUseSkill, incrementOnFieldTurns, spendPP]);

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
    } else {
      const damage = calculateDamage(activeCards.player, activeCards.opponent, skill.base ?? 0);
      applyDamage('player', 'opponent', damage);
      setGameState(prev => ({ ...prev, actionUsed: true }));
    }
    setShowSkillMenu(false);
    setTimeout(() => endTurn(), 400);
  }, [gameState.turn, gameState.actionUsed, gameState.playerStun, activeCards.player, activeCards.opponent, getSkills, canUseSkill, spendPP, calculateDamage, applyDamage, endTurn]);

  // Ação: Trocar (inicia seleção do banco)
  const startSwitch = useCallback(() => {
    if (gameState.turn !== 'player' || gameState.actionUsed) return;
    setAwaitingSwitch(true);
  setShowSwitchModal(true);
    setShowSkillMenu(false);
  }, [gameState.turn, gameState.actionUsed]);

  // Ação: Passar o turno
  const passTurn = useCallback(() => {
    if (gameState.turn !== 'player' || gameState.actionUsed) return;
    setShowSkillMenu(false);
    setGameState(prev => ({ ...prev, actionUsed: true }));
    setTimeout(() => endTurn(), 100);
  }, [gameState.turn, gameState.actionUsed, endTurn]);

  

  // Pilhas de deck/descarte removidas neste modo

  // Troca via clique no banco (quando aguardando seleção)
  const onPlayerBenchClick = useCallback((card, index) => {
    if (!card) return;
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
      const hasBench = playerBench.some(c => !!c);
      if (hasBench) setForcePromotionFor('player');
      else console.log('Derrota: sem encantados no banco');
    } else if (lastKOSide === 'opponent') {
      const idx = opponentBench.findIndex(c => !!c);
      if (idx >= 0) switchActive('opponent', idx);
    }
    setLastKOSide(null);
  }, [lastKOSide, playerBench, opponentBench, switchActive]);

  

  return (
    <div className="h-screen bg-gradient-to-br from-[#09131d] via-[#0c1f31] to-[#09131d] text-white overflow-hidden relative">
      <Playmat transitioning={fieldTransitioning} />
      <FieldIndicator currentField={currentField} fields={fields} fieldTransitioning={fieldTransitioning} />
    {/* Layout baseado em grade rigorosa para alinhamento perfeito */}
      <div
        className="
          relative h-full
      grid
      grid-cols-[1fr]
          grid-rows-[1fr,0.8fr,1fr]
          items-stretch
        "
      >
        {/* Acentos laterais para preencher o espaço e manter imersão */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-cyan-900/20 via-transparent to-transparent blur-2xl" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-cyan-900/20 via-transparent to-transparent blur-2xl" />
        {/* HUDs com margens simétricas */}
        <div className="absolute top-4 left-4 z-30">
          <PlayerHUD player={opponentData} position="top-left" />
        </div>
        <div className="absolute bottom-4 right-4 z-30">
          <PlayerHUD player={playerData} position="bottom-right" />
        </div>
  {/* Sidebars de deck/descarte removidas neste modo */}

        {/* Coluna Central - topo: Oponente com ativo e banco */}
        <div className="col-start-1 row-start-1 flex flex-col items-center justify-end px-6">
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
  <div className="col-start-1 row-start-2 flex items-center justify-center z-40">
          <EndTurnButton
            onEndTurn={endTurn}
            disabled={gameState.actionUsed}
            isPlayerTurn={gameState.turn === 'player'}
          />
        </div>

        {/* Coluna Central - base: Jogador com ativo e banco */}
        <div className="col-start-1 row-start-3 flex flex-col items-center justify-start px-6">
          <div className="w-full max-w-6xl flex flex-col items-center">
            <div className="w-full flex justify-center relative z-20">
              <div className="min-h-48 min-w-[22rem] flex items-center justify-center">
                <div className="relative">
                  <div className={`${hasFieldBuff(activeCards.player) ? 'ring-2 ring-offset-2 ring-offset-black/30 ring-emerald-400/80 rounded-xl' : ''}`}>
                    <ActiveZone
                      card={activeCards.player}
                      position="player"
                      isPlayerTurn={gameState.turn === 'player'}
                      onCardClick={() => activeCards.player && setShowSkillMenu(m => !m)}
                      onCardContextMenu={(card) => setDetailCard(card)}
                    />
                  </div>
                  {/* Overlay para fechar o menu ao clicar fora */}
                  {showSkillMenu && (
                    <div className="fixed inset-0 z-40" onClick={() => setShowSkillMenu(false)} />
                  )}
                  {showSkillMenu && activeCards.player && (
                    <div className="absolute -top-2 -right-44 w-44 bg-neutral-900/95 border border-neutral-700 rounded-xl p-3 flex flex-col gap-2 text-[11px] shadow-2xl z-50">
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] font-bold tracking-wide text-neutral-300">AÇÕES</div>
                        <button onClick={() => setShowSkillMenu(false)} className="text-neutral-400 hover:text-neutral-200 text-xs">✖</button>
                      </div>
                      {(() => {
                        const skills = getSkills(activeCards.player);
                        return (
                          <div className="flex flex-col gap-2">
                            {skills.map((s, i) => {
                              const disabled = gameState.actionUsed || !canUseSkill('player', s) || (gameState.playerStun ?? 0) > 0;
                              const palette = i === 0 ? 'bg-blue-700/40 hover:bg-blue-600/50 border-blue-600' : i === 1 ? 'bg-cyan-700/40 hover:bg-cyan-600/50 border-cyan-600' : i === 2 ? 'bg-purple-700/40 hover:bg-purple-600/50 border-purple-600' : 'bg-amber-600/40 hover:bg-amber-500/50 border-amber-500';
                              const glow = s.key === 'skill5' && !s.locked && !disabled ? 'animate-pulse ring-2 ring-amber-400/70 ring-offset-1 ring-offset-black/30' : '';
                              return (
                                <button
                                  key={s.key}
                                  onClick={() => castSkill(i)}
                                  disabled={disabled}
                                  className={`px-2 py-1 rounded border text-left font-semibold transition text-neutral-200 ${disabled ? 'bg-neutral-800 border-neutral-700 cursor-not-allowed' : palette} ${glow}`}
                                >
                                  {s.name} <span className="text-[10px] text-yellow-200">(PP {s.pp}/{s.ppMax})</span>
                                  <span className="block text-[9px] font-normal text-neutral-300">{s.description}</span>
                                  {s.locked && (
                                    <span className="block text-[9px] font-normal text-amber-300">🔒 Desbloqueia em {s.unlockIn} turno(s)</span>
                                  )}
                                </button>
                              );
                            })}
            {/* PP não tem barra global */}
                          </div>
                        );
                      })()}
                      <button
                        onClick={startSwitch}
                        disabled={gameState.actionUsed}
                        className={`px-2 py-1 rounded border text-left font-semibold transition text-neutral-200 ${gameState.actionUsed ? 'bg-neutral-800 border-neutral-700 cursor-not-allowed' : 'bg-emerald-700/40 hover:bg-emerald-600/50 border-emerald-600'}`}
                      >
                        Trocar Encantado
                        <span className="block text-[9px] font-normal text-neutral-200">Escolha do banco</span>
                      </button>
                      <button
                        onClick={passTurn}
                        disabled={gameState.actionUsed}
                        className={`px-2 py-1 rounded border text-left font-semibold transition text-neutral-200 ${gameState.actionUsed ? 'bg-neutral-800 border-neutral-700 cursor-not-allowed' : 'bg-neutral-700/40 hover:bg-neutral-600/50 border-neutral-600'}`}
                      >
                        Passar Turno
                        <span className="block text-[9px] font-normal text-neutral-300">Encerrar sem ação</span>
                      </button>
                    </div>
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
      <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center" onClick={() => setDetailCard(null)}>
        <div className="max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
          <CardDetail card={detailCard} onClose={() => setDetailCard(null)} />
        </div>
      </div>
    )}

        {/* Menu de opções */}
        <div className="absolute top-4 right-4 z-40">
          <OptionsMenu />
        </div>
      </div>
    </div>
  );
}

// Simple options menu replacing red exit button.
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

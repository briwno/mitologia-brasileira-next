"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBattleChannel } from '@/hooks/useBattleChannel';
import { useMatchRealtime } from '@/hooks/useMatchRealtime';
import LegendCard from './LegendCard';
import BattleLog from './BattleLog';
// import ItemHand from './ItemHand'; // DESATIVADO: Sistema de itens
import TurnController from './TurnController';
import BattleDecorations from './BattleDecorations';
import PlayerHUD from './PlayerHUD';
import { PetWidget } from '@/components/Pet';
import BenchRow from './BenchRow';
import SkillPanelSide from './SkillPanelSide';
import { generateRelicPool, drawRelic, applyRelicEffect } from '@/utils/relicSystem';
import { formatRoomCodeDisplay } from '@/utils/roomCodes';
import { 
  calculateDamage, 
  applyDamage, 
  checkVictoryConditions,
  createActionLog,
  isLegendStunned,
  isLegendRooted
} from '@/utils/battleSystem';
import { processSkillEffects } from '@/utils/skillEffects';

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
  opponentProfile = null,
  botDifficulty = 'normal',
  allCards = [],
  allItems = [],
  onExit
}) {
  const router = useRouter();
  const { user } = useAuth();

  const [selectedTarget, setSelectedTarget] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isMyTurn, setIsMyTurn] = useState(false); // Será definido pelo match
  const [currentTurn, setCurrentTurn] = useState(1);
  const [hasPlayedThisTurn, setHasPlayedThisTurn] = useState(false); // Controla se já jogou neste turno
  const [logs, setLogs] = useState([
    { type: 'inicio', text: 'Batalha iniciada!', timestamp: new Date().toISOString(), formatted: 'A batalha começou!' }
  ]);
  const [showTurnAlert, setShowTurnAlert] = useState(false);
  const turnAlertTimeoutRef = useRef(null);
  const lastLoggedTurnRef = useRef(null);
  const actionLockRef = useRef(false);

  const handleAddLog = useCallback((type, message) => {
    setLogs(prev => [...prev, {
      type,
      text: message,
      formatted: message,
      timestamp: new Date().toLocaleTimeString('pt-BR')
    }]);
  }, []);

  const handleGameOver = useCallback((finalMatch) => {
    const winnerId = finalMatch.winner_id;
    const isWinner = winnerId === user?.id;

    handleAddLog('fim_jogo', isWinner ? '🎉 VITÓRIA!' : '💀 DERROTA');

    setTimeout(() => {
      router.push(`/pvp?result=${isWinner ? 'win' : 'lose'}`);
    }, 3000);
  }, [handleAddLog, router, user?.id]);

  // Extrair roomId para uso nos hooks (sem prefixo custom_)
  const roomIdForApi = roomCode?.includes('_') ? roomCode.split('_')[1] : roomCode;
  const isPvP = mode === 'custom' || mode === 'ranked';

  // ===== HOOKS DE TEMPO REAL (APENAS PVP) =====
  
  // Handler para ações recebidas do oponente
  const handleOpponentAction = useCallback((action) => {
    console.log('[BattleScreen] Ação do oponente recebida:', action);
    
    const { type, payload } = action;
    
    switch (type) {
      case 'USE_SKILL':
        handleOpponentUseSkill(payload);
        break;
      
      case 'SWITCH_LEGEND':
        handleOpponentSwitchLegend(payload);
        break;
      
      case 'END_TURN':
        handleOpponentEndTurn(payload);
        break;
      
      case 'USE_RELIC':
        handleOpponentUseRelic(payload);
        break;
      
      case 'USE_ITEM':
        handleOpponentUseItem(payload);
        break;
      
      default:
        console.warn('[BattleScreen] Tipo de ação desconhecido:', type);
    }
  }, []);

  // Hook para canal de batalha (broadcast de ações)
  const { sendAction, isConnected, opponentConnected } = useBattleChannel(
    isPvP ? roomIdForApi : null,
    user?.id,
    handleOpponentAction
  );

  // Hook para sincronização de match (estado da partida)
  const { match, updateMatch } = useMatchRealtime(
    isPvP ? roomIdForApi : null,
    useCallback((updatedMatch) => {
      console.log('[BattleScreen] Match atualizado via realtime:', {
        current_turn: updatedMatch.current_turn,
        current_player_id: updatedMatch.current_player_id
      });
      
      // Atualizar turno atual
      setCurrentTurn(prev => {
        if (updatedMatch.current_turn !== prev) {
          console.log('[BattleScreen] 🔄 TURNO MUDOU:', prev, '→', updatedMatch.current_turn);
          if (updatedMatch.current_turn != null) {
            const ultimoTurnoRegistrado = lastLoggedTurnRef.current;
            const precisaLogar = (
              ultimoTurnoRegistrado == null && prev != null && updatedMatch.current_turn !== prev
            ) || (
              ultimoTurnoRegistrado != null && ultimoTurnoRegistrado !== updatedMatch.current_turn
            );

            if (precisaLogar) {
              handleAddLog('novo_turno', `🔄 Turno ${updatedMatch.current_turn} iniciado`);
            }

            lastLoggedTurnRef.current = updatedMatch.current_turn;
          }
          setHasPlayedThisTurn(false);
          return updatedMatch.current_turn;
        }
        return prev;
      });
      
      // Atualizar vez do jogador
      setIsMyTurn(prev => {
        const isMyTurnNow = String(updatedMatch.current_player_id) === String(user?.id);
        if (isMyTurnNow !== prev) {
          console.log('[BattleScreen] 🎮 VEZ MUDOU:', prev ? 'ERA MINHA' : 'ERA DO OPONENTE', '→', isMyTurnNow ? 'AGORA É MINHA' : 'AGORA É DO OPONENTE');
          if (isMyTurnNow) {
            const souPlayerA = String(user?.id) === String(updatedMatch.player_a_id);
            const jaAgiu = souPlayerA ? Boolean(updatedMatch.player_a_has_acted) : Boolean(updatedMatch.player_b_has_acted);
            if (jaAgiu) {
              actionLockRef.current = true;
            } else {
              actionLockRef.current = false;
            }
            setHasPlayedThisTurn(jaAgiu);
          } else {
            actionLockRef.current = true;
            setHasPlayedThisTurn(false);
          }
          return isMyTurnNow;
        }
        return prev;
      });
      
      // Verificar se a partida terminou
      if (updatedMatch.status === 'finished') {
        handleGameOver(updatedMatch);
      }
    }, [handleAddLog, handleGameOver, user?.id])
  );

  // Sincronizar estado local com o match
  useEffect(() => {
    if (match && user?.id && isPvP) {
      const isPlayerA = String(user.id) === String(match.player_a_id);
      const isPlayerB = String(user.id) === String(match.player_b_id);
      
      console.log('[BattleScreen] Sincronizando estado com match:', {
        matchId: match.id,
        userId: user.id,
        isPlayerA,
        isPlayerB,
        playerAId: match.player_a_id,
        playerBId: match.player_b_id,
        currentPlayerId: match.current_player_id,
        currentTurn: match.current_turn,
        status: match.status
      });
      
      // Verificar se ambos os jogadores estão na partida
      if (!match.player_b_id) {
        console.log('[BattleScreen] ⏳ Aguardando segundo jogador entrar...');
        setIsMyTurn(false);
        return;
      }
      
      // Atualizar turno atual
      if (match.current_turn) {
        setCurrentTurn(match.current_turn);
        if (lastLoggedTurnRef.current == null) {
          lastLoggedTurnRef.current = match.current_turn;
        }
      }
      
      // Atualizar vez do jogador
      if (match.current_player_id) {
        const myTurn = String(match.current_player_id) === String(user.id);
        setIsMyTurn(myTurn);
        console.log(`[BattleScreen] ${myTurn ? '✅ É minha vez!' : '⏳ Aguardando oponente'}`);
        if (myTurn) {
          const souPlayerA = String(user.id) === String(match.player_a_id);
          const jaAgiu = souPlayerA ? Boolean(match.player_a_has_acted) : Boolean(match.player_b_has_acted);
          if (jaAgiu) {
            actionLockRef.current = true;
          } else {
            actionLockRef.current = false;
          }
          setHasPlayedThisTurn(jaAgiu);
        } else {
          actionLockRef.current = true;
          setHasPlayedThisTurn(false);
        }
      } else {
        // Se ainda não tem current_player_id, aguardar
        console.log('[BattleScreen] ⏳ Aguardando inicialização do turno...');
        actionLockRef.current = true;
        setIsMyTurn(false);
        setHasPlayedThisTurn(false);
      }
    }
  }, [match?.player_a_id, match?.player_b_id, match?.current_player_id, match?.current_turn, match?.status, match?.player_a_has_acted, match?.player_b_has_acted, user?.id, isPvP]);

  useEffect(() => {
    if (!isPvP) {
      setShowTurnAlert(false);
      if (turnAlertTimeoutRef.current) {
        clearTimeout(turnAlertTimeoutRef.current);
        turnAlertTimeoutRef.current = null;
      }
      return undefined;
    }

    if (isMyTurn) {
      setShowTurnAlert(true);
      if (turnAlertTimeoutRef.current) {
        clearTimeout(turnAlertTimeoutRef.current);
      }
      turnAlertTimeoutRef.current = setTimeout(() => {
        setShowTurnAlert(false);
        turnAlertTimeoutRef.current = null;
      }, 2000);
    } else {
      if (turnAlertTimeoutRef.current) {
        clearTimeout(turnAlertTimeoutRef.current);
        turnAlertTimeoutRef.current = null;
      }
      setShowTurnAlert(false);
    }

    return () => {
      if (turnAlertTimeoutRef.current) {
        clearTimeout(turnAlertTimeoutRef.current);
        turnAlertTimeoutRef.current = null;
      }
    };
  }, [isMyTurn, isPvP]);

  // ===== FIM HOOKS DE TEMPO REAL =====

  const obterHabilidadesDaCarta = (card) => {
    if (!card) {
      return {};
    }

    if (card.habilidades) {
      return card.habilidades;
    }

    if (card.abilities) {
      if (typeof card.abilities === 'string') {
        try {
          const parsed = JSON.parse(card.abilities);
          if (parsed) {
            return parsed;
          }
        } catch (error) {
          console.error('[BattleScreen] Erro ao ler habilidades da carta', { cardId: card.id, error });
        }
      } else if (typeof card.abilities === 'object') {
        return card.abilities;
      }
    }

    return {};
  };

  const gerarDecisoesParaEfeitos = (skillObj) => {
    const resultados = [];

    if (!skillObj) {
      return resultados;
    }

    if (!Array.isArray(skillObj.effects)) {
      return resultados;
    }

    skillObj.effects.forEach(effect => {
      let aplicar = true;
      if (effect && typeof effect.chance === 'number') {
        const rolagem = Math.random();
        if (rolagem > effect.chance) {
          aplicar = false;
        }
      }
      resultados.push(aplicar);
    });

    return resultados;
  };

  // Transformar dados das cartas do deck para formato de batalha
  const transformCardData = (card, hp, maxHp) => {
    if (!card) {
      return null;
    }

    let nome = 'Carta Desconhecida';
    if (typeof card.nome === 'string' && card.nome.length > 0) {
      nome = card.nome;
    } else if (typeof card.name === 'string' && card.name.length > 0) {
      nome = card.name;
    }

    let imagem = `/images/cards/portraits/${card.id}.jpg`;
    if (card.imagens && typeof card.imagens.retrato === 'string' && card.imagens.retrato.length > 0) {
      imagem = card.imagens.retrato;
    } else if (card.images && typeof card.images.portrait === 'string' && card.images.portrait.length > 0) {
      imagem = card.images.portrait;
    } else if (typeof card.imagem === 'string' && card.imagem.length > 0) {
      imagem = card.imagem;
    }

    const habilidadesOrigem = obterHabilidadesDaCarta(card);

    const chavesSkills = ['skill1', 'skill2', 'skill3', 'skill4', 'skill5'];
    const skills = [];

    for (let indice = 0; indice < chavesSkills.length; indice += 1) {
      const chave = chavesSkills[indice];
      const dadosHabilidade = habilidadesOrigem ? habilidadesOrigem[chave] : null;
      if (!dadosHabilidade) {
        continue;
      }

      const efeitosNormalizados = [];
      if (Array.isArray(dadosHabilidade.effects)) {
        dadosHabilidade.effects.forEach(efeito => {
          if (efeito) {
            efeitosNormalizados.push({ ...efeito });
          }
        });
      }

      let capacidadePP = indice + 2;
      if (typeof dadosHabilidade.pp_max === 'number') {
        capacidadePP = dadosHabilidade.pp_max;
      } else if (typeof dadosHabilidade.ppMax === 'number') {
        capacidadePP = dadosHabilidade.ppMax;
      } else if (typeof dadosHabilidade.maxPP === 'number') {
        capacidadePP = dadosHabilidade.maxPP;
      }

      let ppAtual = capacidadePP;
      if (typeof dadosHabilidade.pp === 'number') {
        ppAtual = dadosHabilidade.pp;
      } else if (typeof dadosHabilidade.pp_atual === 'number') {
        ppAtual = dadosHabilidade.pp_atual;
      }

      let poderBase = 0;
      if (typeof dadosHabilidade.power === 'number') {
        poderBase = dadosHabilidade.power;
      } else if (typeof dadosHabilidade.damage === 'number') {
        poderBase = dadosHabilidade.damage;
      }

      let descricaoSkill = '';
      if (typeof dadosHabilidade.description === 'string') {
        descricaoSkill = dadosHabilidade.description;
      }

      let nomeSkill = `Habilidade ${indice + 1}`;
      if (typeof dadosHabilidade.name === 'string' && dadosHabilidade.name.length > 0) {
        nomeSkill = dadosHabilidade.name;
      }

      let tipoSkill = 'damage';
      if (typeof dadosHabilidade.type === 'string' && dadosHabilidade.type.length > 0) {
        tipoSkill = dadosHabilidade.type;
      }

      let alvoSkill = 'enemy';
      if (typeof dadosHabilidade.target === 'string' && dadosHabilidade.target.length > 0) {
        alvoSkill = dadosHabilidade.target;
      }

      let cooldownSkill = indice;
      if (typeof dadosHabilidade.cooldown === 'number') {
        cooldownSkill = dadosHabilidade.cooldown;
      }

      let requisitosUltimate = null;
      if (dadosHabilidade.ultimate_requirements) {
        requisitosUltimate = { ...dadosHabilidade.ultimate_requirements };
      }

      const novaSkill = {
        id: `skill${indice + 1}`,
        name: nomeSkill,
        description: descricaoSkill,
        power: poderBase,
        pp: ppAtual,
        ppMax: capacidadePP,
        maxPP: capacidadePP,
        cooldown: cooldownSkill,
        image: dadosHabilidade.image,
        isUltimate: indice === 4,
        type: tipoSkill,
        target: alvoSkill,
        effects: efeitosNormalizados,
        ultimateRequirements: requisitosUltimate
      };

      if (typeof dadosHabilidade.chance === 'number') {
        novaSkill.chance = dadosHabilidade.chance;
      }

      skills.push(novaSkill);
    }

    const passiveBruta = habilidadesOrigem ? habilidadesOrigem.passive : null;
    let passive = null;
    if (passiveBruta) {
      let nomePassiva = '';
      if (typeof passiveBruta.name === 'string') {
        nomePassiva = passiveBruta.name;
      }

      let descricaoPassiva = '';
      if (typeof passiveBruta.description === 'string') {
        descricaoPassiva = passiveBruta.description;
      }

      let tipoPassivo = 'buff';
      if (typeof passiveBruta.effect === 'string') {
        tipoPassivo = passiveBruta.effect;
      }

      let valorPassivo = 0;
      if (typeof passiveBruta.value === 'number') {
        valorPassivo = passiveBruta.value;
      }

      let gatilhoPassivo = 'turn_start';
      if (typeof passiveBruta.trigger === 'string' && passiveBruta.trigger.length > 0) {
        gatilhoPassivo = passiveBruta.trigger;
      }

      const efeitosPassivos = Array.isArray(passiveBruta.effects) ? passiveBruta.effects.map(efeito => ({ ...efeito })) : undefined;
      const sinergiasPassivas = Array.isArray(passiveBruta.synergy) ? passiveBruta.synergy.map(entrada => ({ ...entrada })) : undefined;

      passive = {
        name: nomePassiva,
        description: descricaoPassiva,
        effect: tipoPassivo,
        value: valorPassivo,
        trigger: gatilhoPassivo,
        image: passiveBruta.image,
        effects: efeitosPassivos,
        synergy: sinergiasPassivas
      };
    }

    let baseHp = 100;
    if (typeof card.vida === 'number') {
      baseHp = card.vida;
    } else if (typeof card.life === 'number') {
      baseHp = card.life;
    } else if (typeof card.hp === 'number') {
      baseHp = card.hp;
    } else if (typeof card.max_hp === 'number') {
      baseHp = card.max_hp;
    }

    let baseAtk = 7;
    if (typeof card.ataque === 'number') {
      baseAtk = card.ataque;
    } else if (typeof card.attack === 'number') {
      baseAtk = card.attack;
    } else if (typeof card.atk === 'number') {
      baseAtk = card.atk;
    }

    let baseDef = 5;
    if (typeof card.defesa === 'number') {
      baseDef = card.defesa;
    } else if (typeof card.defense === 'number') {
      baseDef = card.defense;
    } else if (typeof card.def === 'number') {
      baseDef = card.def;
    }

    let valorHp = baseHp;
    if (typeof hp === 'number') {
      valorHp = hp;
    }

    let valorMaxHp = baseHp;
    if (typeof maxHp === 'number') {
      valorMaxHp = maxHp;
    }

    let elemento = 'Neutro';
    if (typeof card.elemento === 'string' && card.elemento.length > 0) {
      elemento = card.elemento;
    } else if (typeof card.element === 'string' && card.element.length > 0) {
      elemento = card.element;
    }

    return {
      id: card.id,
      name: nome,
      image: imagem,
      hp: valorHp,
      maxHp: valorMaxHp,
      baseMaxHp: baseHp,
      atk: baseAtk,
      baseAtk: baseAtk,
      def: baseDef,
      baseDef: baseDef,
      element: elemento,
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
        // Se recebemos opponentProfile (do servidor), usamos nickname/avatar/mmr
        name: opponentProfile?.nickname || opponentProfile?.name || (mode === 'bot' ? 'Bot' : 'Oponente'),
        avatar_url: opponentProfile?.avatar_url || null,
        mmr: opponentProfile?.mmr,
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
        const newLogs = [...logs, { type: 'relic_draw', text: `${me.name} recebeu uma Relíquia guardada!`, timestamp: new Date().toLocaleTimeString('pt-BR'), formatted: '' }];
        setLogs(newLogs);
      }
      return { ...prev, myPlayer: me };
    });
  }, [isMyTurn]);

  // ===== HANDLERS PARA AÇÕES DO OPONENTE =====
  
  const handleOpponentUseSkill = useCallback((payload) => {
    const {
      skillId,
      targetId,
      damage,
      effectsMask,
      skillName,
      logsShared,
      effectLogsShared,
      sync,
      attackerName
    } = payload;

    const resultado = {
      sucesso: false,
      logs: [],
      efeitoLogs: []
    };

    setBattleData(prev => {
      const next = { ...prev };
      const opp = { ...next.opponent };
      const me = { ...next.myPlayer };

      if (!opp.activeLegend) {
        return prev;
      }

      let skill = null;
      if (opp.activeLegend && Array.isArray(opp.activeLegend.skills)) {
        const listaSkills = opp.activeLegend.skills;
        for (let indice = 0; indice < listaSkills.length; indice += 1) {
          const habilidade = listaSkills[indice];
          if (habilidade && habilidade.id === skillId) {
            skill = habilidade;
            break;
          }
        }
      }
      if (!skill) {
        return prev;
      }

      if (targetId && me.activeLegend && targetId === me.activeLegend.id) {
        const target = { ...me.activeLegend };
        const dmgResult = applyDamage(target, damage);
        me.activeLegend = target;

        const mensagemDano = `${opp.name} causou ${dmgResult.totalDamage} de dano com ${skill.name}${dmgResult.isCritical ? ' CRÍTICO!' : ''}`;
        resultado.logs.push({ type: 'dano', message: mensagemDano });

        if (dmgResult.isDefeated) {
          resultado.logs.push({ type: 'derrota', message: `${target.name} foi derrotado!` });
        }
      }

      const mascaraEfeitos = Array.isArray(effectsMask) ? effectsMask : [];
      const logsEfeitos = processSkillEffects({
        skill,
        attackerLegend: opp.activeLegend,
        defenderLegend: me.activeLegend,
        attackerPlayer: opp,
        defenderPlayer: me,
        forcedResults: mascaraEfeitos
      }) || [];

      logsEfeitos.forEach(item => {
        if (!item) {
          return;
        }
        const tipoLog = item.type ? item.type : 'info';
        const mensagemLog = item.text ? item.text : '';
        if (mensagemLog.length > 0) {
          resultado.efeitoLogs.push({ type: tipoLog, message: mensagemLog });
        }
      });

      if (opp.activeLegend.skills) {
        const updatedSkills = opp.activeLegend.skills.map(s => {
          if (s && s.id === skillId) {
            let valorAtual = 0;
            if (typeof s.pp === 'number') {
              valorAtual = s.pp;
            } else if (typeof s.ppMax === 'number') {
              valorAtual = s.ppMax;
            }
            const novoValor = valorAtual - 1;
            return { ...s, pp: novoValor >= 0 ? novoValor : 0 };
          }
          return s;
        });
        opp.activeLegend = { ...opp.activeLegend, skills: updatedSkills };
      }

      if (sync && sync.attacker && opp.activeLegend) {
        if (sync.attacker.id && opp.activeLegend.id === sync.attacker.id) {
          if (typeof sync.attacker.hp === 'number') {
            opp.activeLegend.hp = sync.attacker.hp;
          }
          if (typeof sync.attacker.shields === 'number') {
            opp.activeLegend.shields = sync.attacker.shields;
          }
          if (Array.isArray(opp.activeLegend.skills) && sync.attacker.skillId) {
            opp.activeLegend.skills = opp.activeLegend.skills.map(s => {
              if (s && s.id === sync.attacker.skillId && typeof sync.attacker.skillPP === 'number') {
                return { ...s, pp: sync.attacker.skillPP };
              }
              return s;
            });
          }
        }
      }

      if (sync && sync.defender && me.activeLegend) {
        if (sync.defender.id && me.activeLegend.id === sync.defender.id) {
          if (typeof sync.defender.hp === 'number') {
            me.activeLegend.hp = sync.defender.hp;
          }
          if (typeof sync.defender.shields === 'number') {
            me.activeLegend.shields = sync.defender.shields;
          }
          if (Array.isArray(sync.defender.statusEffects)) {
            me.activeLegend.statusEffects = sync.defender.statusEffects.map(efeito => ({ ...efeito }));
          }
        }
      }

      next.opponent = opp;
      next.myPlayer = me;
      resultado.sucesso = true;
      return next;
    });

    if (!resultado.sucesso) {
      return;
    }

    const registrosBase = [];
    if (Array.isArray(logsShared) && logsShared.length > 0) {
      logsShared.forEach(item => registrosBase.push(item));
    } else {
      resultado.logs.forEach(item => registrosBase.push(item));
    }

    const registrosEfeitos = [];
    if (Array.isArray(effectLogsShared) && effectLogsShared.length > 0) {
      effectLogsShared.forEach(item => registrosEfeitos.push(item));
    } else {
      resultado.efeitoLogs.forEach(item => registrosEfeitos.push(item));
    }

    if (registrosBase.length === 0 && registrosEfeitos.length === 0) {
      let nomeAtacante = 'Oponente';
      if (typeof attackerName === 'string' && attackerName.length > 0) {
        nomeAtacante = attackerName;
      }
      let nomeSkill = 'habilidade';
      if (typeof skillName === 'string' && skillName.length > 0) {
        nomeSkill = skillName;
      }
      registrosBase.push({ type: 'usar_skill', message: `${nomeAtacante} usou ${nomeSkill}.` });
    }

    registrosBase.forEach(entry => {
      if (entry && entry.message) {
        const tipo = entry.type ? entry.type : 'info';
        handleAddLog(tipo, entry.message);
      }
    });

    registrosEfeitos.forEach(entry => {
      if (entry && entry.message) {
        const tipo = entry.type ? entry.type : 'info';
        handleAddLog(tipo, entry.message);
      }
    });
  }, [handleAddLog, processSkillEffects]);

  const handleOpponentSwitchLegend = useCallback((payload) => {
    const { legendId } = payload;

    let mensagemTroca = null;

    setBattleData(prev => {
      const next = { ...prev };
      const opp = { ...next.opponent };

      const newActive = opp.bench.find(l => l.id === legendId);
      if (!newActive) {
        return prev;
      }

      opp.bench = [opp.activeLegend, ...opp.bench.filter(l => l.id !== legendId)];
      opp.activeLegend = newActive;

      next.opponent = opp;
      mensagemTroca = `${opp.name} trocou para ${newActive.name}`;
      return next;
    });

    if (mensagemTroca) {
      handleAddLog('trocar_lenda', mensagemTroca);
    }
  }, [handleAddLog]);

  const handleOpponentEndTurn = useCallback((payload) => {
    console.log('[handleOpponentEndTurn] Oponente finalizou turno', {
      payload,
      current_turn: match?.current_turn,
      current_player_id: match?.current_player_id
    });

    handleAddLog('fim_turno', `${battleData.opponent?.name || 'Oponente'} encerrou o turno`);

    if (!isPvP) {
      return;
    }

    setHasPlayedThisTurn(false);
    setIsMyTurn(true);
    actionLockRef.current = false;

    if (payload?.turn) {
      setCurrentTurn(payload.turn);
    }
  }, [battleData.opponent, handleAddLog, isPvP, match?.current_player_id, match?.current_turn]);

  const handleOpponentUseRelic = useCallback((payload) => {
    const { relicEffect } = payload;
    handleAddLog('relic', `${battleData.opponent?.name || 'Oponente'} usou uma Relíquia`);
    
    // Aplicar efeitos da relíquia do oponente (se afetar o jogador)
    if (relicEffect?.damage) {
      setBattleData(prev => {
        const next = { ...prev };
        const me = { ...next.myPlayer };
        const target = { ...me.activeLegend };
        applyDamage(target, relicEffect.damage);
        me.activeLegend = target;
        next.myPlayer = me;
        return next;
      });
    }
  }, [battleData.opponent, handleAddLog]);

  const handleOpponentUseItem = useCallback((payload) => {
    const { itemName, effect } = payload;
    handleAddLog('item', `${battleData.opponent?.name || 'Oponente'} usou ${itemName}`);
  }, [battleData.opponent, handleAddLog]);

  // ===== FIM HANDLERS =====

  const handleUseSkill = (skill) => {
    if (actionLockRef.current === true) {
      handleAddLog('erro', 'Ação anterior ainda está sendo processada. Aguarde um instante.');
      return;
    }

    console.log('[handleUseSkill] Tentando usar skill:', {
      skillName: skill.name,
      isMyTurn,
      hasPlayedThisTurn,
      currentTurn
    });

    const minhaLendaAtiva = battleData.myPlayer ? battleData.myPlayer.activeLegend : null;
    if (isLegendStunned(minhaLendaAtiva)) {
      let nomeLenda = 'Sua lenda';
      if (minhaLendaAtiva && typeof minhaLendaAtiva.name === 'string' && minhaLendaAtiva.name.length > 0) {
        nomeLenda = minhaLendaAtiva.name;
      }

      let nomeJogador = 'Jogador';
      if (battleData.myPlayer && typeof battleData.myPlayer.name === 'string' && battleData.myPlayer.name.length > 0) {
        nomeJogador = battleData.myPlayer.name;
      }

      handleAddLog('controle', `${nomeLenda} está atordoada e não pode agir neste turno.`);
      finalizeTurn('stun_skip', `${nomeJogador} perdeu a ação por atordoamento.`);
      return;
    }
    
    if (!isMyTurn || hasPlayedThisTurn) {
      console.warn('[handleUseSkill] ❌ Bloqueado:', { isMyTurn, hasPlayedThisTurn });
      handleAddLog('erro', 'Aguarde sua vez ou você já jogou neste turno!');
      return;
    }

    actionLockRef.current = true;

    console.log('[handleUseSkill] ✅ Executando skill:', skill.name);

    const resultadoAcao = {
      sucesso: false,
      erro: null,
      logs: [],
      efeitoLogs: [],
      payload: null
    };

    setBattleData(prev => {
      const next = { ...prev };
      const me = { ...next.myPlayer };
      const opp = { ...next.opponent };

      if (!me.activeLegend) {
        resultadoAcao.erro = 'Nenhuma lenda ativa para usar habilidades';
        return prev;
      }

      const active = { ...me.activeLegend };
      const skills = Array.isArray(active.skills) ? active.skills.map(s => ({ ...s })) : [];
      const idx = skills.findIndex(s => s.id === skill.id);
      const skillObj = idx >= 0 ? { ...skills[idx] } : { ...skill };

      if (skillObj.isUltimate) {
        const requiredTurns = skillObj.requiredTurns || skillObj.required_turns || 3;
        if ((me.turnsPlayed || 0) < requiredTurns) {
          resultadoAcao.erro = `Ultimate ${skillObj.name} não disponível ainda`;
          return prev;
        }
        if (active.ultimateUsed) {
          resultadoAcao.erro = `Ultimate ${skillObj.name} já foi usada`;
          return prev;
        }
        active.ultimateUsed = true;
      } else {
        const currentPP = (() => {
          if (typeof skillObj.pp === 'number') {
            return skillObj.pp;
          }
          if (typeof skillObj.ppCurrent === 'number') {
            return skillObj.ppCurrent;
          }
          if (typeof skillObj.ppMax === 'number') {
            return skillObj.ppMax;
          }
          if (typeof skillObj.maxPP === 'number') {
            return skillObj.maxPP;
          }
          return 0;
        })();

        if (currentPP <= 0) {
          resultadoAcao.erro = `Sem PP para usar ${skillObj.name}`;
          return prev;
        }

        if (idx >= 0) {
          skills[idx] = { ...skills[idx], pp: currentPP - 1 };
        }
      }

      const alvoOriginal = opp.activeLegend ? { ...opp.activeLegend } : null;
      let damage = 0;

      if (skillObj.power && opp.activeLegend) {
        const dmgCalc = calculateDamage(
          active,
          opp.activeLegend,
          skillObj.power,
          {}
        );
        damage = dmgCalc.damage;

        if (alvoOriginal) {
          const target = { ...alvoOriginal };
          const dmgResult = applyDamage(target, damage);
          opp.activeLegend = target;

          const mensagemBase = `${me.name} usou ${skillObj.name} causando ${dmgResult.totalDamage} de dano${dmgResult.isCritical ? ' CRÍTICO!' : ''}`;
          resultadoAcao.logs.push({ type: 'usar_skill', message: mensagemBase });

          if (dmgResult.isDefeated) {
            resultadoAcao.logs.push({ type: 'derrota', message: `${target.name} foi derrotado!` });
          }
        }
      }

      const efeitoDecisoes = gerarDecisoesParaEfeitos(skillObj);

      const logsEfeitos = processSkillEffects({
        skill: skillObj,
        attackerLegend: active,
        defenderLegend: opp.activeLegend,
        attackerPlayer: me,
        defenderPlayer: opp,
        forcedResults: efeitoDecisoes
      }) || [];

      logsEfeitos.forEach(item => {
        if (!item) {
          return;
        }
        const tipoLog = item.type ? item.type : 'info';
        const mensagemLog = item.text ? item.text : '';
        if (mensagemLog.length > 0) {
          resultadoAcao.efeitoLogs.push({ type: tipoLog, message: mensagemLog });
        }
      });

      active.skills = skills;
      me.activeLegend = active;
      next.myPlayer = me;
      next.opponent = opp;

      resultadoAcao.sucesso = true;
      const syncData = {
        attacker: {
          id: null,
          hp: null,
          shields: null,
          skillId: skillObj.id,
          skillPP: null
        },
        defender: {
          id: null,
          hp: null,
          shields: null,
          statusEffects: []
        }
      };

      if (active) {
        if (typeof active.id === 'undefined') {
          // mantém nulo
        } else {
          syncData.attacker.id = active.id;
        }
        if (typeof active.hp === 'number') {
          syncData.attacker.hp = active.hp;
        }
        if (typeof active.shields === 'number') {
          syncData.attacker.shields = active.shields;
        }
      }

      if (idx >= 0) {
        const skillAtualizada = skills[idx];
        if (skillAtualizada && typeof skillAtualizada.pp === 'number') {
          syncData.attacker.skillPP = skillAtualizada.pp;
        }
      }

      if (opp.activeLegend) {
        const defensorAtivo = opp.activeLegend;
        if (typeof defensorAtivo.id === 'undefined') {
          // mantém padrão
        } else {
          syncData.defender.id = defensorAtivo.id;
        }
        if (typeof defensorAtivo.hp === 'number') {
          syncData.defender.hp = defensorAtivo.hp;
        }
        if (typeof defensorAtivo.shields === 'number') {
          syncData.defender.shields = defensorAtivo.shields;
        }
        if (Array.isArray(defensorAtivo.statusEffects)) {
          syncData.defender.statusEffects = defensorAtivo.statusEffects.map(efeito => ({ ...efeito }));
        }
      }

      let alvoId = null;
      if (alvoOriginal) {
        if (typeof alvoOriginal.id === 'undefined') {
          // permanece nulo
        } else {
          alvoId = alvoOriginal.id;
        }
      }

      resultadoAcao.payload = {
        skillId: skillObj.id,
        skillName: skillObj.name,
        targetId: alvoId,
        damage,
        effectsMask: efeitoDecisoes,
        attackerName: me.name,
        sync: syncData
      };

      return next;
    });

    if (resultadoAcao.erro) {
      handleAddLog('erro', resultadoAcao.erro);
      actionLockRef.current = false;
      return;
    }

    if (resultadoAcao.sucesso) {
      if (resultadoAcao.logs.length === 0) {
        const fallbackMensagem = `${battleData.myPlayer?.name || 'Jogador'} usou ${skill.name}.`;
        resultadoAcao.logs.push({ type: 'usar_skill', message: fallbackMensagem });
      }

      resultadoAcao.logs.forEach(entry => {
        if (entry && entry.message) {
          handleAddLog(entry.type || 'info', entry.message);
        }
      });

      if (resultadoAcao.efeitoLogs.length === 0 && resultadoAcao.logs.length === 0) {
        let nomeJogador = 'Jogador';
        if (battleData.myPlayer) {
          const nomeEncontrado = battleData.myPlayer.name;
          if (nomeEncontrado) {
            nomeJogador = nomeEncontrado;
          }
        }
        const fallbackMensagem = `${nomeJogador} usou ${skill.name}.`;
        handleAddLog('usar_skill', fallbackMensagem);
        resultadoAcao.logs.push({ type: 'usar_skill', message: fallbackMensagem });
      }

      if (resultadoAcao.payload) {
        const logsCompartilhados = [];
        resultadoAcao.logs.forEach(entrada => {
          if (entrada && entrada.message) {
            let tipoEntrada = 'info';
            if (entrada.type) {
              tipoEntrada = entrada.type;
            }
            logsCompartilhados.push({ type: tipoEntrada, message: entrada.message });
          }
        });
        resultadoAcao.payload.logsShared = logsCompartilhados;

        const efeitosCompartilhados = [];
        resultadoAcao.efeitoLogs.forEach(entrada => {
          if (entrada && entrada.message) {
            let tipoEntrada = 'info';
            if (entrada.type) {
              tipoEntrada = entrada.type;
            }
            efeitosCompartilhados.push({ type: tipoEntrada, message: entrada.message });
          }
        });
        resultadoAcao.payload.effectLogsShared = efeitosCompartilhados;
      }

      resultadoAcao.efeitoLogs.forEach(entry => {
        if (entry && entry.message) {
          handleAddLog(entry.type || 'info', entry.message);
        }
      });

      if (isPvP && sendAction && resultadoAcao.payload) {
        sendAction('USE_SKILL', resultadoAcao.payload);
      }

      console.log('[handleUseSkill] ✅ Skill usada com sucesso, ação concluída');

      finalizeTurn('skill', `${battleData.myPlayer?.name || 'Jogador'} usou ${skill.name} e passou o turno automaticamente`);
      return;
    }

    actionLockRef.current = false;
  };

  const handleSwitchLegend = (legend) => {
    if (actionLockRef.current === true) {
      handleAddLog('erro', 'Ação anterior ainda está sendo processada. Aguarde um instante.');
      return;
    }

    const ativaAtual = battleData.myPlayer ? battleData.myPlayer.activeLegend : null;
    if (isLegendRooted(ativaAtual)) {
      let nomeLenda = 'Sua lenda';
      if (ativaAtual && typeof ativaAtual.name === 'string' && ativaAtual.name.length > 0) {
        nomeLenda = ativaAtual.name;
      }
      handleAddLog('controle', `${nomeLenda} está presa e não pode deixar o campo.`);
      return;
    }

    if (isLegendStunned(ativaAtual)) {
      let nomeLenda = 'Sua lenda';
      if (ativaAtual && typeof ativaAtual.name === 'string' && ativaAtual.name.length > 0) {
        nomeLenda = ativaAtual.name;
      }
      handleAddLog('controle', `${nomeLenda} está atordoada e não pode trocar de posição.`);
      return;
    }

    if (!isMyTurn || hasPlayedThisTurn) {
      handleAddLog('erro', 'Aguarde sua vez ou você já jogou neste turno!');
      return;
    }
    
    actionLockRef.current = true;

    handleAddLog('trocar_lenda', `${battleData.myPlayer.name} trocou para ${legend.name}`);
    
    setBattleData(prev => ({
      ...prev,
      myPlayer: {
        ...prev.myPlayer,
        activeLegend: legend,
        bench: [prev.myPlayer.activeLegend, ...prev.myPlayer.bench.filter(l => l.id !== legend.id)]
      }
    }));

    // Enviar ação via realtime (se PvP)
    if (isPvP && sendAction) {
      sendAction('SWITCH_LEGEND', {
        legendId: legend.id,
        legendName: legend.name
      });
    }

    console.log('[handleSwitchLegend] ✅ Lenda trocada, ação concluída');

    finalizeTurn('switch', `${battleData.myPlayer?.name || 'Jogador'} trocou de lenda e passou o turno automaticamente`);
  };

  const executeBotTurn = useCallback(() => {
    // TODO: Implementar IA do bot
    const efeitoLogs = [];
    setBattleData(prev => {
      const next = { ...prev };
      const opp = { ...next.opponent };
      const me = { ...next.myPlayer };

      const availableSkills = opp.activeLegend?.skills?.filter(s => (s.pp || s.ppMax) > 0);
      if (availableSkills && availableSkills.length > 0) {
        const randomSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];

        if (randomSkill.power && me.activeLegend) {
          const dmgCalc = calculateDamage(opp.activeLegend, me.activeLegend, randomSkill.power, {});
          const target = { ...me.activeLegend };
          const dmgResult = applyDamage(target, dmgCalc.damage);
          me.activeLegend = target;

          handleAddLog('bot_skill', `${opp.name} usou ${randomSkill.name} causando ${dmgResult.totalDamage} de dano`);

          if (dmgResult.isDefeated) {
            handleAddLog('derrota', `${target.name} foi derrotado!`);
          }
        }

        const mascaraEfeitos = gerarDecisoesParaEfeitos(randomSkill);

        const logsEfeitos = processSkillEffects({
          skill: randomSkill,
          attackerLegend: opp.activeLegend,
          defenderLegend: me.activeLegend,
          attackerPlayer: opp,
          defenderPlayer: me,
          forcedResults: mascaraEfeitos
        });

        if (logsEfeitos && logsEfeitos.length > 0) {
          logsEfeitos.forEach(item => {
            efeitoLogs.push(item);
          });
        }

        const updatedSkills = opp.activeLegend.skills.map(s =>
          s.id === randomSkill.id ? { ...s, pp: Math.max(0, (s.pp || s.ppMax) - 1) } : s
        );
        opp.activeLegend = { ...opp.activeLegend, skills: updatedSkills };
      }

      next.opponent = opp;
      next.myPlayer = me;
      return next;
    });

    if (efeitoLogs.length > 0) {
      efeitoLogs.forEach(entry => {
        if (!entry) {
          return;
        }

        let tipoLog = 'info';
        if (entry.type) {
          tipoLog = entry.type;
        }

        let mensagemLog = '';
        if (entry.text) {
          mensagemLog = entry.text;
        }

        if (mensagemLog.length > 0) {
          handleAddLog(tipoLog, mensagemLog);
        }
      });
    }
  }, [handleAddLog]);

  const finalizeTurn = useCallback((reason = 'manual', logMessage) => {
    const actorName = battleData.myPlayer?.name || 'Jogador';
    const turnNumber = match?.current_turn || currentTurn || 1;

    const mensagem = logMessage || (reason === 'manual'
      ? `${actorName} encerrou o turno`
      : `${actorName} concluiu a ação e passou o turno`);

    handleAddLog('fim_turno', mensagem);

    setBattleData(prev => ({
      ...prev,
      myPlayer: {
        ...prev.myPlayer,
        turnsPlayed: (prev.myPlayer?.turnsPlayed || 0) + 1
      }
    }));

    setHasPlayedThisTurn(true);
    setIsMyTurn(false);
    actionLockRef.current = true;

    if (mode === 'bot') {
      setTimeout(() => {
        executeBotTurn();
        setIsMyTurn(true);
        setCurrentTurn(prev => prev + 1);
      }, 2000);
      return;
    }

    if (!isPvP || !match || !match.player_a_id || !match.player_b_id) {
      console.warn('[finalizeTurn] Impossível atualizar turno PvP', { isPvP, hasMatch: !!match });
      return;
    }

    if (sendAction) {
      sendAction('END_TURN', {
        turn: turnNumber,
        playerId: user?.id,
        reason
      });
    }

    const souPlayerA = String(user?.id) === String(match.player_a_id);
    const opponentId = souPlayerA ? match.player_b_id : match.player_a_id;
    const opponentJaAgiu = souPlayerA ? Boolean(match.player_b_has_acted) : Boolean(match.player_a_has_acted);
    const agora = new Date().toISOString();

    const updates = {
      current_player_id: opponentId,
      current_turn: turnNumber,
      last_action: {
        type: 'END_TURN',
        reason,
        player_id: user?.id,
        turn: turnNumber,
        created_at: agora
      },
      last_action_timestamp: agora,
      last_activity_at: agora
    };

    if (souPlayerA) {
      updates.player_a_has_acted = true;
    } else {
      updates.player_b_has_acted = true;
    }

    if (opponentJaAgiu) {
      updates.current_turn = turnNumber + 1;
      updates.current_player_id = match.player_a_id;
      updates.player_a_has_acted = false;
      updates.player_b_has_acted = false;

      const previousHistory = Array.isArray(match.turn_history) ? match.turn_history : [];
      updates.turn_history = [...previousHistory, {
        turn: turnNumber,
        ended_by: user?.id,
        reason,
        finished_at: agora
      }];
    }

    updateMatch(updates)
      .then((result) => {
        console.log('[finalizeTurn] ✅ Match atualizado com flags de turno:', result);
      })
      .catch((err) => {
        console.error('[finalizeTurn] ❌ Erro ao atualizar turno:', err);
      });
  }, [battleData.myPlayer?.name, currentTurn, executeBotTurn, handleAddLog, isPvP, match, mode, sendAction, setBattleData, updateMatch, user?.id]);

  const handleEndTurn = () => {
    if (!isMyTurn) {
      console.warn('[handleEndTurn] ❌ Não é seu turno, abortando');
      handleAddLog('erro', 'Aguarde sua vez!');
      return;
    }

    console.log('[handleEndTurn] ✅ Finalizando turno manualmente');
    finalizeTurn('manual');
  };

  // Usar relíquia guardada (aplicação simples de efeitos: heal, damage, shield, skip_turn)
  const handleUseRelic = () => {
    const relic = battleData.myPlayer?.storedRelic;
    if (!relic) return;

    // Aplicar efeitos básicos diretamente aqui para demo
    setBattleData(prev => {
      const next = { ...prev };
      const me = { ...next.myPlayer };
      const opp = { ...next.opponent };

      // exemplo: aplicar cura na lenda ativa
      if (relic.effect?.heal) {
        const heal = relic.effect.heal;
        me.activeLegend = { ...me.activeLegend, hp: Math.min(me.activeLegend.maxHp, (me.activeLegend.hp || me.activeLegend.maxHp) + heal) };
      }

      // exemplo: dano ao oponente
      if (relic.effect?.damage) {
        const dmg = relic.effect.damage;
        opp.activeLegend = { ...opp.activeLegend, hp: Math.max(0, (opp.activeLegend.hp || opp.activeLegend.maxHp) - dmg) };
      }

      // exemplo: shield
      if (relic.effect?.shield) {
        const sh = relic.effect.shield;
        me.activeLegend = { ...me.activeLegend, shields: (me.activeLegend.shields || 0) + sh };
      }

      // exemplo: skip_turn
      if (relic.effect?.skip_turn) {
        // aplicar efeito simples: pular o turno do oponente (definido como setIsMyTurn true após timeout)
        // aqui apenas geramos log e avançamos turno de forma simples
        setTimeout(() => {
          setIsMyTurn(true);
        }, 1000);
      }

      // Registrar uso e limpar storedRelic
      me.storedRelic = null;
      next.myPlayer = me;
      next.opponent = opp;
      return next;
    });

    const res = applyRelicEffect(relic, { name: battleData.myPlayer?.name }, battleData);
    handleAddLog('relic', res.message || `Usou ${relic.name}`);

    // Enviar ação via realtime (se PvP)
    if (isPvP && sendAction) {
      sendAction('USE_RELIC', {
        relicName: relic.name,
        relicEffect: relic.effect
      });
    }
  };

  const obterTurnosJogador = (participante) => {
    if (participante) {
      if (typeof participante.turnsPlayed === 'number') {
        return participante.turnsPlayed;
      }
    }
    return 0;
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
          onClick={onExit || (() => router.push('/'))}
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

      {/* Indicador de Turno - Conectado */}
      {isPvP && (
        <div className="absolute right-4 top-4 z-50">
          <div className={`bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2 border-2 ${
            isConnected ? 'border-green-500/50' : 'border-red-500/50'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`} />
              <span className="text-xs font-semibold text-white">
                {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
            {isConnected && (
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${
                  opponentConnected ? 'bg-blue-500 animate-pulse' : 'bg-gray-500'
                }`} />
                <span className="text-[10px] text-gray-400">
                  {opponentConnected ? 'Oponente online' : 'Aguardando oponente'}
                </span>
              </div>
            )}
            {isPvP && match && (
              <div className="text-[10px] text-gray-400 mt-1">
                Turno {currentTurn} • {isMyTurn ? 'Sua vez' : 'Aguardando'}
              </div>
            )}
          </div>
        </div>
      )}

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
          {selectedCard && battleData.opponent && battleData.opponent.activeLegend && selectedCard.id === battleData.opponent.activeLegend.id && (
            <div
              className="absolute z-30"
              style={{ top: '10%', left: 'calc(50% + 180px)' }}
            >
              <SkillPanelSide
                card={battleData.opponent.activeLegend}
                onClose={() => setSelectedCard(null)}
                isMyTurn={false}
                isEnemy={true}
                turnsPlayed={obterTurnosJogador(battleData.opponent)}
              />
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
          {selectedCard && battleData.myPlayer && battleData.myPlayer.activeLegend && selectedCard.id === battleData.myPlayer.activeLegend.id && (
            <div
              className="absolute z-30"
              style={{ bottom: '10%', left: 'calc(50% + 180px)' }}
            >
              <SkillPanelSide
                card={battleData.myPlayer.activeLegend}
                onClose={() => setSelectedCard(null)}
                onUseSkill={(skillSelecionada) => {
                  handleUseSkill(skillSelecionada);
                  setSelectedCard(null);
                  setSelectedTarget(null);
                }}
                isMyTurn={isMyTurn}
                isEnemy={false}
                turnsPlayed={obterTurnosJogador(battleData.myPlayer)}
              />
            </div>
          )}

            {/* Pet ao lado esquerdo */}
            <PetWidget posicao="middle-left" tamanhoAvatar="xl" posicaoBubble="right" autoSaudar={false} situacao={"inicio_batalha"} />

          {/* Log de Batalha */}
          <div className="absolute right-20 top-40">
            <BattleLog logs={logs} />
          </div>
        </div>

        {/* ========== BASE: JOGADOR + BANCO + ITENS ========== */}
        <div className="px-8 flex items-end justify-between gap-6 mb-2">
          
          {/* HUD Jogador */}
          <div className="flex items-end gap-3">
            <PlayerHUD 
            player={battleData.myPlayer}
            isOpponent={false}
            isMyTurn={isMyTurn}
            onUseRelic={handleUseRelic}
            />
          </div>

          {/* BANCO + ITENS - CENTRO */}
          {battleData.myPlayer && (
            <div className="flex-1 flex flex-col items-center pb-2 gap-3">
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
              hasPlayedThisTurn={hasPlayedThisTurn}
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
          💡Use sua relíquia!
        </div>
      )}

      {isPvP && showTurnAlert && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gradient-to-b from-emerald-600 to-emerald-800 border-2 border-emerald-300 rounded-2xl px-8 py-6 text-center shadow-2xl">
            <div className="text-5xl mb-3">🎮</div>
            <h3 className="text-2xl font-bold text-white mb-1">Sua vez!</h3>
            <p className="text-sm text-emerald-100 mb-5">Turno {currentTurn}. Faça sua jogada para manter o fluxo da partida.</p>
            <button
              onClick={() => setShowTurnAlert(false)}
              className="px-5 py-2 bg-black/40 hover:bg-black/60 rounded-lg text-sm font-semibold text-white transition-colors"
            >
              Beleza
            </button>
          </div>
        </div>
      )}

      {/* Modal: Oponente Desconectado */}
      {isPvP && isConnected && !opponentConnected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gradient-to-b from-orange-900/90 to-red-900/90 border-2 border-orange-500 rounded-xl p-6 max-w-md mx-4 shadow-2xl">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-orange-300 mb-2">
                Oponente Desconectado
              </h3>
              <p className="text-sm text-gray-300 mb-4">
                Seu oponente perdeu a conexão com a sala de batalha.
              </p>
              <p className="text-xs text-gray-400 mb-6">
                Aguardando reconexão... A partida será retomada automaticamente quando o oponente voltar.
              </p>
              
              {/* Loading Animation */}
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
              </div>
              
              <button
                onClick={onExit || (() => router.push('/pvp'))}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
              >
                Sair da Batalha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

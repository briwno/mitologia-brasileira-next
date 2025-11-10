"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
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
import { generateRelicPool, drawRelic, applyRelicEffect } from '@/utils/relicSystem';
import { formatRoomCodeDisplay } from '@/utils/roomCodes';
import { 
  calculateDamage, 
  applyDamage, 
  checkVictoryConditions,
  createActionLog 
} from '@/utils/battleSystem';

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
          setHasPlayedThisTurn(false); // Reset ao mudar de turno
          // Não adicionar log aqui para evitar duplicação
          return updatedMatch.current_turn;
        }
        return prev;
      });
      
      // Atualizar vez do jogador
      setIsMyTurn(prev => {
        const isMyTurnNow = String(updatedMatch.current_player_id) === String(user?.id);
        if (isMyTurnNow !== prev) {
          console.log('[BattleScreen] 🎮 VEZ MUDOU:', prev ? 'ERA MINHA' : 'ERA DO OPONENTE', '→', isMyTurnNow ? 'AGORA É MINHA' : 'AGORA É DO OPONENTE');
          
          // ✅ CORREÇÃO: Resetar hasPlayedThisTurn quando RECEBER a vez de volta
          if (isMyTurnNow) {
            console.log('[BattleScreen] ✅ Recebi a vez! Resetando hasPlayedThisTurn');
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
    }, [user?.id])
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
      }
      
      // Atualizar vez do jogador
      if (match.current_player_id) {
        const myTurn = String(match.current_player_id) === String(user.id);
        setIsMyTurn(myTurn);
        console.log(`[BattleScreen] ${myTurn ? '✅ É minha vez!' : '⏳ Aguardando oponente'}`);
      } else {
        // Se ainda não tem current_player_id, aguardar
        console.log('[BattleScreen] ⏳ Aguardando inicialização do turno...');
        setIsMyTurn(false);
      }
    }
  }, [match?.player_a_id, match?.player_b_id, match?.current_player_id, match?.current_turn, match?.status, user?.id, isPvP]);

  // ===== FIM HOOKS DE TEMPO REAL =====

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
    
    const skills = blocos.map((habilidade, indice) => {
      // Seguir a mesma convenção usada em CardDetail.js: pp e ppMax
  const ppMax = (typeof habilidade.ppMax === 'number') ? habilidade.ppMax : (typeof habilidade.maxPP === 'number' ? habilidade.maxPP : (indice + 2));
  // Usar pp atual se definido, senão iniciar com ppMax (PP cheio). Não usar índice como fallback.
  const pp = (typeof habilidade.pp === 'number') ? habilidade.pp : ppMax;

      return {
        id: `skill${indice + 1}`,
        name: habilidade.name,
        description: habilidade.description || '',
        power: habilidade.power || habilidade.damage || 0,
        pp,
        ppMax,
        // manter compatibilidade com outros componentes que usam maxPP
        maxPP: ppMax,
        cooldown: habilidade.cooldown || indice,
        image: habilidade.image,
        isUltimate: indice === 4
      };
    });
    
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

  const handleAddLog = (type, message) => {
    setLogs(prev => [...prev, {
      type,
      text: message,
      formatted: message,
      timestamp: new Date().toLocaleTimeString('pt-BR')
    }]);
  };

  // ===== HANDLERS PARA AÇÕES DO OPONENTE =====
  
  const handleOpponentUseSkill = useCallback((payload) => {
    const { skillId, targetId, damage } = payload;
    
    setBattleData(prev => {
      const next = { ...prev };
      const opp = { ...next.opponent };
      const me = { ...next.myPlayer };

      // Encontrar skill usada pelo oponente
      const skill = opp.activeLegend?.skills?.find(s => s.id === skillId);
      if (!skill) return prev;

      // Aplicar dano à lenda alvo (se for o jogador)
      if (targetId === me.activeLegend?.id) {
        const target = { ...me.activeLegend };
        const dmgResult = applyDamage(target, damage);
        me.activeLegend = target;
        
        handleAddLog('dano', `${opp.name} causou ${dmgResult.totalDamage} de dano com ${skill.name}${dmgResult.isCritical ? ' CRÍTICO!' : ''}`);
        
        if (dmgResult.isDefeated) {
          handleAddLog('derrota', `${target.name} foi derrotado!`);
        }
      }

      // Atualizar PP da skill do oponente
      const updatedSkills = opp.activeLegend.skills.map(s => 
        s.id === skillId ? { ...s, pp: Math.max(0, (s.pp || s.ppMax) - 1) } : s
      );
      opp.activeLegend = { ...opp.activeLegend, skills: updatedSkills };

      next.opponent = opp;
      next.myPlayer = me;
      return next;
    });
  }, []);

  const handleOpponentSwitchLegend = useCallback((payload) => {
    const { legendId } = payload;
    
    setBattleData(prev => {
      const next = { ...prev };
      const opp = { ...next.opponent };
      
      const newActive = opp.bench.find(l => l.id === legendId);
      if (!newActive) return prev;

      opp.bench = [opp.activeLegend, ...opp.bench.filter(l => l.id !== legendId)];
      opp.activeLegend = newActive;
      
      next.opponent = opp;
      
      handleAddLog('trocar_lenda', `${opp.name} trocou para ${newActive.name}`);
      return next;
    });
  }, []);

  // Avançar para o próximo turno (após ambos jogadores terem jogado)
  const advanceTurn = useCallback(async () => {
    if (!isPvP || !match) {
      console.warn('[advanceTurn] Impossível avançar turno:', { isPvP, hasMatch: !!match });
      return;
    }

    const nextTurn = currentTurn + 1;
    
    // Player A sempre começa cada turno
    const nextPlayerId = match.player_a_id;
    
    console.log('[advanceTurn] 🔄 Avançando turno:', { 
      de: currentTurn, 
      para: nextTurn,
      proximoJogador: String(nextPlayerId) === String(user?.id) ? 'EU (Player A)' : 'OPONENTE (Player A)',
      player_a_id: match.player_a_id,
      player_b_id: match.player_b_id
    });

    // ✅ Resetar hasPlayedThisTurn ANTES de atualizar (para evitar race condition)
    setHasPlayedThisTurn(false);

    await updateMatch({
      current_turn: nextTurn,
      current_player_id: nextPlayerId
    });
    
    // Log adicionado APENAS aqui para evitar duplicação
    handleAddLog('novo_turno', `🔄 Turno ${nextTurn} iniciado`);
  }, [isPvP, match, currentTurn, updateMatch, user?.id]);

  const handleOpponentEndTurn = useCallback((payload) => {
    console.log('[handleOpponentEndTurn] Oponente finalizou turno', { 
      payload, 
      hasPlayedThisTurn,
      sou_player_a: user?.id === match?.player_a_id,
      current_player_antes: match?.current_player_id,
      current_turn_antes: match?.current_turn
    });
    
    handleAddLog('fim_turno', `${battleData.opponent?.name || 'Oponente'} encerrou o turno`);
    
    // ✅ NOVA LÓGICA SIMPLIFICADA:
    // Quando oponente passa, verificar se AMBOS já passaram neste turno
    // Se sim, avançar para próximo turno
    
    // Verificar se é o Player B que acabou de passar (último a jogar no turno)
    const isPlayerA = String(user?.id) === String(match?.player_a_id);
    const opponentIsPlayerB = !isPlayerA;
    
    // Se o oponente é Player B E acabou de passar, significa que o ciclo completou
    if (opponentIsPlayerB && hasPlayedThisTurn) {
      console.log('[handleOpponentEndTurn] ✅ Player B passou! Ambos jogaram, avançando turno...');
      advanceTurn();
    } else {
      console.log('[handleOpponentEndTurn] ⏳ Aguardando próxima rodada. hasPlayed:', hasPlayedThisTurn, 'opponentIsB:', opponentIsPlayerB);
    }
  }, [battleData.opponent, hasPlayedThisTurn, isPvP, match, advanceTurn, user?.id]);

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
  }, [battleData.opponent]);

  const handleOpponentUseItem = useCallback((payload) => {
    const { itemName, effect } = payload;
    handleAddLog('item', `${battleData.opponent?.name || 'Oponente'} usou ${itemName}`);
  }, [battleData.opponent]);

  const handleGameOver = useCallback((finalMatch) => {
    const winnerId = finalMatch.winner_id;
    const isWinner = winnerId === user?.id;
    
    handleAddLog('fim_jogo', isWinner ? '🎉 VITÓRIA!' : '💀 DERROTA');
    
    // TODO: Redirecionar para tela de resultado
    setTimeout(() => {
      router.push(`/pvp?result=${isWinner ? 'win' : 'lose'}`);
    }, 3000);
  }, [user?.id, router]);

  // ===== FIM HANDLERS =====

  const handleUseSkill = (skill) => {
    console.log('[handleUseSkill] Tentando usar skill:', {
      skillName: skill.name,
      isMyTurn,
      hasPlayedThisTurn,
      currentTurn
    });
    
    if (!isMyTurn || hasPlayedThisTurn) {
      console.warn('[handleUseSkill] ❌ Bloqueado:', { isMyTurn, hasPlayedThisTurn });
      handleAddLog('erro', 'Aguarde sua vez ou você já jogou neste turno!');
      return;
    }

    console.log('[handleUseSkill] ✅ Executando skill:', skill.name);

    setBattleData(prev => {
      const next = { ...prev };
      const me = { ...next.myPlayer };
      const opp = { ...next.opponent };

      // localizar a skill dentro da lenda ativa (referência por id)
      const active = { ...me.activeLegend };
      const skills = (active.skills || []).map(s => ({ ...s }));
      const idx = skills.findIndex(s => s.id === skill.id);
      const skillObj = idx >= 0 ? skills[idx] : skill;

      // Verificar ultimate
      if (skillObj.isUltimate) {
        const requiredTurns = skillObj.requiredTurns || skillObj.required_turns || 3;
        if ((me.turnsPlayed || 0) < requiredTurns) {
          handleAddLog('erro', `Ultimate ${skillObj.name} não disponível ainda`);
          return prev;
        }
        if (active.ultimateUsed) {
          handleAddLog('erro', `Ultimate ${skillObj.name} já foi usada`);
          return prev;
        }

        // Marcar ultimate usada
        active.ultimateUsed = true;
      } else {
        // Consumir PP normal
        const currentPP = typeof skillObj.pp === 'number' ? skillObj.pp : (typeof skillObj.ppCurrent === 'number' ? skillObj.ppCurrent : skillObj.ppMax || skillObj.maxPP || 0);
        if (currentPP <= 0) {
          handleAddLog('erro', `Sem PP para usar ${skillObj.name}`);
          return prev;
        }
        // decrementar PP
        if (idx >= 0) {
          skills[idx] = { ...skills[idx], pp: currentPP - 1 };
        }
      }

      // Calcular dano usando battleSystem
      let damage = 0;
      if (skillObj.power && opp.activeLegend) {
        const dmgCalc = calculateDamage(
          active,
          opp.activeLegend,
          skillObj.power,
          {}
        );
        damage = dmgCalc.damage;

        const target = { ...opp.activeLegend };
        const dmgResult = applyDamage(target, damage);
        opp.activeLegend = target;

        handleAddLog('usar_skill', `${me.name} usou ${skillObj.name} causando ${dmgResult.totalDamage} de dano${dmgResult.isCritical ? ' CRÍTICO!' : ''}`);
        
        if (dmgResult.isDefeated) {
          handleAddLog('derrota', `${target.name} foi derrotado!`);
        }
      }

      // Atualizar estado
      active.skills = skills;
      me.activeLegend = active;
      next.myPlayer = me;
      next.opponent = opp;

      // Enviar ação via realtime (se PvP)
      if (isPvP && sendAction) {
        sendAction('USE_SKILL', {
          skillId: skillObj.id,
          skillName: skillObj.name,
          targetId: opp.activeLegend.id,
          damage: damage
        });
      }

      return next;
    });

    // Marcar que jogou neste turno
    setHasPlayedThisTurn(true);
    
    console.log('[handleUseSkill] ✅ Skill usada com sucesso, ação concluída');
    // NÃO passar o turno automaticamente - jogador deve clicar em "Passar Turno"
  };

  const handleSwitchLegend = (legend) => {
    if (!isMyTurn || hasPlayedThisTurn) {
      handleAddLog('erro', 'Aguarde sua vez ou você já jogou neste turno!');
      return;
    }
    
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

    // Marcar que jogou e passar turno
    setHasPlayedThisTurn(true);
    console.log('[handleSwitchLegend] ✅ Lenda trocada, ação concluída');
    // NÃO passar o turno automaticamente - jogador deve clicar em "Passar Turno"
  };

  const handleEndTurn = () => {
    if (!isMyTurn) {
      console.warn('[handleEndTurn] ❌ Não é seu turno, abortando');
      handleAddLog('erro', 'Aguarde sua vez!');
      return;
    }
    
    // ✅ REMOVIDO: Bloqueio de hasPlayedThisTurn
    // O jogador pode passar o turno mesmo sem ter jogado (passar vez sem ação)
    
    console.log('[handleEndTurn] ✅ Finalizando turno...', {
      isPvP,
      hasMatch: !!match,
      currentPlayerId: match?.current_player_id,
      playerAId: match?.player_a_id,
      playerBId: match?.player_b_id,
      currentTurn,
      hasPlayedThisTurn,
      sou_player_a: user?.id === match?.player_a_id
    });
    
    // Marcar que jogou ANTES de fazer qualquer outra coisa
    setHasPlayedThisTurn(true);
    
    handleAddLog('fim_turno', `${battleData.myPlayer.name} encerrou o turno`);
    
    setBattleData(prev => ({
      ...prev,
      myPlayer: {
        ...prev.myPlayer,
        turnsPlayed: prev.myPlayer.turnsPlayed + 1
      }
    }));

    // Enviar ação via realtime (se PvP)
    if (isPvP && sendAction) {
      console.log('[handleEndTurn] 📡 Enviando broadcast END_TURN');
      sendAction('END_TURN', {
        turn: currentTurn,
        playerId: user?.id
      });
    }

    // Em PvP, trocar vez para o oponente
    if (isPvP && match && match.player_a_id && match.player_b_id) {
      const sou_player_a = String(user?.id) === String(match.player_a_id);
      const nextPlayerId = sou_player_a ? match.player_b_id : match.player_a_id;
      
      console.log('[handleEndTurn] 🔄 Passando turno para outro jogador:', {
        eu_sou: sou_player_a ? 'Player A' : 'Player B',
        proximo: sou_player_a ? 'Player B' : 'Player A',
        current_player_id: nextPlayerId,
        current_turn: currentTurn,
        hasPlayedThisTurn: true
      });
      
      updateMatch({
        current_player_id: nextPlayerId
        // NÃO incrementar current_turn aqui - apenas trocar jogador
      }).then((result) => {
        console.log('[handleEndTurn] ✅ Match atualizado:', result);
      }).catch((err) => {
        console.error('[handleEndTurn] ❌ Erro ao passar turno:', err);
      });
    }
    
    // Se for bot, executar turno do bot
    if (mode === 'bot') {
      setIsMyTurn(false);
      setTimeout(() => {
        executeBotTurn();
        setIsMyTurn(true);
        setCurrentTurn(prev => prev + 1);
      }, 2000);
    }
  };

  // Executar turno do bot (lógica simplificada)
  const executeBotTurn = () => {
    // TODO: Implementar IA do bot
    setBattleData(prev => {
      const next = { ...prev };
      const opp = { ...next.opponent };
      const me = { ...next.myPlayer };

      // Bot usa skill aleatória disponível
      const availableSkills = opp.activeLegend?.skills?.filter(s => (s.pp || s.ppMax) > 0);
      if (availableSkills && availableSkills.length > 0) {
        const randomSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
        
        // Aplicar dano ao jogador
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

        // Decrementar PP
        const updatedSkills = opp.activeLegend.skills.map(s =>
          s.id === randomSkill.id ? { ...s, pp: Math.max(0, (s.pp || s.ppMax) - 1) } : s
        );
        opp.activeLegend = { ...opp.activeLegend, skills: updatedSkills };
      }

      next.opponent = opp;
      next.myPlayer = me;
      return next;
    });
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
                        handleUseSkill(skill);
                        setSelectedCard(null);
                        setSelectedTarget(null);
                      }
                    }}
                  >
                    <div className="font-bold text-xs text-cyan-300">{skill.name}</div>
                    <div className="text-[10px] text-neutral-300 mt-1">{skill.description}</div>
                    <div className="flex gap-2 mt-2 text-[9px]">
                      <span className="text-orange-400">⚡ {skill.power || 0}</span>
                      <span className="text-blue-400">💧 PP: {skill.pp !== undefined ? skill.pp : skill.ppMax}/{skill.ppMax}</span>
                    </div>
                    {(!skill.pp || skill.pp <= 0) && (
                      <div className="text-[9px] text-red-400 mt-1">Sem PP!</div>
                    )}
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

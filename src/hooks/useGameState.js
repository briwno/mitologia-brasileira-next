// src/hooks/useGameState.js
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Hook principal para gerenciar o estado completo da batalha
 * Implementa:
 * - Estado de turnos e fases
 * - Sistema de log
 * - Sincronização via Supabase Realtime
 * - Validação de ações
 */
export function useGameState(roomCode, playerId, playerDeck, mode = 'pvp') {
  const [gameState, setGameState] = useState(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('INICIO'); // INICIO, ACAO, RESOLUCAO, FIM_TURNO
  const [battleLog, setBattleLog] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const channelRef = useRef(null);
  const actionTimeoutRef = useRef(null);

  /**
   * Inicializa o estado da partida no banco
   */
  const initializeGame = useCallback(async () => {
    if (mode === 'bot') {
      // Modo bot: estado local apenas
      const initialState = createInitialGameState(playerId, playerDeck);
      setGameState(initialState);
      setIsMyTurn(true);
      setIsLoading(false);
      return;
    }

    try {
      // Buscar ou criar partida no Supabase
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('room_code', roomCode)
        .single();

      if (matchError && matchError.code !== 'PGRST116') {
        throw matchError;
      }

      if (!match) {
        // Criar nova partida
        const newMatch = {
          room_code: roomCode,
          player_a_id: playerId,
          player_b_id: null,
          state: createInitialGameState(playerId, playerDeck),
          current_turn: 1,
          current_player: playerId,
          status: 'waiting',
          mode: mode,
          created_at: new Date().toISOString()
        };

        const { data: created, error: createError } = await supabase
          .from('matches')
          .insert(newMatch)
          .select()
          .single();

        if (createError) throw createError;
        
        setGameState(created.state);
        setIsMyTurn(true);
      } else {
        // Entrar em partida existente
        setGameState(match.state);
        setIsMyTurn(match.current_player === playerId);
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Erro ao inicializar jogo:', err);
      setError(err.message);
      setIsLoading(false);
    }
  }, [roomCode, playerId, playerDeck, mode]);

  /**
   * Configura o canal Realtime para sincronização
   */
  useEffect(() => {
    if (mode === 'bot' || !roomCode) return;

    const channel = supabase
      .channel(`battle:${roomCode}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'matches',
        filter: `room_code=eq.${roomCode}`
      }, (payload) => {
        const newState = payload.new;
        setGameState(newState.state);
        setIsMyTurn(newState.current_player === playerId);
        
        // Adicionar ações ao log
        if (newState.state.lastAction) {
          addLogEntry(newState.state.lastAction);
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [roomCode, playerId, mode, addLogEntry]);

  /**
   * Inicializa o jogo ao montar
   */
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  /**
   * Adiciona entrada ao log de batalha
   */
  const addLogEntry = useCallback((entry) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    setBattleLog(prev => [...prev, { ...entry, timestamp }]);
  }, []);

  /**
   * Executa uma ação no turno atual
   */
  const executeAction = useCallback(async (actionType, actionData) => {
    if (!isMyTurn) {
      setError('Não é seu turno!');
      return false;
    }

    if (currentPhase !== 'ACAO') {
      setError('Ação não permitida nesta fase!');
      return false;
    }

    try {
      // Validar e executar ação localmente
      const newState = applyAction(gameState, playerId, actionType, actionData);
      
      if (!newState) {
        setError('Ação inválida!');
        return false;
      }

      // Adicionar ao log
      const logEntry = {
        turn: gameState.turn,
        player: playerId,
        action: actionType,
        data: actionData,
        result: newState.lastResult
      };
      addLogEntry(logEntry);

      // Atualizar estado
      setGameState(newState);

      if (mode === 'bot') {
        // Modo bot: processar turno do bot
        handleBotTurn(newState);
      } else {
        // Salvar no Supabase
        await saveGameState(roomCode, newState, playerId);
      }

      // Auto-encerrar turno após 3 segundos
      if (actionTimeoutRef.current) {
        clearTimeout(actionTimeoutRef.current);
      }
      
      actionTimeoutRef.current = setTimeout(() => {
        endTurn();
      }, 3000);

      return true;
    } catch (err) {
      console.error('Erro ao executar ação:', err);
      setError(err.message);
      return false;
    }
  }, [isMyTurn, currentPhase, gameState, playerId, mode, roomCode, addLogEntry, endTurn]);

  /**
   * Encerra o turno atual
   */
  const endTurn = useCallback(async () => {
    if (!isMyTurn) return;

    try {
      // Processar fim de turno
      const newState = processTurnEnd(gameState, playerId);
      
      // Trocar jogador ativo
      const nextPlayer = gameState.players.find(p => p.id !== playerId);
      newState.currentPlayer = nextPlayer.id;
      newState.turn += 1;
      
      setGameState(newState);
      setIsMyTurn(false);

      if (mode !== 'bot') {
        await saveGameState(roomCode, newState, nextPlayer.id);
      }
    } catch (err) {
      console.error('Erro ao encerrar turno:', err);
      setError(err.message);
    }
  }, [isMyTurn, gameState, playerId, mode, roomCode]);

  /**
   * Usa uma skill da lenda ativa
   */
  const useSkill = useCallback((skillId, targetId) => {
    return executeAction('usar_skill', { skillId, targetId });
  }, [executeAction]);

  /**
   * Usa um item da mão
   */
  const useItem = useCallback((itemId, targetId) => {
    return executeAction('usar_item', { itemId, targetId });
  }, [executeAction]);

  /**
   * Troca a lenda ativa
   */
  const switchLegend = useCallback((legendId) => {
    return executeAction('trocar_lenda', { legendId });
  }, [executeAction]);

  /**
   * Usa a ultimate da lenda
   */
  const useUltimate = useCallback((targetId) => {
    return executeAction('usar_ultimate', { targetId });
  }, [executeAction]);

  return {
    gameState,
    isMyTurn,
    currentPhase,
    battleLog,
    isLoading,
    error,
    actions: {
      useSkill,
      useItem,
      switchLegend,
      useUltimate,
      endTurn
    }
  };
}

/**
 * Cria o estado inicial da partida
 */
function createInitialGameState(playerId, playerDeck) {
  return {
    turn: 0,
    phase: 'INICIO',
    currentPlayer: playerId,
    players: [
      {
        id: playerId,
        activeLegend: playerDeck.legends[0], // Primeira lenda ativa
        bench: playerDeck.legends.slice(1), // Outras 4 no banco
        itemHand: [], // Será preenchido no turno 0
        itemDeck: shuffleArray([...playerDeck.items]),
        itemDiscard: [],
        hp: 100,
        shields: 0
      }
    ],
    lastAction: null,
    lastResult: null
  };
}

/**
 * Aplica uma ação ao estado do jogo
 */
function applyAction(state, playerId, actionType, actionData) {
  const newState = JSON.parse(JSON.stringify(state)); // Deep clone
  const player = newState.players.find(p => p.id === playerId);
  
  if (!player) return null;

  switch (actionType) {
    case 'usar_skill':
      return applySkill(newState, player, actionData);
    case 'usar_item':
      return applyItem(newState, player, actionData);
    case 'trocar_lenda':
      return switchLegendAction(newState, player, actionData);
    case 'usar_ultimate':
      return applyUltimate(newState, player, actionData);
    default:
      return null;
  }
}

/**
 * Aplica uma skill
 */
function applySkill(state, player, { skillId, targetId }) {
  const skill = player.activeLegend.skills.find(s => s.id === skillId);
  if (!skill) return null;

  // Aplicar efeitos da skill
  const target = findTarget(state, targetId);
  if (!target) return null;

  // Calcular dano/efeitos
  const damage = calculateDamage(skill.power, player.activeLegend.atk, target.def);
  target.hp -= damage;

  state.lastAction = { type: 'skill', skill: skill.name, target: targetId };
  state.lastResult = `Causou ${damage} de dano em ${target.name}`;

  return state;
}

/**
 * Aplica um item
 */
function applyItem(state, player, { itemId, targetId }) {
  const itemIndex = player.itemHand.findIndex(i => i.id === itemId);
  if (itemIndex === -1) return null;

  const item = player.itemHand[itemIndex];
  const target = findTarget(state, targetId);

  // Aplicar efeito do item
  applyItemEffect(item, target);

  // Remover item da mão
  player.itemHand.splice(itemIndex, 1);
  player.itemDiscard.push(item);

  state.lastAction = { type: 'item', item: item.name, target: targetId };
  state.lastResult = `Usou ${item.name}`;

  return state;
}

/**
 * Troca a lenda ativa
 */
function switchLegendAction(state, player, { legendId }) {
  const benchIndex = player.bench.findIndex(l => l.id === legendId);
  if (benchIndex === -1) return null;

  // Trocar lenda ativa com a do banco
  const newActive = player.bench[benchIndex];
  player.bench[benchIndex] = player.activeLegend;
  player.activeLegend = newActive;

  state.lastAction = { type: 'switch', legend: newActive.name };
  state.lastResult = `Trocou para ${newActive.name}`;

  return state;
}

/**
 * Processa o fim do turno
 */
function processTurnEnd(state, playerId) {
  const newState = JSON.parse(JSON.stringify(state));
  const player = newState.players.find(p => p.id === playerId);

  // Comprar item se houver espaço na mão
  if (player.itemHand.length < 3 && player.itemDeck.length > 0) {
    const newItem = player.itemDeck.pop();
    player.itemHand.push(newItem);
  }

  // Aplicar efeitos de fim de turno (passivas, DoT, etc)
  applyEndOfTurnEffects(newState, player);

  return newState;
}

/**
 * Funções auxiliares
 */
function findTarget(state, targetId) {
  for (const player of state.players) {
    if (player.activeLegend.id === targetId) {
      return player.activeLegend;
    }
  }
  return null;
}

function calculateDamage(power, atk, def) {
  const baseDamage = power * (atk / 10);
  const reduction = def / 10;
  return Math.max(1, Math.floor(baseDamage - reduction));
}

function applyItemEffect(item, target) {
  // Implementar efeitos específicos dos itens
  if (item.type === 'heal') {
    target.hp += item.value;
  } else if (item.type === 'buff') {
    target.atk += item.value;
  }
  // Adicionar mais efeitos conforme necessário
}

function applyEndOfTurnEffects(state, player) {
  // Implementar efeitos de passivas, DoT, etc
  // Exemplo: cura regenerativa, dano contínuo, etc
}

function applyUltimate(state, player, { targetId }) {
  const ultimate = player.activeLegend.ultimate;
  if (!ultimate || player.activeLegend.ultimateUsed) {
    return null;
  }

  const target = findTarget(state, targetId);
  if (!target) return null;

  // Aplicar efeito da ultimate
  const damage = calculateDamage(ultimate.power, player.activeLegend.atk, target.def);
  target.hp -= damage;

  player.activeLegend.ultimateUsed = true;

  state.lastAction = { type: 'ultimate', skill: ultimate.name, target: targetId };
  state.lastResult = `Ultimate! Causou ${damage} de dano devastador!`;

  return state;
}

function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

async function saveGameState(roomCode, state, currentPlayer) {
  const { error } = await supabase
    .from('matches')
    .update({
      state: state,
      current_player: currentPlayer,
      current_turn: state.turn,
      updated_at: new Date().toISOString()
    })
    .eq('room_code', roomCode);

  if (error) throw error;
}

function handleBotTurn(state) {
  // TODO: Implementar lógica da IA do bot
  console.log('Turno do bot - implementar IA');
}

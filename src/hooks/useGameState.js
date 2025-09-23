// src/hooks/useGameState.js
"use client";

import { useState, useCallback, useEffect } from 'react';
import { MotorDeJogo } from '@/utils/gameLogic';
import { FASES_DO_JOGO, ZONAS_CAMPO } from '@/utils/constants';

export function useGameState(initialPlayers, mode = 'pvp') {
  const [gameEngine, setGameEngine] = useState(null);
  const [gameState, setGameState] = useState({
    fase: FASES_DO_JOGO.INICIO,
    turn: 1,
    currentPlayerIndex: 0,
    players: initialPlayers || [],
    gameLog: [],
    gameOver: false,
    winner: null
  });

  // Inicializar o motor do jogo
  useEffect(() => {
    if (initialPlayers && initialPlayers.length >= 2 && !gameEngine) {
      const engine = new MotorDeJogo(initialPlayers);
      engine.iniciarJogo();
      setGameEngine(engine);
      setGameState(prev => ({
        ...prev,
        fase: engine.fase,
        turn: engine.turn,
        currentPlayerIndex: engine.indiceJogadorAtual,
        players: engine.players,
        gameLog: engine.gameLog
      }));
    }
  }, [initialPlayers, gameEngine]);

  // Executar ação do jogador
  const executeAction = useCallback((action) => {
    if (!gameEngine || gameState.gameOver) return;

    try {
      switch (action.type) {
        case 'TROCAR_LENDA':
          // Lógica para trocar lenda ativa
          const { card, index } = action.data;
          const currentPlayer = gameEngine.players[gameEngine.indiceJogadorAtual];
          const currentActiveCard = currentPlayer.zonas[ZONAS_CAMPO.LENDA_ATIVA];
          const bankCard = currentPlayer.zonas[ZONAS_CAMPO.BANCO_LENDAS][index];
          
          if (bankCard) {
            currentPlayer.zonas[ZONAS_CAMPO.LENDA_ATIVA] = bankCard;
            currentPlayer.zonas[ZONAS_CAMPO.BANCO_LENDAS][index] = currentActiveCard;
            gameEngine.adicionarAoLog(`${currentPlayer.nome} trocou ${currentActiveCard?.nome} por ${bankCard.nome}`, 'action');
          }
          break;

        case 'USAR_ITEM':
          // Lógica para usar item
          const { item, index: itemIndex } = action.data;
          const player = gameEngine.players[gameEngine.indiceJogadorAtual];
          
          if (player.zonas[ZONAS_CAMPO.MAO_ITENS][itemIndex]) {
            // Remove o item da mão
            player.zonas[ZONAS_CAMPO.MAO_ITENS].splice(itemIndex, 1);
            // Adiciona ao descarte
            player.zonas[ZONAS_CAMPO.DESCARTE_ITENS].push(item);
            gameEngine.adicionarAoLog(`${player.nome} usou ${item.nome}`, 'action');
            
            // Aqui você aplicaria os efeitos do item
            applyItemEffect(item, player, gameEngine);
          }
          break;

        case 'USAR_HABILIDADE':
          // Lógica para usar habilidade da lenda ativa
          const { card: skillCard } = action.data;
          const activePlayer = gameEngine.players[gameEngine.indiceJogadorAtual];
          
          if (skillCard && activePlayer.energia > 0) {
            activePlayer.energia -= 1;
            gameEngine.adicionarAoLog(`${activePlayer.nome} usou habilidade de ${skillCard.nome}`, 'action');
            
            // Aqui você aplicaria os efeitos da habilidade
            applySkillEffect(skillCard, activePlayer, gameEngine);
          }
          break;

        case 'COMPRAR_ITEM':
          // Lógica para comprar carta de item
          gameEngine.comprarItens(gameEngine.players[gameEngine.indiceJogadorAtual], 1);
          break;

        default:
          console.warn('Ação não reconhecida:', action.type);
      }

      // Atualizar estado do jogo
      setGameState(prev => ({
        ...prev,
        fase: gameEngine.fase,
        turn: gameEngine.turn,
        currentPlayerIndex: gameEngine.indiceJogadorAtual,
        players: gameEngine.players,
        gameLog: gameEngine.gameLog,
        gameOver: gameEngine.gameOver,
        winner: gameEngine.vencedor
      }));

    } catch (error) {
      console.error('Erro ao executar ação:', error);
      gameEngine?.adicionarAoLog(`Erro: ${error.message}`, 'error');
    }
  }, [gameEngine, gameState.gameOver]);

  // Encerrar turno
  const endTurn = useCallback(() => {
    if (!gameEngine || gameState.gameOver) return;

    try {
      // Comprar item automaticamente no fim do turno
      const currentPlayer = gameEngine.players[gameEngine.indiceJogadorAtual];
      if (currentPlayer.zonas[ZONAS_CAMPO.MAO_ITENS].length < 3) {
        gameEngine.comprarItens(currentPlayer, 1);
      }

      // Passar para o próximo jogador
      gameEngine.proximoTurno();

      setGameState(prev => ({
        ...prev,
        fase: gameEngine.fase,
        turn: gameEngine.turn,
        currentPlayerIndex: gameEngine.indiceJogadorAtual,
        players: gameEngine.players,
        gameLog: gameEngine.gameLog
      }));

    } catch (error) {
      console.error('Erro ao encerrar turno:', error);
    }
  }, [gameEngine, gameState.gameOver]);

  // Reiniciar jogo
  const resetGame = useCallback(() => {
    if (initialPlayers && initialPlayers.length >= 2) {
      const newEngine = new MotorDeJogo(initialPlayers);
      newEngine.iniciarJogo();
      setGameEngine(newEngine);
      setGameState({
        fase: newEngine.fase,
        turn: newEngine.turn,
        currentPlayerIndex: newEngine.indiceJogadorAtual,
        players: newEngine.players,
        gameLog: newEngine.gameLog,
        gameOver: false,
        winner: null
      });
    }
  }, [initialPlayers]);

  return {
    gameState,
    executeAction,
    endTurn,
    resetGame,
    currentPlayer: gameState.players[gameState.currentPlayerIndex] || null,
    opponent: gameState.players[gameState.currentPlayerIndex === 0 ? 1 : 0] || null
  };
}

// Funções auxiliares para aplicar efeitos
function applyItemEffect(item, player, gameEngine) {
  // Implementar efeitos específicos dos itens
  switch (item.tipo) {
    case 'ofensivo':
      // Aumentar ataque temporariamente
      if (player.zonas[ZONAS_CAMPO.LENDA_ATIVA]) {
        player.zonas[ZONAS_CAMPO.LENDA_ATIVA].ataqueBonus = 
          (player.zonas[ZONAS_CAMPO.LENDA_ATIVA].ataqueBonus || 0) + (item.valor || 2);
      }
      break;
    case 'defensivo':
      // Aumentar defesa temporariamente
      if (player.zonas[ZONAS_CAMPO.LENDA_ATIVA]) {
        player.zonas[ZONAS_CAMPO.LENDA_ATIVA].defesaBonus = 
          (player.zonas[ZONAS_CAMPO.LENDA_ATIVA].defesaBonus || 0) + (item.valor || 2);
      }
      break;
    case 'utilitario':
      // Efeitos especiais (cura, energia, etc.)
      player.energia = Math.min(player.energia + (item.energiaBonus || 1), 10);
      break;
  }
}

function applySkillEffect(card, player, gameEngine) {
  // Implementar efeitos específicos das habilidades das lendas
  const opponent = gameEngine.players[gameEngine.indiceJogadorAtual === 0 ? 1 : 0];
  
  if (card.habilidade) {
    switch (card.habilidade.tipo) {
      case 'ataque':
        // Causar dano ao oponente
        if (opponent.zonas[ZONAS_CAMPO.LENDA_ATIVA]) {
          const dano = (card.ataque || 3) + (card.ataqueBonus || 0);
          opponent.zonas[ZONAS_CAMPO.LENDA_ATIVA].vida = 
            Math.max(0, (opponent.zonas[ZONAS_CAMPO.LENDA_ATIVA].vida || card.defesa || 5) - dano);
        }
        break;
      case 'cura':
        // Curar lenda ativa
        if (player.zonas[ZONAS_CAMPO.LENDA_ATIVA]) {
          player.zonas[ZONAS_CAMPO.LENDA_ATIVA].vida = 
            Math.min(card.defesa || 5, (player.zonas[ZONAS_CAMPO.LENDA_ATIVA].vida || card.defesa || 5) + 2);
        }
        break;
      case 'energia':
        // Ganhar energia
        player.energia = Math.min(player.energia + 2, 10);
        break;
    }
  }
}
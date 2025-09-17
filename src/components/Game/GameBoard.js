// src/components/Game/GameBoard.js
"use client";

import { useState, useEffect, useCallback } from 'react';
import FieldZones from './FieldZones';
import PhaseIndicator, { PhaseLog } from './PhaseIndicator';
import { MotorDeJogo } from '@/utils/gameLogic';

export default function GameBoard({ 
  initialPlayers = [], 
  onGameEnd = () => {},
  isSpectatorMode = false 
}) {
  const [gameEngine, setGameEngine] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Inicializar o jogo
  useEffect(() => {
    if (initialPlayers.length === 2) {
      try {
        const engine = new MotorDeJogo(initialPlayers);
        const state = engine.iniciarJogo();
        setGameEngine(engine);
        setGameState(state);
        setLoading(false);
      } catch (err) {
        setError('Erro ao inicializar o jogo: ' + err.message);
        setLoading(false);
      }
    }
  }, [initialPlayers]);

  // Handlers para ações do jogador
  const handleUseSkill = (skillId, target = null) => {
    if (!gameEngine || !gameState || gameState.gameOver) return;

    const result = gameEngine.usarHabilidade(0, skillId, target); // Assumindo jogador 0 é humano
    if (result.success) {
      setGameState(gameEngine.obterEstadoDoJogo());
    } else {
      console.warn('Não foi possível usar habilidade:', result.error);
    }
  };

  const handleSwitchLegend = (legendIndex) => {
    if (!gameEngine || !gameState || gameState.gameOver) return;

    const result = gameEngine.trocarLenda(0, legendIndex);
    if (result.success) {
      setGameState(gameEngine.obterEstadoDoJogo());
    } else {
      console.warn('Não foi possível trocar lenda:', result.error);
    }
  };

  const handleUseItem = (itemIndex, target = null) => {
    if (!gameEngine || !gameState || gameState.gameOver) return;

    const player = gameState.players[0];
    const item = player.zonas?.mao_itens[itemIndex];
    
    if (!item) {
      console.warn('Item não encontrado no índice:', itemIndex);
      return;
    }

    const result = gameEngine.usarItem(0, itemIndex, target);
    if (result.success) {
      setGameState(gameEngine.obterEstadoDoJogo());
      console.log(`Item ${item.nome} usado com sucesso!`);
    } else {
      console.warn('Não foi possível usar item:', result.error);
    }
  };

  const handleSpecialAction = (actionType) => {
    // Implementar ações especiais (carregar energia, preparar defesa, etc.)
    console.log('Ação especial:', actionType);
  };

  const simulateAIAction = useCallback(() => {
    if (!gameEngine || !gameState) return;

    const aiPlayer = gameState.players[1];
    const lendaAtiva = aiPlayer.zonas?.lenda_ativa;

    if (lendaAtiva?.habilidades) {
      // IA simples: usar skill1 se tiver PP, senão trocar lenda se possível
      const skill1 = lendaAtiva.habilidades.skill1;
      const ppAtual = lendaAtiva.pp?.skill1 || skill1?.ppMax || 0;

      if (skill1 && ppAtual >= skill1.cost) {
        const result = gameEngine.usarHabilidade(1, 'skill1');
        if (result.success) {
          setGameState(gameEngine.obterEstadoDoJogo());
          return;
        }
      }

      // Tentar trocar lenda
      const bancoLendas = aiPlayer.zonas?.banco_lendas || [];
      if (bancoLendas.length > 0) {
        const result = gameEngine.trocarLenda(1, 0);
        if (result.success) {
          setGameState(gameEngine.obterEstadoDoJogo());
          return;
        }
      }
    }
  }, [gameEngine, gameState]);

  // Verificar fim de jogo
  useEffect(() => {
    if (gameState?.gameOver) {
      onGameEnd({
        winner: gameState.players[gameState.winner],
        loser: gameState.players[1 - gameState.winner],
        turn: gameState.turn,
        log: gameState.log
      });
    }
  }, [gameState?.gameOver, gameState?.winner, gameState?.players, gameState?.turn, gameState?.log, onGameEnd]);

  // Simular ação do oponente (IA simples)
  useEffect(() => {
    if (gameState?.currentPlayer === 1 && 
        gameState?.phase === 'acao' && 
        !gameState?.gameOver &&
        !isSpectatorMode) {
      
      // Delay para simular pensamento da IA
      const timer = setTimeout(() => {
        simulateAIAction();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [gameState?.currentPlayer, gameState?.phase, gameState?.gameOver, isSpectatorMode, simulateAIAction]);

  if (loading) {
    return (
      <div className="game-board-loading flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Inicializando jogo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="game-board-error flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center text-red-400">
          <h2 className="text-xl font-bold mb-2">Erro no Jogo</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="game-board-waiting flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center text-gray-400">
          <p>Aguardando inicialização do jogo...</p>
        </div>
      </div>
    );
  }

  const [player1, player2] = gameState.players;
  const currentPlayerData = gameState.players[gameState.currentPlayer];

  return (
    <div className="game-board min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20 p-4">
      {/* Cabeçalho com informações da fase */}
      <PhaseIndicator
        currentPhase={gameState.phase}
        currentPlayer={gameState.currentPlayer}
        turn={gameState.turn}
        players={gameState.players}
      />

      {/* Layout Principal */}
      <div className="game-layout grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jogador Oponente (topo/esquerda) */}
        <div className="opponent-area">
          <h2 className="text-lg font-bold text-red-400 mb-3">🔥 Oponente</h2>
          <FieldZones
            player={player2}
            isCurrentPlayer={false}
            gamePhase={gameState.phase}
          />
        </div>

        {/* Área Central - Log e Controles */}
        <div className="central-area">
          {/* Log do Jogo */}
          <PhaseLog actions={gameState.log} />

          {/* Controles Especiais */}
          {gameState.currentPlayer === 0 && gameState.phase === 'acao' && !gameState.gameOver && (
            <div className="special-controls mt-4 p-3 bg-gray-800/50 rounded border border-gray-600">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">🎮 Ações Especiais</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="px-3 py-2 bg-purple-700 hover:bg-purple-600 rounded text-sm text-white transition-colors"
                  onClick={() => handleSpecialAction('charge_energy')}
                >
                  ⚡ Carregar Energia
                </button>
                <button
                  className="px-3 py-2 bg-blue-700 hover:bg-blue-600 rounded text-sm text-white transition-colors"
                  onClick={() => handleSpecialAction('prepare_defense')}
                >
                  🛡️ Preparar Defesa
                </button>
              </div>
            </div>
          )}

          {/* Status da Partida */}
          <div className="match-status mt-4 p-3 bg-black/30 rounded">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">📊 Status</h4>
            <div className="text-xs text-gray-400 space-y-1">
              <div>Turno: {gameState.turn}</div>
              <div>Fase: {gameState.phase}</div>
              <div>Jogador Atual: {currentPlayerData?.name}</div>
              {gameState.gameOver && (
                <div className="text-green-400 font-bold">
                  Vencedor: {gameState.players[gameState.winner]?.name}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Jogador Humano (baixo/direita) */}
        <div className="player-area">
          <h2 className="text-lg font-bold text-blue-400 mb-3">⚔️ Você</h2>
          <FieldZones
            player={player1}
            isCurrentPlayer={gameState.currentPlayer === 0}
            onUseSkill={handleUseSkill}
            onSwitchLegend={handleSwitchLegend}
            onUseItem={handleUseItem}
            gamePhase={gameState.phase}
          />
        </div>
      </div>

      {/* Overlay de fim de jogo */}
      {gameState.gameOver && (
        <div className="game-over-overlay fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg text-center border border-gray-600">
            <h2 className="text-2xl font-bold text-white mb-4">
              {gameState.winner !== null ? 'Fim de Jogo!' : 'Empate!'}
            </h2>
            {gameState.winner !== null && (
              <p className="text-lg text-yellow-400 mb-4">
                Vencedor: {gameState.players[gameState.winner]?.name}
              </p>
            )}
            <button
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white transition-colors"
              onClick={() => window.location.reload()}
            >
              Nova Partida
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
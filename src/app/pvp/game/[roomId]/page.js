// src/app/pvp/game/[roomId]/page.js
"use client";

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

export default function GameRoom({ params }) {
  const [gameState, setGameState] = useState({
    turn: 'player',
    playerHealth: 20,
    opponentHealth: 20,
    playerMana: 3,
    opponentMana: 3,
    turnNumber: 1
  });

  const [playerHand, setPlayerHand] = useState([
    { id: 1, name: 'Curupira', cost: 5, attack: 7, defense: 8, type: 'creature', rarity: 'legendary' },
    { id: 2, name: 'Iara', cost: 4, attack: 6, defense: 5, type: 'creature', rarity: 'epic' },
    { id: 3, name: 'Saci-Pererê', cost: 3, attack: 5, defense: 6, type: 'creature', rarity: 'rare' },
    { id: 4, name: 'Proteção da Floresta', cost: 2, type: 'spell', rarity: 'common' },
    { id: 5, name: 'Canto da Iara', cost: 3, type: 'spell', rarity: 'rare' },
    { id: 6, name: 'Boto Cor-de-Rosa', cost: 6, attack: 8, defense: 7, type: 'creature', rarity: 'legendary' },
    { id: 7, name: 'Mula sem Cabeça', cost: 4, attack: 7, defense: 4, type: 'creature', rarity: 'epic' }
  ]);

  const [battlefield, setBattlefield] = useState({
    player: [],
    opponent: [
      { id: 101, name: 'Boitatá', attack: 9, defense: 7, health: 18, maxHealth: 18 }
    ]
  });

  const [selectedCard, setSelectedCard] = useState(null);
  const [gameLog, setGameLog] = useState([
    { type: 'info', message: 'Jogo iniciado! Você começa.' },
    { type: 'action', message: 'Oponente invocou Boitatá!' }
  ]);

  const [chatMessages, setChatMessages] = useState([
    { player: 'opponent', message: 'Boa sorte!' },
    { player: 'system', message: 'Jogador entrou na sala' }
  ]);

  const [newMessage, setNewMessage] = useState('');

  // Simular ação do oponente
  const simulateOpponentAction = useCallback(() => {
    const actions = [
      () => {
        setGameLog(prev => [...prev, {
          type: 'action',
          message: 'Oponente jogou uma carta!'
        }]);
      },
      () => {
        if (battlefield.opponent.length > 0) {
          setGameLog(prev => [...prev, {
            type: 'combat',
            message: 'Oponente atacou com suas criaturas!'
          }]);
          setGameState(prev => ({
            ...prev,
            playerHealth: Math.max(1, prev.playerHealth - 2)
          }));
        }
      },
      () => {
        setGameLog(prev => [...prev, {
          type: 'info',
          message: 'Oponente finalizou o turno.'
        }]);
        setGameState(prev => ({
          ...prev,
          turn: 'player'
        }));
      }
    ];

    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    randomAction();
  }, [battlefield.opponent.length]);

  useEffect(() => {
    // Simular atualizações do jogo em tempo real
    const gameInterval = setInterval(() => {
      // Simular ações do oponente periodicamente
      if (gameState.turn === 'opponent' && Math.random() < 0.3) {
        simulateOpponentAction();
      }
    }, 2000);

    return () => clearInterval(gameInterval);
  }, [gameState.turn, simulateOpponentAction]);

  const playCard = (card) => {
    if (gameState.turn !== 'player') {
      alert('Não é seu turno!');
      return;
    }

    if (card.cost > gameState.playerMana) {
      alert('Mana insuficiente!');
      return;
    }

    if (card.type === 'creature') {
      // Adicionar criatura ao campo
      setBattlefield(prev => ({
        ...prev,
        player: [...prev.player, {
          id: card.id,
          name: card.name,
          attack: card.attack,
          defense: card.defense,
          health: card.defense,
          maxHealth: card.defense,
          canAttack: false
        }]
      }));
    }

    // Remover carta da mão
    setPlayerHand(prev => prev.filter(c => c.id !== card.id));
    
    // Gastar mana
    setGameState(prev => ({
      ...prev,
      playerMana: prev.playerMana - card.cost
    }));

    // Adicionar ao log
    setGameLog(prev => [...prev, {
      type: 'action',
      message: `Você jogou ${card.name}!`
    }]);

    setSelectedCard(null);
  };

  const attackCreature = (attackerId, targetId) => {
    // Lógica de ataque entre criaturas
    const attacker = battlefield.player.find(c => c.id === attackerId);
    const target = battlefield.opponent.find(c => c.id === targetId);

    if (!attacker || !target) return;

    // Calcular dano
    const damage = attacker.attack;
    target.health -= damage;

    // Contra-ataque
    if (target.health > 0) {
      attacker.health -= target.attack;
    }

    // Atualizar battlefield
    setBattlefield(prev => ({
      player: prev.player.filter(c => c.health > 0),
      opponent: prev.opponent.filter(c => c.health > 0)
    }));

    setGameLog(prev => [...prev, {
      type: 'combat',
      message: `${attacker.name} atacou ${target.name} causando ${damage} de dano!`
    }]);
  };

  const endTurn = () => {
    if (gameState.turn !== 'player') return;

    setGameState(prev => ({
      ...prev,
      turn: 'opponent',
      turnNumber: prev.turn === 'opponent' ? prev.turnNumber + 1 : prev.turnNumber,
      playerMana: Math.min(10, prev.turnNumber + 1), // Aumentar mana máxima
      opponentMana: Math.min(10, prev.turnNumber + 1)
    }));

    // Permitir que criaturas ataquem no próximo turno
    setBattlefield(prev => ({
      ...prev,
      player: prev.player.map(c => ({ ...c, canAttack: true }))
    }));

    setGameLog(prev => [...prev, {
      type: 'info',
      message: 'Turno finalizado. Vez do oponente.'
    }]);

    // Simular turno do oponente
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        turn: 'player'
      }));
      
      setGameLog(prev => [...prev, {
        type: 'info',
        message: 'Seu turno!'
      }]);
    }, 2000);
  };

  const sendChatMessage = () => {
    if (!newMessage.trim()) return;

    setChatMessages(prev => [...prev, {
      player: 'player',
      message: newMessage
    }]);
    setNewMessage('');
  };

  // Função para obter cor da raridade
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'legendary': return 'border-yellow-400 bg-yellow-900/20';
      case 'epic': return 'border-purple-400 bg-purple-900/20';
      case 'rare': return 'border-blue-400 bg-blue-900/20';
      default: return 'border-gray-400 bg-gray-900/20';
    }
  };

  // Função para obter emoji da criatura
  const getCreatureEmoji = (name) => {
    const emojiMap = {
      'Curupira': '🧙‍♂️',
      'Iara': '🧜‍♀️',
      'Saci-Pererê': '👹',
      'Boto Cor-de-Rosa': '🐬',
      'Mula sem Cabeça': '🐴',
      'Boitatá': '🐍'
    };
    return emojiMap[name] || '🧙';
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-900 via-blue-900 to-purple-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header do Jogo */}
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 mb-4 border border-gray-600/30">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="text-lg font-bold">Sala: {params.roomId}</div>
              <div className="text-sm text-gray-400">
                Turno {gameState.turnNumber} • {gameState.turn === 'player' ? 'Seu turno' : 'Turno do oponente'}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                ⏱️ 00:05:23
              </div>
              <Link
                href="/pvp"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
              >
                Sair
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {/* Campo de Batalha Principal */}
          <div className="col-span-3 space-y-4">
            {/* Oponente */}
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-red-500/30">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                    👤
                  </div>
                  <div>
                    <div className="font-bold">Oponente</div>
                    <div className="text-sm text-gray-400">Nível 15</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-red-400">❤️ {gameState.opponentHealth}/20</div>
                  <div className="text-blue-400">💎 {gameState.opponentMana}/10</div>
                </div>
              </div>

              {/* Campo do Oponente */}
              <div className="min-h-24 bg-black/30 rounded-lg p-3 border border-gray-600/30">
                <div className="flex space-x-3">
                  {battlefield.opponent.map(creature => (
                    <div
                      key={creature.id}
                      className="bg-red-900/50 p-3 rounded border border-red-500/50 cursor-pointer hover:border-red-400 transition-all"
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-1">🐍</div>
                        <div className="text-xs font-bold">{creature.name}</div>
                        <div className="text-xs text-red-400">{creature.attack}/{creature.health}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Campo do Jogador */}
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-green-500/30">
              <div className="min-h-24 bg-black/30 rounded-lg p-3 border border-gray-600/30 mb-4">
                <div className="flex space-x-3">
                  {battlefield.player.map(creature => (
                    <div
                      key={creature.id}
                      className={`bg-green-900/50 p-3 rounded border cursor-pointer transition-all ${
                        creature.canAttack 
                          ? 'border-green-400 hover:border-green-300 shadow-lg shadow-green-400/30' 
                          : 'border-green-600/50'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-1">{getCreatureEmoji(creature.name)}</div>
                        <div className="text-xs font-bold">{creature.name}</div>
                        <div className="text-xs text-green-400">{creature.attack}/{creature.health}</div>
                        {creature.canAttack && (
                          <div className="text-xs text-yellow-400 mt-1 animate-pulse">⚔️ Pronto</div>
                        )}
                      </div>
                    </div>
                  ))}
                  {battlefield.player.length === 0 && (
                    <div className="text-gray-500 text-center w-full py-4">
                      Seu campo está vazio
                    </div>
                  )}
                </div>
              </div>

              {/* Informações do Jogador */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    👤
                  </div>
                  <div>
                    <div className="font-bold">Você</div>
                    <div className="text-sm text-gray-400">Nível 12</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-green-400">❤️ {gameState.playerHealth}/20</div>
                  <div className="text-blue-400">💎 {gameState.playerMana}/10</div>
                  <button
                    onClick={endTurn}
                    disabled={gameState.turn !== 'player'}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors"
                  >
                    Finalizar Turno
                  </button>
                </div>
              </div>
            </div>

            {/* Mão do Jogador */}
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-blue-500/30">
              <h3 className="font-bold mb-3">🃏 Sua Mão</h3>
              <div className="flex space-x-3 overflow-x-auto">
                {playerHand.map(card => (
                  <div
                    key={card.id}
                    onClick={() => setSelectedCard(card)}
                    className={`min-w-32 p-3 rounded border cursor-pointer transition-all ${getRarityColor(card.rarity)} ${
                      selectedCard?.id === card.id 
                        ? 'ring-2 ring-blue-400 transform scale-105' 
                        : card.cost <= gameState.playerMana 
                        ? 'hover:border-gray-300 hover:transform hover:scale-105' 
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">
                        {card.type === 'creature' ? getCreatureEmoji(card.name) : '✨'}
                      </div>
                      <div className="text-xs font-bold mb-1">{card.name}</div>
                      <div className="text-xs text-yellow-400 mb-1">💎{card.cost}</div>
                      {card.type === 'creature' && (
                        <div className="text-xs text-gray-300">{card.attack}/{card.defense}</div>
                      )}
                      <div className={`text-xs mt-1 px-1 rounded ${
                        card.rarity === 'legendary' ? 'text-yellow-300' :
                        card.rarity === 'epic' ? 'text-purple-300' :
                        card.rarity === 'rare' ? 'text-blue-300' :
                        'text-gray-300'
                      }`}>
                        {card.rarity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedCard && (
                <div className="mt-4 p-3 bg-black/50 rounded border border-blue-500/30">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold">{selectedCard.name}</div>
                      <div className="text-sm text-gray-400">
                        {selectedCard.type === 'creature' ? 'Criatura' : 'Feitiço'} • 💎{selectedCard.cost}
                      </div>
                    </div>
                    <button
                      onClick={() => playCard(selectedCard)}
                      disabled={selectedCard.cost > gameState.playerMana || gameState.turn !== 'player'}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors"
                    >
                      Jogar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Painel Lateral */}
          <div className="space-y-4">
            {/* Log do Jogo */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-gray-600/30">
              <h3 className="font-bold mb-3">📋 Log do Jogo</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {gameLog.slice(-8).map((entry, index) => (
                  <div
                    key={index}
                    className={`text-xs p-2 rounded ${
                      entry.type === 'info' ? 'bg-blue-900/30' :
                      entry.type === 'action' ? 'bg-green-900/30' :
                      'bg-red-900/30'
                    }`}
                  >
                    {entry.message}
                  </div>
                ))}
              </div>
            </div>

            {/* Chat */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-gray-600/30">
              <h3 className="font-bold mb-3">💬 Chat</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto mb-3">
                {chatMessages.slice(-5).map((msg, index) => (
                  <div
                    key={index}
                    className={`text-xs p-2 rounded ${
                      msg.player === 'player' ? 'bg-green-900/30' :
                      msg.player === 'opponent' ? 'bg-red-900/30' :
                      'bg-gray-900/30'
                    }`}
                  >
                    <span className="font-semibold">
                      {msg.player === 'player' ? 'Você' : 
                       msg.player === 'opponent' ? 'Oponente' : 'Sistema'}:
                    </span> {msg.message}
                  </div>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Digite uma mensagem..."
                  className="flex-1 px-2 py-1 bg-black/50 border border-gray-600 rounded text-xs text-white focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={sendChatMessage}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors"
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// src/app/pvp/game/[roomId]/page.js
"use client";

import Link from 'next/link';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { cardsDatabase } from '../../../../data/cardsDatabase';
import CardImage from '../../../../components/Card/CardImage';

export default function GameRoom({ params }) {
  const [gameState, setGameState] = useState({
    turn: 'player',
    playerHealth: 100,
    opponentHealth: 100,
    playerUltimate: 0, // 0-100, ganha 10 por turno, 20 ao usar skill
    opponentUltimate: 0,
    turnNumber: 1,
    actionUsed: false // Se já usou ação no turno (skill/ultimate/troca)
  });

  // Função para obter dados completos da carta
  const getCardData = (cardName) => {
    return cardsDatabase.find(card => card.name === cardName) || null;
  };

  // 3 cartas na mão apenas
  const [playerHand, setPlayerHand] = useState([
    getCardData('Curupira') || { id: 1, name: 'Curupira', cost: 5, attack: 7, defense: 8, type: 'creature', rarity: 'legendary' },
    getCardData('Iara') || { id: 2, name: 'Iara', cost: 4, attack: 6, defense: 5, type: 'creature', rarity: 'epic' },
    getCardData('Saci-Pererê') || { id: 3, name: 'Saci-Pererê', cost: 3, attack: 5, defense: 6, type: 'creature', rarity: 'rare' }
  ]);

  // Uma carta ativa em campo para cada jogador
  const [activeCards, setActiveCards] = useState({
    player: null, // Carta ativa do jogador
    opponent: getCardData('Boitatá') || { 
      id: 101, 
      name: 'Boitatá', 
      attack: 9, 
      defense: 7, 
      health: 18, 
      maxHealth: 18,
      skillCooldown: 0,
      ultimateCooldown: 0
    }
  });

  // Estados para o novo visual
  const [currentField, setCurrentField] = useState('floresta'); // Campo/terreno atual
  const [fieldChangeCountdown, setFieldChangeCountdown] = useState(2); // Conta turnos até mudança

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

  // Função para mudar campo a cada 2 turnos
  const changeField = useCallback(() => {
    const fieldKeys = Object.keys(fields);
    const currentIndex = fieldKeys.indexOf(currentField);
    const nextIndex = (currentIndex + 1) % fieldKeys.length;
    setCurrentField(fieldKeys[nextIndex]);
    setFieldChangeCountdown(2);

    setGameLog(prev => [...prev, {
      type: 'info',
      message: `⚡ Campo mudou para: ${fields[fieldKeys[nextIndex]].name}!`
    }]);
  }, [currentField, fields]);

  // Simular ação do oponente
  const simulateOpponentAction = useCallback(() => {
    const actions = [
      () => {
        setGameLog(prev => [...prev, {
          type: 'action',
          message: 'Oponente está planejando...'
        }]);
      },
      () => {
        if (activeCards.opponent) {
          setGameLog(prev => [...prev, {
            type: 'combat',
            message: 'Oponente está preparando um ataque!'
          }]);
        }
      }
    ];

    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    randomAction();
  }, [activeCards.opponent]);

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

  // Colocar carta em campo (primeira vez ou trocar)
  const playCard = (card) => {
    if (gameState.turn !== 'player') {
      alert('Não é seu turno!');
      return;
    }

    if (gameState.actionUsed) {
      alert('Você já usou sua ação neste turno!');
      return;
    }

    // Se já tem carta ativa, está trocando
    if (activeCards.player) {
      // Trocar carta (volta para a mão)
      setPlayerHand(prev => [...prev.filter(c => c.id !== card.id), activeCards.player]);
    } else {
      // Primeira carta em campo
      setPlayerHand(prev => prev.filter(c => c.id !== card.id));
    }

    // Colocar nova carta ativa
    setActiveCards(prev => ({
      ...prev,
      player: {
        ...card,
        health: card.defense || card.health || 50,
        maxHealth: card.defense || card.health || 50,
        skillCooldown: 0,
        ultimateCooldown: 0
      }
    }));

    setGameState(prev => ({
      ...prev,
      actionUsed: true
    }));

    setGameLog(prev => [...prev, {
      type: 'action',
      message: `Você colocou ${card.name} em campo!`
    }]);

    setSelectedCard(null);
  };

  // Usar habilidade da carta ativa
  const useSkill = () => {
    if (gameState.turn !== 'player' || !activeCards.player) {
      alert('Não é possível usar habilidade agora!');
      return;
    }

    if (gameState.actionUsed) {
      alert('Você já usou sua ação neste turno!');
      return;
    }

    if (activeCards.player.skillCooldown > 0) {
      alert('Habilidade em cooldown!');
      return;
    }

    const card = activeCards.player;
    const skill = card.abilities?.[0]; // Primeira habilidade como skill

    if (!skill) {
      alert('Esta carta não possui habilidade!');
      return;
    }

    // Aplicar efeito da skill
    applySkillEffect(skill);

    // Atualizar cooldown e ultimate
    setActiveCards(prev => ({
      ...prev,
      player: {
        ...prev.player,
        skillCooldown: 2 // 2 turnos de cooldown
      }
    }));

    setGameState(prev => ({
      ...prev,
      actionUsed: true,
      playerUltimate: Math.min(100, prev.playerUltimate + 20)
    }));

    setGameLog(prev => [...prev, {
      type: 'action',
      message: `Você usou ${skill.name}!`
    }]);
  };

  // Usar ultimate
  const useUltimate = () => {
    if (gameState.turn !== 'player' || !activeCards.player) {
      alert('Não é possível usar ultimate agora!');
      return;
    }

    if (gameState.actionUsed) {
      alert('Você já usou sua ação neste turno!');
      return;
    }

    if (gameState.playerUltimate < 100) {
      alert('Ultimate não está carregado!');
      return;
    }

    const card = activeCards.player;
    const ultimate = card.abilities?.[1] || card.abilities?.[0]; // Segunda habilidade como ultimate

    if (!ultimate) {
      alert('Esta carta não possui ultimate!');
      return;
    }

    // Aplicar efeito do ultimate (mais forte)
    applyUltimateEffect(ultimate);

    setGameState(prev => ({
      ...prev,
      actionUsed: true,
      playerUltimate: 0 // Zerar ultimate após uso
    }));

    setGameLog(prev => [...prev, {
      type: 'combat',
      message: `💥 ULTIMATE! Você usou ${ultimate.name}!`
    }]);
  };

  // Aplicar efeitos das habilidades
  const applySkillEffect = (skill) => {
    if (skill.type === 'damage' && activeCards.opponent) {
      const damage = skill.value || 15;
      setActiveCards(prev => ({
        ...prev,
        opponent: {
          ...prev.opponent,
          health: Math.max(0, prev.opponent.health - damage)
        }
      }));
      
      if (activeCards.opponent.health - damage <= 0) {
        setGameState(prev => ({
          ...prev,
          opponentHealth: Math.max(0, prev.opponentHealth - 20)
        }));
      }
    } else if (skill.type === 'heal') {
      const heal = skill.value || 10;
      setGameState(prev => ({
        ...prev,
        playerHealth: Math.min(100, prev.playerHealth + heal)
      }));
    }
  };

  const applyUltimateEffect = (ultimate) => {
    if (ultimate.type === 'damage' && activeCards.opponent) {
      const damage = (ultimate.value || 15) * 2; // Ultimate faz o dobro do dano
      setActiveCards(prev => ({
        ...prev,
        opponent: {
          ...prev.opponent,
          health: Math.max(0, prev.opponent.health - damage)
        }
      }));
      
      if (activeCards.opponent.health - damage <= 0) {
        setGameState(prev => ({
          ...prev,
          opponentHealth: Math.max(0, prev.opponentHealth - 40)
        }));
      }
    } else if (ultimate.type === 'heal') {
      const heal = (ultimate.value || 10) * 2;
      setGameState(prev => ({
        ...prev,
        playerHealth: Math.min(100, prev.playerHealth + heal)
      }));
    }
  };

  const endTurn = () => {
    if (gameState.turn !== 'player') return;

    // Reduzir cooldowns
    if (activeCards.player?.skillCooldown > 0) {
      setActiveCards(prev => ({
        ...prev,
        player: {
          ...prev.player,
          skillCooldown: prev.player.skillCooldown - 1
        }
      }));
    }

    // Sistema de mudança de campo
    let newFieldCountdown = fieldChangeCountdown - 1;
    if (newFieldCountdown <= 0) {
      changeField();
      newFieldCountdown = 2; // Resetar contador
    } else {
      setFieldChangeCountdown(newFieldCountdown);
    }

    setGameState(prev => ({
      ...prev,
      turn: 'opponent',
      turnNumber: prev.turn === 'opponent' ? prev.turnNumber + 1 : prev.turnNumber,
      playerUltimate: Math.min(100, prev.playerUltimate + 10), // +10 ultimate por turno
      actionUsed: false // Resetar ação para próximo turno
    }));

    setGameLog(prev => [...prev, {
      type: 'info',
      message: `Turno finalizado. ${newFieldCountdown > 0 ? `Campo muda em ${newFieldCountdown} turno(s).` : ''}`
    }]);

    // Simular turno do oponente
    setTimeout(() => {
      simulateOpponentTurn();
      
      setGameState(prev => ({
        ...prev,
        turn: 'player',
        opponentUltimate: Math.min(100, prev.opponentUltimate + 10)
      }));
      
      setGameLog(prev => [...prev, {
        type: 'info',
        message: 'Seu turno!'
      }]);
    }, 2000);
  };

  // Simular turno do oponente
  const simulateOpponentTurn = () => {
    if (!activeCards.opponent) return;

    const actions = ['skill', 'wait'];
    const action = actions[Math.floor(Math.random() * actions.length)];

    if (action === 'skill' && activeCards.opponent.abilities?.[0]) {
      // Oponente usa habilidade
      const skill = activeCards.opponent.abilities[0];
      
      if (skill.type === 'damage' && activeCards.player) {
        const damage = skill.value || 10;
        setActiveCards(prev => ({
          ...prev,
          player: {
            ...prev.player,
            health: Math.max(0, prev.player.health - damage)
          }
        }));
        
        if (activeCards.player.health - damage <= 0) {
          setGameState(prev => ({
            ...prev,
            playerHealth: Math.max(0, prev.playerHealth - 15)
          }));
        }
      }

      setGameLog(prev => [...prev, {
        type: 'combat',
        message: `Oponente usou ${skill.name}!`
      }]);
    } else {
      setGameLog(prev => [...prev, {
        type: 'info',
        message: 'Oponente aguardou.'
      }]);
    }
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

  return (
    <main className={`min-h-screen text-white relative overflow-hidden bg-gradient-to-br ${fields[currentField].bg}`}>
      {/* Background dinâmico baseado no campo atual */}
      <div className="absolute inset-0">
        {/* Textura de fundo baseada no campo */}
        <div className="absolute inset-0 opacity-30">
          {currentField === 'floresta' && (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(34,197,94,0.3)_1px,transparent_1px)] bg-[length:60px_60px]"></div>
          )}
          {currentField === 'rio' && (
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(59,130,246,0.2)_25%,transparent_25%,transparent_75%,rgba(59,130,246,0.2)_75%)] bg-[length:40px_40px]"></div>
          )}
          {currentField === 'caatinga' && (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.3)_1px,transparent_1px)] bg-[length:80px_80px]"></div>
          )}
          {currentField === 'pantanal' && (
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,185,129,0.2)_50%,rgba(107,114,128,0.2)_50%)] bg-[length:60px_30px]"></div>
          )}
          {currentField === 'lua' && (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(147,51,234,0.4)_1px,transparent_1px)] bg-[length:100px_100px]"></div>
          )}
        </div>
        
        {/* Elementos decorativos do campo */}
        <div className="absolute inset-0 opacity-20">
          {currentField === 'floresta' && (
            <div className="text-6xl absolute top-10 left-10 animate-pulse">🌲</div>
          )}
          {currentField === 'rio' && (
            <div className="text-6xl absolute top-20 right-20 animate-bounce">🌊</div>
          )}
          {currentField === 'caatinga' && (
            <div className="text-6xl absolute bottom-20 left-20 animate-pulse">🌵</div>
          )}
          {currentField === 'pantanal' && (
            <div className="text-6xl absolute top-1/3 right-10 animate-bounce">🐊</div>
          )}
          {currentField === 'lua' && (
            <div className="text-8xl absolute top-10 right-1/3 animate-pulse">🌕</div>
          )}
        </div>
      </div>
      
      <div className="relative z-10 h-screen p-2">
        {/* Título da Arena - Topo Central */}
        <div className="text-center mb-2">
          <div className="inline-block bg-gradient-to-r from-amber-600/90 to-yellow-600/90 backdrop-blur-md rounded-xl px-4 py-2 border-2 border-yellow-400/50 shadow-2xl">
            <h1 className="text-lg font-bold text-yellow-100 tracking-wide">
              ⚔️ MITOLOGIA BRASILEIRA - BATALHA DOS ENCANTADOS ⚔️
            </h1>
            <div className="text-xs text-yellow-200 mt-1">
              Arena: {params.roomId} • Turno {gameState.turnNumber}
            </div>
          </div>
        </div>

        {/* Layout Principal do Tabuleiro */}
        <div className="flex-1 grid grid-cols-12 grid-rows-8 gap-2 h-full max-h-[calc(100vh-80px)]">
          
          {/* Info do Oponente - Canto Superior Esquerdo */}
          <div className="col-span-3 row-span-2">
            <div className="bg-gradient-to-br from-red-600/80 to-red-800/80 backdrop-blur-md rounded-xl p-3 border-2 border-red-400/50 shadow-xl h-full">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-red-700/80 rounded-full flex items-center justify-center border-2 border-red-300/50">
                  <span className="text-sm">🧙‍♂️</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-red-100">Oponente</div>
                  <div className="text-xs text-red-300">Nível 12</div>
                </div>
              </div>
              <div className="bg-red-900/60 rounded-lg p-2 text-center">
                <div className="text-xs text-red-200 mb-1">Pontos de Vida</div>
                <div className="text-lg font-bold text-red-100">❤️ {gameState.opponentHealth}</div>
                <div className="text-xs text-red-300 mt-1">
                  Ultimate: ⚡ {gameState.opponentUltimate}%
                </div>
              </div>
            </div>
          </div>

          {/* Indicador de Campo Atual - Centro Superior */}
          <div className="col-span-6 row-span-1 flex justify-center items-center">
            <div className="bg-gradient-to-r from-purple-600/90 to-indigo-600/90 backdrop-blur-md rounded-xl px-4 py-2 border-2 border-purple-400/50 shadow-xl">
              <div className="text-center">
                <div className="text-2xl mb-1">{fields[currentField].icon}</div>
                <div className="text-sm font-bold text-purple-100">{fields[currentField].name}</div>
                <div className="text-xs text-purple-300">{fields[currentField].effect}</div>
                <div className="text-xs text-purple-400 mt-1">
                  Muda em {fieldChangeCountdown} turno(s)
                </div>
              </div>
            </div>
          </div>

          {/* Baralho e Descarte - Lado Direito */}
          <div className="col-span-3 row-span-8 flex flex-col justify-center space-y-4">
            {/* Baralho de Compra */}
            <div className="bg-gradient-to-br from-blue-600/80 to-blue-800/80 backdrop-blur-md rounded-xl p-3 border-2 border-blue-400/50 shadow-xl">
              <div className="text-center">
                <div className="w-16 h-20 bg-blue-700/80 rounded-lg border-2 border-blue-300/50 flex items-center justify-center mx-auto mb-2 shadow-lg">
                  <span className="text-2xl">🃏</span>
                </div>
                <div className="text-sm font-bold text-blue-100">Compra</div>
                <div className="text-xs text-blue-300">22 cartas</div>
              </div>
            </div>
            
            {/* Descarte */}
            <div className="bg-gradient-to-br from-gray-600/80 to-gray-800/80 backdrop-blur-md rounded-xl p-3 border-2 border-gray-400/50 shadow-xl">
              <div className="text-center">
                <div className="w-16 h-20 bg-gray-700/80 rounded-lg border-2 border-gray-300/50 flex items-center justify-center mx-auto mb-2 shadow-lg">
                  <span className="text-2xl">🗑️</span>
                </div>
                <div className="text-sm font-bold text-gray-100">Desencanto</div>
                <div className="text-xs text-gray-300">5 cartas</div>
              </div>
            </div>
          </div>

          {/* Espaço vazio - alinhamento */}
          <div className="col-span-3 row-span-1"></div>

          {/* Encantado Ativo do Oponente - Centro Superior */}
          <div className="col-span-6 row-span-3">
            <div className="bg-gradient-to-br from-red-800/60 to-red-900/60 backdrop-blur-md rounded-2xl p-4 border-3 border-red-400/40 shadow-2xl h-full relative">
              {/* Plataforma mística */}
              <div className="absolute inset-3 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-xl border border-red-300/30"></div>
              
              <div className="relative z-10 h-full flex flex-col justify-center">
                <h3 className="text-center text-red-300 mb-3 font-bold text-sm">
                  👑 ENCANTADO ATIVO - OPONENTE
                </h3>
                
                {activeCards.opponent ? (
                  <div className="flex justify-center">
                    <div className="bg-gradient-to-br from-red-700/90 to-red-800/90 backdrop-blur-sm rounded-xl p-4 border-2 border-red-400/60 shadow-2xl relative max-w-48">
                      {/* Indicadores de habilidade */}
                      {activeCards.opponent.abilities && activeCards.opponent.abilities.length > 0 && (
                        <div className="absolute -top-2 -right-2 flex space-x-1">
                          {activeCards.opponent.abilities.slice(0, 2).map((ability, idx) => (
                            <div
                              key={idx}
                              className="w-6 h-6 bg-purple-600/90 rounded-full flex items-center justify-center border-2 border-purple-300/50 shadow-lg"
                              title={ability.name}
                            >
                              <span className="text-xs">
                                {ability.type === 'damage' ? '⚔️' : 
                                 ability.type === 'heal' ? '💚' :
                                 ability.type === 'shield' ? '🛡️' : '✨'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="text-center">
                        <div className="mb-2">
                          <CardImage card={activeCards.opponent} size="medium" className="mx-auto" />
                        </div>
                        <div className="text-lg font-bold text-red-100 mb-2">{activeCards.opponent.name}</div>
                        <div className="text-sm text-red-300 bg-black/50 rounded-lg px-3 py-1 mb-2">
                          ❤️ {activeCards.opponent.health}/{activeCards.opponent.maxHealth}
                        </div>
                        {activeCards.opponent.abilities?.[0] && (
                          <div className="text-xs text-purple-200 bg-purple-900/70 rounded-lg px-2 py-1">
                            ⚡ {activeCards.opponent.abilities[0].name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-red-400/60 text-center py-8 text-lg">
                    〰️ Nenhum Encantado Ativo 〰️
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Seu Encantado Ativo - Centro Inferior */}
          <div className="col-span-6 row-span-3">
            <div className="bg-gradient-to-br from-emerald-800/60 to-emerald-900/60 backdrop-blur-md rounded-2xl p-4 border-3 border-emerald-400/40 shadow-2xl h-full relative">
              {/* Plataforma mística */}
              <div className="absolute inset-3 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-xl border border-emerald-300/30"></div>
              
              <div className="relative z-10 h-full flex flex-col justify-center">
                <h3 className="text-center text-emerald-300 mb-3 font-bold text-sm">
                  👑 SEU ENCANTADO ATIVO
                </h3>
                
                {activeCards.player ? (
                  <div className="flex justify-center">
                    <div 
                      className="bg-gradient-to-br from-emerald-700/90 to-emerald-800/90 backdrop-blur-sm rounded-xl p-4 border-2 border-emerald-400/60 shadow-2xl relative max-w-48 cursor-pointer hover:scale-105 transition-all"
                      onClick={() => setSelectedCard(activeCards.player)}
                    >
                      {/* Indicadores de habilidade */}
                      {activeCards.player.abilities && activeCards.player.abilities.length > 0 && (
                        <div className="absolute -top-2 -right-2 flex space-x-1">
                          {activeCards.player.abilities.slice(0, 2).map((ability, idx) => (
                            <div
                              key={idx}
                              className="w-6 h-6 bg-purple-600/90 rounded-full flex items-center justify-center border-2 border-purple-300/50 shadow-lg"
                              title={ability.name}
                            >
                              <span className="text-xs">
                                {ability.type === 'damage' ? '⚔️' : 
                                 ability.type === 'heal' ? '💚' :
                                 ability.type === 'shield' ? '🛡️' : '✨'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Indicador de cooldown */}
                      {activeCards.player.skillCooldown > 0 && (
                        <div className="absolute -top-2 -left-2 w-6 h-6 bg-red-600/90 rounded-full flex items-center justify-center border-2 border-red-300/50 shadow-lg">
                          <span className="text-xs font-bold">{activeCards.player.skillCooldown}</span>
                        </div>
                      )}
                      
                      <div className="text-center">
                        <div className="mb-2">
                          <CardImage card={activeCards.player} size="medium" className="mx-auto" />
                        </div>
                        <div className="text-lg font-bold text-emerald-100 mb-2">{activeCards.player.name}</div>
                        <div className="text-sm text-emerald-300 bg-black/50 rounded-lg px-3 py-1 mb-2">
                          ❤️ {activeCards.player.health}/{activeCards.player.maxHealth}
                        </div>
                        {activeCards.player.abilities?.[0] && (
                          <div className="text-xs text-purple-200 bg-purple-900/70 rounded-lg px-2 py-1 mb-2">
                            ⚡ {activeCards.player.abilities[0].name}
                          </div>
                        )}
                        {!gameState.actionUsed && gameState.turn === 'player' && (
                          <div className="text-xs text-yellow-300 font-bold animate-pulse">
                            👆 Clique para usar habilidades
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-emerald-400/60 text-center py-8 text-lg">
                    〰️ Escolha uma carta da sua mão 〰️
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info do Jogador - Canto Inferior Esquerdo */}
          <div className="col-span-3 row-span-1">
            <div className="bg-gradient-to-br from-emerald-600/80 to-emerald-800/80 backdrop-blur-md rounded-xl p-3 border-2 border-emerald-400/50 shadow-xl h-full">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-emerald-700/80 rounded-full flex items-center justify-center border-2 border-emerald-300/50">
                  <span className="text-sm">🧙‍♂️</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-emerald-100">Você</div>
                  <div className="text-xs text-emerald-300">Nível 8</div>
                </div>
              </div>
              <div className="bg-emerald-900/60 rounded-lg p-2 text-center">
                <div className="text-xs text-emerald-200 mb-1">Pontos de Vida</div>
                <div className="text-lg font-bold text-emerald-100">❤️ {gameState.playerHealth}</div>
                <div className="text-xs text-emerald-300 mt-1">
                  Ultimate: ⚡ {gameState.playerUltimate}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mão do Jogador - Inferior Central (Sobrepostas como Genshin) */}
        <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-30">
          <div className="bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-purple-900/90 backdrop-blur-md rounded-xl px-4 py-3 border-2 border-blue-400/50 shadow-2xl">
            <div className="text-center mb-2">
              <h3 className="font-bold text-blue-100 text-sm">🃏 Sua Mão ({playerHand.length}/3)</h3>
              <div className="text-xs text-blue-300">
                {activeCards.player ? 'Clique para trocar carta ativa' : 'Escolha uma carta para colocar em campo'}
              </div>
            </div>
            
            <div className="flex justify-center space-x-1">
              {playerHand.map((card, index) => (
                <div
                  key={card.id}
                  onClick={() => playCard(card)}
                  className={`relative cursor-pointer transition-all duration-300 ${
                    gameState.turn === 'player' && !gameState.actionUsed
                      ? 'hover:transform hover:-translate-y-3 hover:scale-110' 
                      : 'opacity-70 cursor-not-allowed'
                  }`}
                  style={{
                    marginLeft: index > 0 ? '-16px' : '0',
                    zIndex: playerHand.length - index
                  }}
                >
                  {/* Carta parcialmente escondida estilo Genshin */}
                  <div className={`w-20 h-28 rounded-lg border-2 backdrop-blur-sm shadow-xl relative overflow-hidden ${getRarityColor(card.rarity)}`}>
                    {/* Indicadores de habilidade */}
                    {card.abilities && card.abilities.length > 0 && (
                      <div className="absolute top-1 right-1 flex space-x-1">
                        {card.abilities.slice(0, 2).map((ability, idx) => (
                          <div
                            key={idx}
                            className="w-2 h-2 bg-purple-600/90 rounded-full flex items-center justify-center border border-purple-300/50"
                            title={ability.name}
                          >
                            <span className="text-xs">
                              {ability.type === 'damage' ? '⚔️' : 
                               ability.type === 'heal' ? '💚' :
                               ability.type === 'shield' ? '🛡️' : '✨'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="p-2 text-center h-full flex flex-col justify-between">
                      <div className="mb-1">
                        <CardImage card={card} size="small" className="mx-auto" />
                      </div>
                      <div className="text-xs font-bold text-white truncate">{card.name}</div>
                      <div className="text-xs text-gray-300">
                        ⚔️{card.attack} 🛡️{card.defense}
                      </div>
                    </div>
                  </div>
                  
                  {/* Indicador se pode usar */}
                  {gameState.turn === 'player' && !gameState.actionUsed && (
                    <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs text-green-300 font-bold animate-pulse bg-black/60 rounded px-1 py-0.5">
                      {activeCards.player ? '🔄' : '🎯'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Habilidades - Inferior Direito */}
        <div className="fixed bottom-2 right-2 z-30">
          {activeCards.player && (
            <div className="bg-gradient-to-br from-purple-600/90 to-purple-800/90 backdrop-blur-md rounded-xl p-3 border-2 border-purple-400/50 shadow-2xl">
              <h3 className="text-sm font-bold text-purple-100 mb-2 text-center">⚡ Habilidades</h3>
              <div className="space-y-2">
                {/* Skill */}
                <button 
                  onClick={useSkill}
                  disabled={
                    gameState.turn !== 'player' || 
                    gameState.actionUsed || 
                    !activeCards.player?.abilities?.[0] ||
                    activeCards.player?.skillCooldown > 0
                  }
                  className="w-full bg-green-700/80 hover:bg-green-600/90 disabled:bg-gray-600/60 disabled:cursor-not-allowed rounded-lg p-2 transition-all relative min-w-40"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-green-100 font-semibold text-sm">
                      🔥 {activeCards.player.abilities?.[0]?.name || 'Habilidade 1'}
                    </span>
                    {activeCards.player.skillCooldown > 0 && (
                      <span className="bg-red-600/80 rounded-full px-1.5 py-0.5 text-xs font-bold">
                        {activeCards.player.skillCooldown}
                      </span>
                    )}
                  </div>
                </button>

                {/* Ultimate */}
                <button 
                  onClick={useUltimate}
                  disabled={
                    gameState.turn !== 'player' || 
                    gameState.actionUsed || 
                    gameState.playerUltimate < 100 ||
                    !activeCards.player?.abilities?.[1] && !activeCards.player?.abilities?.[0]
                  }
                  className="w-full bg-purple-700/80 hover:bg-purple-600/90 disabled:bg-gray-600/60 disabled:cursor-not-allowed rounded-lg p-2 transition-all relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-purple-100 font-semibold text-sm">
                      💥 {activeCards.player.abilities?.[1]?.name || activeCards.player.abilities?.[0]?.name || 'Ultimate'}
                    </span>
                    {gameState.playerUltimate >= 100 && (
                      <span className="bg-yellow-600/80 rounded-full px-1.5 py-0.5 text-xs font-bold animate-pulse">
                        PRONTO
                      </span>
                    )}
                  </div>
                </button>

                {/* Finalizar Turno */}
                <button 
                  onClick={endTurn}
                  disabled={gameState.turn !== 'player'}
                  className="w-full bg-yellow-700/80 hover:bg-yellow-600/90 disabled:bg-gray-600/60 disabled:cursor-not-allowed rounded-lg p-2 transition-all"
                >
                  <span className="text-yellow-100 font-semibold text-sm">
                    🏁 Finalizar Turno
                  </span>
                </button>
              </div>
              
              {/* Status */}
              <div className="mt-2 text-center">
                <div className="text-xs text-purple-200 bg-black/40 rounded-lg px-2 py-1">
                  {gameState.turn === 'player' ? 
                    (gameState.actionUsed ? '✅ Ação usada' : '⚡ Seu turno') : 
                    '⏳ Aguardando oponente'
                  }
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Indicador de Turno - Superior */}
        <div className="fixed top-2 left-1/2 transform -translate-x-1/2 z-20">
          <div className={`px-4 py-2 rounded-xl border-2 backdrop-blur-md shadow-xl ${
            gameState.turn === 'player' 
              ? 'bg-emerald-600/90 border-emerald-400/50 text-emerald-100' 
              : 'bg-red-600/90 border-red-400/50 text-red-100'
          }`}>
            <div className="text-sm font-bold text-center">
              {gameState.turn === 'player' ? '⚡ SEU TURNO' : '⏳ TURNO DO OPONENTE'}
            </div>
          </div>
        </div>

        {/* Log e Chat - Lateral */}
        <div className="fixed top-16 left-2 w-64 space-y-2 z-20">
          {/* Log do Jogo */}
          <div className="bg-black/70 backdrop-blur-md rounded-xl p-3 border-2 border-gray-400/50 shadow-xl">
            <h3 className="font-bold mb-2 text-gray-100 text-sm">📋 Log da Batalha</h3>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {gameLog.slice(-5).map((entry, index) => (
                <div
                  key={index}
                  className={`text-xs p-1.5 rounded-md ${
                    entry.type === 'info' ? 'bg-blue-800/50 text-blue-200' :
                    entry.type === 'action' ? 'bg-emerald-800/50 text-emerald-200' :
                    'bg-red-800/50 text-red-200'
                  }`}
                >
                  {entry.message}
                </div>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div className="bg-black/70 backdrop-blur-md rounded-xl p-3 border-2 border-gray-400/50 shadow-xl">
            <h3 className="font-bold mb-2 text-gray-100 text-sm">💬 Chat</h3>
            <div className="space-y-1 max-h-24 overflow-y-auto mb-2">
              {chatMessages.slice(-3).map((msg, index) => (
                <div
                  key={index}
                  className={`text-xs p-1.5 rounded-md ${
                    msg.player === 'player' ? 'bg-emerald-800/50 text-emerald-200' :
                    msg.player === 'opponent' ? 'bg-red-800/50 text-red-200' :
                    'bg-gray-800/50 text-gray-200'
                  }`}
                >
                  <span className="font-semibold">
                    {msg.player === 'player' ? 'Você' : 
                     msg.player === 'opponent' ? 'Oponente' : 'Sistema'}:
                  </span> {msg.message}
                </div>
              ))}
            </div>
            <div className="flex space-x-1">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="Digite uma mensagem..."
                className="flex-1 px-2 py-1 bg-black/50 border border-gray-500 rounded-md text-xs text-white focus:border-blue-400 focus:outline-none"
              />
              <button
                onClick={sendChatMessage}
                className="px-2 py-1 bg-blue-600/80 hover:bg-blue-700 rounded-md text-xs transition-colors"
              >
                📤
              </button>
            </div>
          </div>
        </div>

        {/* Botão Sair - Canto Superior Direito */}
        <div className="fixed top-2 right-2 z-20">
          <Link href="/pvp" className="px-3 py-2 bg-red-600/90 hover:bg-red-700 rounded-xl text-white font-bold transition-all border-2 border-red-400/50 backdrop-blur-md shadow-xl text-sm">
            🚪 Sair da Arena
          </Link>
        </div>
      </div>
    </main>
  );
}

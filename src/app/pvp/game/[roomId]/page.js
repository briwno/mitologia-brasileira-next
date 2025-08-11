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
  const getCardData = (cardID) => {
      const card = cardsDatabase.find(c => c.id === cardID);
      if (!card) return null;
      return card;
  };

  // 3 cartas na mão apenas
  const [playerHand, setPlayerHand] = useState([
    getCardData('cur001'), getCardData('cuc001'), getCardData('mul001')
  ]);

  // Uma carta ativa em campo para cada jogador
  const [activeCards, setActiveCards] = useState({
    player: null, // Carta ativa do jogador
    opponent: getCardData('boi001') || null
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

  // --- NOVO: Simulação de baralho e descarte ---
  const [deck, setDeck] = useState([
    getCardData('Boto'),
    getCardData('Cuca'),
    getCardData('Mula sem Cabeça'),
    getCardData('Encourado'),
    getCardData('Curupira'),
    getCardData('Iara'),
    getCardData('Saci-Pererê'),
  ].filter(Boolean));
  const [discardPile, setDiscardPile] = useState([]);
  const [showSkillMenu, setShowSkillMenu] = useState(false);
  const [bonusGlow, setBonusGlow] = useState(false);

  // Compra automática de carta no início do turno do jogador
  useEffect(() => {
    if (gameState.turn === 'player') {
      // Só compra se tiver menos de 3 cartas na mão e houver cartas no deck
      if (playerHand.length < 3 && deck.length > 0) {
        const newCard = deck[0];
        setPlayerHand(prev => [...prev, newCard]);
        setDeck(prev => prev.slice(1));
        // Animação: classe CSS temporária
        setBonusGlow(true);
        setTimeout(() => setBonusGlow(false), 800);
      }
    }
  }, [gameState.turn]);

  // Bônus visual para Encantado na "casa" do campo
  useEffect(() => {
    if (!activeCards.player) return;
    // Exemplo: Curupira na Floresta
    if (
      (currentField === 'floresta' && activeCards.player.name === 'Curupira') ||
      (currentField === 'rio' && activeCards.player.name === 'Iara') ||
      (currentField === 'caatinga' && activeCards.player.name === 'Saci-Pererê') ||
      (currentField === 'pantanal' && activeCards.player.name === 'Boto')
    ) {
      setBonusGlow(true);
    } else {
      setBonusGlow(false);
    }
  }, [currentField, activeCards.player]);

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

    // Se já tem carta ativa, vai para o descarte
    if (activeCards.player) {
      setDiscardPile(prev => [...prev, activeCards.player]);
    }
    setPlayerHand(prev => prev.filter(c => c.id !== card.id));
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
    setGameState(prev => ({ ...prev, actionUsed: true }));
    setGameLog(prev => [...prev, {
      type: 'action',
      message: `Você colocou ${card.name} em campo! (Passiva ativada)`
    }]);
    setSelectedCard(null);
    setShowSkillMenu(false);
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

  // Ao clicar no Encantado ativo, mostra menu de habilidades
  const handleActiveCardClick = () => {
    if (activeCards.player) setShowSkillMenu(v => !v);
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
      
      <div className="relative z-10 h-screen p-2 flex flex-col justify-between">
        {/* Linha superior: Oponente e campo */}
        <div className="flex flex-row justify-between items-start w-full">
          {/* Canto superior esquerdo: Info do oponente */}
          <div className="flex flex-col items-start gap-2 mt-2 ml-2">
            <div className="flex items-center gap-2 bg-black/40 rounded-lg px-3 py-1 shadow-lg">
              <img src="/images/avatars/opponent.png" alt="Avatar Oponente" className="w-10 h-10 rounded-full border-2 border-red-400" />
              <div>
                <div className="font-bold text-red-200">Oponente</div>
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-red-400">❤</span>
                  <span>{gameState.opponentHealth}</span>
                </div>
              </div>
            </div>
          </div>
          {/* Centro superior: Encantado ativo do oponente */}
          <div className="flex flex-col items-center flex-1">
            <div className="relative flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-t from-indigo-900/80 to-indigo-700/60 border-4 border-blue-400 flex items-center justify-center shadow-2xl mb-2 animate-pulse">
                {activeCards.opponent && (
                  <CardImage card={activeCards.opponent} className="w-24 h-24" />
                )}
              </div>
              <div className="text-center text-xs text-blue-200 font-semibold">
                {activeCards.opponent?.name || '---'}
              </div>
            </div>
          </div>
          {/* Lado direito: Pilha de compra */}
          <div className="flex flex-col items-end gap-2 mt-2 mr-2">
            <div className="flex flex-col items-center">
              <div className="w-12 h-16 bg-blue-900/60 border-2 border-blue-400 rounded-lg flex items-center justify-center shadow-lg relative">
                <span className="text-blue-200 font-bold">Compra</span>
                {deck.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-xs rounded-full px-2 py-0.5">{deck.length}</span>
                )}
              </div>
              <span className="text-xs text-blue-300 mt-1">Baralho</span>
            </div>
          </div>
        </div>

        {/* Centro do tabuleiro: Campo e Encantados */}
        <div className="relative flex flex-col items-center justify-center flex-1">
          {/* Indicador de campo/terreno atual */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
            <div className="flex items-center gap-2 bg-black/60 px-4 py-1 rounded-full border-2 border-yellow-400 shadow-lg">
              <span className="text-2xl">{fields[currentField].icon}</span>
              <span className="font-bold text-yellow-100">{fields[currentField].name}</span>
            </div>
            <div className="text-xs text-yellow-200 mt-1">{fields[currentField].effect}</div>
          </div>
          {/* Encantado ativo do jogador (centro inferior) */}
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
            <div
              className={`w-32 h-32 rounded-full bg-gradient-to-b from-amber-900/80 to-yellow-700/60 border-4 border-yellow-400 flex items-center justify-center shadow-2xl mb-2 animate-pulse cursor-pointer transition-all duration-300 ${bonusGlow ? 'ring-4 ring-green-400 shadow-green-400/60' : ''} ${gameState.turn === 'player' ? 'animate-glow' : ''}`}
              onClick={handleActiveCardClick}
              title="Clique para ver habilidades"
            >
              {activeCards.player && (
                <CardImage card={activeCards.player} className="w-24 h-24" />
              )}
            </div>
            <div className="text-center text-xs text-yellow-200 font-semibold">
              {activeCards.player?.name || '---'}
            </div>
            {/* Menu de habilidades ao clicar */}
            {showSkillMenu && activeCards.player && (
              <div className="flex flex-row gap-3 mt-2 animate-fade-in">
                <button
                  className="flex flex-col items-center bg-black/60 px-3 py-2 rounded-lg border-2 border-blue-400 shadow-lg hover:bg-blue-900/80 transition"
                  onClick={useSkill}
                  disabled={gameState.actionUsed || activeCards.player.skillCooldown > 0}
                  title="Habilidade Básica"
                >
                  <span className="text-lg">✨</span>
                  <span className="text-xs mt-1">Skill</span>
                  {activeCards.player.skillCooldown > 0 && (
                    <span className="text-xs text-blue-200">{activeCards.player.skillCooldown}t</span>
                  )}
                </button>
                <button
                  className="flex flex-col items-center bg-black/60 px-3 py-2 rounded-lg border-2 border-yellow-400 shadow-lg hover:bg-yellow-900/80 transition"
                  onClick={useUltimate}
                  disabled={gameState.actionUsed || gameState.playerUltimate < 100}
                  title="Ultimate"
                >
                  <span className="text-lg">💥</span>
                  <span className="text-xs mt-1">Ultimate</span>
                  <span className="text-xs text-yellow-200">{gameState.playerUltimate}/100</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Linha inferior: Info do jogador, mão, habilidades */}
        <div className="flex flex-row justify-between items-end w-full mb-4">
          {/* Canto inferior esquerdo: Info do jogador */}
          <div className="flex flex-col items-start gap-2 ml-2 mb-2">
            <div className={`flex items-center gap-2 bg-black/40 rounded-lg px-3 py-1 shadow-lg ${gameState.turn === 'player' ? 'ring-2 ring-yellow-400' : ''}`}>
              <img src="/images/avatars/player.png" alt="Seu Avatar" className="w-10 h-10 rounded-full border-2 border-yellow-400" />
              <div>
                <div className="font-bold text-yellow-200">Você</div>
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-yellow-400">❤</span>
                  <span>{gameState.playerHealth}</span>
                </div>
              </div>
            </div>
          </div>
          {/* Inferior central: Mão do jogador */}
          <div className="flex flex-row items-end justify-center flex-1 gap-[-2rem]">
            {playerHand.map((card, idx) => (
              <div
                key={card.id}
                className={`relative transition-transform duration-200 hover:z-20 hover:-translate-y-8 cursor-pointer -ml-8 ${selectedCard?.id === card.id ? 'ring-4 ring-yellow-400' : ''} ${bonusGlow && idx === playerHand.length - 1 ? 'animate-card-draw' : ''}`}
                style={{ zIndex: idx + 1 }}
                onClick={() => setSelectedCard(card)}
                onDoubleClick={() => playCard(card)}
              >
                <CardImage card={card} className="w-20 h-28 rounded-lg border-2 border-white/30 shadow-lg" />
              </div>
            ))}
          </div>
          {/* Inferior direito: Habilidades */}
          <div className="flex flex-col items-end gap-2 mr-4 mb-2">
            {activeCards.player && (
              <div className="flex flex-row gap-3">
                {/* Habilidade 1 */}
                <button
                  className="flex flex-col items-center bg-black/60 px-3 py-2 rounded-lg border-2 border-blue-400 shadow-lg hover:bg-blue-900/80 transition"
                  onClick={useSkill}
                  disabled={gameState.actionUsed || activeCards.player.skillCooldown > 0}
                  title="Habilidade Básica"
                >
                  <span className="text-lg">✨</span>
                  <span className="text-xs mt-1">Skill</span>
                  {activeCards.player.skillCooldown > 0 && (
                    <span className="text-xs text-blue-200">{activeCards.player.skillCooldown}t</span>
                  )}
                </button>
                {/* Habilidade 2 (Ultimate) */}
                <button
                  className="flex flex-col items-center bg-black/60 px-3 py-2 rounded-lg border-2 border-yellow-400 shadow-lg hover:bg-yellow-900/80 transition"
                  onClick={useUltimate}
                  disabled={gameState.actionUsed || gameState.playerUltimate < 100}
                  title="Ultimate"
                >
                  <span className="text-lg">💥</span>
                  <span className="text-xs mt-1">Ultimate</span>
                  <span className="text-xs text-yellow-200">{gameState.playerUltimate}/100</span>
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Lado esquerdo: Pilha de descarte */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="w-12 h-16 bg-gray-800/60 border-2 border-gray-400 rounded-lg flex items-center justify-center shadow-lg relative">
            <span className="text-gray-200 font-bold">Descarte</span>
            {discardPile.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-xs rounded-full px-2 py-0.5">{discardPile.length}</span>
            )}
          </div>
          <span className="text-xs text-gray-300 mt-1">Desencanto</span>
        </div>
        {/* Indicador de turno (brilho no avatar do jogador ativo) já incluso nas classes dos avatares) */}
      </div>
    </main>
  );
}

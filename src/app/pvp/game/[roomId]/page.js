// src/app/pvp/game/[roomId]/page.js
"use client";

import Link from 'next/link';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { cardsDatabase } from '../../../../data/cardsDatabase';
import CardImage from '../../../../components/Card/CardImage';
import BoardBackground from '../../../../components/Board/BoardBackground';
import { 
  PlayerInfo, 
  FieldIndicator, 
  CardInField, 
  Hand, 
  DeckPile, 
  SkillButtons 
} from '../../../../components/Game';

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

  // Função para buscar carta por id e garantir todos os campos necessários
  function getCardData(cardID) {
    if (!cardID) return null;
    const card = cardsDatabase.find(c => c.id === cardID);
    if (!card) return null;
    // Garante que abilities sempre existe e tem basic/ultimate/passive
    return {
      ...card,
      abilities: {
        basic: card.abilities?.basic || null,
        ultimate: card.abilities?.ultimate || null,
        passive: card.abilities?.passive || null
      }
    };
  }

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
      bgImage: '/images/backgrounds/forest.jpg',
      effect: 'Curupira +2 Defesa'
    },
    rio: { 
      name: 'Correnteza do Rio', 
      icon: '🌊', 
      bg: 'from-blue-800/40 to-blue-900/40',
      bgImage: '/images/backgrounds/river.jpg',
      effect: 'Iara +2 Ataque'
    },
    caatinga: { 
      name: 'Caatinga Seca', 
      icon: '🌵', 
      bg: 'from-yellow-800/40 to-orange-900/40',
      bgImage: '/images/backgrounds/caatinga.jpg',
      effect: 'Saci +1 Velocidade'
    },
    pantanal: { 
      name: 'Pântano Sombrio', 
      icon: '🐊', 
      bg: 'from-purple-800/40 to-gray-900/40',
      bgImage: '/images/backgrounds/swamp.jpg',
      effect: 'Boto +3 Vida'
    },
    lua: { 
      name: 'Lua Cheia Ascendente', 
      icon: '🌕', 
      bg: 'from-indigo-800/40 to-purple-900/40',
      bgImage: '/images/backgrounds/moon.jpg',
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
  }, [gameState.turn, deck, playerHand.length]);

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

  // Novo: animação de transição de campo
  const [fieldTransitioning, setFieldTransitioning] = useState(false);
  const fieldBgRef = useRef(null);

  // Função para mudar campo a cada 2 turnos, agora com animação
  const changeField = useCallback(() => {
    setFieldTransitioning(true);
    setTimeout(() => {
      const fieldKeys = Object.keys(fields);
      const currentIndex = fieldKeys.indexOf(currentField);
      const nextIndex = (currentIndex + 1) % fieldKeys.length;
      setCurrentField(fieldKeys[nextIndex]);
      setFieldChangeCountdown(2);
      setFieldTransitioning(false);
      setGameLog(prev => [...prev, {
        type: 'info',
        message: `⚡ Campo mudou para: ${fields[fieldKeys[nextIndex]].name}!`
      }]);
    }, 900); // tempo da transição
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
    const skill = card.abilities?.basic; // Habilidade básica como skill

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
    const ultimate = card.abilities?.ultimate || card.abilities?.basic; // Ultimate é a habilidade ultimate, se não tiver, usa a básica

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

    if (action === 'skill' && activeCards.opponent.abilities?.basic) {
      // Oponente usa habilidade
      const skill = activeCards.opponent.abilities.basic;

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

  // Painel de debug
  const [debugOpen, setDebugOpen] = useState(false);
  const [debugState, setDebugState] = useState({
    playerHP: gameState.playerHealth,
    opponentHP: gameState.opponentHealth,
    field: currentField,
    playerActive: activeCards.player?.id || '',
    opponentActive: activeCards.opponent?.id || '',
    hand: playerHand.map(c => c.id).join(',')
  });

  // Atualiza debugState ao mudar o jogo
  useEffect(() => {
    setDebugState({
      playerHP: gameState.playerHealth,
      opponentHP: gameState.opponentHealth,
      field: currentField,
      playerActive: activeCards.player?.id || '',
      opponentActive: activeCards.opponent?.id || '',
      hand: playerHand.map(c => c.id).join(',')
    });
  }, [gameState, currentField, activeCards, playerHand]);

  function handleDebugChange(e) {
    const { name, value } = e.target;
    setDebugState(prev => ({ ...prev, [name]: value }));
  }

  function applyDebugState() {
    setGameState(prev => ({
      ...prev,
      playerHealth: Number(debugState.playerHP),
      opponentHealth: Number(debugState.opponentHP)
    }));
    setCurrentField(debugState.field);
    setActiveCards(prev => ({
      ...prev,
      player: getCardData(debugState.playerActive),
      opponent: getCardData(debugState.opponentActive)
    }));
    setPlayerHand(debugState.hand.split(',').map(id => getCardData(id)).filter(Boolean));
  }

  function debugPassTurn() {
    endTurn();
  }

  // Função para obter a imagem de fundo do campo atual
  const getFieldBgImage = () => {
    return fields[currentField]?.bgImage || '/images/backgrounds/forest.jpg';
  };

  return (
    <BoardBackground bgImage={getFieldBgImage()}>
      {/* Botão flutuante de debug */}
      <button
        onClick={() => setDebugOpen(v => !v)}
        style={{ position: 'fixed', top: 16, right: 16, zIndex: 1000 }}
        className="bg-pink-700 text-white px-3 py-2 rounded-full shadow-lg hover:bg-pink-800 transition"
      >
        {debugOpen ? 'Fechar Debug' : 'Debug'}
      </button>
      {debugOpen && (
        <div className="fixed top-20 right-4 z-[1001] bg-black/90 text-white p-4 rounded-xl shadow-2xl w-80 border-2 border-pink-600 flex flex-col gap-2 animate-fade-in">
          <div className="font-bold text-lg mb-2">Painel de Debug</div>
          <label className="flex flex-col text-xs mb-1">HP Jogador
            <input type="number" name="playerHP" value={debugState.playerHP} onChange={handleDebugChange} className="bg-gray-800 rounded px-2 py-1 mt-1" />
          </label>
          <label className="flex flex-col text-xs mb-1">HP Oponente
            <input type="number" name="opponentHP" value={debugState.opponentHP} onChange={handleDebugChange} className="bg-gray-800 rounded px-2 py-1 mt-1" />
          </label>
          <label className="flex flex-col text-xs mb-1">Campo/Terreno
            <select name="field" value={debugState.field} onChange={handleDebugChange} className="bg-gray-800 rounded px-2 py-1 mt-1">
              {Object.keys(fields).map(f => (
                <option key={f} value={f}>{fields[f].name}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col text-xs mb-1">Carta Ativa Jogador (id)
            <input type="text" name="playerActive" value={debugState.playerActive} onChange={handleDebugChange} className="bg-gray-800 rounded px-2 py-1 mt-1" />
          </label>
          <label className="flex flex-col text-xs mb-1">Carta Ativa Oponente (id)
            <input type="text" name="opponentActive" value={debugState.opponentActive} onChange={handleDebugChange} className="bg-gray-800 rounded px-2 py-1 mt-1" />
          </label>
          <label className="flex flex-col text-xs mb-1">Cartas na Mão (ids separados por vírgula)
            <input type="text" name="hand" value={debugState.hand} onChange={handleDebugChange} className="bg-gray-800 rounded px-2 py-1 mt-1" />
          </label>
          <div className="flex gap-2 mt-2">
            <button onClick={applyDebugState} className="bg-green-700 px-3 py-1 rounded hover:bg-green-800">Aplicar</button>
            <button onClick={debugPassTurn} className="bg-blue-700 px-3 py-1 rounded hover:bg-blue-800">Passar Turno</button>
          </div>
        </div>
      )}

      <main className={`min-h-screen text-white relative overflow-hidden bg-gradient-to-br ${fields[currentField].bg}`}>
        {/* Fundo animado do campo */}
        <div ref={fieldBgRef} className={`absolute inset-0 z-0 transition-all duration-1000 ${fieldTransitioning ? 'opacity-0 scale-105 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
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
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            {currentField === 'floresta' && (
              <div className="text-7xl absolute top-10 left-10 animate-pulse-slow">🌲</div>
            )}
            {currentField === 'rio' && (
              <div className="text-7xl absolute top-20 right-20 animate-bounce">🌊</div>
            )}
            {currentField === 'caatinga' && (
              <div className="text-7xl absolute bottom-20 left-20 animate-pulse">🌵</div>
            )}
            {currentField === 'pantanal' && (
              <div className="text-7xl absolute top-1/3 right-10 animate-bounce">🐊</div>
            )}
            {currentField === 'lua' && (
              <div className="text-9xl absolute top-10 right-1/3 animate-pulse">🌕</div>
            )}
          </div>
        </div>

        <div className="relative z-10 h-screen p-2 flex flex-col justify-between">
          {/* Linha superior: Oponente e campo */}
          <div className="flex flex-row justify-between items-start w-full">
            {/* Canto superior esquerdo: Info do oponente */}
            <div className="flex flex-col items-start gap-2 mt-2 ml-2">
              <PlayerInfo 
                avatar="/images/avatars/opponent.png" 
                name="Oponente" 
                hp={gameState.opponentHealth} 
                color="red" 
                isActive={gameState.turn === 'opponent'} 
              />
            </div>
            
            {/* Centro superior: Encantado ativo do oponente */}
            <CardInField
              card={activeCards.opponent}
              position="opponent"
            />
            
            {/* Lado direito: Pilha de compra */}
            <DeckPile 
              count={deck.length}
              type="deck"
              position="right"
            />
          </div>

          {/* Centro do tabuleiro: Campo e Encantados */}
          <div className="relative flex flex-col items-center justify-center flex-1">
            {/* Indicador de campo/terreno atual */}
            <FieldIndicator 
              currentField={currentField}
              fields={fields}
              fieldTransitioning={fieldTransitioning}
            />
            
            {/* Encantado ativo do jogador (centro inferior) */}
            <CardInField
              card={activeCards.player}
              position="player"
              bonusGlow={bonusGlow}
              isActive={gameState.turn === 'player'}
              onClick={handleActiveCardClick}
              showMenu={showSkillMenu}
              onSkillClick={useSkill}
              onUltimateClick={useUltimate}
              onEndTurnClick={endTurn}
              skillCooldown={activeCards.player?.skillCooldown || 0}
              ultimateCharge={gameState.playerUltimate}
              actionUsed={gameState.actionUsed}
            />
          </div>

          {/* Linha inferior: Info do jogador, mão, habilidades */}
          <div className="flex flex-row justify-between items-end w-full mb-4">
            {/* Canto inferior esquerdo: Info do jogador */}
            <div className="flex flex-col items-start gap-2 ml-2 mb-2">
              <PlayerInfo 
                avatar="/images/avatars/player.jpg" 
                name="Você" 
                hp={gameState.playerHealth} 
                color="yellow" 
                isActive={gameState.turn === 'player'} 
              />
            </div>
            
            {/* Inferior central: Mão do jogador */}
            <Hand
              cards={playerHand}
              selectedCard={selectedCard}
              onCardSelect={setSelectedCard}
              onCardPlay={playCard}
              bonusGlow={bonusGlow}
              newCardIndex={playerHand.length - 1}
            />
            
            {/* Inferior direito: Habilidades */}
            <div className="flex flex-col items-end gap-2 mr-4 mb-2">
              {activeCards.player && (
                <SkillButtons
                  card={activeCards.player}
                  onSkillClick={useSkill}
                  onUltimateClick={useUltimate}
                  skillCooldown={activeCards.player.skillCooldown || 0}
                  ultimateCharge={gameState.playerUltimate}
                  actionUsed={gameState.actionUsed}
                  layout="horizontal"
                />
              )}
            </div>
          </div>
          {/* Lado esquerdo: Pilha de descarte */}
          <DeckPile 
            count={discardPile.length}
            type="discard"
            position="left"
          />
          {/* Indicador de turno (brilho no avatar do jogador ativo) já incluso nas classes dos avatares) */}
        </div>
      </main>
    </BoardBackground>
  );
}

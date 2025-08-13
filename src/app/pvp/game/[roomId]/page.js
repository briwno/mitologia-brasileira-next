// src/app/pvp/game/[roomId]/page_new.js
"use client";

import Link from 'next/link';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { cardsDatabase } from '../../../../data/cardsDatabase';
import CardImage from '../../../../components/Card/CardImage';
import {
  PlayerInfo,
  FieldIndicator,
  CardInField,
  Hand,
  DeckPile,
  SkillButtons,
  ActiveZone,
  BenchZone,
  Playmat,
  GameZones,
  PlayerHand,
  PlayerHUD,
  EndTurnButton
} from '../../../../components/Game';

export default function GameRoom({ params }) {
  const [gameState, setGameState] = useState({
    turn: 'player',
    playerHealth: 100,
    opponentHealth: 100,
    playerUltimate: 0,
    opponentUltimate: 0,
    turnNumber: 1,
    actionUsed: false
  });

  // Função para buscar carta por id e garantir todos os campos necessários
  function getCardData(cardID) {
    if (!cardID) return null;
    const card = cardsDatabase.find(c => c.id === cardID);
    if (!card) return null;
    return {
      ...card,
      abilities: {
        basic: card.abilities?.basic || null,
        ultimate: card.abilities?.ultimate || null,
        passive: card.abilities?.passive || null
      }
    };
  }

  // Nova estrutura de estado para o layout TCG
  const [playerBench, setPlayerBench] = useState([]);
  const [opponentBench, setOpponentBench] = useState([
    getCardData('sac001'), 
    getCardData('cur001')
  ]);
  
  const [playerHand, setPlayerHand] = useState([
    getCardData('cur001'), getCardData('cuc001'), getCardData('mul001')
  ]);

  const [activeCards, setActiveCards] = useState({
    player: null,
    opponent: getCardData('boi001') || null
  });

  const [deck, setDeck] = useState(Array(25).fill().map((_, i) => getCardData('mul001')));
  const [discardPile, setDiscardPile] = useState([]);

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

  const [selectedCard, setSelectedCard] = useState(null);
  const [showSkillMenu, setShowSkillMenu] = useState(false);
  const [bonusGlow, setBonusGlow] = useState(false);
  const [skillCooldown, setSkillCooldown] = useState(0);

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
  const playCard = useCallback((card) => {
    if (!card || gameState.turn !== 'player' || gameState.actionUsed) return;
    setPlayerHand(prev => prev.filter(c => c?.id !== card.id));
    setDiscardPile(prev => activeCards.player ? [...prev, activeCards.player] : prev);
    setActiveCards(prev => ({ ...prev, player: card }));
    setGameState(prev => ({ ...prev, actionUsed: true }));
    setSelectedCard(null);
  }, [gameState.turn, gameState.actionUsed, activeCards.player]);

  const useSkill = useCallback(() => {
    if (gameState.turn !== 'player' || gameState.actionUsed || skillCooldown > 0) return;
    
    setSkillCooldown(2);
    setGameState(prev => ({ 
      ...prev, 
      actionUsed: true,
      playerUltimate: Math.min(100, prev.playerUltimate + 20)
    }));
    setShowSkillMenu(false);
  }, [gameState.turn, gameState.actionUsed, skillCooldown]);

  const useUltimate = useCallback(() => {
    if (gameState.turn !== 'player' || gameState.actionUsed || gameState.playerUltimate < 100) return;
    
    setGameState(prev => ({ 
      ...prev, 
      actionUsed: true,
      playerUltimate: 0
    }));
    setShowSkillMenu(false);
  }, [gameState.turn, gameState.actionUsed, gameState.playerUltimate]);

  const endTurn = useCallback(() => {
    if (gameState.turn !== 'player') return;

    // Reset skill cooldown
    if (skillCooldown > 0) {
      setSkillCooldown(prev => Math.max(0, prev - 1));
    }

    // Mudança de campo a cada 2 turnos
    const newCountdown = fieldChangeCountdown - 1;
    if (newCountdown === 0) {
      setFieldTransitioning(true);
      setTimeout(() => {
        const fieldKeys = Object.keys(fields);
        const currentIndex = fieldKeys.indexOf(currentField);
        const nextIndex = (currentIndex + 1) % fieldKeys.length;
        setCurrentField(fieldKeys[nextIndex]);
        setFieldChangeCountdown(2);
        setFieldTransitioning(false);
      }, 500);
    } else {
      setFieldChangeCountdown(newCountdown);
    }

    // Próximo turno
    setGameState(prev => ({
      ...prev,
      turn: 'opponent',
      turnNumber: prev.turnNumber + 1,
      actionUsed: false,
      playerUltimate: Math.min(100, prev.playerUltimate + 10)
    }));

    // Simular turno do oponente
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        turn: 'player',
        opponentUltimate: Math.min(100, prev.opponentUltimate + 10)
      }));
    }, 2000);
  }, [gameState.turn, skillCooldown, fieldChangeCountdown, fields, currentField]);

  // Funções de interação com pilhas
  const handlePlayerDeckClick = useCallback(() => {
    if (gameState.turn !== 'player' || deck.length === 0) return;
    
    // Comprar carta (só jogador pode clicar no próprio deck)
    const drawnCard = deck[0];
    if (drawnCard) {
      setPlayerHand(prev => [...prev, drawnCard]);
      setDeck(prev => prev.slice(1));
      console.log('Carta comprada:', drawnCard.name);
    }
  }, [gameState.turn, deck]);

  const handlePlayerDiscardClick = useCallback(() => {
    if (gameState.turn !== 'player' || discardPile.length === 0) return;
    
    // Ver pilha de descarte (só jogador pode clicar na própria pilha)
    console.log('Visualizando pilha de descarte:', discardPile);
  }, [gameState.turn, discardPile]);

  const handleOpponentZoneClick = useCallback(() => {
    // Oponente não pode ser clicado
    console.log('Não é possível interagir com as pilhas do oponente');
  }, []);

  // Função para jogar carta no campo ativo
  const handleActiveZoneDrop = useCallback((e) => {
    e.preventDefault();
    const dragData = e.dataTransfer.getData('text/plain');
    
    if (!dragData) return;
    
    try {
      const { card } = JSON.parse(dragData);
      if (card && gameState.turn === 'player' && !gameState.actionUsed && !activeCards.player) {
        playCard(card);
      }
    } catch (error) {
      console.error('Erro ao processar drop:', error);
    }
  }, [gameState.turn, gameState.actionUsed, activeCards.player, playCard]);

  const handleActiveZoneDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  return (
    <div className="h-screen bg-gradient-to-br from-[#09131d] via-[#0c1f31] to-[#09131d] text-white overflow-hidden relative">
      <Playmat />
      {/* Layout baseado em grade rigorosa para alinhamento perfeito */}
      <div
        className="
          relative h-full
          grid
          grid-cols-[6rem,1fr,6rem]
          grid-rows-[1fr,0.8fr,1fr]
          items-stretch
        "
      >
        {/* HUDs com margens simétricas */}
        <div className="absolute top-4 left-4 z-30">
          <PlayerHUD player={opponentData} position="top-left" />
        </div>
        <div className="absolute bottom-4 right-4 z-30">
          <PlayerHUD player={playerData} position="bottom-right" />
        </div>

        {/* Sidebars: DECK/DESCARTE centralizados verticalmente e espelhados no eixo Y */}
  <div className="col-start-1 row-start-1 row-span-3 place-self-center z-20 ml-8">
          <div className="w-24 flex flex-col items-center gap-5">
            <GameZones
              deckCount={deck.length}
              discardCount={discardPile.length}
              position="player"
              topDiscardCard={discardPile[discardPile.length - 1]}
              onDeckClick={handlePlayerDeckClick}
              onDiscardClick={handlePlayerDiscardClick}
            />
          </div>
        </div>

  <div className="col-start-3 row-start-1 row-span-3 place-self-center z-20 mr-8">
          <div className="w-24 flex flex-col items-center gap-5">
            <GameZones
              deckCount={20}
              discardCount={3}
              position="opponent"
              onDeckClick={handleOpponentZoneClick}
              onDiscardClick={handleOpponentZoneClick}
            />
          </div>
        </div>

        {/* Coluna Central - topo: Oponente (Banco acima, Ativo abaixo) */}
        <div className="col-start-2 row-start-1 flex flex-col items-center justify-end gap-4 px-4">
          <div className="w-full max-w-5xl flex flex-col items-center gap-3">
            <div className="w-full flex justify-center">
              <BenchZone
                cards={opponentBench}
                position="opponent"
                onCardClick={(card, index) => console.log('Opponent bench card clicked:', card)}
              />
            </div>
            <div className="w-full flex justify-center">
              <div className="min-h-44 min-w-[18rem] flex items-center justify-center">
                <ActiveZone
                  card={activeCards.opponent}
                  position="opponent"
                  onCardClick={() => console.log('Opponent active card clicked')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Linha do meio: espaçador para respiro/menus */}
        <div className="col-start-2 row-start-2 pointer-events-none" />

        {/* Coluna Central - base: Jogador (Ativo acima, Banco abaixo) */}
        <div className="col-start-2 row-start-3 flex flex-col items-center justify-start gap-4 px-4">
          <div className="w-full max-w-5xl flex flex-col items-center gap-3">
            <div className="w-full flex justify-center relative z-20">
              <div className="min-h-48 min-w-[20rem] flex items-center justify-center">
                <ActiveZone
                  card={activeCards.player}
                  position="player"
                  isPlayerTurn={gameState.turn === 'player'}
                  showMenu={showSkillMenu && activeCards.player}
                  onCardClick={() => setShowSkillMenu(!showSkillMenu)}
                  onSkillClick={useSkill}
                  onUltimateClick={useUltimate}
                  skillCooldown={skillCooldown}
                  ultimateCharge={gameState.playerUltimate}
                  actionUsed={gameState.actionUsed}
                  onDrop={handleActiveZoneDrop}
                  onDragOver={handleActiveZoneDragOver}
                />
              </div>
            </div>
            <div className="w-full flex justify-center">
              <BenchZone
                cards={playerBench}
                position="player"
                onCardClick={(card, index) => {
                  if (activeCards.player) {
                    const newBench = [...playerBench];
                    newBench[index] = activeCards.player;
                    setPlayerBench(newBench);
                    setActiveCards(prev => ({ ...prev, player: card }));
                  }
                }}
              />
            </div>
          </div>
        </div>

    {/* Mão do Jogador - fixa e centralizada */}
  <div className="absolute bottom-0 left-0 right-0 z-30">
          <PlayerHand
            cards={playerHand}
            selectedCard={selectedCard}
            onCardSelect={setSelectedCard}
            onCardPlay={playCard}
            bonusGlow={bonusGlow}
          />
        </div>

        {/* Botão de Encerrar Turno - central no eixo X com mais respiro */}
  <div className="absolute bottom-[15.5rem] left-1/2 transform -translate-x-1/2 z-40">
          <EndTurnButton
            onEndTurn={endTurn}
            disabled={gameState.actionUsed}
            isPlayerTurn={gameState.turn === 'player'}
          />
        </div>

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

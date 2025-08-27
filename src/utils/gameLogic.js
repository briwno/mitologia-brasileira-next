// src/utils/gameLogic.js
import { GAME_CONSTANTS } from './constants';

export class GameEngine {
  constructor(players) {
    this.players = players;
    this.currentPlayerIndex = 0;
    this.turn = 1;
    this.phase = GAME_CONSTANTS.GAME_PHASES?.DRAW || 'draw';
    this.gameLog = [];
  }

  // Inicializar jogo
  initializeGame() {
    this.players.forEach((player, index) => {
      player.health = GAME_CONSTANTS.INITIAL_HEALTH;
      player.mana = GAME_CONSTANTS.INITIAL_MANA;
      player.hand = this.drawInitialHand(player.deck);
      player.field = [];
      player.graveyard = [];
    });

    this.addToLog('Jogo iniciado!', 'info');
    return this.getGameState();
  }

  // Sacar mão inicial
  drawInitialHand(deck) {
  const baralhoEmbaralhado = this.shuffleDeck([...deck]);
  return baralhoEmbaralhado.splice(0, 5); // 5 cartas iniciais
  }

  // Embaralhar deck
  shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Comprar carta
  drawCard(playerIndex) {
    const player = this.players[playerIndex];
    
    if (player.deck.length === 0) {
      // Dano por fadiga
      player.health -= this.turn;
      this.addToLog(`${player.name} sofreu ${this.turn} de dano por fadiga!`, 'warning');
      return null;
    }

    if (player.hand.length >= GAME_CONSTANTS.MAX_HAND_SIZE) {
      // Carta é descartada
      const cartaDescartada = player.deck.shift();
      this.addToLog(`${player.name} descartou ${cartaDescartada.name} (mão cheia)`, 'info');
      return cartaDescartada;
    }

    const cartaComprada = player.deck.shift();
    player.hand.push(cartaComprada);
    this.addToLog(`${player.name} comprou uma carta`, 'info');
    return cartaComprada;
  }

  // Jogar carta
  playCard(playerIndex, cardIndex, target = null) {
    const player = this.players[playerIndex];
    const card = player.hand[cardIndex];

    // Verificações
    if (!this.canPlayCard(playerIndex, card)) {
      return { success: false, error: 'Não é possível jogar esta carta' };
    }

  // Gastar mana (cartas não têm mais custo; custos estão nas habilidades)
  player.mana -= (card.cost || 0);

    // Remover carta da mão
    player.hand.splice(cardIndex, 1);

    // Aplicar efeito da carta
    const result = this.applyCardEffect(card, playerIndex, target);

    this.addToLog(`${player.name} jogou ${card.name}`, 'action');

    return { success: true, result };
  }

  // Verificar se pode jogar carta
  canPlayCard(playerIndex, card) {
    const player = this.players[playerIndex];
    
    // Verificar turno
    if (playerIndex !== this.currentPlayerIndex) {
      return false;
    }

    // Verificar mana
  // Cartas não têm mais custo; manter compat por segurança
  if (player.mana < (card.cost || 0)) {
      return false;
    }

    // Verificar fase
    if (this.phase === 'combat' && card.type === 'creature') {
      return false;
    }

    return true;
  }

  // Aplicar efeito da carta
  applyCardEffect(card, playerIndex, target) {
    const player = this.players[playerIndex];

    switch (card.type || 'creature') {
      case 'creature':
        // Adicionar criatura ao campo
  const criatura = {
          ...card,
          health: card.defense,
          maxHealth: card.defense,
          canAttack: false, // Summoning sickness
          effects: []
        };
  player.field.push(criatura);
        break;

      case 'spell':
        // Aplicar efeito do feitiço
        this.applySpellEffect(card, playerIndex, target);
        // Feitiços vão para o cemitério
        player.graveyard.push(card);
        break;

      default:
        // Tratar como criatura por padrão
  const criaturaPadrao = {
          ...card,
          health: card.defense,
          maxHealth: card.defense,
          canAttack: false,
          effects: []
        };
  player.field.push(criaturaPadrao);
    }

    return { card, target };
  }

  // Aplicar efeito de feitiço
  applySpellEffect(spell, playerIndex, target) {
    const player = this.players[playerIndex];
    const opponent = this.players[1 - playerIndex];

    // Implementar efeitos específicos baseados na habilidade
    switch (spell.ability) {
      case 'Canto Hipnótico':
        if (Math.random() < 0.3) { // 30% de chance
          // Pular próximo turno do oponente (simplificado)
          this.addToLog(`${opponent.name} perdeu o próximo turno!`, 'special');
        }
        break;

      case 'Fogo Protetor':
        // Causar dano contínuo
        opponent.health -= 3;
        this.addToLog(`${opponent.name} sofreu 3 de dano de fogo!`, 'damage');
        break;

      default:
        this.addToLog(`Efeito de ${spell.name} aplicado`, 'info');
    }
  }

  // Atacar com criatura
  attackWithCreature(playerIndex, creatureIndex, targetType, targetIndex = null) {
    const player = this.players[playerIndex];
    const opponent = this.players[1 - playerIndex];
    const criatura = player.field[creatureIndex];

    if (!this.canAttack(playerIndex, creatureIndex)) {
      return { success: false, error: 'Criatura não pode atacar' };
    }

    if (targetType === 'player') {
      // Atacar jogador diretamente
      opponent.health -= criatura.attack;
      this.addToLog(`${criatura.name} atacou ${opponent.name} causando ${criatura.attack} de dano!`, 'damage');
    } else if (targetType === 'creature') {
      // Atacar criatura
      const criaturaAlvo = opponent.field[targetIndex];
      
      // Aplicar dano
      criaturaAlvo.health -= criatura.attack;
      criatura.health -= criaturaAlvo.attack;

      this.addToLog(`${criatura.name} atacou ${criaturaAlvo.name}!`, 'combat');

      // Remover criaturas mortas
      if (criaturaAlvo.health <= 0) {
        opponent.field.splice(targetIndex, 1);
        opponent.graveyard.push(criaturaAlvo);
        this.addToLog(`${criaturaAlvo.name} foi destruída!`, 'death');
      }

      if (criatura.health <= 0) {
        player.field.splice(creatureIndex, 1);
        player.graveyard.push(criatura);
        this.addToLog(`${criatura.name} foi destruída!`, 'death');
      }
    }

    // Marcar criatura como tendo atacado
    if (criatura.health > 0) {
      criatura.canAttack = false;
    }

    return { success: true };
  }

  // Verificar se criatura pode atacar
  canAttack(playerIndex, creatureIndex) {
    const player = this.players[playerIndex];
    const creature = player.field[creatureIndex];

    // Verificar turno
    if (playerIndex !== this.currentPlayerIndex) {
      return false;
    }

    // Verificar fase
    if (this.phase !== 'combat') {
      return false;
    }

    // Verificar se pode atacar
    if (!creature.canAttack) {
      return false;
    }

    return true;
  }

  // Finalizar turno
  endTurn() {
    const currentPlayer = this.players[this.currentPlayerIndex];

    // Reset de criaturas
    currentPlayer.field.forEach(creature => {
      creature.canAttack = true;
    });

    // Próximo jogador
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    
    if (this.currentPlayerIndex === 0) {
      this.turn++;
    }

    // Novo turno
    this.startTurn();

    return this.getGameState();
  }

  // Iniciar turno
  startTurn() {
    const currentPlayer = this.players[this.currentPlayerIndex];

    // Aumentar mana
    currentPlayer.mana = Math.min(GAME_CONSTANTS.MAX_MANA, this.turn);

    // Comprar carta
    this.drawCard(this.currentPlayerIndex);

    // Mudar para fase de draw
    this.phase = 'draw';

    this.addToLog(`Turno ${this.turn} - ${currentPlayer.name}`, 'turn');
  }

  // Verificar condições de vitória
  checkWinCondition() {
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i].health <= 0) {
        const winner = this.players[1 - i];
        return { gameEnded: true, winner, reason: 'health' };
      }
    }

    return { gameEnded: false };
  }

  // Obter estado do jogo
  getGameState() {
    return {
      players: this.players.map(p => ({ ...p })),
      currentPlayerIndex: this.currentPlayerIndex,
      turn: this.turn,
      phase: this.phase,
      gameLog: [...this.gameLog],
      winCondition: this.checkWinCondition()
    };
  }

  // Adicionar ao log
  addToLog(message, type = 'info') {
    this.gameLog.push({
      message,
      type,
      timestamp: Date.now(),
      turn: this.turn
    });

    // Manter apenas últimas 50 entradas
    if (this.gameLog.length > 50) {
      this.gameLog = this.gameLog.slice(-50);
    }
  }
}

// Utilitários de deck
export const DeckUtils = {
  // Validar deck
  validateDeck(cards) {
    const errors = [];

    if (cards.length < GAME_CONSTANTS.MIN_DECK_SIZE) {
      errors.push(`Deck deve ter pelo menos ${GAME_CONSTANTS.MIN_DECK_SIZE} cartas`);
    }

    if (cards.length > GAME_CONSTANTS.MAX_DECK_SIZE) {
      errors.push(`Deck não pode ter mais de ${GAME_CONSTANTS.MAX_DECK_SIZE} cartas`);
    }

    // Verificar limite de cópias
    const cardCounts = {};
    cards.forEach(card => {
      cardCounts[card.id] = (cardCounts[card.id] || 0) + 1;
    });

    for (const [cardId, count] of Object.entries(cardCounts)) {
      if (count > GAME_CONSTANTS.MAX_COPIES_PER_CARD) {
        errors.push(`Máximo ${GAME_CONSTANTS.MAX_COPIES_PER_CARD} cópias da mesma carta`);
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Calcular estatísticas do deck
  calculateDeckStats(cards) {
  // Compat: sem custo por carta, agregados baseados em ataque
  const totalCost = cards.reduce((sum, card) => sum + (card.cost || 0), 0);
  const averageCost = cards.length ? (totalCost / cards.length) : 0;

    const costDistribution = {};
    cards.forEach(card => {
  const c = card.cost || 0;
  costDistribution[c] = (costDistribution[c] || 0) + 1;
    });

    const categoryDistribution = {};
    cards.forEach(card => {
      categoryDistribution[card.category] = (categoryDistribution[card.category] || 0) + 1;
    });

    return {
      totalCards: cards.length,
      averageCost: Math.round(averageCost * 10) / 10,
      costDistribution,
      categoryDistribution,
      uniqueCards: new Set(cards.map(c => c.id)).size
    };
  }
};

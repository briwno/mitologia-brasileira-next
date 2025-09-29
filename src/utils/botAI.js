export class BotAI {
  constructor(difficulty = 'normal', personality = 'balanced') {
    this.difficulty = difficulty;
    this.personality = personality;
  }

  generateBotDeck(availableCards) {
    if (!availableCards || availableCards.length === 0) {
      return [];
    }

    const lendas = availableCards.filter(card => {
      const category = (card.category || card.categoria || '').toLowerCase();
      const type = (card.type || card.tipo || '').toLowerCase();
      return category === 'lenda' || type === 'lenda' || category === 'legend' || type === 'legend';
    });
    
    const itens = availableCards.filter(card => {
      const category = (card.category || card.categoria || '').toLowerCase();
      const type = (card.type || card.tipo || '').toLowerCase();
      return category === 'item' || type === 'item' || category === 'itens' || type === 'itens';
    });

    let selectedLendas, selectedItens;

    switch (this.difficulty) {
      case 'easy':
        selectedLendas = lendas.sort((a, b) => (a.attack || 0) - (b.attack || 0)).slice(0, 5);
        selectedItens = itens.slice(0, 20);
        break;
      case 'hard':
        selectedLendas = lendas.sort((a, b) => (b.attack || 0) - (a.attack || 0)).slice(0, 5);
        selectedItens = itens.sort((a, b) => (b.rarity || '').localeCompare(a.rarity || '')).slice(0, 20);
        break;
      default:
        selectedLendas = this.shuffleArray([...lendas]).slice(0, 5);
        selectedItens = this.shuffleArray([...itens]).slice(0, 20);
    }

    // Garantir que temos cartas suficientes
    while (selectedLendas.length < 5 && lendas.length > 0) {
      const remaining = lendas.filter(l => !selectedLendas.includes(l));
      if (remaining.length === 0) break;
      selectedLendas.push(remaining[0]);
    }

    while (selectedItens.length < 20 && itens.length > 0) {
      const remaining = itens.filter(i => !selectedItens.includes(i));
      if (remaining.length === 0) break;
      selectedItens.push(remaining[0]);
    }

    return [...selectedLendas, ...selectedItens];
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  decideAction(gameState, botPlayerIndex) {
    if (!gameState?.jogadores?.[botPlayerIndex]) {
      return { type: 'pass' };
    }

    const possibleActions = this.getPossibleActions(gameState, botPlayerIndex);
    if (possibleActions.length === 0) {
      return { type: 'pass' };
    }

    return this.selectBestAction(possibleActions, gameState, botPlayerIndex);
  }

  getPossibleActions(gameState, botPlayerIndex) {
    const actions = [];
    const botPlayer = gameState.jogadores[botPlayerIndex];
    const currentPhase = gameState.fase;

    switch (currentPhase) {
      case 'INICIO':
        if (botPlayer.zonas?.BANCO_LENDAS?.length > 0) {
          botPlayer.zonas.BANCO_LENDAS.forEach((lenda, index) => {
            if (lenda && !lenda.cooldown) {
              actions.push({
                type: 'trocarLendaAtiva',
                targetIndex: index,
                priority: this.calculateCardPriority(lenda)
              });
            }
          });
        }
        break;

      case 'ACAO':
        if (botPlayer.zonas?.MAO_ITENS?.length > 0) {
          botPlayer.zonas.MAO_ITENS.forEach((item, index) => {
            if (item && this.canUseItem(item, gameState, botPlayerIndex)) {
              actions.push({
                type: 'usarItem',
                itemIndex: index,
                priority: this.calculateItemPriority(item, gameState, botPlayerIndex)
              });
            }
          });
        }
        break;
    }

    actions.push({ type: 'pass', priority: 1 });
    return actions;
  }

  selectBestAction(actions, gameState, botPlayerIndex) {
    if (actions.length === 0) return { type: 'pass' };

    actions.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    const randomFactor = this.difficulty === 'easy' ? 0.3 : 
                        this.difficulty === 'hard' ? 0.1 : 0.2;
    
    if (Math.random() < randomFactor && actions.length > 1) {
      return actions[Math.floor(Math.random() * Math.min(3, actions.length))];
    }

    return actions[0];
  }

  canUseItem(item, gameState, playerIndex) {
    if (!item || item.cooldown > 0) return false;
    
    const player = gameState.jogadores[playerIndex];
    if (item.tipo === 'equipamento' && !player.zonas?.LENDA_ATIVA) {
      return false;
    }

    return true;
  }

  calculateItemPriority(item, gameState, playerIndex) {
    let priority = 5;
    
    if (item.efeito?.includes('cura')) {
      priority += 6;
    }
    
    if (item.efeito?.includes('dano')) {
      priority += 8;
    }
    
    return priority;
  }

  calculateCardPriority(card) {
    let priority = 5;
    
    if (card.ataque) priority += card.ataque * 0.1;
    if (card.defesa) priority += card.defesa * 0.1;
    if (card.vida) priority += card.vida * 0.05;
    
    if (!card.cooldown) priority += 3;
    
    return priority;
  }
}

// Utilitário para gerar deck e jogador bot
import { getAllGameCards } from './cardUtils';

export function getBotDeck(options = {}) {
  // Busca todas as cartas disponíveis do jogo
  const availableCards = typeof getAllGameCards === 'function' ? getAllGameCards() : [];
  const bot = new BotAI(options.difficulty || 'normal', options.personality || 'balanced');
  return bot.generateBotDeck(availableCards);
}

export function getBotPlayer(options = {}) {
  return {
    id: 'bot',
    nome: 'Bot',
    avatarUrl: '/public/avatars/player.jpg',
    tipo: 'bot',
    ...options
  };
}

export default BotAI;

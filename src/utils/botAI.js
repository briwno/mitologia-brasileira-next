// src/utils/botAI.js
import { nanoid } from 'nanoid';

// Sistema de IA para o bot adversário
export class BotAI {
  constructor() {
    this.difficulty = 'medium'; // easy, medium, hard
    this.personality = 'balanced'; // aggressive, defensive, balanced
  }

  // Deck pré-definido do bot
  getBotDeck() {
    return [
      'boi001', // Boitatá
      'enc001', // Encantado genérico
      'mul001', // Mula-sem-cabeça
      'sac001', // Saci-Pererê
      'iar001', // Iara
      'cur001'  // Curupira
    ];
  }

  // Avalia a situação atual do jogo
  evaluateGameState(gameState, activeCards, playerBench, opponentBench) {
    const botHealth = gameState.opponentHealth;
    const playerHealth = gameState.playerHealth;
    const botCard = activeCards.opponent;
    const playerCard = activeCards.player;

    // Calcula vantagem geral
    const healthAdvantage = botHealth - playerHealth;
    const cardAdvantage = this.countAliveCards(opponentBench) - this.countAliveCards(playerBench);
    
    return {
      healthAdvantage,
      cardAdvantage,
      botCard,
      playerCard,
      isWinning: healthAdvantage > 5 || cardAdvantage > 1,
      isLosing: healthAdvantage < -5 || cardAdvantage < -1,
      canAttack: botCard && !botCard.isDead,
      shouldSwitch: botCard && (botCard.vida < 3 || botCard.isDead)
    };
  }

  // Conta cartas vivas no banco
  countAliveCards(bench) {
    return bench.filter(card => card && !card.isDead).length;
  }

  // Escolhe melhor carta do banco para trocar
  selectBestBenchCard(bench, situation) {
    const aliveCards = bench.filter(card => card && !card.isDead);
    if (aliveCards.length === 0) return null;

    // Estratégia baseada na situação
    if (situation.isLosing) {
      // Quando perdendo, prefere carta com mais ataque
      return aliveCards.reduce((best, card) => 
        (card.ataque || 0) > (best.ataque || 0) ? card : best
      );
    } else if (situation.isWinning) {
      // Quando ganhando, prefere carta com mais vida
      return aliveCards.reduce((best, card) => 
        (card.vida || 0) > (best.vida || 0) ? card : best
      );
    } else {
      // Situação equilibrada, escolhe carta mais balanceada
      return aliveCards.reduce((best, card) => {
        const cardScore = (card.ataque || 0) + (card.vida || 0);
        const bestScore = (best.ataque || 0) + (best.vida || 0);
        return cardScore > bestScore ? card : best;
      });
    }
  }

  // Escolhe melhor habilidade para usar
  selectBestSkill(card, skills, situation) {
    const availableSkills = skills.filter(skill => 
      !skill.locked && 
      skill.pp >= skill.ppCost
    );

    if (availableSkills.length === 0) return null;

    // Prioriza ultimate se disponível e situação crítica
    const ultimate = availableSkills.find(skill => skill.isUltimate);
    if (ultimate && (situation.isLosing || Math.random() < 0.3)) {
      return availableSkills.indexOf(skills.find(s => s.isUltimate));
    }

    // Escolhe habilidade baseada na estratégia
    if (situation.isLosing) {
      // Quando perdendo, prefere habilidades de dano
      const damageSkills = availableSkills.filter(skill => skill.kind === 'damage');
      if (damageSkills.length > 0) {
        const bestDamage = damageSkills.reduce((best, skill) =>
          (skill.base || 0) > (best.base || 0) ? skill : best
        );
        return availableSkills.indexOf(bestDamage);
      }
    } else {
      // Situação normal, usa variedade de habilidades
      const stunSkills = availableSkills.filter(skill => skill.kind === 'stun');
      const damageSkills = availableSkills.filter(skill => skill.kind === 'damage');
      
      // 30% chance de usar stun se disponível
      if (stunSkills.length > 0 && Math.random() < 0.3) {
        return availableSkills.indexOf(stunSkills[0]);
      }
      
      // Senão usa habilidade de dano
      if (damageSkills.length > 0) {
        return availableSkills.indexOf(damageSkills[0]);
      }
    }

    // Fallback: primeira habilidade disponível
    return availableSkills.length > 0 ? 0 : null;
  }

  // Decide se deve usar item
  shouldUseItem(items, situation) {
    if (!items || items.length === 0) return false;
    
    // Usa item quando:
    // - Está perdendo (60% chance)
    // - Situação crítica (carta com pouca vida)
    // - Ocasionalmente (20% chance)
    if (situation.isLosing && Math.random() < 0.6) return true;
    if (situation.botCard?.vida < 5 && Math.random() < 0.8) return true;
    if (Math.random() < 0.2) return true;
    
    return false;
  }

  // Toma decisão principal do turno
  makeDecision(gameState, activeCards, playerBench, opponentBench, opponentItems, getSkills, canUseSkill) {
    const situation = this.evaluateGameState(gameState, activeCards, playerBench, opponentBench);
    
    // Se não tem carta ativa ou ela está morta, precisa trocar
    if (!situation.botCard || situation.botCard.isDead) {
      const benchIndex = opponentBench.findIndex(card => card && !card.isDead);
      if (benchIndex >= 0) {
        return {
          action: 'switch',
          targetIndex: benchIndex,
          delay: 1000 + Math.random() * 1000 // 1-2 segundos
        };
      }
      // Se não tem cartas vivas, o jogo deveria ter terminado
      return { action: 'pass', delay: 500 };
    }

    // Se está atordoado, passa o turno
    if ((gameState.opponentStun || 0) > 0) {
      return { action: 'pass', delay: 800 };
    }

    // Decide se deve trocar carta (mesmo tendo uma ativa)
    if (situation.shouldSwitch && Math.random() < 0.4) {
      const bestCard = this.selectBestBenchCard(opponentBench, situation);
      if (bestCard) {
        const benchIndex = opponentBench.findIndex(card => card === bestCard);
        return {
          action: 'switch',
          targetIndex: benchIndex,
          delay: 1200 + Math.random() * 800
        };
      }
    }

    // Decide se deve usar item
    if (this.shouldUseItem(opponentItems.hand, situation)) {
      return {
        action: 'useItem',
        itemIndex: Math.floor(Math.random() * opponentItems.hand.length),
        delay: 1500 + Math.random() * 1000
      };
    }

    // Tenta usar habilidade
    if (situation.canAttack) {
      const skills = getSkills(situation.botCard);
      const skillIndex = this.selectBestSkill(situation.botCard, skills, situation);
      
      if (skillIndex !== null && canUseSkill('opponent', skills[skillIndex])) {
        return {
          action: 'skill',
          skillIndex: skillIndex,
          delay: 1800 + Math.random() * 1200 // 1.8-3 segundos
        };
      }
    }

    // Fallback: ataque básico ou passar turno
    if (situation.canAttack && Math.random() < 0.7) {
      return {
        action: 'attack',
        delay: 1000 + Math.random() * 800
      };
    }

    return { 
      action: 'pass', 
      delay: 600 + Math.random() * 400 
    };
  }

  // Executa ação do bot com delay apropriado
  executeAction(decision, callbacks) {
    const { action, delay } = decision;
    
    return new Promise((resolve) => {
      setTimeout(() => {
        switch (action) {
          case 'switch':
            callbacks.switchActive?.('opponent', decision.targetIndex);
            break;
          case 'skill':
            callbacks.castSkill?.(decision.skillIndex);
            break;
          case 'attack':
            callbacks.basicAttack?.();
            break;
          case 'useItem':
            callbacks.useItem?.(decision.itemIndex);
            break;
          case 'pass':
          default:
            callbacks.passTurn?.();
            break;
        }
        resolve();
      }, delay || 1000);
    });
  }

  // Método principal para o turno do bot
  async playBotTurn(gameState, activeCards, playerBench, opponentBench, opponentItems, callbacks) {
    const decision = this.makeDecision(
      gameState, 
      activeCards, 
      playerBench, 
      opponentBench, 
      opponentItems,
      callbacks.getSkills,
      callbacks.canUseSkill
    );

    console.log(`Bot decidiu: ${decision.action}`, decision);
    
    return this.executeAction(decision, callbacks);
  }
}
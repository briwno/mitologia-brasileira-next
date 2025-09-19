// src/utils/combatSystem.js
import { getMultiplicadores, getCombos, getElementos } from './constantsAPI';

export class CombatSystem {
  constructor() {
    this.activeMultipliers = [];
    this.activeCombos = [];
    this.gameState = {
      turn: 1,
      isFullMoon: false,
      activeEvents: [],
      battlefield: {
        player: [],
        opponent: []
      }
    };
    this.MULTIPLICADORES = null;
    this.COMBOS_CARTAS = null;
    this.ELEMENTOS = null;
  }

  // Inicializar com as constantes da API
  async initialize() {
    this.MULTIPLICADORES = await getMultiplicadores();
    this.COMBOS_CARTAS = await getCombos();
    this.ELEMENTOS = await getElementos();
  }

  // Garantir que está inicializado
  async ensureInitialized() {
    if (!this.MULTIPLICADORES || !this.COMBOS_CARTAS || !this.ELEMENTOS) {
      await this.initialize();
    }
  }

  // Calcular dano final com todos os modificadores
  async calculateDamage(attacker, defender, gameState = null) {
    await this.ensureInitialized();
    
    if (gameState) this.gameState = gameState;

    // Valores base
  let danoBase = attacker.ataque ?? attacker.attack;
  let defesa = defender.defesa ?? defender.defense;
    
    // Aplicar multiplicadores de ataque
    danoBase *= this.getAttackMultipliers(attacker);
    
    // Aplicar multiplicadores de defesa
    defesa *= this.getDefenseMultipliers(defender);
    
    // Calcular dano final
    let danoFinal = Math.max(1, danoBase - defesa);
    
    // Aplicar resistências especiais
    danoFinal = this.applyResistances(danoFinal, attacker, defender);
    
    // Aplicar reflexão de dano
    const danoRefletido = this.calculateReflection(danoFinal, defender);
    
    return {
      damage: Math.round(danoFinal),
      reflected: Math.round(danoRefletido),
      criticalHit: this.checkCriticalHit(attacker),
      dodged: this.checkDodge(defender),
      multipliers: this.getAppliedMultipliers(attacker, defender)
    };
  }

  // Obter multiplicadores de ataque
  getAttackMultipliers(attacker) {
    let multiplier = 1.0;
    
    // Multiplicador regional
    if (this.hasRegionalBonus(attacker)) {
      multiplier *= this.MULTIPLICADORES.REGIONAL.value;
    }
    
    // Multiplicador elemental
    const bonusElemental = this.getElementalAdvantage(attacker);
    if (bonusElemental > 1) {
      multiplier *= bonusElemental;
    }
    
    // Multiplicador de lua cheia
    if (this.gameState.isFullMoon && this.isNightCreature(attacker)) {
      multiplier *= this.MULTIPLICADORES.FULL_MOON.value;
    }
    
    // Multiplicador sazonal
    const bonusSazonal = this.getSeasonalBonus(attacker);
    if (bonusSazonal > 1) {
      multiplier *= bonusSazonal;
    }
    
    // Multiplicador de combo
    const bonusDeCombo = this.getComboMultiplier(attacker, 'attack');
    if (bonusDeCombo > 1) {
      multiplier *= bonusDeCombo;
    }
    
    // Multiplicador de contra-ataque
    if (attacker.hasCounterattack) {
      multiplier *= this.MULTIPLICADORES.COUNTERATTACK.value;
    }
    
    return multiplier;
  }

  // Obter multiplicadores de defesa
  getDefenseMultipliers(defender) {
    let multiplier = 1.0;
    
    // Multiplicador de combo defensivo
    const bonusDeCombo = this.getComboMultiplier(defender, 'defense');
    if (bonusDeCombo > 1) {
      multiplier *= bonusDeCombo;
    }
    
    // Bônus passivos de defesa
    if (defender.abilities?.passive?.name === 'Protetor da Natureza') {
      const aliadosDaFloresta = this.countForestAllies(defender);
      multiplier *= (1 + aliadosDaFloresta * 0.1); // +10% por aliado da floresta
    }
    
    return multiplier;
  }

  // Verificar vantagem elemental
  getElementalAdvantage(attacker) {
  const elementoDoAtacante = attacker.elemento || attacker.element;
  const elementoDoDefensor = this.getCurrentTarget()?.elemento || this.getCurrentTarget()?.element;
    
  if (!elementoDoAtacante || !elementoDoDefensor) return 1.0;
    
    const vantagens = this.MULTIPLICADORES.ELEMENTAL.advantages[elementoDoAtacante];
    if (vantagens && vantagens.includes(elementoDoDefensor)) {
      return this.MULTIPLICADORES.ELEMENTAL.value;
    }
    
    return 1.0;
  }

  // Verificar bônus regional
  hasRegionalBonus(card) {
    const allies = this.gameState.battlefield.player;
    const sameRegionAllies = allies.filter(ally => 
      ally.id !== card.id && (ally.regiao || ally.region) === (card.regiao || card.region)
    );
    return sameRegionAllies.length > 0;
  }

  // Verificar se é criatura noturna
  isNightCreature(card) {
    return card.tags?.includes('noturno') || 
           card.abilities?.basic?.name?.includes('Noturna') ||
           ['mul001', 'bot001'].includes(card.id); // IDs específicos
  }

  // Obter bônus sazonal
  getSeasonalBonus(card) {
    const bonus = card.bonusSazonal || card.seasonalBonus;
    if (!bonus) return 1.0;
    
    const currentEvents = this.gameState.activeEvents || [];
    if (currentEvents.includes(bonus.estacao || bonus.season)) {
      return bonus.multiplicador || bonus.multiplier;
    }
    
    return 1.0;
  }

  // Obter multiplicador de combo
  getComboMultiplier(card, type) {
    for (const [comboId, combo] of Object.entries(this.COMBOS_CARTAS)) {
      if (combo.cards.includes(card.id)) {
        // Verificar se todas as cartas do combo estão em campo
        const comboActive = combo.cards.every(cardId =>
          this.gameState.battlefield.player.some(ally => ally.id === cardId)
        );
        
        if (comboActive && combo.effect.type.includes(type)) {
          return combo.effect.value;
        }
      }
    }
    return 1.0;
  }

  // Aplicar resistências especiais
  applyResistances(damage, attacker, defender) {
    let danoFinal = damage;
    
    // Resistência arcana da Cuca
    if (defender.abilities?.passive?.name === 'Resistência Arcana' && 
        this.isMagicalAttack(attacker)) {
      danoFinal *= 0.7; // 30% de resistência
    }
    
    // Proteção divina (combo)
    if (this.hasActiveCombo('DIVINE_PROTECTION')) {
      danoFinal *= 0.5;
    }
    
    return danoFinal;
  }

  // Calcular reflexão de dano
  calculateReflection(damage, defender) {
    // Corpo Flamejante do Boitatá
    if (defender.abilities?.passive?.name === 'Corpo Flamejante') {
      return damage * 0.25; // 25% de reflexão
    }
    
    return 0;
  }

  // Verificar acerto crítico
  checkCriticalHit(attacker) {
    // 10% de chance base, pode ser modificada por habilidades
    let critChance = 0.1;
    
    if (attacker.abilities?.passive?.name === 'Astúcia') {
      critChance += 0.05; // +5% para Saci
    }
    
    return Math.random() < critChance;
  }

  // Verificar esquiva
  checkDodge(defender) {
    let dodgeChance = 0;
    
    // Astúcia do Saci
    if (defender.abilities?.passive?.name === 'Astúcia') {
      dodgeChance = 0.15; // 15% de esquiva
    }
    
    // Forma Etérea da Mula sem Cabeça
    if (defender.abilities?.passive?.name === 'Forma Etérea') {
      dodgeChance = 0.20; // 20% de ignorar ataques físicos
    }
    
    return Math.random() < dodgeChance;
  }

  // Aplicar habilidades especiais
  activateAbility(card, abilityType, target = null) {
    const ability = card.abilities[abilityType];
    if (!ability) return null;
    
    const result = {
      success: true,
      effects: [],
      message: `${card.nome || card.name} usou ${ability.name}!`
    };
    
    switch (ability.name) {
      case 'Confusão da Floresta':
        result.effects.push({
          type: 'attack_debuff',
          target: 'opponent',
          value: -2,
          duration: 2
        });
        break;
        
      case 'Canto Hipnótico':
        if (Math.random() < 0.3) {
          result.effects.push({
            type: 'skip_turn',
            target: 'opponent',
            duration: 1
          });
        }
        break;
        
      case 'Fogo Protetor':
        result.effects.push({
          type: 'continuous_damage',
          target: 'opponent',
          value: 3,
          duration: -1 // Permanente enquanto em campo
        });
        break;
        
      // Adicionar mais habilidades...
    }
    
    return result;
  }

  // Métodos auxiliares
  getCurrentTarget() {
    return this.gameState.currentTarget;
  }

  countForestAllies(card) {
    return this.gameState.battlefield.player.filter(ally =>
      ally.id !== card.id && (ally.categoria || ally.category) === 'Guardiões da Floresta'
    ).length;
  }

  isMagicalAttack(attacker) {
  return (attacker.tipo || attacker.type) === 'spell' || 
       (attacker.elemento || attacker.element) === ELEMENTOS.SPIRIT ||
           attacker.tags?.includes('magia');
  }

  hasActiveCombo(comboId) {
    return this.activeCombos.includes(comboId);
  }

  getAppliedMultipliers(attacker, defender) {
    const applied = [];
    
    if (this.hasRegionalBonus(attacker)) {
      applied.push('Regional (+25%)');
    }
    
    if (this.getElementalAdvantage(attacker) > 1) {
      applied.push('Elemental (+50%)');
    }
    
    if (this.gameState.isFullMoon && this.isNightCreature(attacker)) {
      applied.push('Lua Cheia (+100%)');
    }
    
    return applied;
  }
}

// Funções utilitárias para o jogo
export const combatSystem = new CombatSystem();

export const calculateBattleDamage = (attacker, defender, gameState) => {
  return combatSystem.calculateDamage(attacker, defender, gameState);
};

export const activateCardAbility = (card, abilityType, target) => {
  return combatSystem.activateAbility(card, abilityType, target);
};

export const checkComboActivation = (battlefield) => {
  const activeCards = battlefield.player.map(card => card.id);
  const activeCombos = [];
  
  for (const [comboId, combo] of Object.entries(this.COMBOS_CARTAS)) {
    const comboActive = combo.cards.every(cardId => activeCards.includes(cardId));
    if (comboActive) {
      activeCombos.push({ id: comboId, ...combo });
    }
  }
  
  return activeCombos;
};

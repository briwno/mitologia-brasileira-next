// src/utils/battleSystem.js

/**
 * Sistema de Combate do Ka'aguy
 * Implementa todas as regras de batalha, cálculos e validações
 */

import { CONSTANTES_DO_JOGO, FASES_DO_JOGO, ACOES_TURNO } from './constants';

/**
 * Valida se uma ação é permitida no estado atual
 */
export function validateAction(gameState, playerId, actionType, actionData) {
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) {
    return { valid: false, error: 'Jogador não encontrado' };
  }

  // Verificar se é o turno do jogador
  if (gameState.currentPlayer !== playerId) {
    return { valid: false, error: 'Não é seu turno' };
  }

  // Verificar fase do jogo
  if (gameState.phase !== FASES_DO_JOGO.ACAO) {
    return { valid: false, error: 'Ação não permitida nesta fase' };
  }

  switch (actionType) {
    case ACOES_TURNO.USAR_HABILIDADE:
      return validateSkillUse(player, actionData.skillId);
    
    case ACOES_TURNO.USAR_ITEM:
      return validateItemUse(player, actionData.itemId);
    
    case ACOES_TURNO.TROCAR_LENDA:
      return validateLegendSwitch(player, actionData.legendId);
    
    case 'usar_ultimate':
      return validateUltimateUse(player);
    
    default:
      return { valid: false, error: 'Ação desconhecida' };
  }
}

/**
 * Valida uso de skill
 */
function validateSkillUse(player, skillId) {
  const legend = player.activeLegend;
  const skill = legend.skills.find(s => s.id === skillId);

  if (!skill) {
    return { valid: false, error: 'Skill não encontrada' };
  }

  if (skill.cooldown && skill.cooldown > 0) {
    return { valid: false, error: `Skill em cooldown (${skill.cooldown} turnos)` };
  }

  if (skill.cost && player.energy < skill.cost) {
    return { valid: false, error: 'Energia insuficiente' };
  }

  return { valid: true };
}

/**
 * Valida uso de item
 */
function validateItemUse(player, itemId) {
  const item = player.itemHand.find(i => i.id === itemId);

  if (!item) {
    return { valid: false, error: 'Item não encontrado na mão' };
  }

  if (player.itemHand.length === 0) {
    return { valid: false, error: 'Mão de itens vazia' };
  }

  return { valid: true };
}

/**
 * Valida troca de lenda
 */
function validateLegendSwitch(player, legendId) {
  const legend = player.bench.find(l => l.id === legendId);

  if (!legend) {
    return { valid: false, error: 'Lenda não encontrada no banco' };
  }

  if (legend.hp <= 0) {
    return { valid: false, error: 'Lenda derrotada não pode entrar em campo' };
  }

  return { valid: true };
}

/**
 * Valida uso de ultimate
 */
function validateUltimateUse(player) {
  const legend = player.activeLegend;

  if (!legend.ultimate) {
    return { valid: false, error: 'Lenda não possui ultimate' };
  }

  if (legend.ultimateUsed) {
    return { valid: false, error: 'Ultimate já foi usada nesta partida' };
  }

  const requiredTurns = legend.ultimate.requiredTurns || 5;
  if (player.turnsPlayed < requiredTurns) {
    return { valid: false, error: `Ultimate disponível no turno ${requiredTurns}` };
  }

  return { valid: true };
}

/**
 * Calcula dano de uma skill/ataque
 */
export function calculateDamage(attacker, defender, skillPower, modifiers = {}) {
  let ataque = 0;
  if (attacker && typeof attacker.atk === 'number') {
    ataque = attacker.atk;
  }

  let defesa = 0;
  if (defender && typeof defender.def === 'number') {
    defesa = defender.def;
  }

  let poder = 0;
  if (typeof skillPower === 'number') {
    poder = skillPower;
  }

  let baseDamage = poder * (1 + ataque / 10) - defesa / 5;
  if (baseDamage < 0) {
    baseDamage = 0;
  }

  if (modifiers && modifiers.elementAdvantage) {
    baseDamage = baseDamage * 1.5;
  } else if (modifiers && modifiers.elementDisadvantage) {
    baseDamage = baseDamage * 0.75;
  }

  if (attacker && attacker.buffs && typeof attacker.buffs.attack === 'number') {
    baseDamage = baseDamage * (1 + attacker.buffs.attack);
  }

  if (defender && defender.buffs && typeof defender.buffs.defense === 'number') {
    baseDamage = baseDamage * (1 - defender.buffs.defense);
  }

  let critico = false;
  if (Math.random() < 0.1) {
    baseDamage = baseDamage * 2;
    critico = true;
  }

  let danoFinal = Math.ceil(baseDamage);
  if (danoFinal < 1) {
    danoFinal = 1;
  }

  return {
    damage: danoFinal,
    isCritical: critico
  };
}

/**
 * Aplica dano a uma lenda
 */
export function applyDamage(target, damage, source = null) {
  // Primeiro reduzir shields, depois HP
  let remainingDamage = damage;

  if (target.shields > 0) {
    const shieldDamage = Math.min(target.shields, remainingDamage);
    target.shields -= shieldDamage;
    remainingDamage -= shieldDamage;
  }

  if (remainingDamage > 0) {
    target.hp = Math.max(0, target.hp - remainingDamage);
  }

  // Registrar fonte do dano para efeitos de retaliação
  if (source) {
    target.lastDamagedBy = source;
  }

  return {
    totalDamage: damage,
    shieldDamage: damage - remainingDamage,
    hpDamage: remainingDamage,
    isDefeated: target.hp <= 0
  };
}

/**
 * Aplica cura
 */
export function applyHealing(target, amount) {
  const maxHp = target.maxHp || 100;
  const actualHealing = Math.min(amount, maxHp - target.hp);
  target.hp += actualHealing;

  return {
    healing: actualHealing,
    overheal: amount - actualHealing
  };
}

/**
 * Verifica vantagem de elemento
 */
export function checkElementAdvantage(attackerElement, defenderElement) {
  const advantages = {
    'Fogo': 'Terra',
    'Terra': 'Água',
    'Água': 'Fogo',
    'Ar': 'Fogo',
    'Sombra': 'Ar'
  };

  if (advantages[attackerElement] === defenderElement) {
    return 'advantage';
  } else if (advantages[defenderElement] === attackerElement) {
    return 'disadvantage';
  }

  return 'neutral';
}

/**
 * Processa o início do turno
 */
export function processTurnStart(gameState, playerId) {
  const player = gameState.players.find(p => p.id === playerId);
  
  // Ativar passivas de início de turno
  activatePassives(player, 'turn_start');

  // Reduzir cooldowns
  reduceCooldowns(player.activeLegend);

  // Aplicar efeitos contínuos (DoT, HoT, etc)
  applyStatusEffects(player);

  gameState.phase = FASES_DO_JOGO.ACAO;
  
  return gameState;
}

/**
 * Processa o fim do turno
 */
export function processTurnEnd(gameState, playerId) {
  const player = gameState.players.find(p => p.id === playerId);

  // Ativar passivas de fim de turno
  activatePassives(player, 'turn_end');

  // Comprar item se houver espaço
  if (player.itemHand.length < CONSTANTES_DO_JOGO.TAMANHO_MAXIMO_MAO_ITENS) {
    drawItem(player);
  }

  // Incrementar contador de turnos
  player.turnsPlayed = (player.turnsPlayed || 0) + 1;

  gameState.phase = FASES_DO_JOGO.FIM_TURNO;
  
  return gameState;
}

/**
 * Compra um item do deck
 */
function drawItem(player) {
  if (player.itemDeck.length === 0) {
    // Embaralhar descarte de volta ao deck
    player.itemDeck = shuffleArray([...player.itemDiscard]);
    player.itemDiscard = [];
  }

  if (player.itemDeck.length > 0) {
    const item = player.itemDeck.pop();
    player.itemHand.push(item);
    return item;
  }

  return null;
}

/**
 * Ativa passivas da lenda
 */
function activatePassives(player, trigger) {
  const legend = player.activeLegend;
  
  if (!legend.passive) return;

  const passive = legend.passive;

  // Verificar se a passiva é ativada neste gatilho
  if (passive.trigger === trigger) {
    applyPassiveEffect(player, passive);
  }
}

/**
 * Aplica efeito de passiva
 */
function applyPassiveEffect(player, passive) {
  switch (passive.effect) {
    case 'heal':
      applyHealing(player.activeLegend, passive.value);
      break;
    
    case 'shield':
      player.activeLegend.shields += passive.value;
      break;
    
    case 'buff_atk':
      player.activeLegend.buffs = player.activeLegend.buffs || {};
      player.activeLegend.buffs.attack = passive.value;
      break;
    
    case 'buff_def':
      player.activeLegend.buffs = player.activeLegend.buffs || {};
      player.activeLegend.buffs.defense = passive.value;
      break;
    
    default:
      console.log('Efeito de passiva desconhecido:', passive.effect);
  }
}

/**
 * Reduz cooldowns das skills
 */
function reduceCooldowns(legend) {
  if (!legend.skills) return;

  legend.skills.forEach(skill => {
    if (skill.cooldown && skill.cooldown > 0) {
      skill.cooldown -= 1;
    }
  });
}

/**
 * Aplica efeitos de status (DoT, HoT, etc)
 */
function applyStatusEffects(player) {
  const legend = player.activeLegend;
  
  if (!legend) {
    return;
  }

  if (!Array.isArray(legend.statusEffects)) {
    return;
  }

  const efeitosRestantes = [];

  legend.statusEffects.forEach(effect => {
    if (!effect) {
      return;
    }

    let duracao = 0;
    if (typeof effect.duration === 'number') {
      duracao = effect.duration;
    } else {
      duracao = 1;
    }

    if (effect.type === 'burn' || effect.type === 'bleed' || effect.type === 'poison') {
      const valorDano = typeof effect.value === 'number' ? effect.value : 0;
      applyDamage(legend, valorDano);
    } else if (effect.type === 'regen' || effect.type === 'heal_over_time') {
      const valorCura = typeof effect.value === 'number' ? effect.value : 0;
      applyHealing(legend, valorCura);
    }

    if (effect.type === 'attack_down' || effect.type === 'defense_down' || effect.type === 'attack_up' || effect.type === 'defense_up') {
      // Apenas sinaliza para recálculo após o loop
    }

    if (effect.type === 'shield_temporary' && duracao <= 1) {
      if (typeof effect.value === 'number' && typeof legend.shields === 'number') {
        const restante = legend.shields - effect.value;
        legend.shields = restante > 0 ? restante : 0;
      }
    }

    duracao = duracao - 1;

    if (duracao > 0) {
      effect.duration = duracao;
      efeitosRestantes.push(effect);
    }
  });

  legend.statusEffects = efeitosRestantes;
  recalculateLegendStats(legend);
}

export function recalculateLegendStats(legend) {
  if (!legend) {
    return;
  }

  let baseAtk = 0;
  if (typeof legend.baseAtk === 'number') {
    baseAtk = legend.baseAtk;
  } else if (typeof legend.atk === 'number') {
    baseAtk = legend.atk;
  }

  let baseDef = 0;
  if (typeof legend.baseDef === 'number') {
    baseDef = legend.baseDef;
  } else if (typeof legend.def === 'number') {
    baseDef = legend.def;
  }

  let totalAtk = baseAtk;
  let totalDef = baseDef;

  if (legend.buffs && typeof legend.buffs.attack === 'number') {
    totalAtk += legend.buffs.attack;
  }

  if (legend.buffs && typeof legend.buffs.defense === 'number') {
    totalDef += legend.buffs.defense;
  }

  if (Array.isArray(legend.statusEffects)) {
    legend.statusEffects.forEach(effect => {
      if (!effect) {
        return;
      }
      if (typeof effect.duration !== 'number' || effect.duration <= 0) {
        return;
      }

      const valor = typeof effect.value === 'number' ? effect.value : 0;

      if (effect.type === 'attack_up') {
        totalAtk += valor;
      } else if (effect.type === 'attack_down') {
        totalAtk -= valor;
      } else if (effect.type === 'defense_up') {
        totalDef += valor;
      } else if (effect.type === 'defense_down') {
        totalDef -= valor;
      }
    });
  }

  if (totalAtk < 0) {
    totalAtk = 0;
  }

  if (totalDef < 0) {
    totalDef = 0;
  }

  legend.atk = totalAtk;
  legend.def = totalDef;
}

export function isLegendStunned(legend) {
  if (!legend) {
    return false;
  }

  if (!Array.isArray(legend.statusEffects)) {
    return false;
  }

  for (let i = 0; i < legend.statusEffects.length; i += 1) {
    const effect = legend.statusEffects[i];
    if (!effect) {
      continue;
    }
    if (typeof effect.duration === 'number' && effect.duration <= 0) {
      continue;
    }
    if (effect.type === 'stun' || effect.type === 'charm' || effect.type === 'fear') {
      return true;
    }
  }

  return false;
}

export function isLegendRooted(legend) {
  if (!legend) {
    return false;
  }

  if (!Array.isArray(legend.statusEffects)) {
    return false;
  }

  for (let i = 0; i < legend.statusEffects.length; i += 1) {
    const effect = legend.statusEffects[i];
    if (!effect) {
      continue;
    }
    if (typeof effect.duration === 'number' && effect.duration <= 0) {
      continue;
    }
    if (effect.type === 'root') {
      return true;
    }
  }

  return false;
}

/**
 * Verifica condições de vitória
 */
export function checkVictoryConditions(gameState) {
  const results = gameState.players.map(player => {
    const allLegends = [player.activeLegend, ...player.bench];
    const allDefeated = allLegends.every(legend => legend.hp <= 0);
    
    return {
      playerId: player.id,
      allDefeated
    };
  });

  const defeated = results.find(r => r.allDefeated);
  
  if (defeated) {
    const winner = results.find(r => !r.allDefeated);
    return {
      gameOver: true,
      winnerId: winner?.playerId || null,
      loserId: defeated.playerId
    };
  }

  return { gameOver: false };
}

/**
 * Embaralha um array
 */
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * Cria log de ação formatado
 */
export function createActionLog(actionType, data) {
  const timestamp = new Date().toISOString();
  
  return {
    type: actionType,
    timestamp,
    data,
    formatted: formatActionForLog(actionType, data)
  };
}

/**
 * Formata ação para exibição no log
 */
function formatActionForLog(actionType, data) {
  switch (actionType) {
    case 'usar_skill':
      return `usou ${data.skillName} em ${data.targetName}`;
    
    case 'usar_item':
      return `usou o item ${data.itemName}`;
    
    case 'trocar_lenda':
      return `trocou para ${data.legendName}`;
    
    case 'usar_ultimate':
      return `ativou ULTIMATE: ${data.ultimateName}!`;
    
    case 'damage':
      return `causou ${data.damage} de dano${data.isCritical ? ' CRÍTICO!' : ''}`;
    
    case 'heal':
      return `curou ${data.healing} de HP`;
    
    case 'defeat':
      return `${data.legendName} foi derrotado!`;
    
    default:
      return JSON.stringify(data);
  }
}

/**
 * Gera ID único para ações
 */
export function generateActionId() {
  return `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

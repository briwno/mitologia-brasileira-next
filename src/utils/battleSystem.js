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
  // Fórmula base: (Poder da Skill × ATK do Atacante) ÷ DEF do Defensor
  let baseDamage = (skillPower * attacker.atk) / Math.max(1, defender.def);

  // Aplicar modificadores de elemento
  if (modifiers.elementAdvantage) {
    baseDamage *= 1.5; // 50% de bônus por vantagem de elemento
  } else if (modifiers.elementDisadvantage) {
    baseDamage *= 0.75; // 25% de redução por desvantagem
  }

  // Aplicar buffs e debuffs
  if (attacker.buffs?.attack) {
    baseDamage *= (1 + attacker.buffs.attack);
  }

  if (defender.buffs?.defense) {
    baseDamage *= (1 - defender.buffs.defense);
  }

  // Crítico (10% de chance)
  if (Math.random() < 0.1) {
    baseDamage *= 2;
    modifiers.critical = true;
  }

  // Arredondar e garantir dano mínimo
  return {
    damage: Math.max(1, Math.floor(baseDamage)),
    isCritical: modifiers.critical || false
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
  
  if (!legend.statusEffects) return;

  legend.statusEffects.forEach(effect => {
    switch (effect.type) {
      case 'burn': // Dano ao longo do tempo
        applyDamage(legend, effect.value);
        break;
      
      case 'regen': // Cura ao longo do tempo
        applyHealing(legend, effect.value);
        break;
      
      case 'poison':
        applyDamage(legend, effect.value);
        break;
    }

    // Reduzir duração
    effect.duration -= 1;
  });

  // Remover efeitos expirados
  legend.statusEffects = legend.statusEffects.filter(e => e.duration > 0);
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

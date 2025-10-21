// src/hooks/useBotAI.js
"use client";

import { useState, useEffect, useMemo } from 'react';
import { FASES_DO_JOGO, ZONAS_CAMPO } from '@/utils/constants';

export function useBotAI(gameState, botPlayer, opponent, difficulty = 'normal') {
  const [botAction, setBotAction] = useState(null);

  // Verificar se é o turno do bot
  const isBotTurn = useMemo(() => {
    if (!gameState || !botPlayer) return false;
    const currentPlayer = gameState.players?.[gameState.currentPlayerIndex];
    return currentPlayer?.id === botPlayer?.id && currentPlayer?.isBot;
  }, [gameState, botPlayer]);

  // Decidir ação do bot
  useEffect(() => {
    if (!isBotTurn || !botPlayer || !gameState || gameState.gameOver) {
      setBotAction(null);
      return;
    }

    // Delay para simular "pensamento"
    const thinkingTime = difficulty === 'easy' ? 1500 : difficulty === 'hard' ? 800 : 1200;

    const timer = setTimeout(() => {
      const action = decideAction(gameState, botPlayer, opponent, difficulty);
      setBotAction(action);
    }, thinkingTime);

    return () => clearTimeout(timer);
  }, [isBotTurn, gameState, botPlayer, opponent, difficulty]);

  return {
    botAction,
    isBotTurn
  };
}

// Decidir a melhor ação para o bot
function decideAction(gameState, botPlayer, opponent, difficulty) {
  const possibleActions = getPossibleActions(gameState, botPlayer, opponent);

  if (possibleActions.length === 0) {
    return { type: 'END_TURN' };
  }

  // Selecionar ação baseada na dificuldade
  return selectBestAction(possibleActions, difficulty);
}

// Obter todas as ações possíveis
function getPossibleActions(gameState, botPlayer, opponent) {
  const actions = [];
  const fase = gameState.fase;

  // Fase de Início: Trocar lenda ativa
  if (fase === FASES_DO_JOGO.INICIO) {
    const banco = botPlayer.zonas?.[ZONAS_CAMPO.BANCO_LENDAS] || [];
    const lendaAtiva = botPlayer.zonas?.[ZONAS_CAMPO.LENDA_ATIVA];

    banco.forEach((lenda, index) => {
      if (lenda && shouldSwitchLegend(lenda, lendaAtiva, opponent)) {
        actions.push({
          type: 'TROCAR_LENDA',
          data: { card: lenda, index },
          priority: calculateLegendPriority(lenda, opponent)
        });
      }
    });
  }

  // Fase de Ação: Usar itens ou habilidades
  if (fase === FASES_DO_JOGO.ACAO) {
    // Verificar itens na mão
    const maoItens = botPlayer.zonas?.[ZONAS_CAMPO.MAO_ITENS] || [];
    const lendaAtiva = botPlayer.zonas?.[ZONAS_CAMPO.LENDA_ATIVA];

    maoItens.forEach((item, index) => {
      if (item && shouldUseItem(item, botPlayer, opponent, lendaAtiva)) {
        actions.push({
          type: 'USAR_ITEM',
          data: { item, index },
          priority: calculateItemPriority(item, botPlayer, opponent)
        });
      }
    });

    // Verificar habilidades disponíveis
    if (lendaAtiva && lendaAtiva.habilidades) {
      const habilidades = extractSkills(lendaAtiva);
      
      habilidades.forEach(skill => {
        if (skill.disponivel && shouldUseSkill(skill, botPlayer, opponent)) {
          actions.push({
            type: 'USAR_HABILIDADE',
            data: { skill, card: lendaAtiva },
            priority: calculateSkillPriority(skill, botPlayer, opponent)
          });
        }
      });
    }
  }

  return actions;
}

// Selecionar a melhor ação baseada na dificuldade
function selectBestAction(actions, difficulty) {
  if (actions.length === 0) {
    return { type: 'END_TURN' };
  }

  // Ordenar por prioridade
  actions.sort((a, b) => (b.priority || 0) - (a.priority || 0));

  // Fator de aleatoriedade baseado na dificuldade
  let randomFactor;
  switch (difficulty) {
    case 'easy':
      randomFactor = 0.4; // 40% de chance de ação aleatória
      break;
    case 'hard':
      randomFactor = 0.05; // 5% de chance de ação aleatória
      break;
    default: // normal
      randomFactor = 0.2; // 20% de chance de ação aleatória
      break;
  }

  // Às vezes escolher uma ação não-ótima
  if (Math.random() < randomFactor && actions.length > 1) {
    const randomIndex = Math.floor(Math.random() * Math.min(3, actions.length));
    return actions[randomIndex];
  }

  return actions[0];
}

// Verificar se deve trocar de lenda
function shouldSwitchLegend(newLegend, currentLegend, opponent) {
  if (!currentLegend) return true;
  
  // Trocar se a nova lenda for significativamente mais forte
  const newPower = (newLegend.ataque || 0) + (newLegend.defesa || 0);
  const currentPower = (currentLegend.ataque || 0) + (currentLegend.defesa || 0);
  
  return newPower > currentPower * 1.2;
}

// Verificar se deve usar item
function shouldUseItem(item, botPlayer, opponent, lendaAtiva) {
  if (!item) return false;

  const tipoItem = item.tipo_item || '';
  
  // Lógica básica: usar itens ofensivos se oponente estiver fraco
  if (tipoItem.includes('ofensivo') || tipoItem.includes('attack')) {
    const opponentLegend = opponent.zonas?.[ZONAS_CAMPO.LENDA_ATIVA];
    return opponentLegend && (opponentLegend.vida || opponentLegend.defesa || 0) < 3;
  }

  // Usar itens defensivos se estiver com pouca vida
  if (tipoItem.includes('defensivo') || tipoItem.includes('defense')) {
    return lendaAtiva && (lendaAtiva.vida || lendaAtiva.defesa || 0) < 3;
  }

  // Usar itens utilitários com 30% de chance
  return Math.random() < 0.3;
}

// Verificar se deve usar habilidade
function shouldUseSkill(skill, botPlayer, opponent) {
  if (!skill || !skill.disponivel) return false;

  // Energia suficiente?
  if (botPlayer.energia < (skill.cost || 1)) return false;

  const kind = skill.kind || skill.tipo || '';

  // Priorizar ultimates quando disponíveis
  if (kind === 'ultimate' && botPlayer.energia >= 3) return true;

  // Usar habilidades de dano se oponente estiver vulnerável
  if (kind.includes('damage') || kind.includes('attack')) {
    const opponentLegend = opponent.zonas?.[ZONAS_CAMPO.LENDA_ATIVA];
    return opponentLegend && (opponentLegend.vida || 5) < 4;
  }

  // Usar habilidades de cura se necessário
  if (kind.includes('heal') || kind.includes('cura')) {
    const botLegend = botPlayer.zonas?.[ZONAS_CAMPO.LENDA_ATIVA];
    return botLegend && (botLegend.vida || 5) < 3;
  }

  return true;
}

// Calcular prioridade de lenda
function calculateLegendPriority(legend, opponent) {
  let priority = 10;

  // Quanto maior o ataque, maior a prioridade
  priority += (legend.ataque || 0) * 2;

  // Considerar defesa também
  priority += (legend.defesa || 0) * 1.5;

  // Bônus se tiver habilidades poderosas
  if (legend.habilidades || legend.abilities) {
    priority += 5;
  }

  return priority;
}

// Calcular prioridade de item
function calculateItemPriority(item, botPlayer, opponent) {
  let priority = 5;

  const tipoItem = item.tipo_item || '';
  const valor = item.valor || 0;

  // Itens ofensivos têm alta prioridade se oponente estiver fraco
  if (tipoItem.includes('ofensivo')) {
    const opponentLegend = opponent.zonas?.[ZONAS_CAMPO.LENDA_ATIVA];
    if (opponentLegend && (opponentLegend.vida || 5) < 3) {
      priority += 15;
    } else {
      priority += 8;
    }
  }

  // Itens defensivos têm alta prioridade se bot estiver fraco
  if (tipoItem.includes('defensivo')) {
    const botLegend = botPlayer.zonas?.[ZONAS_CAMPO.LENDA_ATIVA];
    if (botLegend && (botLegend.vida || 5) < 3) {
      priority += 12;
    } else {
      priority += 5;
    }
  }

  // Considerar valor do item
  priority += valor;

  return priority;
}

// Calcular prioridade de habilidade
function calculateSkillPriority(skill, botPlayer, opponent) {
  let priority = 10;

  const kind = skill.kind || skill.tipo || '';
  const base = skill.base || 0;

  // Ultimates têm altíssima prioridade
  if (kind === 'ultimate') {
    priority += 20;
  }

  // Habilidades de dano são prioritárias
  if (kind.includes('damage') || kind.includes('attack')) {
    priority += 12;
    priority += base * 2;

    // Maior prioridade se oponente estiver fraco
    const opponentLegend = opponent.zonas?.[ZONAS_CAMPO.LENDA_ATIVA];
    if (opponentLegend && (opponentLegend.vida || 5) < 3) {
      priority += 10;
    }
  }

  // Habilidades de cura são prioritárias se necessário
  if (kind.includes('heal') || kind.includes('cura')) {
    const botLegend = botPlayer.zonas?.[ZONAS_CAMPO.LENDA_ATIVA];
    if (botLegend && (botLegend.vida || 5) < 3) {
      priority += 15;
    } else {
      priority += 5;
    }
  }

  // Buffs e debuffs têm prioridade média
  if (kind.includes('buff') || kind.includes('debuff')) {
    priority += 7;
  }

  return priority;
}

// Extrair habilidades de uma carta
function extractSkills(card) {
  if (!card) return [];

  const abilities = card.habilidades || card.abilities;
  if (!abilities) return [];

  const skills = [];

  // Habilidades sequenciais (skill1, skill2, etc.)
  ['skill1', 'skill2', 'skill3', 'skill4', 'skill5'].forEach((key, index) => {
    const skill = abilities[key];
    if (skill && (skill.name || skill.nome)) {
      skills.push({
        ...skill,
        id: key,
        disponivel: true, // Simplificado - deveria verificar cooldowns
        tipo: key === 'skill5' ? 'ultimate' : index === 0 ? 'basica' : 'ativa'
      });
    }
  });

  // Passiva
  if (abilities.passive && (abilities.passive.name || abilities.passive.nome)) {
    skills.push({
      ...abilities.passive,
      id: 'passive',
      tipo: 'passiva',
      disponivel: true
    });
  }

  return skills;
}

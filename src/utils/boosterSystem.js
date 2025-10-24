// src/utils/boosterSystem.js
// Sistema de boosters com drop rates e pity system

import { valorComPadrao, primeiroValorDefinido } from './valores';

/**
 * Constantes do sistema de boosters
 */
export const BOOSTER_CONFIG = {
  // Cada booster contém 5 cartas de lendas
  CARTAS_POR_BOOSTER: 5,
  
  // Taxa de drop base para LENDAS - com pity system
  // Lendas só podem ser Épicas, Lendárias ou Míticas
  DROP_RATES_LENDAS: {
    MITICO: 0.005,      // 0.5%
    LENDARIO: 0.045,    // 4.5%
    EPICO: 0.950,       // 95% (resto da probabilidade)
  },

  // Pity system (garantias)
  PITY: {
    MITICO_GARANTIDO: 20, // Garantia de mítico a cada 20 boosters sem mítico
    SOFT_PITY_START: 15,  // Soft pity começa em 15 boosters
  },

  // Soft pity target: chance aproximada de mítico no penúltimo booster (antes da garantia)
  // Ex: 0.2 significa ~20% de chance perto do fim do soft pity. Ajuste para ter efeito suave.
  SOFT_PITY_TARGET: 0.2,

  // Preço de 1 booster em moedas
  PRECO_BOOSTER: 100,
  
  // Booster inicial gratuito
  BOOSTER_INICIAL_CARTAS: 5, // 5 cartas de lendas (épicas, lendárias ou míticas)
};

/**
 * Tipos de raridade em ordem de valor
 */
const ORDEM_RARIDADE = ['COMUM', 'INCOMUM', 'RARO', 'EPICO', 'LENDARIO', 'MITICO'];

/**
 * Raridades válidas apenas para cartas de LENDA
 * Lendas só podem ser Épicas, Lendárias ou Míticas
 */
const RARIDADES_LENDAS = ['EPICO', 'LENDARIO', 'MITICO'];

/**
 * Calcula a raridade de uma LENDA com base no pity counter
 * Lendas só podem ser Épicas, Lendárias ou Míticas
 * @param {number} pityMitico - Contador de boosters sem mítico
 * @returns {string} - Raridade sorteada (EPICO, LENDARIO ou MITICO)
 */
export function calcularRaridadeLenda(pityMitico) {
  // Hard pity - garantia absoluta no 20º booster
  if (pityMitico >= BOOSTER_CONFIG.PITY.MITICO_GARANTIDO) {
    return 'MITICO';
  }

  // Copiar chances base
  const chances = { ...BOOSTER_CONFIG.DROP_RATES_LENDAS };

  // Soft pity: aumentar a chance de mítico de forma LINEAR e controlada
  if (pityMitico >= BOOSTER_CONFIG.PITY.SOFT_PITY_START) {
    const boostersAposSoft = pityMitico - BOOSTER_CONFIG.PITY.SOFT_PITY_START + 1;
    const softSpan = BOOSTER_CONFIG.PITY.MITICO_GARANTIDO - BOOSTER_CONFIG.PITY.SOFT_PITY_START; // ex: 5
    const baseMitico = BOOSTER_CONFIG.DROP_RATES_LENDAS.MITICO || 0.005;
    const targetMitico = Math.max(baseMitico, Math.min(BOOSTER_CONFIG.SOFT_PITY_TARGET, 0.95));

    // incremento linear por passo de soft pity
    const incrementPerStep = (targetMitico - baseMitico) / Math.max(1, softSpan);
    const added = incrementPerStep * Math.min(boostersAposSoft, softSpan);

    chances.MITICO = baseMitico + added;
  }

  // Normalizar chances (dividir por total) para garantir soma == 1
  const total = Object.values(chances).reduce((s, v) => s + (v || 0), 0) || 1;
  const normalized = {};
  Object.keys(chances).forEach((k) => {
    normalized[k] = (chances[k] || 0) / total;
  });

  // Sortear raridade: iterar nas raridades válidas (não usar reverse() direto pois muta o array)
  const raridades = [...RARIDADES_LENDAS].slice().reverse();
  const numero = Math.random();
  let acumulado = 0;
  for (const raridade of raridades) {
    acumulado += normalized[raridade] || 0;
    if (numero <= acumulado) return raridade;
  }

  // Fallback
  return 'EPICO';
}

/**
 * Abre um booster e retorna as 5 cartas de lenda
 * @param {Array} cartasLendas - Pool de cartas lendas disponíveis
 * @param {number} pityMitico - Contador de pity do jogador
 * @returns {Object} - { cartas: Array, novoPityMitico: number, estatisticas: Object }
 */
export function abrirBooster(cartasLendas, pityMitico) {
  const cartasSorteadas = [];
  const estatisticas = {
    COMUM: 0,
    INCOMUM: 0,
    RARO: 0,
    EPICO: 0,
    LENDARIO: 0,
    MITICO: 0,
  };

  let miticoSorteado = false;

  // Sortear 5 cartas de LENDAS
  // IMPORTANTE: Usar o mesmo pity para todas as 5 cartas do booster
  for (let i = 0; i < BOOSTER_CONFIG.CARTAS_POR_BOOSTER; i++) {
    const raridade = calcularRaridadeLenda(pityMitico);
    
    // Filtrar lendas da raridade sorteada
    const lendasFiltradas = cartasLendas.filter((lenda) => {
      const raridadeLenda = primeiroValorDefinido(lenda.rarity, lenda.raridade, '').toUpperCase();
      return raridadeLenda === raridade;
    });

    // Log de quantas cartas foram encontradas
    console.log(`[Booster] Sorteou ${raridade}, encontrou ${lendasFiltradas.length} cartas dessa raridade`);

    // Sortear lenda aleatória dessa raridade
    let legendaSorteada;
    if (lendasFiltradas.length > 0) {
      const indiceAleatorio = Math.floor(Math.random() * lendasFiltradas.length);
      legendaSorteada = lendasFiltradas[indiceAleatorio];
    } else {
      // Fallback: sortear qualquer lenda e avisar
      console.warn(`[Booster] AVISO: Não encontrou cartas ${raridade} no banco! Usando fallback.`);
      const indiceAleatorio = Math.floor(Math.random() * cartasLendas.length);
      legendaSorteada = cartasLendas[indiceAleatorio];
    }

    // Usar a raridade real da carta do banco, não a sorteada
    const raridadeReal = primeiroValorDefinido(legendaSorteada.rarity, legendaSorteada.raridade, raridade).toUpperCase();

    cartasSorteadas.push({
      ...legendaSorteada,
      tipo: 'lenda',
    });

    // Contar pela raridade REAL da carta
    estatisticas[raridadeReal]++;

    // Marcar se alguma carta foi mítica
    if (raridadeReal === 'MITICO' || raridadeReal === 'MYTHIC') {
      miticoSorteado = true;
    }
  }

  // O pity só aumenta +1 por booster, não por carta
  const novoPityMitico = miticoSorteado ? 0 : pityMitico + 1;

  return {
    cartas: cartasSorteadas,
    novoPityMitico,
    estatisticas,
  };
}

/**
 * Calcula recompensa de booster baseado em dificuldade de quiz
 * @param {string} dificuldade - 'FACIL', 'MEDIO', 'DIFICIL'
 * @param {number} pontuacao - Pontuação obtida (0-100%)
 * @returns {Object} - { boosters: number, moedas: number, xp: number }
 */
export function calcularRecompensaQuiz(dificuldade, pontuacao) {
  const percentual = pontuacao / 100;

  const recompensas = {
    FACIL: {
      moedas: 100,
      xp: 50,
      boosterChance: 0.3, // 30% de chance
    },
    MEDIO: {
      moedas: 200,
      xp: 100,
      boosterChance: 0.6, // 60% de chance
    },
    DIFICIL: {
      moedas: 400,
      xp: 200,
      boosterChance: 1.0, // 100% de chance se > 70%
    },
  };

  const base = recompensas[dificuldade];
  const moedasFinais = Math.floor(base.moedas * percentual);
  const xpFinal = Math.floor(base.xp * percentual);

  // Calcular boosters ganhos
  let boosters = 0;
  if (percentual >= 0.7) {
    const sorteio = Math.random();
    if (sorteio < base.boosterChance) {
      if (dificuldade === 'DIFICIL') {
        boosters = 2;
      } else {
        boosters = 1;
      }
    }
  }

  return {
    boosters,
    moedas: moedasFinais,
    xp: xpFinal,
  };
}

/**
 * Verifica se jogador tem moedas suficientes para comprar booster
 * @param {number} moedasJogador - Moedas do jogador
 * @returns {boolean}
 */
export function podeComprarBooster(moedasJogador) {
  return moedasJogador >= BOOSTER_CONFIG.PRECO_BOOSTER;
}

/**
 * Formata estatísticas de pulls para exibição
 * @param {Object} historicoPulls - Histórico de pulls do jogador
 * @returns {Object} - Estatísticas formatadas
 */
export function calcularEstatisticasPulls(historicoPulls) {
  const total = valorComPadrao(historicoPulls.total, 0);
  const porRaridade = valorComPadrao(historicoPulls.porRaridade, {});

  const percentuais = {};
  for (const raridade in porRaridade) {
    if (total > 0) {
      percentuais[raridade] = (porRaridade[raridade] / total) * 100;
    } else {
      percentuais[raridade] = 0;
    }
  }

  return {
    total,
    porRaridade,
    percentuais,
    proximoEpico: BOOSTER_CONFIG.PITY.EPICO_HARD - valorComPadrao(historicoPulls.pityCounters?.epico, 0),
    proximoLendario: BOOSTER_CONFIG.PITY.LENDARIO_HARD - valorComPadrao(historicoPulls.pityCounters?.lendario, 0),
    proximoMitico: BOOSTER_CONFIG.PITY.MITICO_HARD - valorComPadrao(historicoPulls.pityCounters?.mitico, 0),
  };
}

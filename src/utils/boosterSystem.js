// src/utils/boosterSystem.js
// Sistema de boosters com drop rates e pity system

import { valorComPadrao, primeiroValorDefinido } from './valores';

/**
 * Constantes do sistema de boosters
 */
export const BOOSTER_CONFIG = {
  // Cada booster contém 5 cartas: 4 itens + 1 lenda
  CARTAS_POR_BOOSTER: 5,
  ITENS_POR_BOOSTER: 4,
  LENDAS_POR_BOOSTER: 1,

  // Taxa de drop base para LENDAS (a carta especial) - sem pity
  // Lendas só podem ser Épicas, Lendárias ou Míticas
  DROP_RATES_LENDAS: {
    MITICO: 0.005,      // 0.5%
    LENDARIO: 0.045,    // 4.5%
    EPICO: 0.950,       // 95% (resto da probabilidade)
  },

  // Taxa de drop para ITENS (as 4 cartas comuns do booster)
  // Itens podem ser de Comum a Lendário
  DROP_RATES_ITENS: {
    LENDARIO: 0.02,     // 2%
    EPICO: 0.08,        // 8%
    RARO: 0.15,         // 15%
    INCOMUM: 0.35,      // 35%
    COMUM: 0.40,        // 40%
  },

  // Pity system (garantias) - só se aplica à carta de LENDA
  PITY: {
    MITICO_GARANTIDO: 20, // Garantia de mítico a cada 20 boosters sem mítico
    SOFT_PITY_START: 15,  // Soft pity começa em 15 boosters
  },

  // Multiplicador de chance de mítico durante soft pity
  SOFT_PITY_MULTIPLIER: 2.5, // 2.5x chance por booster após 15

  // Preço de 1 booster em moedas
  PRECO_BOOSTER: 100,
  
  // Booster inicial gratuito
  BOOSTER_INICIAL_CARTAS: 5, // Mesmo formato: 4 itens + 1 lenda
};

/**
 * Tipos de raridade em ordem de valor
 */
const ORDEM_RARIDADE = ['COMUM', 'INCOMUM', 'RARO', 'EPICO', 'LENDARIO', 'MITICO'];

/**
 * Raridades válidas apenas para cartas de LENDA
 */
const RARIDADES_LENDAS = ['EPICO', 'LENDARIO', 'MITICO'];

/**
 * Raridades válidas para ITENS
 */
const RARIDADES_ITENS = ['COMUM', 'INCOMUM', 'RARO', 'EPICO', 'LENDARIO'];

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

  // Calcular chances base
  let chances = { ...BOOSTER_CONFIG.DROP_RATES_LENDAS };

  // Soft pity - aumenta chance de mítico após 15 boosters
  if (pityMitico >= BOOSTER_CONFIG.PITY.SOFT_PITY_START) {
    const boostersAposSoft = pityMitico - BOOSTER_CONFIG.PITY.SOFT_PITY_START + 1;
    const multiplicador = Math.pow(BOOSTER_CONFIG.SOFT_PITY_MULTIPLIER, boostersAposSoft);
    chances.MITICO *= multiplicador;
  }

  // Normalizar chances para somar 1
  const total = Object.values(chances).reduce((soma, valor) => soma + valor, 0);
  const chancesNormalizadas = {};
  for (const raridade in chances) {
    chancesNormalizadas[raridade] = chances[raridade] / total;
  }

  // Sortear raridade
  const numero = Math.random();
  let acumulado = 0;

  // Iterar apenas nas raridades válidas para lendas
  for (const raridade of RARIDADES_LENDAS.reverse()) {
    acumulado += chancesNormalizadas[raridade];
    if (numero <= acumulado) {
      return raridade;
    }
  }

  // Fallback: se algo der errado, retornar épico (menor raridade para lendas)
  return 'EPICO';
}

/**
 * Calcula a raridade de um ITEM (sem pity)
 * Itens podem ser de Comum a Lendário
 * @returns {string} - Raridade sorteada (COMUM, INCOMUM, RARO, EPICO ou LENDARIO)
 */
export function calcularRaridadeItem() {
  const chances = BOOSTER_CONFIG.DROP_RATES_ITENS;
  const numero = Math.random();
  let acumulado = 0;

  // Iterar nas raridades válidas para itens (do maior para o menor)
  for (const raridade of RARIDADES_ITENS.reverse()) {
    acumulado += chances[raridade];
    if (numero <= acumulado) {
      return raridade;
    }
  }

  // Fallback: se algo der errado, retornar comum (menor raridade para itens)
  return 'COMUM';
}

/**
 * Abre um booster e retorna as cartas (4 itens + 1 lenda)
 * @param {Array} cartasLendas - Pool de cartas lendas disponíveis
 * @param {Array} cartasItens - Pool de cartas de itens disponíveis
 * @param {number} pityMitico - Contador de pity do jogador
 * @returns {Object} - { cartas: Array, novoPityMitico: number, estatisticas: Object }
 */
export function abrirBooster(cartasLendas, cartasItens, pityMitico) {
  const cartasSorteadas = [];
  const estatisticas = {
    COMUM: 0,
    INCOMUM: 0,
    RARO: 0,
    EPICO: 0,
    LENDARIO: 0,
    MITICO: 0,
  };

  // 1. Sortear 4 cartas de ITENS
  for (let i = 0; i < BOOSTER_CONFIG.ITENS_POR_BOOSTER; i++) {
    const raridade = calcularRaridadeItem();
    
    // Filtrar itens da raridade sorteada
    const itensFiltrados = cartasItens.filter((item) => {
      const raridadeItem = primeiroValorDefinido(item.raridade, item.rarity, '').toUpperCase();
      return raridadeItem === raridade;
    });

    // Sortear item aleatório dessa raridade
    let itemSorteado;
    if (itensFiltrados.length > 0) {
      const indiceAleatorio = Math.floor(Math.random() * itensFiltrados.length);
      itemSorteado = itensFiltrados[indiceAleatorio];
    } else {
      // Fallback: sortear qualquer item
      const indiceAleatorio = Math.floor(Math.random() * cartasItens.length);
      itemSorteado = cartasItens[indiceAleatorio];
    }

    cartasSorteadas.push({
      ...itemSorteado,
      raridadeSorteada: raridade,
      tipo: 'item',
    });

    estatisticas[raridade]++;
  }

  // 2. Sortear 1 carta de LENDA (com pity)
  const raridadeLenda = calcularRaridadeLenda(pityMitico);
  
  // Filtrar lendas da raridade sorteada
  const lendasFiltradas = cartasLendas.filter((lenda) => {
    const raridadeLendaItem = primeiroValorDefinido(lenda.raridade, lenda.rarity, '').toUpperCase();
    return raridadeLendaItem === raridadeLenda;
  });

  // Sortear lenda aleatória dessa raridade
  let legendaSorteada;
  if (lendasFiltradas.length > 0) {
    const indiceAleatorio = Math.floor(Math.random() * lendasFiltradas.length);
    legendaSorteada = lendasFiltradas[indiceAleatorio];
  } else {
    // Fallback: sortear qualquer lenda
    const indiceAleatorio = Math.floor(Math.random() * cartasLendas.length);
    legendaSorteada = cartasLendas[indiceAleatorio];
  }

  cartasSorteadas.push({
    ...legendaSorteada,
    raridadeSorteada: raridadeLenda,
    tipo: 'lenda',
  });

  estatisticas[raridadeLenda]++;

  // 3. Atualizar pity
  const novoPityMitico = raridadeLenda === 'MITICO' ? 0 : pityMitico + 1;

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

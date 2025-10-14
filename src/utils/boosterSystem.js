// src/utils/boosterSystem.js
// Sistema de boosters com drop rates e pity system

import { valorComPadrao, primeiroValorDefinido } from './valores';

/**
 * Constantes do sistema de boosters
 */
export const BOOSTER_CONFIG = {
  // Tamanhos de boosters
  TAMANHOS: {
    PEQUENO: 3,
    MEDIO: 5,
    GRANDE: 10,
  },

  // Taxa de drop base (sem pity)
  DROP_RATES: {
    MITICO: 0.006,      // 0.6%
    LENDARIO: 0.051,    // 5.1%
    EPICO: 0.134,       // 13.4%
    RARO: 0.309,        // 30.9%
    INCOMUM: 0.35,      // 35%
    COMUM: 0.15,        // 15%
  },

  // Pity system (garantias)
  PITY: {
    EPICO_SOFT: 10,     // Após 10 pulls sem épico, chance aumenta
    EPICO_HARD: 15,     // Garantia de épico em 15 pulls
    LENDARIO_SOFT: 70,  // Após 70 pulls sem lendário, chance aumenta
    LENDARIO_HARD: 90,  // Garantia de lendário em 90 pulls
    MITICO_SOFT: 270,   // Após 270 pulls sem mítico, chance aumenta
    MITICO_HARD: 300,   // Garantia de mítico em 300 pulls
  },

  // Multiplicadores de pity soft
  SOFT_PITY_MULTIPLIER: {
    EPICO: 5,           // 5x chance após soft pity
    LENDARIO: 10,       // 10x chance após soft pity
    MITICO: 15,         // 15x chance após soft pity
  },

  // Preços em moedas
  PRECOS: {
    PEQUENO: 150,       // 3 cartas
    MEDIO: 400,         // 5 cartas (20% desconto)
    GRANDE: 800,        // 10 cartas (47% desconto)
  },
};

/**
 * Tipos de raridade em ordem de valor
 */
const ORDEM_RARIDADE = ['COMUM', 'INCOMUM', 'RARO', 'EPICO', 'LENDARIO', 'MITICO'];

/**
 * Calcula a raridade com base no pity counter
 * @param {Object} pityCounters - Contadores de pity do jogador
 * @returns {string} - Raridade sorteada
 */
export function calcularRaridadeComPity(pityCounters) {
  const contadores = valorComPadrao(pityCounters, {
    epico: 0,
    lendario: 0,
    mitico: 0,
  });

  // Hard pity - garantia absoluta
  if (contadores.mitico >= BOOSTER_CONFIG.PITY.MITICO_HARD) {
    return 'MITICO';
  }
  if (contadores.lendario >= BOOSTER_CONFIG.PITY.LENDARIO_HARD) {
    return 'LENDARIO';
  }
  if (contadores.epico >= BOOSTER_CONFIG.PITY.EPICO_HARD) {
    return 'EPICO';
  }

  // Calcular chances com soft pity
  let chances = { ...BOOSTER_CONFIG.DROP_RATES };

  // Soft pity para épico
  if (contadores.epico >= BOOSTER_CONFIG.PITY.EPICO_SOFT) {
    const multiplicador = BOOSTER_CONFIG.SOFT_PITY_MULTIPLIER.EPICO;
    chances.EPICO *= multiplicador;
  }

  // Soft pity para lendário
  if (contadores.lendario >= BOOSTER_CONFIG.PITY.LENDARIO_SOFT) {
    const multiplicador = BOOSTER_CONFIG.SOFT_PITY_MULTIPLIER.LENDARIO;
    chances.LENDARIO *= multiplicador;
  }

  // Soft pity para mítico
  if (contadores.mitico >= BOOSTER_CONFIG.PITY.MITICO_SOFT) {
    const multiplicador = BOOSTER_CONFIG.SOFT_PITY_MULTIPLIER.MITICO;
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

  for (const raridade of ORDEM_RARIDADE.reverse()) {
    acumulado += chancesNormalizadas[raridade];
    if (numero <= acumulado) {
      return raridade;
    }
  }

  return 'COMUM';
}

/**
 * Atualiza os contadores de pity após um pull
 * @param {Object} pityCounters - Contadores atuais
 * @param {string} raridadeObtida - Raridade da carta obtida
 * @returns {Object} - Contadores atualizados
 */
export function atualizarPityCounters(pityCounters, raridadeObtida) {
  const novosContadores = {
    epico: pityCounters.epico + 1,
    lendario: pityCounters.lendario + 1,
    mitico: pityCounters.mitico + 1,
  };

  // Resetar contadores quando obter a raridade correspondente ou superior
  const indiceObtido = ORDEM_RARIDADE.indexOf(raridadeObtida);

  if (indiceObtido >= ORDEM_RARIDADE.indexOf('EPICO')) {
    novosContadores.epico = 0;
  }
  if (indiceObtido >= ORDEM_RARIDADE.indexOf('LENDARIO')) {
    novosContadores.lendario = 0;
  }
  if (indiceObtido >= ORDEM_RARIDADE.indexOf('MITICO')) {
    novosContadores.mitico = 0;
  }

  return novosContadores;
}

/**
 * Abre um booster e retorna as cartas
 * @param {number} tamanho - Quantidade de cartas (3, 5 ou 10)
 * @param {Array} cartasDisponiveis - Pool de cartas disponíveis
 * @param {Object} pityCounters - Contadores de pity do jogador
 * @returns {Object} - { cartas: Array, novoPityCounter: Object, estatisticas: Object }
 */
export function abrirBooster(tamanho, cartasDisponiveis, pityCounters) {
  const cartasSorteadas = [];
  let novoPity = { ...pityCounters };
  const estatisticas = {
    COMUM: 0,
    INCOMUM: 0,
    RARO: 0,
    EPICO: 0,
    LENDARIO: 0,
    MITICO: 0,
  };

  for (let i = 0; i < tamanho; i++) {
    // Calcular raridade com pity
    const raridade = calcularRaridadeComPity(novoPity);
    
    // Atualizar pity
    novoPity = atualizarPityCounters(novoPity, raridade);
    
    // Filtrar cartas da raridade sorteada
    const cartasRaridade = cartasDisponiveis.filter((carta) => {
      const raridadeCarta = primeiroValorDefinido(carta.raridade, carta.rarity, '').toUpperCase();
      return raridadeCarta === raridade;
    });

    // Sortear carta aleatória dessa raridade
    let cartaSorteada;
    if (cartasRaridade.length > 0) {
      const indiceAleatorio = Math.floor(Math.random() * cartasRaridade.length);
      cartaSorteada = cartasRaridade[indiceAleatorio];
    } else {
      // Fallback: sortear qualquer carta
      const indiceAleatorio = Math.floor(Math.random() * cartasDisponiveis.length);
      cartaSorteada = cartasDisponiveis[indiceAleatorio];
    }

    cartasSorteadas.push({
      ...cartaSorteada,
      raridadeSorteada: raridade,
      novaCarta: true,
    });

    estatisticas[raridade]++;
  }

  return {
    cartas: cartasSorteadas,
    novoPityCounter: novoPity,
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
 * @param {string} tamanhoBooster - 'PEQUENO', 'MEDIO', 'GRANDE'
 * @returns {boolean}
 */
export function podeComprarBooster(moedasJogador, tamanhoBooster) {
  const preco = BOOSTER_CONFIG.PRECOS[tamanhoBooster];
  return moedasJogador >= preco;
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

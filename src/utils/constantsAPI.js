// src/utils/constantsAPI.js

/**
 * Cache das constantes para evitar múltiplas chamadas à API
 */
let cacheConstantes = null;

/**
 * Busca todas as constantes da API
 */
export async function obterConstantes() {
  if (cacheConstantes) {
    return cacheConstantes;
  }

  try {
    const resposta = await fetch('/api/constants');
    if (!resposta.ok) {
      console.error('[constantsAPI] Resposta inválida ao buscar constantes:', resposta.status);
      return obterFallbackConstantes();
    }

    cacheConstantes = await resposta.json();
    return cacheConstantes;
  } catch (erro) {
    console.error('Erro ao buscar constantes:', erro);
    return obterFallbackConstantes();
  }
}

function obterFallbackConstantes() {
  return {
    CATEGORIAS_CARTAS: {},
    RARIDADES_CARTAS: {},
    REGIOES: {},
    TIPOS_CARTA: {},
    ELEMENTOS: {},
    ESTACOES: {},
    COMBOS_CARTAS: {},
    MULTIPLICADORES: {}
  };
}

/**
 * Busca um tipo específico de constante
 */
export async function obterTipoConstante(tipo) {
  try {
    const resposta = await fetch(`/api/constants?type=${tipo}`);
    if (!resposta.ok) {
      console.error(`[constantsAPI] Resposta inválida ao buscar constante ${tipo}:`, resposta.status);
      return {};
    }

    return await resposta.json();
  } catch (erro) {
    console.error(`Erro ao buscar constante ${tipo}:`, erro);
    return {};
  }
}

/**
 * Força atualização do cache de constantes
 */
export function limparCacheConstantes() {
  cacheConstantes = null;
}

/**
 * Exporta constantes individuais para compatibilidade
 */
export async function obterCategorias() {
  const constantes = await obterConstantes();
  return constantes.CATEGORIAS_CARTAS || {};
}

export async function obterRaridades() {
  const constantes = await obterConstantes();
  return constantes.RARIDADES_CARTAS || {};
}

export async function obterRegioes() {
  const constantes = await obterConstantes();
  return constantes.REGIOES || {};
}

export async function obterTiposCartas() {
  const constantes = await obterConstantes();
  return constantes.TIPOS_CARTA || {};
}

export async function obterElementos() {
  const constantes = await obterConstantes();
  return constantes.ELEMENTOS || {};
}

export async function obterEstacoes() {
  const constantes = await obterConstantes();
  return constantes.ESTACOES || {};
}

export async function obterCombos() {
  const constantes = await obterConstantes();
  return constantes.COMBOS_CARTAS || {};
}

export async function obterMultiplicadores() {
  const constantes = await obterConstantes();
  return constantes.MULTIPLICADORES || {};
}

export async function obterConstantesDeck() {
  const constantes = await obterConstantes();
  return constantes.CONSTANTES_DECK || {};
}
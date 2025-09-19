// src/utils/constantsAPI.js

/**
 * Cache das constantes para evitar múltiplas chamadas à API
 */
let constantsCache = null;

/**
 * Busca todas as constantes da API
 */
export async function getConstants() {
  if (constantsCache) {
    return constantsCache;
  }

  try {
    const response = await fetch('/api/constants');
    if (!response.ok) {
      throw new Error('Erro ao buscar constantes');
    }
    
    constantsCache = await response.json();
    return constantsCache;
  } catch (error) {
    console.error('Erro ao buscar constantes:', error);
    // Fallback para caso a API falhe
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
}

/**
 * Busca um tipo específico de constante
 */
export async function getConstantType(type) {
  try {
    const response = await fetch(`/api/constants?type=${type}`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar constante ${type}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Erro ao buscar constante ${type}:`, error);
    return {};
  }
}

/**
 * Força atualização do cache de constantes
 */
export function clearConstantsCache() {
  constantsCache = null;
}

/**
 * Exporta constantes individuais para compatibilidade
 */
export async function getCategorias() {
  const constants = await getConstants();
  return constants.CATEGORIAS_CARTAS || {};
}

export async function getRaridades() {
  const constants = await getConstants();
  return constants.RARIDADES_CARTAS || {};
}

export async function getRegioes() {
  const constants = await getConstants();
  return constants.REGIOES || {};
}

export async function getTiposCartas() {
  const constants = await getConstants();
  return constants.TIPOS_CARTA || {};
}

export async function getElementos() {
  const constants = await getConstants();
  return constants.ELEMENTOS || {};
}

export async function getEstacoes() {
  const constants = await getConstants();
  return constants.ESTACOES || {};
}

export async function getCombos() {
  const constants = await getConstants();
  return constants.COMBOS_CARTAS || {};
}

export async function getMultiplicadores() {
  const constants = await getConstants();
  return constants.MULTIPLICADORES || {};
}

export async function getConstantesDeck() {
  const constants = await getConstants();
  return constants.CONSTANTES_DECK || {};
}
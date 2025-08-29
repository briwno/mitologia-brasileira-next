// src/utils/constants.js

export const CONSTANTES_DO_JOGO = {
  // Configurações de jogo
  TAMANHO_MAXIMO_MAO: 7,
  TAMANHO_MAXIMO_DECK: 30,
  TAMANHO_MINIMO_DECK: 20,
  COPIAS_MAXIMAS_POR_CARTA: 3,
  VIDA_INICIAL: 20,
  MANA_INICIAL: 1,
  MANA_MAXIMA: 10,
  LIMITE_TEMPO_TURNO: 300, // 5 minutos

  // Tipos de carta
  CARD_TYPES: {
    CREATURE: 'creature',
    SPELL: 'spell',
    ARTIFACT: 'artifact'
  },

  // Elementos
  ELEMENTS: {
    FIRE: 'Fogo',
    WATER: 'Água',
    EARTH: 'Terra',
    AIR: 'Ar',
    SHADOW: 'Sombra'
  },

  // Raridades
  RARITIES: {
  EPIC: 'Épico',
  LEGENDARY: 'Lendário',
  MYTHIC: 'Mítico'
  },

  // Regiões
  REGIONS: {
    NORTH: 'Amazônia',
    NORTHEAST: 'Nordeste',
    CENTERWEST: 'Centro-Oeste',
    SOUTHEAST: 'Sudeste',
    SOUTH: 'Sul',
    NATIONAL: 'Nacional'
  },

  // Categorias
  CATEGORIES: {
    FOREST_GUARDIANS: 'Guardiões da Floresta',
    WATER_SPIRITS: 'Espíritos das Águas',
    HAUNTINGS: 'Assombrações',
    NIGHT_CREATURES: 'Criaturas Noturnas',
    GIANT_CREATURES: 'Criaturas Gigantes'
  }
};

export const CONSTANTES_UI = {
  // Cores do tema
  COLORS: {
    PRIMARY: '#10B981', // green-500
    SECONDARY: '#3B82F6', // blue-500
    ACCENT: '#F59E0B', // yellow-500
    DANGER: '#EF4444', // red-500
    WARNING: '#F97316', // orange-500
    SUCCESS: '#10B981', // green-500
    INFO: '#3B82F6', // blue-500
  },

  // Breakpoints
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px'
  }
};

export const ENDPOINTS_API = {
  AUTH: '/api/auth',
  CARDS: '/api/cards',
  GAME: '/api/game',
  USER: '/api/user'
};

export const TIPOS_DE_CONQUISTA = {
  FIRST_WIN: 'first_win',
  COLLECTOR: 'collector',
  QUIZ_MASTER: 'quiz_master',
  WIN_STREAK: 'win_streak',
  REGION_EXPLORER: 'region_explorer',
  RANKED_WARRIOR: 'ranked_warrior'
};

export const MODOS_DE_JOGO = {
  CASUAL: 'casual',
  RANKED: 'ranked',
  TOURNAMENT: 'tournament',
  TUTORIAL: 'tutorial'
};

export const FASES_DO_JOGO = {
  COMPRA: 'compra',
  PRINCIPAL: 'principal',
  COMBATE: 'combate',
  FIM: 'fim'
};

export const TIPOS_DE_NOTIFICACAO = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

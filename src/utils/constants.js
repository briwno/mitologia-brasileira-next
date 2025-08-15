// src/utils/constants.js

export const GAME_CONSTANTS = {
  // Configurações de jogo
  MAX_HAND_SIZE: 7,
  MAX_DECK_SIZE: 30,
  MIN_DECK_SIZE: 20,
  MAX_COPIES_PER_CARD: 3,
  INITIAL_HEALTH: 20,
  INITIAL_MANA: 1,
  MAX_MANA: 10,
  TURN_TIME_LIMIT: 300, // 5 minutos

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

export const UI_CONSTANTS = {
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

export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  CARDS: '/api/cards',
  GAME: '/api/game',
  USER: '/api/user'
};

export const ACHIEVEMENT_TYPES = {
  FIRST_WIN: 'first_win',
  COLLECTOR: 'collector',
  QUIZ_MASTER: 'quiz_master',
  WIN_STREAK: 'win_streak',
  REGION_EXPLORER: 'region_explorer',
  RANKED_WARRIOR: 'ranked_warrior'
};

export const GAME_MODES = {
  CASUAL: 'casual',
  RANKED: 'ranked',
  TOURNAMENT: 'tournament',
  TUTORIAL: 'tutorial'
};

export const GAME_PHASES = {
  DRAW: 'draw',
  MAIN: 'main',
  COMBAT: 'combat',
  END: 'end'
};

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

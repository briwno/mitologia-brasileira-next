// src/utils/constants.js

export const CONSTANTES_DO_JOGO = {
  // Configurações de jogo - Nova estrutura
  TAMANHO_DECK_LENDAS: 5,      // 5 Lendas únicas no deck
  TAMANHO_DECK_ITENS: 10,      // 10 Itens no deck  
  TAMANHO_MAXIMO_MAO_ITENS: 3, // Máximo 3 itens na mão
  BANCO_LENDAS: 4,              // 4 lendas no banco (reserva)
  LENDA_ATIVA: 1,               // 1 lenda ativa em campo
  LIMITE_TEMPO_TURNO: 300,      // 5 minutos

  // Tipos de carta - Nova estrutura
  CARD_TYPES: {
    LENDA: 'lenda',     // Cartas de lenda (personagens jogáveis)
    ITEM: 'item'        // Cartas de item (equipamentos, consumíveis, etc.)
  },

  // Tipos de Item
  ITEM_TYPES: {
    OFENSIVO: 'ofensivo',
    DEFENSIVO: 'defensivo',
    UTILITARIO: 'utilitario'
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

export const ZONAS_CAMPO = {
  LENDA_ATIVA: 'lenda_ativa',     // 1 carta em combate
  BANCO_LENDAS: 'banco_lendas',   // 4 cartas de reserva
  MAO_ITENS: 'mao_itens',         // até 3 cartas na mão
  PILHA_ITENS: 'pilha_itens',     // cartas restantes para compra
  DESCARTE_ITENS: 'descarte_itens' // para reciclagem/habilidades
};

export const ACOES_TURNO = {
  USAR_HABILIDADE: 'usar_habilidade',
  TROCAR_LENDA: 'trocar_lenda', 
  USAR_ITEM: 'usar_item',
  ACAO_ESPECIAL: 'acao_especial'  // carregar energia, preparar defesa
};

export const FASES_DO_JOGO = {
  INICIO: 'inicio',           // Ativar passivas, resolver efeitos contínuos
  ACAO: 'acao',               // Escolher ação: habilidade, trocar lenda, usar item
  RESOLUCAO: 'resolucao',     // Calcular dano, aplicar efeitos, checar derrotas
  FIM_TURNO: 'fim_turno'      // Comprar item, aplicar efeitos de fim de turno
};

export const TIPOS_DE_NOTIFICACAO = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

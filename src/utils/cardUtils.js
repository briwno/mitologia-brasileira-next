// src/utils/cardUtils.js

// Mapas de tradução (API -> PT-BR) centralizados
export const TRANSLATION_MAPS = {
  RARITY: { EPIC: 'Épico', LEGENDARY: 'Lendário', MYTHIC: 'Mítico' },
  REGION: { 
    AMAZONIA: 'Amazônia', 
    NORTHEAST: 'Nordeste', 
    SOUTHEAST: 'Sudeste', 
    SOUTH: 'Sul', 
    MIDWEST: 'Centro-Oeste', 
    NATIONAL: 'Nacional' 
  },
  CATEGORY: { 
    GUARDIANS: 'Guardiões da Floresta', 
    SPIRITS: 'Espíritos das Águas', 
    HAUNTS: 'Assombrações', 
    PROTECTORS: 'Protetores Humanos', 
    MYSTICAL: 'Entidades Místicas' 
  },
  ELEMENT: { 
    EARTH: 'Terra', 
    WATER: 'Água', 
    FIRE: 'Fogo', 
    AIR: 'Ar', 
    SPIRIT: 'Espírito' 
  },
  SEASON: { 
    CARNIVAL: 'Carnaval', 
    SAO_JOAO: 'São João', 
    FESTA_JUNINA: 'Festa Junina', 
    CHRISTMAS: 'Natal' 
  },
  ITEM_TYPE: { 
    CONSUMABLE: 'Consumível', 
    EQUIPMENT: 'Equipamento', 
    ARTIFACT: 'Artefato', 
    RELIC: 'Relíquia', 
    SCROLL: 'Pergaminho' 
  }
};

/**
 * Função utilitária para traduzir valores usando os mapas
 * @param {string} value - Valor a ser traduzido
 * @param {Object} map - Mapa de tradução
 * @returns {string} - Valor traduzido ou original se não encontrado
 */
export const translate = (value, map) => map?.[value] || value;

/**
 * Formatar labels de enum (ex: SOME_VALUE -> Some Value)
 * @param {string} value - Valor enum
 * @returns {string} - Label formatado
 */
export const formatEnumLabel = (value) => {
  if (typeof value !== 'string') return value;
  return value.toLowerCase().split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

/**
 * Obter classes CSS para frames de raridade
 * @param {string} rarity - Raridade da carta
 * @returns {string} - Classes CSS
 */
export const getRarityFrameClasses = (rarity) => {
  switch (rarity) {
    case TRANSLATION_MAPS.RARITY.MYTHIC:
      return 'border-red-500 text-red-400 bg-red-900/20';
    case TRANSLATION_MAPS.RARITY.LEGENDARY:
      return 'border-yellow-500 text-yellow-400 bg-yellow-900/20';
    case TRANSLATION_MAPS.RARITY.EPIC:
      return 'border-purple-500 text-purple-400 bg-purple-900/20';
    default:
      return 'border-gray-500 text-gray-400 bg-gray-900/20';
  }
};

/**
 * Obter gradientes CSS para raridade
 * @param {string} rarity - Raridade da carta
 * @returns {string} - Classes de gradiente
 */
export const getRarityGradient = (rarity) => {
  switch (rarity) {
    case TRANSLATION_MAPS.RARITY.MYTHIC:
      return 'from-red-400/20 to-red-600/30 border-red-400/50';
    case TRANSLATION_MAPS.RARITY.LEGENDARY:
      return 'from-yellow-400/20 to-yellow-600/30 border-yellow-400/50';
    case TRANSLATION_MAPS.RARITY.EPIC:
      return 'from-purple-400/20 to-purple-600/30 border-purple-400/50';
    default:
      return 'from-gray-400/20 to-gray-600/30 border-gray-400/50';
  }
};

/**
 * Mapear carta da API para o formato local
 * @param {Object} apiCard - Carta no formato da API
 * @returns {Object} - Carta no formato local
 */
export const mapApiCardToLocal = (apiCard) => {
  if (!apiCard) return null;

  const seasonalBonus = apiCard.seasonalBonus || apiCard.seasonal_bonus;
  const seasonKey = seasonalBonus?.season || seasonalBonus?.estacao;
  const bonusSazonal = seasonalBonus ? {
    estacao: translate(seasonKey, TRANSLATION_MAPS.SEASON) || formatEnumLabel(seasonKey),
    descricao: seasonalBonus.description || seasonalBonus.descricao || seasonalBonus.text || '',
    multiplicador: seasonalBonus.multiplier || seasonalBonus.multiplicador || seasonalBonus.bonus || null
  } : null;

  return {
    id: apiCard.id,
    nome: apiCard.name,
    regiao: translate(apiCard.region, TRANSLATION_MAPS.REGION),
    categoria: translate(apiCard.category, TRANSLATION_MAPS.CATEGORY),
    raridade: translate(apiCard.rarity, TRANSLATION_MAPS.RARITY),
    elemento: translate(apiCard.element, TRANSLATION_MAPS.ELEMENT),
    ataque: apiCard.attack || 0,
    defesa: apiCard.defense || 0,
    vida: apiCard.life || apiCard.health || 0,
    custo: apiCard.cost || 0,
    descricao: apiCard.description || apiCard.lore || apiCard.history,
    imagens: apiCard.images || {},
    habilidades: apiCard.abilities || {},
    tipo: apiCard.cardType || apiCard.card_type || 'creature',
    tags: apiCard.tags || [],
    bonusSazonal,
    isStarter: apiCard.is_starter || false,
    condicaoDesbloqueio: apiCard.unlock_condition || apiCard.unlockCondition
  };
};

/**
 * Obter classes CSS para wrapper modal padrão
 * @returns {string} - Classes CSS do modal
 */
export const getModalClasses = () => 
  "fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4";

/**
 * Filtrar cartas baseado em critérios
 * @param {Array} cards - Array de cartas
 * @param {Object} filters - Filtros aplicados
 * @returns {Array} - Cartas filtradas
 */
export const filterCards = (cards, filters = {}) => {
  if (!Array.isArray(cards)) return [];

  return cards.filter(card => {
    const matchesSearch = !filters.search || 
      card.nome?.toLowerCase().includes(filters.search.toLowerCase()) ||
      card.regiao?.toLowerCase().includes(filters.search.toLowerCase()) ||
      card.categoria?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesRegion = !filters.region || filters.region === 'all' || card.regiao === filters.region;
    const matchesCategory = !filters.category || filters.category === 'all' || card.categoria === filters.category;
    const matchesRarity = !filters.rarity || filters.rarity === 'all' || card.raridade === filters.rarity;
    const matchesElement = !filters.element || filters.element === 'all' || card.elemento === filters.element;

    return matchesSearch && matchesRegion && matchesCategory && matchesRarity && matchesElement;
  });
};

/**
 * Obter ícone do tipo de carta
 * @param {string} cardType - Tipo da carta
 * @returns {string} - Emoji do tipo
 */
export const getCardTypeIcon = (cardType) => {
  const type = (cardType || '').toString().toLowerCase();
  switch (type) {
    case 'creature': return '👾';
    case 'spell': return '✨';
    case 'artifact': return '⚱️';
    default: return '👾';
  }
};
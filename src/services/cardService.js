// src/services/cardService.js
/**
 * Serviço centralizado para gerenciamento de cartas
 * Baseado na estrutura do cards.csv
 */

import { cardsAPI, itemCardsAPI } from '@/utils/api';

/**
 * Normaliza uma carta do banco de dados para o formato usado no jogo
 * Baseado em cards.csv com foco em abilities com sistema PP
 */
export function normalizeCard(rawCard) {
  if (!rawCard) return null;

  const isLegend = rawCard.category !== 'item' && rawCard.card_type !== 'item';
  
  // Parse abilities do JSON se necessário
  let abilities = rawCard.abilities;
  if (typeof abilities === 'string') {
    try {
      abilities = JSON.parse(abilities);
    } catch (e) {
      console.error('Erro ao fazer parse de abilities:', e);
      abilities = {};
    }
  }

  // Normalizar habilidades com sistema PP (ignorar cost, usar ppMax)
  const normalizedAbilities = {};
  if (abilities && typeof abilities === 'object') {
    Object.keys(abilities).forEach(key => {
      const skill = abilities[key];
      if (skill && typeof skill === 'object') {
        normalizedAbilities[key] = {
          name: skill.name || skill.nome || '',
          description: skill.description || skill.descricao || '',
          kind: skill.kind || skill.tipo || 'damage',
          base: skill.base || 0,
          ppMax: skill.ppMax || skill.pp_max || 10,
          ppCurrent: skill.ppMax || skill.pp_max || 10, // Iniciar com PP cheio
          // Ignorar cost - usar apenas PP
          chance: skill.chance || 1.0,
          stun: skill.stun || 0,
          heal: skill.heal || 0,
        };
      }
    });
  }

  // Parse images se for string
  let images = rawCard.images;
  if (typeof images === 'string') {
    try {
      images = JSON.parse(images);
    } catch (e) {
      images = { retrato: '', completa: '' };
    }
  }

  // Parse tags se for string
  let tags = rawCard.tags;
  if (typeof tags === 'string') {
    try {
      tags = JSON.parse(tags);
    } catch (e) {
      tags = [];
    }
  }

  return {
    // IDs e metadados
    id: rawCard.id,
    nome: rawCard.name || rawCard.nome,
    tipo: isLegend ? 'lenda' : 'item',
    
    // Informações da carta
    regiao: rawCard.region || rawCard.regiao || 'NATIONAL',
    categoria: rawCard.category || rawCard.categoria,
    tipo_carta: rawCard.card_type || rawCard.tipo_carta,
    raridade: rawCard.rarity || rawCard.raridade || 'COMMON',
    elemento: rawCard.element || rawCard.elemento || 'NEUTRAL',
    
    // Stats de combate (apenas para lendas)
    ataque: isLegend ? (rawCard.attack || rawCard.ataque || 0) : 0,
    defesa: isLegend ? (rawCard.defense || rawCard.defesa || 0) : 0,
    vida: isLegend ? (rawCard.health || rawCard.vida || 1) : 0,
    vidaMaxima: isLegend ? (rawCard.health || rawCard.vida || 1) : 0,
    vidaAtual: isLegend ? (rawCard.health || rawCard.vida || 1) : 0,
    
    // Habilidades (sistema PP)
    habilidades: normalizedAbilities,
    abilities: normalizedAbilities, // Alias
    
    // Informações visuais e lore
    imagem: images?.retrato || images?.completa || '/images/placeholder.svg',
    imagemCompleta: images?.completa || images?.retrato || '/images/placeholder.svg',
    images: images,
    historia: rawCard.lore || rawCard.historia || rawCard.description || '',
    descricao: rawCard.lore || rawCard.historia || rawCard.description || '',
    
    // Tags e condições
    tags: tags || [],
    condicao_desbloqueio: rawCard.unlock_condition || rawCard.condicao_desbloqueio,
    bonus_sazonal: rawCard.seasonal_bonus || rawCard.bonus_sazonal,
    is_starter: rawCard.is_starter || false,
    
    // Timestamps
    created_at: rawCard.created_at,
    updated_at: rawCard.updated_at,
    
    // Para item cards
    tipo_item: !isLegend ? (rawCard.type_item || rawCard.tipo_item) : null,
    valor: !isLegend ? (rawCard.value || rawCard.valor || 1) : null,
  };
}

/**
 * Busca todas as cartas disponíveis (lendas + itens)
 */
export async function getAllCards() {
  try {
    const [legendsResponse, itemsResponse] = await Promise.all([
      cardsAPI.getAll(),
      itemCardsAPI.getAll()
    ]);

    const legends = (legendsResponse.cards || []).map(card => 
      normalizeCard({ ...card, category: card.category || 'lenda' })
    );

    const items = (itemsResponse.itemCards || []).map(card => 
      normalizeCard({ ...card, category: 'item', card_type: 'item' })
    );

    return {
      all: [...legends, ...items],
      legends,
      items,
    };
  } catch (error) {
    console.error('[CardService] Erro ao buscar cartas:', error);
    throw error;
  }
}

/**
 * Busca uma carta específica por ID
 */
export async function getCardById(cardId) {
  try {
    const { all } = await getAllCards();
    return all.find(card => card.id === cardId);
  } catch (error) {
    console.error('[CardService] Erro ao buscar carta:', error);
    return null;
  }
}

/**
 * Busca múltiplas cartas por IDs
 */
export async function getCardsByIds(cardIds) {
  if (!Array.isArray(cardIds) || cardIds.length === 0) {
    return [];
  }

  try {
    const { all } = await getAllCards();
    return cardIds
      .map(id => all.find(card => card.id === id))
      .filter(Boolean)
      .map(card => normalizeCard(card));
  } catch (error) {
    console.error('[CardService] Erro ao buscar cartas:', error);
    return [];
  }
}

/**
 * Filtra cartas por critérios
 */
export function filterCards(cards, filters = {}) {
  let filtered = [...cards];

  if (filters.tipo) {
    filtered = filtered.filter(c => c.tipo === filters.tipo);
  }

  if (filters.elemento) {
    filtered = filtered.filter(c => c.elemento === filters.elemento);
  }

  if (filters.raridade) {
    filtered = filtered.filter(c => c.raridade === filters.raridade);
  }

  if (filters.regiao) {
    filtered = filtered.filter(c => c.regiao === filters.regiao);
  }

  if (filters.minAtaque !== undefined) {
    filtered = filtered.filter(c => c.ataque >= filters.minAtaque);
  }

  if (filters.maxAtaque !== undefined) {
    filtered = filtered.filter(c => c.ataque <= filters.maxAtaque);
  }

  return filtered;
}

/**
 * Ordena cartas por critério
 */
export function sortCards(cards, sortBy = 'name', order = 'asc') {
  const sorted = [...cards];

  sorted.sort((a, b) => {
    let valA, valB;

    switch (sortBy) {
      case 'name':
        valA = a.nome?.toLowerCase() || '';
        valB = b.nome?.toLowerCase() || '';
        break;
      case 'attack':
        valA = a.ataque || 0;
        valB = b.ataque || 0;
        break;
      case 'defense':
        valA = a.defesa || 0;
        valB = b.defesa || 0;
        break;
      case 'health':
        valA = a.vida || 0;
        valB = b.vida || 0;
        break;
      case 'rarity':
        const rarityOrder = { COMMON: 1, UNCOMMON: 2, RARE: 3, EPIC: 4, LEGENDARY: 5, MYTHIC: 6 };
        valA = rarityOrder[a.raridade] || 0;
        valB = rarityOrder[b.raridade] || 0;
        break;
      default:
        return 0;
    }

    if (order === 'desc') {
      return valA > valB ? -1 : valA < valB ? 1 : 0;
    }
    return valA < valB ? -1 : valA > valB ? 1 : 0;
  });

  return sorted;
}

export default {
  normalizeCard,
  getAllCards,
  getCardById,
  getCardsByIds,
  filterCards,
  sortCards,
};

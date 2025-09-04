// src/utils/cardHelpers.js
import { requireSupabaseAdmin } from '@/lib/supabase';

/**
 * Busca uma carta pelo ID no banco de dados
 */
export async function getCardById(cardId) {
  try {
    const supabase = requireSupabaseAdmin();
    
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('id', cardId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Carta não encontrada
      }
      throw error;
    }
    
    return data;
    
  } catch (error) {
    console.error('Erro ao buscar carta:', error);
    return null;
  }
}

/**
 * Busca múltiplas cartas pelos IDs
 */
export async function getCardsByIds(cardIds) {
  try {
    if (!cardIds || cardIds.length === 0) {
      return [];
    }
    
    const supabase = requireSupabaseAdmin();
    
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .in('id', cardIds);
    
    if (error) throw error;
    
    return data || [];
    
  } catch (error) {
    console.error('Erro ao buscar cartas:', error);
    return [];
  }
}

/**
 * Busca todas as cartas disponíveis
 */
export async function getAllCards() {
  try {
    const supabase = requireSupabaseAdmin();
    
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    return data || [];
    
  } catch (error) {
    console.error('Erro ao buscar cartas:', error);
    return [];
  }
}

/**
 * Busca cartas por filtros
 */
export async function getCardsByFilter(filters = {}) {
  try {
    const supabase = requireSupabaseAdmin();
    
    let query = supabase.from('cards').select('*');
    
    if (filters.region) {
      query = query.eq('region', filters.region);
    }
    
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    
    if (filters.rarity) {
      query = query.eq('rarity', filters.rarity);
    }
    
    if (filters.element) {
      query = query.eq('element', filters.element);
    }
    
    if (filters.isStarter !== undefined) {
      query = query.eq('is_starter', filters.isStarter);
    }
    
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%, lore.ilike.%${filters.search}%`);
    }
    
    query = query.order('name');
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data || [];
    
  } catch (error) {
    console.error('Erro ao buscar cartas com filtros:', error);
    return [];
  }
}

/**
 * Verifica se uma coleção de cartas é válida (todas as cartas existem)
 */
export async function validateCardCollection(cardIds) {
  try {
    if (!cardIds || cardIds.length === 0) {
      return { valid: true, invalidCards: [] };
    }
    
    const cards = await getCardsByIds(cardIds);
    const foundCardIds = cards.map(card => card.id);
    const invalidCards = cardIds.filter(id => !foundCardIds.includes(id));
    
    return {
      valid: invalidCards.length === 0,
      invalidCards
    };
    
  } catch (error) {
    console.error('Erro ao validar coleção:', error);
    return { valid: false, invalidCards: cardIds };
  }
}

/**
 * Converte carta do formato do banco para o formato da API legacy
 */
export function convertCardToLegacyFormat(card) {
  const firstSkill = card.abilities?.skill1 || {};
  
  return {
    id: card.id,
    name: card.name,
    region: card.region,
    category: card.category,
    attack: card.attack,
    defense: card.defense,
    life: card.health,
    cost: card.cost,
    ability: firstSkill.name || null,
    abilityDescription: firstSkill.description || null,
    rarity: card.rarity,
    history: card.lore,
    element: card.element,
    image: card.images?.retrato || card.images?.completa || `/images/cards/${card.id}.jpg`,
    
    // Campos adicionais do novo formato
    images: card.images,
    tags: card.tags,
    cardType: card.card_type,
    abilities: card.abilities,
    unlockCondition: card.unlock_condition,
    seasonalBonus: card.seasonal_bonus,
    isStarter: card.is_starter,
    createdAt: card.created_at,
    updatedAt: card.updated_at
  };
}

/**
 * Obtém estatísticas das cartas
 */
export async function getCardStats() {
  try {
    const supabase = requireSupabaseAdmin();
    
    // Contar total de cartas
    const { count: totalCards, error: countError } = await supabase
      .from('cards')
      .select('*', { count: 'exact', head: true });
    
    if (countError) throw countError;
    
    // Contar por raridade
    const { data: rarityStats, error: rarityError } = await supabase
      .from('cards')
      .select('rarity')
      .not('rarity', 'is', null);
    
    if (rarityError) throw rarityError;
    
    const rarityCount = rarityStats.reduce((acc, card) => {
      acc[card.rarity] = (acc[card.rarity] || 0) + 1;
      return acc;
    }, {});
    
    // Contar por região
    const { data: regionStats, error: regionError } = await supabase
      .from('cards')
      .select('region')
      .not('region', 'is', null);
    
    if (regionError) throw regionError;
    
    const regionCount = regionStats.reduce((acc, card) => {
      acc[card.region] = (acc[card.region] || 0) + 1;
      return acc;
    }, {});
    
    return {
      totalCards,
      byRarity: rarityCount,
      byRegion: regionCount
    };
    
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    return {
      totalCards: 0,
      byRarity: {},
      byRegion: {}
    };
  }
}

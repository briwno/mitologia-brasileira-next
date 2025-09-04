// src/utils/cardMigration.js
import { requireSupabaseAdmin } from '@/lib/supabase';
import { bancoDeCartas } from '@/data/cardsDatabase';

/**
 * Converte uma carta do formato JavaScript para o formato do banco de dados
 */
function convertCardToDatabaseFormat(card) {
  return {
    id: card.id,
    name: card.nome,
    region: card.regiao,
    category: card.categoria,
    card_type: card.tipo,
    cost: card.custo,
    attack: card.ataque || null,
    defense: card.defesa || null,
    health: card.vida || null,
    rarity: card.raridade,
    element: card.elemento || null,
    abilities: card.habilidades || {},
    lore: card.historia || null,
    images: card.imagens || {},
    tags: card.tags || [],
    unlock_condition: card.condicaoDesbloqueio || null,
    seasonal_bonus: card.bonusSazonal || null,
    is_starter: card.condicaoDesbloqueio === 'Starter card - sempre disponível'
  };
}

/**
 * Migra todas as cartas do cardsDatabase.js para o Supabase
 */
export async function migrateCardsToSupabase() {
  try {
    const supabase = requireSupabaseAdmin();
    
    console.log(`Iniciando migração de ${bancoDeCartas.length} cartas...`);
    
    // Converter todas as cartas para o formato do banco
    const cardsToInsert = bancoDeCartas
      .filter(card => card.id && card.nome) // Apenas cartas com dados completos
      .map(convertCardToDatabaseFormat);
    
    console.log(`Preparando ${cardsToInsert.length} cartas para inserção...`);
    
    // Inserir cartas em lotes
    const batchSize = 10;
    const results = [];
    
    for (let i = 0; i < cardsToInsert.length; i += batchSize) {
      const batch = cardsToInsert.slice(i, i + batchSize);
      
      console.log(`Inserindo lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(cardsToInsert.length / batchSize)}...`);
      
      const { data, error } = await supabase
        .from('cards')
        .upsert(batch, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error('Erro ao inserir lote:', error);
        throw error;
      }
      
      results.push(...(data || []));
    }
    
    console.log(`Migração concluída! ${results.length} cartas processadas.`);
    
    // Verificar total de cartas no banco
    const { count, error: countError } = await supabase
      .from('cards')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Erro ao contar cartas:', countError);
    } else {
      console.log(`Total de cartas no banco: ${count}`);
    }
    
    return {
      success: true,
      migratedCards: results.length,
      totalCardsInDatabase: count
    };
    
  } catch (error) {
    console.error('Erro na migração:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Verifica se uma carta existe no banco
 */
export async function checkCardExists(cardId) {
  try {
    const supabase = requireSupabaseAdmin();
    
    const { data, error } = await supabase
      .from('cards')
      .select('id')
      .eq('id', cardId)
      .maybeSingle();
    
    if (error) throw error;
    
    return !!data;
    
  } catch (error) {
    console.error('Erro ao verificar carta:', error);
    return false;
  }
}

/**
 * Obtém todas as cartas do banco
 */
export async function getAllCardsFromDatabase() {
  try {
    const supabase = requireSupabaseAdmin();
    
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('id');
    
    if (error) throw error;
    
    return data || [];
    
  } catch (error) {
    console.error('Erro ao buscar cartas:', error);
    return [];
  }
}

/**
 * Compara cartas do JavaScript com as do banco
 */
export async function compareCardsData() {
  try {
    const jsCards = bancoDeCartas.filter(card => card.id && card.nome);
    const dbCards = await getAllCardsFromDatabase();
    
    const jsCardIds = new Set(jsCards.map(card => card.id));
    const dbCardIds = new Set(dbCards.map(card => card.id));
    
    const onlyInJs = jsCards.filter(card => !dbCardIds.has(card.id));
    const onlyInDb = dbCards.filter(card => !jsCardIds.has(card.id));
    const inBoth = jsCards.filter(card => dbCardIds.has(card.id));
    
    return {
      totalJsCards: jsCards.length,
      totalDbCards: dbCards.length,
      onlyInJs: onlyInJs.length,
      onlyInDb: onlyInDb.length,
      inBoth: inBoth.length,
      missingFromDb: onlyInJs.map(card => ({ id: card.id, name: card.nome })),
      extraInDb: onlyInDb.map(card => ({ id: card.id, name: card.name }))
    };
    
  } catch (error) {
    console.error('Erro na comparação:', error);
    return null;
  }
}

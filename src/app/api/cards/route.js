// src/app/api/cards/route.js
import { NextResponse } from 'next/server';
import { requireSupabaseAdmin } from '@/lib/supabase';

/**
 * Converte uma carta do banco para o formato da API
 */
function formatCardForAPI(card) {
  // Extrair primeira habilidade para compatibilidade
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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    const category = searchParams.get('category');
    const rarity = searchParams.get('rarity');
    const element = searchParams.get('element');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit')) || null;
    const offset = parseInt(searchParams.get('offset')) || 0;

    const supabase = requireSupabaseAdmin();
    
    // Construir query
    let query = supabase.from('cards').select('*');
    
    // Aplicar filtros
    if (region && region !== 'all') {
      query = query.eq('region', region);
    }
    
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    
    if (rarity && rarity !== 'all') {
      query = query.eq('rarity', rarity);
    }
    
    if (element && element !== 'all') {
      query = query.eq('element', element);
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%, lore.ilike.%${search}%`);
    }
    
    // Paginação
    if (limit) {
      query = query.range(offset, offset + limit - 1);
    }
    
    // Ordenação
    query = query.order('name');
    
    const { data: cards, error } = await query;
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // Formatar cartas para a API
    const formattedCards = cards.map(formatCardForAPI);

    return NextResponse.json({
      cards: formattedCards,
      total: formattedCards.length
    });

  } catch (error) {
    console.error('Cards API error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { action, cardId, userId } = await request.json();
    const supabase = requireSupabaseAdmin();

    if (action === 'unlock') {
      // Buscar carta
      const { data: card, error: cardError } = await supabase
        .from('cards')
        .select('*')
        .eq('id', cardId)
        .single();
      
      if (cardError || !card) {
        return NextResponse.json(
          { error: 'Carta não encontrada' },
          { status: 404 }
        );
      }

      // Verificar se o usuário existe
      if (userId) {
        const { data: player, error: playerError } = await supabase
          .from('players')
          .select('id')
          .eq('id', userId)
          .single();
        
        if (playerError || !player) {
          return NextResponse.json(
            { error: 'Usuário não encontrado' },
            { status: 404 }
          );
        }

        // Adicionar carta à coleção do usuário
        const { data: collection, error: collectionError } = await supabase
          .from('collections')
          .select('cards')
          .eq('player_id', userId)
          .single();
        
        if (collectionError && collectionError.code !== 'PGRST116') {
          throw collectionError;
        }
        
        const currentCards = collection?.cards || [];
        
        // Verificar se a carta já está na coleção
        if (currentCards.includes(cardId)) {
          return NextResponse.json({
            message: 'Carta já desbloqueada',
            card: formatCardForAPI(card)
          });
        }
        
        // Adicionar carta à coleção
        const newCards = [...currentCards, cardId];
        
        const { error: updateError } = await supabase
          .from('collections')
          .upsert({
            player_id: userId,
            cards: newCards
          }, { onConflict: 'player_id' });
        
        if (updateError) {
          throw updateError;
        }
      }

      return NextResponse.json({
        message: `Carta ${card.name} desbloqueada!`,
        card: formatCardForAPI(card)
      });
    }

    return NextResponse.json(
      { error: 'Ação inválida' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Cards POST error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

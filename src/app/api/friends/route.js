// src/app/api/friends/route.js
// API para gerenciar sistema de amizades
import { NextResponse } from 'next/server';
import { requireSupabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/friends
 * Buscar amigos e solicitações
 * Query params:
 * - playerId: ID do jogador (obrigatório)
 * - status: filtrar por status (pending, accepted, rejected, blocked)
 */
export async function GET(req) {
  console.log('[Friends API] GET request received');
  try {
    const supabase = requireSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    
    const playerId = searchParams.get('playerId');
    const status = searchParams.get('status');

    if (!playerId) {
      return NextResponse.json(
        { error: 'playerId é obrigatório' },
        { status: 400 }
      );
    }

    // Query base: buscar amizades onde o jogador é player_id OU friend_id
    let query = supabase
      .from('friends')
      .select(`
        id,
        player_id,
        friend_id,
        status,
        created_at,
        updated_at
      `);

    // Filtrar por status se fornecido
    if (status) {
      query = query.eq('status', status);
    }

    // Buscar onde o jogador está em qualquer lado da amizade
    query = query.or(`player_id.eq.${playerId},friend_id.eq.${playerId}`);

    const { data: friendships, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('[Friends API] Erro ao buscar amizades:', error);
      throw error;
    }

    // Buscar informações dos amigos
    const friendIds = new Set();
    friendships.forEach(friendship => {
      // Adicionar o ID do outro jogador (não o playerId atual)
      const otherId = friendship.player_id === playerId 
        ? friendship.friend_id 
        : friendship.player_id;
      friendIds.add(otherId);
    });

    // Buscar dados dos amigos
    let friends = [];
    if (friendIds.size > 0) {
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('id, nickname, avatar_url, level, mmr, titulo_selecionado')
        .in('id', Array.from(friendIds));

      if (playersError) {
        console.error('[Friends API] Erro ao buscar dados dos jogadores:', playersError);
      } else {
        friends = playersData || [];
      }
    }

    // Montar resposta com dados completos
    const friendsWithData = friendships.map(friendship => {
      const otherId = friendship.player_id === playerId 
        ? friendship.friend_id 
        : friendship.player_id;
      
      const friendData = friends.find(f => f.id === otherId);
      const isSentByMe = friendship.player_id === playerId;

      return {
        id: friendship.id,
        friendshipId: friendship.id,
        status: friendship.status,
        createdAt: friendship.created_at,
        updatedAt: friendship.updated_at,
        isSentByMe,
        friend: friendData || {
          id: otherId,
          nickname: 'Jogador Desconhecido',
          avatar_url: '/images/avatars/default.png',
          level: 1,
          mmr: 0
        }
      };
    });

    console.log(`[Friends API] Retornando ${friendsWithData.length} amizades`);
    return NextResponse.json({
      friends: friendsWithData,
      total: friendsWithData.length
    });

  } catch (error) {
    console.error('[Friends API] Erro GET:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/friends
 * Criar solicitação de amizade
 * Body: { playerId, friendId }
 */
export async function POST(req) {
  console.log('[Friends API] POST request received');
  try {
    const { playerId, friendId } = await req.json();

    if (!playerId || !friendId) {
      return NextResponse.json(
        { error: 'playerId e friendId são obrigatórios' },
        { status: 400 }
      );
    }

    if (playerId === friendId) {
      return NextResponse.json(
        { error: 'Você não pode adicionar a si mesmo como amigo' },
        { status: 400 }
      );
    }

    const supabase = requireSupabaseAdmin();

    // Verificar se o amigo existe
    const { data: friendExists } = await supabase
      .from('players')
      .select('id')
      .eq('id', friendId)
      .single();

    if (!friendExists) {
      return NextResponse.json(
        { error: 'Jogador não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se já existe uma solicitação (em qualquer direção)
    const { data: existing } = await supabase
      .from('friends')
      .select('*')
      .or(`and(player_id.eq.${playerId},friend_id.eq.${friendId}),and(player_id.eq.${friendId},friend_id.eq.${playerId})`)
      .maybeSingle();

    if (existing) {
      if (existing.status === 'blocked') {
        return NextResponse.json(
          { error: 'Não é possível adicionar este jogador' },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: 'Já existe uma solicitação entre vocês' },
        { status: 409 }
      );
    }

    // Criar nova solicitação
    const { data: newFriendship, error } = await supabase
      .from('friends')
      .insert({
        player_id: playerId,
        friend_id: friendId,
        status: 'pending'
      })
      .select('*')
      .single();

    if (error) {
      console.error('[Friends API] Erro ao criar amizade:', error);
      throw error;
    }

    console.log('[Friends API] Solicitação criada:', newFriendship.id);
    return NextResponse.json({
      success: true,
      friendship: newFriendship
    }, { status: 201 });

  } catch (error) {
    console.error('[Friends API] Erro POST:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/friends
 * Atualizar status de amizade (aceitar, rejeitar, bloquear)
 * Body: { friendshipId, status }
 */
export async function PUT(req) {
  console.log('[Friends API] PUT request received');
  try {
    const { friendshipId, status } = await req.json();

    if (!friendshipId || !status) {
      return NextResponse.json(
        { error: 'friendshipId e status são obrigatórios' },
        { status: 400 }
      );
    }

    const validStatuses = ['accepted', 'rejected', 'blocked'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido. Use: accepted, rejected, blocked' },
        { status: 400 }
      );
    }

    const supabase = requireSupabaseAdmin();

    const { data: updated, error } = await supabase
      .from('friends')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', friendshipId)
      .select('*')
      .single();

    if (error) {
      console.error('[Friends API] Erro ao atualizar amizade:', error);
      throw error;
    }

    if (!updated) {
      return NextResponse.json(
        { error: 'Amizade não encontrada' },
        { status: 404 }
      );
    }

    console.log('[Friends API] Amizade atualizada:', friendshipId, 'para', status);
    return NextResponse.json({
      success: true,
      friendship: updated
    });

  } catch (error) {
    console.error('[Friends API] Erro PUT:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/friends
 * Remover amizade
 * Body: { friendshipId }
 */
export async function DELETE(req) {
  console.log('[Friends API] DELETE request received');
  try {
    const { friendshipId } = await req.json();

    if (!friendshipId) {
      return NextResponse.json(
        { error: 'friendshipId é obrigatório' },
        { status: 400 }
      );
    }

    const supabase = requireSupabaseAdmin();

    const { error } = await supabase
      .from('friends')
      .delete()
      .eq('id', friendshipId);

    if (error) {
      console.error('[Friends API] Erro ao deletar amizade:', error);
      throw error;
    }

    console.log('[Friends API] Amizade deletada:', friendshipId);
    return NextResponse.json({
      success: true,
      message: 'Amizade removida com sucesso'
    });

  } catch (error) {
    console.error('[Friends API] Erro DELETE:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

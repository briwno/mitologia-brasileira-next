// src/app/api/decks/[id]/route.js
import { NextResponse } from 'next/server';
import { requireSupabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/decks/[id]
 * Busca um deck específico por ID
 */
export async function GET(req, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'ID do deck é obrigatório' }, { status: 400 });
    }

    const supabase = requireSupabaseAdmin();
    
    // Buscar deck por ID
    const { data, error } = await supabase
      .from('decks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[Decks API] Erro ao buscar deck:', error);
      
      // Se não encontrou, retorna 404
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Deck não encontrado' }, { status: 404 });
      }
      
      return NextResponse.json({ error: 'Erro ao buscar deck' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Deck não encontrado' }, { status: 404 });
    }

    // Mapear snake_case para camelCase
    const deck = {
      id: data.id,
      name: data.name,
      cards: data.cards,
      isActive: data.is_active,
      format: data.format,
      ownerId: data.owner_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    return NextResponse.json({ deck });
  } catch (e) {
    console.error('[Decks API] Erro interno:', e);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

/**
 * PUT /api/decks/[id]
 * Atualiza um deck específico
 */
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'ID do deck é obrigatório' }, { status: 400 });
    }

    const supabase = requireSupabaseAdmin();

    // Preparar dados para atualização
    const updateData = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.cards !== undefined) updateData.cards = body.cards;
    if (body.isActive !== undefined) updateData.is_active = body.isActive;
    if (body.format !== undefined) updateData.format = body.format;

    // Adicionar updated_at
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('decks')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('[Decks API] Erro ao atualizar deck:', error);
      
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Deck não encontrado' }, { status: 404 });
      }
      
      return NextResponse.json({ error: 'Erro ao atualizar deck' }, { status: 500 });
    }

    // Mapear snake_case para camelCase
    const deck = {
      id: data.id,
      name: data.name,
      cards: data.cards,
      isActive: data.is_active,
      format: data.format,
      ownerId: data.owner_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    return NextResponse.json({ deck, updated: true });
  } catch (e) {
    console.error('[Decks API] Erro interno:', e);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

/**
 * DELETE /api/decks/[id]
 * Deleta um deck específico
 */
export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'ID do deck é obrigatório' }, { status: 400 });
    }

    const supabase = requireSupabaseAdmin();

    const { error } = await supabase
      .from('decks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Decks API] Erro ao deletar deck:', error);
      
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Deck não encontrado' }, { status: 404 });
      }
      
      return NextResponse.json({ error: 'Erro ao deletar deck' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, deleted: true });
  } catch (e) {
    console.error('[Decks API] Erro interno:', e);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// src/app/api/item-cards/route.js
import { NextResponse } from 'next/server';
import { requireSupabaseAdmin } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Format item card for API response
function formatItemCardForAPI(item) {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    itemType: item.item_type,
    rarity: item.rarity,
    effects: item.effects,
    lore: item.lore,
    images: item.images,
    unlockCondition: item.unlock_condition,
    isTradeable: item.is_tradeable,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

// GET - List item cards with optional filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rarity = searchParams.get('rarity');
    const itemType = searchParams.get('itemType');
    const isTradeable = searchParams.get('isTradeable');
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;

    let query = supabase
      .from('item_cards')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (rarity) {
      query = query.eq('rarity', rarity.toUpperCase());
    }

    if (itemType) {
      query = query.eq('item_type', itemType.toUpperCase());
    }

    if (isTradeable !== null && isTradeable !== undefined) {
      query = query.eq('is_tradeable', isTradeable === 'true');
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching item cards:', error);
      return NextResponse.json({ error: 'Failed to fetch item cards' }, { status: 500 });
    }

    const formattedItems = data.map(formatItemCardForAPI);

    return NextResponse.json({
      itemCards: formattedItems,
      total: count,
      limit,
      offset
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new item card
export async function POST(request) {
  try {
    const supabase = await requireSupabaseAdmin();
    const body = await request.json();
    
    // Map camelCase to snake_case for database
    const itemData = {
      id: body.id,
      name: body.name,
      description: body.description,
      item_type: body.itemType,
      rarity: body.rarity,
      effects: body.effects || {},
      lore: body.lore,
      images: body.images || {},
      unlock_condition: body.unlockCondition,
      is_tradeable: body.isTradeable !== undefined ? body.isTradeable : true,
    };

    const { data, error } = await supabase
      .from('item_cards')
      .insert([itemData])
      .select()
      .single();

    if (error) {
      console.error('Error creating item card:', error);
      return NextResponse.json({ error: 'Failed to create item card' }, { status: 500 });
    }

    return NextResponse.json({
      itemCard: formatItemCardForAPI(data),
      message: 'Item card created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update item card
export async function PUT(request) {
  try {
    const supabase = await requireSupabaseAdmin();
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Item card ID is required' }, { status: 400 });
    }

    // Map camelCase to snake_case for database
    const updateData = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.itemType !== undefined) updateData.item_type = body.itemType;
    if (body.rarity !== undefined) updateData.rarity = body.rarity;
    if (body.effects !== undefined) updateData.effects = body.effects;
    if (body.lore !== undefined) updateData.lore = body.lore;
    if (body.images !== undefined) updateData.images = body.images;
    if (body.unlockCondition !== undefined) updateData.unlock_condition = body.unlockCondition;
    if (body.isTradeable !== undefined) updateData.is_tradeable = body.isTradeable;
    
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('item_cards')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating item card:', error);
      return NextResponse.json({ error: 'Failed to update item card' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Item card not found' }, { status: 404 });
    }

    return NextResponse.json({
      itemCard: formatItemCardForAPI(data),
      message: 'Item card updated successfully'
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete item card
export async function DELETE(request) {
  try {
    const supabase = await requireSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Item card ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('item_cards')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting item card:', error);
      return NextResponse.json({ error: 'Failed to delete item card' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Item card deleted successfully'
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
// src/app/api/currency/route.js
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSupabaseAdmin } from '@/lib/supabase';

const UpdateCurrencySchema = z.object({
  playerId: z.number().int(),
  currencyType: z.enum(['gold', 'gems', 'dust', 'tokens']),
  amount: z.number().int(),
  reason: z.string().min(1),
  metadata: z.object({}).optional()
});

const SpendCurrencySchema = z.object({
  playerId: z.number().int(),
  costs: z.object({
    gold: z.number().int().min(0).optional(),
    gems: z.number().int().min(0).optional(),
    dust: z.number().int().min(0).optional(),
    tokens: z.number().int().min(0).optional()
  }),
  reason: z.string().min(1),
  metadata: z.object({}).optional()
});

// GET /api/currency?playerId=123 - Get player's currency balances
export async function GET(req) {
  try {
    const supabase = requireSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const playerId = searchParams.get('playerId');
    
    if (!playerId) {
      return NextResponse.json({ error: 'playerId is required' }, { status: 400 });
    }

    const { data: currencies, error } = await supabase
      .from('player_currencies')
      .select('*')
      .eq('player_id', parseInt(playerId))
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Create default currency record if it doesn't exist
        const { data: newCurrencies, error: createError } = await supabase
          .from('player_currencies')
          .insert({
            player_id: parseInt(playerId),
            gold: 1000,
            gems: 50,
            dust: 0,
            tokens: 0
          })
          .select('*')
          .single();

        if (createError) throw createError;
        return NextResponse.json({ currencies: newCurrencies });
      }
      throw error;
    }

    return NextResponse.json({ currencies });
  } catch (error) {
    console.error('GET /api/currency error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch currencies' },
      { status: 500 }
    );
  }
}

// POST /api/currency/add - Add currency to player
export async function POST(req) {
  try {
    const supabase = requireSupabaseAdmin();
    const body = await req.json();
    const { playerId, currencyType, amount, reason, metadata } = UpdateCurrencySchema.parse(body);

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be positive' },
        { status: 400 }
      );
    }

    // Get current currencies
    const { data: currentCurrencies, error: fetchError } = await supabase
      .from('player_currencies')
      .select('*')
      .eq('player_id', playerId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    // Update currency
    const updateQuery = {};
    updateQuery[currencyType] = (currentCurrencies?.[currencyType] || 0) + amount;

    const { data: updatedCurrencies, error: updateError } = await supabase
      .from('player_currencies')
      .upsert({
        player_id: playerId,
        ...updateQuery,
        updated_at: new Date().toISOString()
      }, { onConflict: 'player_id' })
      .select('*')
      .single();

    if (updateError) throw updateError;

    // Record transaction
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        player_id: playerId,
        transaction_type: 'reward',
        currency_type: currencyType,
        amount: amount,
        reason: reason,
        metadata: metadata || {}
      });

    if (transactionError) throw transactionError;

    return NextResponse.json({
      message: `Added ${amount} ${currencyType}`,
      currencies: updatedCurrencies
    });

  } catch (error) {
    console.error('POST /api/currency/add error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to add currency' },
      { status: 500 }
    );
  }
}

// POST /api/currency/spend - Spend multiple currencies (for purchases)
export async function SPEND(req) {
  try {
    const supabase = requireSupabaseAdmin();
    const body = await req.json();
    const { playerId, costs, reason, metadata } = SpendCurrencySchema.parse(body);

    // Get current currencies
    const { data: currentCurrencies, error: fetchError } = await supabase
      .from('player_currencies')
      .select('*')
      .eq('player_id', playerId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Player currencies not found' },
          { status: 404 }
        );
      }
      throw fetchError;
    }

    // Check if player has enough currencies
    const insufficientFunds = [];
    Object.entries(costs).forEach(([currency, cost]) => {
      if (cost > 0 && currentCurrencies[currency] < cost) {
        insufficientFunds.push({
          currency,
          required: cost,
          available: currentCurrencies[currency]
        });
      }
    });

    if (insufficientFunds.length > 0) {
      return NextResponse.json({
        error: 'Insufficient funds',
        details: insufficientFunds
      }, { status: 400 });
    }

    // Deduct currencies
    const newBalances = { ...currentCurrencies };
    const transactions = [];

    Object.entries(costs).forEach(([currency, cost]) => {
      if (cost > 0) {
        newBalances[currency] -= cost;
        transactions.push({
          player_id: playerId,
          transaction_type: 'purchase',
          currency_type: currency,
          amount: -cost, // Negative for spending
          reason: reason,
          metadata: metadata || {}
        });
      }
    });

    // Update currencies
    const { data: updatedCurrencies, error: updateError } = await supabase
      .from('player_currencies')
      .update({
        gold: newBalances.gold,
        gems: newBalances.gems,
        dust: newBalances.dust,
        tokens: newBalances.tokens,
        updated_at: new Date().toISOString()
      })
      .eq('player_id', playerId)
      .select('*')
      .single();

    if (updateError) throw updateError;

    // Record transactions
    if (transactions.length > 0) {
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert(transactions);

      if (transactionError) throw transactionError;
    }

    return NextResponse.json({
      message: 'Purchase completed successfully',
      currencies: updatedCurrencies,
      spent: costs
    });

  } catch (error) {
    console.error('POST /api/currency/spend error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to process purchase' },
      { status: 500 }
    );
  }
}

// GET /api/currency/transactions?playerId=123 - Get transaction history
export async function GET_TRANSACTIONS(req) {
  try {
    const supabase = requireSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const playerId = searchParams.get('playerId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type'); // Optional filter by transaction type
    
    if (!playerId) {
      return NextResponse.json({ error: 'playerId is required' }, { status: 400 });
    }

    let query = supabase
      .from('transactions')
      .select('*')
      .eq('player_id', parseInt(playerId))
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) {
      query = query.eq('transaction_type', type);
    }

    const { data: transactions, error } = await query;

    if (error) throw error;

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('player_id', parseInt(playerId));

    if (countError) throw countError;

    return NextResponse.json({
      transactions,
      pagination: {
        total: count,
        limit,
        offset,
        hasMore: offset + limit < count
      }
    });

  } catch (error) {
    console.error('GET /api/currency/transactions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

// Helper function to check if player can afford something
export async function canAfford(supabase, playerId, costs) {
  const { data: currencies, error } = await supabase
    .from('player_currencies')
    .select('*')
    .eq('player_id', playerId)
    .single();

  if (error) return { canAfford: false, error: 'Player not found' };

  const insufficientFunds = [];
  Object.entries(costs).forEach(([currency, cost]) => {
    if (cost > 0 && currencies[currency] < cost) {
      insufficientFunds.push({
        currency,
        required: cost,
        available: currencies[currency]
      });
    }
  });

  return {
    canAfford: insufficientFunds.length === 0,
    insufficientFunds: insufficientFunds.length > 0 ? insufficientFunds : null,
    currentBalances: currencies
  };
}

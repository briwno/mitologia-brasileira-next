// src/app/api/test-novo/route.js
import { NextResponse } from 'next/server';
import { requireSupabaseAdmin } from '@/lib/supabase';

export async function GET(request) {
  try {
    const supabase = requireSupabaseAdmin();
    
    // Buscar cartas marcadas como novo
    const { data: cartas, error: erroCartas } = await supabase
      .from('cards')
      .select('id, name, novo')
      .eq('novo', true);
    
    // Buscar itens marcados como novo
    const { data: itens, error: erroItens } = await supabase
      .from('item_cards')
      .select('id, name, novo')
      .eq('novo', true);
    
    // Buscar algumas cartas aleatórias para ver o campo novo
    const { data: amostraCartas, error: erroAmostra } = await supabase
      .from('cards')
      .select('id, name, novo')
      .limit(5);
    
    return NextResponse.json({
      status: 'ok',
      cartasComNovo: {
        count: cartas?.length || 0,
        cartas: cartas || [],
        erro: erroCartas?.message || null
      },
      itensComNovo: {
        count: itens?.length || 0,
        itens: itens || [],
        erro: erroItens?.message || null
      },
      amostraCartas: {
        cartas: amostraCartas || [],
        erro: erroAmostra?.message || null
      },
      instrucoes: {
        message: 'Para marcar cartas como NOVO, execute no Supabase:',
        sql: "UPDATE cards SET novo = true WHERE id IN ('id1', 'id2', 'id3');"
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

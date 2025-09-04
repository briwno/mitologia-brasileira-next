// src/app/api/admin/fix-permissions/route.js
import { NextResponse } from 'next/server';
import { requireSupabaseAdmin } from '@/lib/supabase';

function isAuthorized(req) {
  const url = new URL(req.url);
  const qp = url.searchParams.get('token');
  const hp = req.headers.get('x-seed-token');
  const expected = process.env.ADMIN_SEED_TOKEN;
  if (expected) return qp === expected || hp === expected;
  return process.env.NODE_ENV !== 'production';
}

export async function POST(req) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const supabase = requireSupabaseAdmin();
    console.log('Aplicando correções de permissão...');

    // Lista de comandos SQL para desabilitar RLS e dar permissões
    const sqlCommands = [
      // Desabilitar RLS em todas as tabelas
      'ALTER TABLE public.players DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE public.collections DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE public.decks DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE public.matches DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE public.cards DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE public.player_currencies DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE public.player_stats DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE public.achievements DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE public.player_achievements DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE public.quests DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE public.player_quests DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE public.seasons DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE public.match_history DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE public.friendships DISABLE ROW LEVEL SECURITY;',
      
      // Dar permissões
      'GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;',
      'GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;',
      'GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;',
      'GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;'
    ];

    const results = [];
    
    for (const command of sqlCommands) {
      try {
        console.log(`Executando: ${command}`);
        const { data, error } = await supabase.rpc('exec_sql', { sql: command });
        
        if (error) {
          console.error(`Erro em "${command}":`, error);
          results.push({ command, success: false, error: error.message });
        } else {
          console.log(`✓ Sucesso: ${command}`);
          results.push({ command, success: true });
        }
      } catch (err) {
        console.error(`Exceção em "${command}":`, err);
        results.push({ command, success: false, error: err.message });
      }
    }

    // Verificar se conseguimos acessar uma tabela
    try {
      const { data: testData, error: testError } = await supabase
        .from('players')
        .select('count', { count: 'exact', head: true });
      
      if (testError) {
        console.error('Ainda há erro de acesso:', testError);
      } else {
        console.log('✓ Acesso às tabelas funcionando!');
      }
    } catch (err) {
      console.error('Erro no teste de acesso:', err);
    }

    return NextResponse.json({
      success: true,
      message: 'Correções de permissão aplicadas',
      results,
      note: 'Se ainda houver erros, execute o SQL manualmente no Supabase Dashboard'
    });

  } catch (error) {
    console.error('Erro ao aplicar correções:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      message: 'Instruções para corrigir permissões',
      steps: [
        '1. Vá ao Supabase Dashboard → SQL Editor',
        '2. Execute este SQL:',
        '',
        'ALTER TABLE public.players DISABLE ROW LEVEL SECURITY;',
        'ALTER TABLE public.collections DISABLE ROW LEVEL SECURITY;',
        'ALTER TABLE public.decks DISABLE ROW LEVEL SECURITY;',
        'ALTER TABLE public.cards DISABLE ROW LEVEL SECURITY;',
        'ALTER TABLE public.player_currencies DISABLE ROW LEVEL SECURITY;',
        'ALTER TABLE public.player_stats DISABLE ROW LEVEL SECURITY;',
        'ALTER TABLE public.achievements DISABLE ROW LEVEL SECURITY;',
        'ALTER TABLE public.player_achievements DISABLE ROW LEVEL SECURITY;',
        'ALTER TABLE public.quests DISABLE ROW LEVEL SECURITY;',
        'ALTER TABLE public.player_quests DISABLE ROW LEVEL SECURITY;',
        'ALTER TABLE public.seasons DISABLE ROW LEVEL SECURITY;',
        'ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;',
        'ALTER TABLE public.match_history DISABLE ROW LEVEL SECURITY;',
        'ALTER TABLE public.friendships DISABLE ROW LEVEL SECURITY;',
        'ALTER TABLE public.matches DISABLE ROW LEVEL SECURITY;',
        '',
        'GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;',
        'GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;',
        'GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;',
        'GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;',
        '',
        '3. Depois execute: POST /api/admin/setup-database?token=changeme'
      ]
    });

  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

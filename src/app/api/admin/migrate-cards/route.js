// src/app/api/admin/migrate-cards/route.js
import { NextResponse } from 'next/server';
import { migrateCardsToSupabase, compareCardsData } from '@/utils/cardMigration';

function isAuthorized(req) {
  const url = new URL(req.url);
  const qp = url.searchParams.get('token');
  const hp = req.headers.get('x-seed-token');
  const expected = process.env.ADMIN_SEED_TOKEN;
  if (expected) return qp === expected || hp === expected;
  // se não houver token configurado, permitir apenas em desenvolvimento
  return process.env.NODE_ENV !== 'production';
}

export async function POST(req) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    console.log('Iniciando migração das cartas...');
    
    const result = await migrateCardsToSupabase();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Migração concluída com sucesso',
        migratedCards: result.migratedCards,
        totalCardsInDatabase: result.totalCardsInDatabase
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Erro na migração:', error);
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

    console.log('Comparando dados das cartas...');
    
    const comparison = await compareCardsData();
    
    if (comparison) {
      return NextResponse.json({
        success: true,
        comparison
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Erro na comparação'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Erro na comparação:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

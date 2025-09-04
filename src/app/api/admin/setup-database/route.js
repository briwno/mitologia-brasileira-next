// src/app/api/admin/setup-database/route.js
import { NextResponse } from 'next/server';
import { migrateCardsToSupabase, compareCardsData } from '@/utils/cardMigration';
import { seedGameData, checkGameDataExists } from '@/utils/gameDataSeeder';

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

    console.log('=== INICIANDO SETUP COMPLETO DO BANCO DE DADOS ===');
    
    const results = {
      cards: { success: false, details: null },
      gameData: { success: false, details: null },
      summary: {}
    };

    // 1. Migrar cartas
    console.log('\n1. Migrando cartas do JavaScript para o Supabase...');
    const cardsMigration = await migrateCardsToSupabase();
    results.cards = cardsMigration;

    if (cardsMigration.success) {
      console.log(`✓ Cartas migradas: ${cardsMigration.migratedCards}`);
      console.log(`✓ Total no banco: ${cardsMigration.totalCardsInDatabase}`);
    } else {
      console.log(`✗ Erro na migração de cartas: ${cardsMigration.error}`);
    }

    // 2. Comparar dados de cartas
    console.log('\n2. Comparando dados de cartas...');
    const comparison = await compareCardsData();
    if (comparison) {
      console.log(`✓ Cartas em JS: ${comparison.totalJsCards}`);
      console.log(`✓ Cartas no DB: ${comparison.totalDbCards}`);
      console.log(`✓ Em ambos: ${comparison.inBoth}`);
      if (comparison.missingFromDb.length > 0) {
        console.log(`⚠ Faltando no DB: ${comparison.missingFromDb.length}`);
      }
    }

    // 3. Seed dados do jogo
    console.log('\n3. Inserindo dados iniciais do jogo...');
    const gameDataResult = await seedGameData();
    results.gameData.success = gameDataResult;

    // 4. Verificar status final
    console.log('\n4. Verificando status final...');
    const dataStatus = await checkGameDataExists();
    results.summary = {
      cardsTotal: cardsMigration.totalCardsInDatabase || 0,
      achievementsTotal: dataStatus.achievements,
      questsTotal: dataStatus.quests,
      seasonsTotal: dataStatus.seasons,
      allDataPresent: cardsMigration.success && dataStatus.hasData
    };

    console.log('\n=== RESUMO FINAL ===');
    console.log(`Cartas no banco: ${results.summary.cardsTotal}`);
    console.log(`Achievements: ${results.summary.achievementsTotal}`);
    console.log(`Quests: ${results.summary.questsTotal}`);
    console.log(`Seasons: ${results.summary.seasonsTotal}`);
    console.log(`Setup completo: ${results.summary.allDataPresent ? 'SIM' : 'NÃO'}`);

    return NextResponse.json({
      success: results.summary.allDataPresent,
      message: results.summary.allDataPresent 
        ? 'Banco de dados configurado com sucesso!' 
        : 'Setup concluído com alguns problemas',
      results,
      comparison
    });

  } catch (error) {
    console.error('Erro no setup do banco:', error);
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

    console.log('Verificando status do banco de dados...');
    
    // Verificar dados das cartas
    const comparison = await compareCardsData();
    
    // Verificar dados do jogo
    const dataStatus = await checkGameDataExists();
    
    const status = {
      cards: {
        inJs: comparison?.totalJsCards || 0,
        inDb: comparison?.totalDbCards || 0,
        missing: comparison?.missingFromDb?.length || 0,
        extra: comparison?.extraInDb?.length || 0
      },
      gameData: {
        achievements: dataStatus.achievements,
        quests: dataStatus.quests,
        seasons: dataStatus.seasons,
        hasData: dataStatus.hasData
      },
      isReady: (comparison?.totalDbCards > 0) && dataStatus.hasData
    };

    return NextResponse.json({
      success: true,
      status,
      ready: status.isReady,
      message: status.isReady 
        ? 'Banco configurado e pronto para uso' 
        : 'Banco precisa ser configurado'
    });

  } catch (error) {
    console.error('Erro ao verificar status:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

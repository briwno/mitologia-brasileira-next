// src/app/api/admin/setup-database/route.js
import { NextResponse } from 'next/server';
import { migrateCardsToSupabase, compareCardsData } from '@/utils/cardMigration';
import { seedGameData, checkGameDataExists } from '@/utils/gameDataSeeder';
import { supabase } from '@/lib/supabase';

function isAuthorized(req) {
  const url = new URL(req.url);
  const qp = url.searchParams.get('token');
  const hp = req.headers.get('x-seed-token');
  const expected = process.env.ADMIN_SEED_TOKEN;
  if (expected) return qp === expected || hp === expected;
  // se não houver token configurado, permitir apenas em desenvolvimento
  return process.env.NODE_ENV !== 'production';
}

async function setupItemCardsTable() {
  try {
    console.log('Setting up item_cards table...');
    
    // Check if table exists
    const { data: existingTable, error: checkError } = await supabase
      .from('item_cards')
      .select('id')
      .limit(1);
    
    if (checkError && checkError.code === '42P01') {
      // Table doesn't exist, create it
      console.log('Creating item_cards table...');
      
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS public.item_cards (
          id text NOT NULL,
          name text NOT NULL,
          description text,
          item_type text NOT NULL,
          rarity text NOT NULL,
          effects jsonb NOT NULL DEFAULT '{}'::jsonb,
          lore text,
          images jsonb NOT NULL DEFAULT '{}'::jsonb,
          unlock_condition text,
          is_tradeable boolean DEFAULT true,
          created_at timestamp with time zone DEFAULT now(),
          updated_at timestamp with time zone DEFAULT now(),
          CONSTRAINT item_cards_pkey PRIMARY KEY (id)
        );
        
        ALTER TABLE public.item_cards ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "Allow public read access to item_cards" ON public.item_cards
          FOR SELECT USING (true);
        
        CREATE POLICY IF NOT EXISTS "Allow authenticated users to insert item_cards" ON public.item_cards
          FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
        
        CREATE POLICY IF NOT EXISTS "Allow authenticated users to update item_cards" ON public.item_cards
          FOR UPDATE USING (auth.uid() IS NOT NULL);
        
        CREATE POLICY IF NOT EXISTS "Allow authenticated users to delete item_cards" ON public.item_cards
          FOR DELETE USING (auth.uid() IS NOT NULL);
        
        CREATE INDEX IF NOT EXISTS idx_item_cards_rarity ON public.item_cards(rarity);
        CREATE INDEX IF NOT EXISTS idx_item_cards_item_type ON public.item_cards(item_type);
        CREATE INDEX IF NOT EXISTS idx_item_cards_is_tradeable ON public.item_cards(is_tradeable);
      `;
      
      const { error: createError } = await supabase.rpc('execute_sql', { sql: createTableSQL });
      
      if (createError) {
        console.log('Error creating table, trying alternative method...');
        // If RPC doesn't work, try direct creation (this might not work depending on Supabase setup)
        throw new Error(`Failed to create item_cards table: ${createError.message}`);
      }
      
      console.log('✓ item_cards table created successfully');
    } else {
      console.log('✓ item_cards table already exists');
    }
    
    // Add sample data if table is empty
    const { data: existingData, error: countError } = await supabase
      .from('item_cards')
      .select('id')
      .limit(1);
    
    if (!countError && (!existingData || existingData.length === 0)) {
      console.log('Adding sample item cards...');
      
      const sampleItems = [
        {
          id: 'item_001',
          name: 'Poção de Cura do Pajé',
          description: 'Restaura vida usando ervas sagradas da floresta',
          item_type: 'CONSUMABLE',
          rarity: 'COMMON',
          effects: { type: 'heal', value: 50, description: 'Restaura 50 pontos de vida' },
          lore: 'Uma poção preparada pelos pajés usando plantas medicinais da Amazônia.',
          images: { portrait: '/images/placeholder.svg', full: '/images/placeholder.svg' },
          unlock_condition: 'Encontrada no primeiro nível',
          is_tradeable: true
        },
        {
          id: 'item_002',
          name: 'Amuleto do Curupira',
          description: 'Proteção mística contra criaturas malignas',
          item_type: 'ARTIFACT',
          rarity: 'RARE',
          effects: { type: 'protection', value: 20, description: 'Reduz dano recebido em 20%' },
          lore: 'Um amuleto abençoado pelo próprio Curupira, protetor das florestas.',
          images: { portrait: '/images/placeholder.svg', full: '/images/placeholder.svg' },
          unlock_condition: 'Recompensa da missão do Curupira',
          is_tradeable: true
        },
        {
          id: 'item_003',
          name: 'Espada de Luz de Iara',
          description: 'Lâmina forjada nas profundezas dos rios',
          item_type: 'EQUIPMENT',
          rarity: 'LEGENDARY',
          effects: { type: 'weapon', attack: 75, special: 'water_damage', description: '+75 de ataque, dano adicional de água' },
          lore: 'Uma espada mística forjada pela Iara nas profundezas dos rios sagrados.',
          images: { portrait: '/images/placeholder.svg', full: '/images/placeholder.svg' },
          unlock_condition: 'Recompensa especial da Iara',
          is_tradeable: false
        }
      ];
      
      const { error: insertError } = await supabase
        .from('item_cards')
        .insert(sampleItems);
      
      if (insertError) {
        console.log('Warning: Could not insert sample data:', insertError.message);
      } else {
        console.log('✓ Sample item cards added successfully');
      }
    }
    
    return { success: true, message: 'item_cards table setup completed' };
    
  } catch (error) {
    console.error('Error setting up item_cards table:', error);
    return { success: false, error: error.message };
  }
}

export async function POST(req) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    console.log('=== INICIANDO SETUP COMPLETO DO BANCO DE DADOS ===');
    
    const results = {
      cards: { success: false, details: null },
      itemCards: { success: false, details: null },
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

    // 2. Setup item_cards table
    console.log('\n2. Configurando tabela item_cards...');
    const itemCardsSetup = await setupItemCardsTable();
    results.itemCards = itemCardsSetup;

    if (itemCardsSetup.success) {
      console.log('✓ Tabela item_cards configurada com sucesso');
    } else {
      console.log(`✗ Erro na configuração da tabela item_cards: ${itemCardsSetup.error}`);
    }

    // 3. Comparar dados de cartas
    console.log('\n3. Comparando dados de cartas...');
    const comparison = await compareCardsData();
    if (comparison) {
      console.log(`✓ Cartas em JS: ${comparison.totalJsCards}`);
      console.log(`✓ Cartas no DB: ${comparison.totalDbCards}`);
      console.log(`✓ Em ambos: ${comparison.inBoth}`);
      if (comparison.missingFromDb.length > 0) {
        console.log(`⚠ Faltando no DB: ${comparison.missingFromDb.length}`);
      }
    }

    // 4. Seed dados do jogo
    console.log('\n4. Inserindo dados iniciais do jogo...');
    const gameDataResult = await seedGameData();
    results.gameData.success = gameDataResult;

    // 5. Verificar status final
    console.log('\n5. Verificando status final...');
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

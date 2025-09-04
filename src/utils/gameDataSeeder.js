// src/utils/gameDataSeeder.js
import { requireSupabaseAdmin } from '@/lib/supabase';

/**
 * Dados iniciais dos achievements
 */
const INITIAL_ACHIEVEMENTS = [
  {
    id: 'first_win',
    name: 'Primeira Vitória',
    description: 'Ganhe sua primeira partida',
    icon: '🏆',
    category: 'Combat',
    rarity: 'Common',
    criteria: { wins: 1 },
    rewards: { gold: 100, xp: 50 }
  },
  {
    id: 'collector_novice',
    name: 'Colecionador Novato',
    description: 'Colete 10 cartas diferentes',
    icon: '📚',
    category: 'Collection',
    rarity: 'Common',
    criteria: { unique_cards: 10 },
    rewards: { gold: 200, gems: 10 }
  },
  {
    id: 'amazon_explorer',
    name: 'Explorador da Amazônia',
    description: 'Colete todas as cartas da região Amazônica',
    icon: '🌳',
    category: 'Regional',
    rarity: 'Epic',
    criteria: { region_complete: 'Amazônia' },
    rewards: { gold: 500, gems: 50, dust: 100 }
  },
  {
    id: 'win_streak_5',
    name: 'Sequência de Vitórias',
    description: 'Ganhe 5 partidas seguidas',
    icon: '🔥',
    category: 'Combat',
    rarity: 'Rare',
    criteria: { win_streak: 5 },
    rewards: { gold: 300, gems: 25 }
  },
  {
    id: 'mythic_collector',
    name: 'Colecionador Mítico',
    description: 'Colete uma carta Mítica',
    icon: '⭐',
    category: 'Collection',
    rarity: 'Legendary',
    criteria: { mythic_cards: 1 },
    rewards: { gold: 1000, gems: 100, dust: 200 }
  }
];

/**
 * Dados iniciais das quests
 */
const INITIAL_QUESTS = [
  {
    id: 'daily_wins',
    name: 'Vitórias Diárias',
    description: 'Ganhe 3 partidas hoje',
    quest_type: 'Daily',
    category: 'Combat',
    objectives: { wins: 3 },
    rewards: { gold: 150, xp: 100 },
    duration_hours: 24
  },
  {
    id: 'weekly_collection',
    name: 'Colecionador Semanal',
    description: 'Colete 5 cartas novas esta semana',
    quest_type: 'Weekly',
    category: 'Collection',
    objectives: { new_cards: 5 },
    rewards: { gold: 500, gems: 30, dust: 50 },
    duration_hours: 168
  },
  {
    id: 'pvp_master',
    name: 'Mestre PvP',
    description: 'Ganhe 10 partidas ranqueadas',
    quest_type: 'Weekly',
    category: 'Ranked',
    objectives: { ranked_wins: 10 },
    rewards: { gold: 750, gems: 50, dust: 100 },
    duration_hours: 168
  },
  {
    id: 'museum_visitor',
    name: 'Visitante do Museu',
    description: 'Complete 3 quizzes no museu',
    quest_type: 'Daily',
    category: 'Knowledge',
    objectives: { quiz_complete: 3 },
    rewards: { gold: 200, xp: 150 },
    duration_hours: 24
  }
];

/**
 * Dados iniciais das seasons
 */
const INITIAL_SEASONS = [
  {
    name: 'Temporada de Lançamento',
    description: 'A primeira temporada do Ka\'aguy Card Game',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 dias
    theme: 'launch',
    rewards: {
      rank_1: { gold: 5000, gems: 500, dust: 1000 },
      rank_10: { gold: 2000, gems: 200, dust: 400 },
      rank_100: { gold: 1000, gems: 100, dust: 200 }
    },
    special_rules: {
      bonus_xp: 1.5,
      starter_deck_bonus: true
    },
    is_active: true
  }
];

/**
 * Insere achievements iniciais
 */
async function seedAchievements() {
  try {
    const supabase = requireSupabaseAdmin();
    
    console.log('Inserindo achievements...');
    
    const { data, error } = await supabase
      .from('achievements')
      .upsert(INITIAL_ACHIEVEMENTS, { onConflict: 'id' });
    
    if (error) throw error;
    
    console.log(`✓ ${INITIAL_ACHIEVEMENTS.length} achievements inseridos`);
    return true;
    
  } catch (error) {
    console.error('Erro ao inserir achievements:', error);
    return false;
  }
}

/**
 * Insere quests iniciais
 */
async function seedQuests() {
  try {
    const supabase = requireSupabaseAdmin();
    
    console.log('Inserindo quests...');
    
    const { data, error } = await supabase
      .from('quests')
      .upsert(INITIAL_QUESTS, { onConflict: 'id' });
    
    if (error) throw error;
    
    console.log(`✓ ${INITIAL_QUESTS.length} quests inseridos`);
    return true;
    
  } catch (error) {
    console.error('Erro ao inserir quests:', error);
    return false;
  }
}

/**
 * Insere seasons iniciais
 */
async function seedSeasons() {
  try {
    const supabase = requireSupabaseAdmin();
    
    console.log('Inserindo seasons...');
    
    const { data, error } = await supabase
      .from('seasons')
      .upsert(INITIAL_SEASONS, { onConflict: 'name' });
    
    if (error) throw error;
    
    console.log(`✓ ${INITIAL_SEASONS.length} seasons inseridas`);
    return true;
    
  } catch (error) {
    console.error('Erro ao inserir seasons:', error);
    return false;
  }
}

/**
 * Executa o seed completo de dados do jogo
 */
export async function seedGameData() {
  try {
    console.log('Iniciando seed dos dados do jogo...');
    
    const results = await Promise.all([
      seedAchievements(),
      seedQuests(),
      seedSeasons()
    ]);
    
    const success = results.every(result => result === true);
    
    if (success) {
      console.log('✓ Seed de dados do jogo concluído com sucesso!');
    } else {
      console.log('⚠ Alguns dados falharam ao ser inseridos');
    }
    
    return success;
    
  } catch (error) {
    console.error('Erro geral no seed:', error);
    return false;
  }
}

/**
 * Verifica se os dados iniciais já foram inseridos
 */
export async function checkGameDataExists() {
  try {
    const supabase = requireSupabaseAdmin();
    
    const [achievementsCheck, questsCheck, seasonsCheck] = await Promise.all([
      supabase.from('achievements').select('id', { count: 'exact', head: true }),
      supabase.from('quests').select('id', { count: 'exact', head: true }),
      supabase.from('seasons').select('id', { count: 'exact', head: true })
    ]);
    
    return {
      achievements: achievementsCheck.count || 0,
      quests: questsCheck.count || 0,
      seasons: seasonsCheck.count || 0,
      hasData: (achievementsCheck.count > 0) && (questsCheck.count > 0) && (seasonsCheck.count > 0)
    };
    
  } catch (error) {
    console.error('Erro ao verificar dados:', error);
    return {
      achievements: 0,
      quests: 0,
      seasons: 0,
      hasData: false
    };
  }
}

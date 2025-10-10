-- ============================================================================
-- SCHEMA SIMPLIFICADO DO BANCO DE DADOS - MITOLOGIA BRASILEIRA
-- ============================================================================
-- Este arquivo contém o schema completo e simplificado do banco de dados.
-- Execute este script no Supabase SQL Editor para criar/atualizar as tabelas.
-- ============================================================================

-- Limpar tabelas existentes (CUIDADO: apaga todos os dados)
-- Descomente apenas se quiser resetar o banco completamente
-- DROP TABLE IF EXISTS public.matches CASCADE;
-- DROP TABLE IF EXISTS public.decks CASCADE;
-- DROP TABLE IF EXISTS public.collections CASCADE;
-- DROP TABLE IF EXISTS public.contos CASCADE;
-- DROP TABLE IF EXISTS public.item_cards CASCADE;
-- DROP TABLE IF EXISTS public.cards CASCADE;
-- DROP TABLE IF EXISTS public.quizzes CASCADE;
-- DROP TABLE IF EXISTS public.players CASCADE;

-- ============================================================================
-- TABELA: players
-- Armazena dados dos jogadores
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.players (
  id BIGSERIAL PRIMARY KEY,
  uid TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  email TEXT UNIQUE,
  password TEXT NOT NULL,
  avatar_url TEXT DEFAULT 'https://img.icons8.com/color/96/user.png',
  mmr INTEGER DEFAULT 1000,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 500,
  title TEXT DEFAULT 'Iniciante',
  banned BOOLEAN DEFAULT false,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_players_username ON public.players(username);
CREATE INDEX IF NOT EXISTS idx_players_email ON public.players(email);
CREATE INDEX IF NOT EXISTS idx_players_uid ON public.players(uid);
CREATE INDEX IF NOT EXISTS idx_players_mmr ON public.players(mmr DESC);

-- Comentários
COMMENT ON TABLE public.players IS 'Tabela principal de jogadores';
COMMENT ON COLUMN public.players.uid IS 'ID único gerado automaticamente (timestamp + random)';
COMMENT ON COLUMN public.players.username IS 'Nome de usuário único para login';
COMMENT ON COLUMN public.players.email IS 'Email único do jogador';
COMMENT ON COLUMN public.players.coins IS 'Moedas do jogo (currency)';

-- ============================================================================
-- TABELA: cards
-- Armazena as cartas de lendas do jogo
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  category TEXT NOT NULL,
  card_type TEXT NOT NULL DEFAULT 'lenda',
  attack INTEGER DEFAULT 0,
  defense INTEGER DEFAULT 0,
  health INTEGER DEFAULT 1,
  rarity TEXT NOT NULL,
  element TEXT,
  abilities JSONB NOT NULL DEFAULT '{}'::jsonb,
  lore TEXT,
  images JSONB NOT NULL DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::text[],
  unlock_condition TEXT,
  seasonal_bonus JSONB,
  is_starter BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_cards_region ON public.cards(region);
CREATE INDEX IF NOT EXISTS idx_cards_rarity ON public.cards(rarity);
CREATE INDEX IF NOT EXISTS idx_cards_category ON public.cards(category);
CREATE INDEX IF NOT EXISTS idx_cards_is_starter ON public.cards(is_starter) WHERE is_starter = true;

COMMENT ON TABLE public.cards IS 'Cartas de lendas jogáveis';
COMMENT ON COLUMN public.cards.abilities IS 'JSON com habilidades: {skill1: {name, description, kind}, passive: {...}}';
COMMENT ON COLUMN public.cards.images IS 'JSON com URLs: {retrato, completa, icone}';

-- ============================================================================
-- TABELA: item_cards
-- Armazena cartas de itens/equipamentos
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.item_cards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  item_type TEXT NOT NULL,
  rarity TEXT NOT NULL,
  effects JSONB NOT NULL DEFAULT '{}'::jsonb,
  lore TEXT,
  images JSONB NOT NULL DEFAULT '{}'::jsonb,
  unlock_condition TEXT,
  is_tradeable BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_item_cards_type ON public.item_cards(item_type);
CREATE INDEX IF NOT EXISTS idx_item_cards_rarity ON public.item_cards(rarity);

COMMENT ON TABLE public.item_cards IS 'Cartas de itens e equipamentos';

-- ============================================================================
-- TABELA: collections
-- Armazena as coleções de cartas dos jogadores
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.collections (
  player_id BIGINT PRIMARY KEY REFERENCES public.players(id) ON DELETE CASCADE,
  cards JSONB NOT NULL DEFAULT '[]'::jsonb,
  item_cards JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_collections_player_id ON public.collections(player_id);

COMMENT ON TABLE public.collections IS 'Coleção de cartas desbloqueadas por jogador';
COMMENT ON COLUMN public.collections.cards IS 'Array JSON de IDs de cards: ["curupira", "saci", ...]';
COMMENT ON COLUMN public.collections.item_cards IS 'Array JSON de IDs de item_cards';

-- ============================================================================
-- TABELA: decks
-- Armazena os decks criados pelos jogadores
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.decks (
  id BIGSERIAL PRIMARY KEY,
  owner_id BIGINT NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cards JSONB NOT NULL,
  is_active BOOLEAN DEFAULT false,
  format TEXT DEFAULT 'standard',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_decks_owner_id ON public.decks(owner_id);
CREATE INDEX IF NOT EXISTS idx_decks_is_active ON public.decks(owner_id, is_active) WHERE is_active = true;

COMMENT ON TABLE public.decks IS 'Decks de batalha dos jogadores';
COMMENT ON COLUMN public.decks.cards IS 'Array JSON de IDs de cartas do deck';
COMMENT ON COLUMN public.decks.is_active IS 'Indica se é o deck ativo do jogador';

-- ============================================================================
-- TABELA: contos
-- Armazena as histórias e narrativas do museu
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.contos (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  card_id TEXT REFERENCES public.cards(id) ON DELETE SET NULL,
  author_id BIGINT REFERENCES public.players(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  subtitulo TEXT,
  resumo TEXT,
  corpo TEXT NOT NULL,
  regiao TEXT,
  categoria TEXT,
  tags TEXT[] DEFAULT ARRAY[]::text[],
  tema TEXT,
  fonte TEXT,
  fonte_url TEXT,
  imagem_capa TEXT,
  estimated_read_time INTEGER,
  versao INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_contos_slug ON public.contos(slug);
CREATE INDEX IF NOT EXISTS idx_contos_card_id ON public.contos(card_id);
CREATE INDEX IF NOT EXISTS idx_contos_regiao ON public.contos(regiao);
CREATE INDEX IF NOT EXISTS idx_contos_is_active ON public.contos(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_contos_is_featured ON public.contos(is_featured) WHERE is_featured = true;

COMMENT ON TABLE public.contos IS 'Histórias e narrativas do museu cultural';

-- ============================================================================
-- TABELA: quizzes
-- Armazena os quizzes educacionais
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.quizzes (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_quizzes_title ON public.quizzes(title);

COMMENT ON TABLE public.quizzes IS 'Quizzes educacionais sobre folclore brasileiro';
COMMENT ON COLUMN public.quizzes.questions IS 'Array JSON de perguntas com alternativas e respostas corretas';

-- ============================================================================
-- TABELA: matches
-- Armazena as partidas de batalha
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.matches (
  id BIGSERIAL PRIMARY KEY,
  room_id TEXT NOT NULL UNIQUE,
  player_a_id BIGINT NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  player_b_id BIGINT NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  winner_id BIGINT REFERENCES public.players(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active',
  version INTEGER NOT NULL DEFAULT 0,
  state JSONB NOT NULL,
  snapshot JSONB,
  duration_seconds INTEGER,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_matches_room_id ON public.matches(room_id);
CREATE INDEX IF NOT EXISTS idx_matches_player_a ON public.matches(player_a_id);
CREATE INDEX IF NOT EXISTS idx_matches_player_b ON public.matches(player_b_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_started_at ON public.matches(started_at DESC);

COMMENT ON TABLE public.matches IS 'Histórico e estado de partidas PvP';
COMMENT ON COLUMN public.matches.state IS 'Estado completo da partida em JSON';
COMMENT ON COLUMN public.matches.snapshot IS 'Snapshot final da partida para replay';

-- ============================================================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas com updated_at
DROP TRIGGER IF EXISTS update_players_updated_at ON public.players;
CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON public.players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cards_updated_at ON public.cards;
CREATE TRIGGER update_cards_updated_at
  BEFORE UPDATE ON public.cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_item_cards_updated_at ON public.item_cards;
CREATE TRIGGER update_item_cards_updated_at
  BEFORE UPDATE ON public.item_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_collections_updated_at ON public.collections;
CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_decks_updated_at ON public.decks;
CREATE TRIGGER update_decks_updated_at
  BEFORE UPDATE ON public.decks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contos_updated_at ON public.contos;
CREATE TRIGGER update_contos_updated_at
  BEFORE UPDATE ON public.contos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY) - OPCIONAL
-- ============================================================================
-- Descomente se quiser habilitar RLS

-- ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Política: Jogadores podem ver apenas seus próprios dados
-- CREATE POLICY players_select_own ON public.players
--   FOR SELECT USING (auth.uid() = uid::text);

-- CREATE POLICY collections_select_own ON public.collections
--   FOR SELECT USING (player_id = (SELECT id FROM public.players WHERE uid::text = auth.uid()));

-- ============================================================================
-- DADOS INICIAIS (SEED)
-- ============================================================================

-- Inserir jogador admin padrão (se não existir)
INSERT INTO public.players (uid, username, email, password, level, xp, coins, mmr, title, avatar_url)
VALUES (
  '123456',
  'AdminSuper',
  'admin@kaaguy.com',
  'admin123',
  99,
  999999,
  97949,
  5000,
  'Guardião Supremo dos Mitos',
  'https://img.icons8.com/color/96/crown.png'
)
ON CONFLICT (username) DO NOTHING;

-- ============================================================================
-- VIEWS ÚTEIS
-- ============================================================================

-- View: Ranking global de jogadores
CREATE OR REPLACE VIEW public.ranking_global AS
SELECT 
  id,
  username,
  avatar_url,
  level,
  xp,
  mmr,
  coins,
  title,
  ROW_NUMBER() OVER (ORDER BY mmr DESC, level DESC, xp DESC) as rank
FROM public.players
WHERE banned = false
ORDER BY mmr DESC, level DESC, xp DESC
LIMIT 100;

-- View: Estatísticas de coleção por jogador
CREATE OR REPLACE VIEW public.collection_stats AS
SELECT 
  p.id as player_id,
  p.username,
  COALESCE(jsonb_array_length(c.cards), 0) as total_cards,
  COALESCE(jsonb_array_length(c.item_cards), 0) as total_item_cards,
  (SELECT COUNT(*) FROM public.cards) as available_cards,
  (SELECT COUNT(*) FROM public.item_cards) as available_item_cards
FROM public.players p
LEFT JOIN public.collections c ON c.player_id = p.id
WHERE p.banned = false;

-- ============================================================================
-- FUNÇÕES ÚTEIS
-- ============================================================================

-- Função: Adicionar moedas a um jogador
CREATE OR REPLACE FUNCTION add_coins_to_player(
  p_player_id BIGINT,
  p_amount INTEGER
)
RETURNS TABLE(new_balance INTEGER) AS $$
BEGIN
  UPDATE public.players
  SET coins = coins + p_amount
  WHERE id = p_player_id;
  
  RETURN QUERY
  SELECT coins FROM public.players WHERE id = p_player_id;
END;
$$ LANGUAGE plpgsql;

-- Função: Atualizar MMR após partida
CREATE OR REPLACE FUNCTION update_mmr_after_match(
  p_winner_id BIGINT,
  p_loser_id BIGINT,
  p_mmr_change INTEGER DEFAULT 25
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.players
  SET mmr = mmr + p_mmr_change
  WHERE id = p_winner_id;
  
  UPDATE public.players
  SET mmr = GREATEST(0, mmr - p_mmr_change)
  WHERE id = p_loser_id;
END;
$$ LANGUAGE plpgsql;

-- Função: Adicionar XP e verificar level up
CREATE OR REPLACE FUNCTION add_xp_to_player(
  p_player_id BIGINT,
  p_xp_amount INTEGER
)
RETURNS TABLE(
  new_xp INTEGER,
  new_level INTEGER,
  leveled_up BOOLEAN
) AS $$
DECLARE
  v_current_level INTEGER;
  v_current_xp INTEGER;
  v_new_xp INTEGER;
  v_new_level INTEGER;
  v_xp_for_next_level INTEGER;
BEGIN
  SELECT level, xp INTO v_current_level, v_current_xp
  FROM public.players
  WHERE id = p_player_id;
  
  v_new_xp := v_current_xp + p_xp_amount;
  v_new_level := v_current_level;
  v_xp_for_next_level := v_current_level * 1000;
  
  -- Verificar level up
  WHILE v_new_xp >= v_xp_for_next_level LOOP
    v_new_xp := v_new_xp - v_xp_for_next_level;
    v_new_level := v_new_level + 1;
    v_xp_for_next_level := v_new_level * 1000;
  END LOOP;
  
  UPDATE public.players
  SET xp = v_new_xp, level = v_new_level
  WHERE id = p_player_id;
  
  RETURN QUERY
  SELECT v_new_xp, v_new_level, (v_new_level > v_current_level);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

-- Verificar se todas as tabelas foram criadas
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN ('players', 'cards', 'item_cards', 'collections', 'decks', 'contos', 'quizzes', 'matches');
  
  IF table_count = 8 THEN
    RAISE NOTICE '✅ Todas as 8 tabelas foram criadas com sucesso!';
  ELSE
    RAISE NOTICE '⚠️ Apenas % de 8 tabelas foram criadas. Verifique erros acima.', table_count;
  END IF;
END $$;

-- ============================================================================
-- SCRIPT COMPLETO! 🎉
-- ============================================================================
-- Para aplicar este schema:
-- 1. Abra o Supabase Dashboard
-- 2. Vá em SQL Editor
-- 3. Cole este arquivo completo
-- 4. Execute
-- ============================================================================

-- Schema SQL para Sistema de Boosters e Pity

-- Tabela de histórico de pulls do jogador
CREATE TABLE IF NOT EXISTS player_pull_history (
  id BIGSERIAL PRIMARY KEY,
  player_id BIGINT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  
  -- Contadores de pity
  pity_epico INTEGER DEFAULT 0,
  pity_lendario INTEGER DEFAULT 0,
  pity_mitico INTEGER DEFAULT 0,
  
  -- Estatísticas totais
  total_pulls INTEGER DEFAULT 0,
  pulls_comum INTEGER DEFAULT 0,
  pulls_incomum INTEGER DEFAULT 0,
  pulls_raro INTEGER DEFAULT 0,
  pulls_epico INTEGER DEFAULT 0,
  pulls_lendario INTEGER DEFAULT 0,
  pulls_mitico INTEGER DEFAULT 0,
  
  -- Moedas e boosters
  moedas INTEGER DEFAULT 500,
  boosters_disponiveis INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca rápida por jogador
CREATE INDEX IF NOT EXISTS idx_pull_history_player ON player_pull_history(player_id);

-- Tabela de histórico individual de cada pull
CREATE TABLE IF NOT EXISTS pull_records (
  id BIGSERIAL PRIMARY KEY,
  player_id BIGINT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  
  -- Informações do pull
  card_id TEXT REFERENCES cards(id),
  item_card_id TEXT REFERENCES item_cards(id),
  raridade VARCHAR(20) NOT NULL,
  
  -- Contexto do pull
  booster_type VARCHAR(20) NOT NULL, -- 'PEQUENO', 'MEDIO', 'GRANDE', 'RECOMPENSA'
  pity_counter_at_pull INTEGER DEFAULT 0,
  
  -- Timestamp
  pulled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para consultas
CREATE INDEX IF NOT EXISTS idx_pull_records_player ON pull_records(player_id);
CREATE INDEX IF NOT EXISTS idx_pull_records_date ON pull_records(pulled_at DESC);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_pull_history_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trigger_update_pull_history_timestamp ON player_pull_history;
CREATE TRIGGER trigger_update_pull_history_timestamp
  BEFORE UPDATE ON player_pull_history
  FOR EACH ROW
  EXECUTE FUNCTION update_pull_history_timestamp();

-- Inserir histórico inicial para jogadores existentes (migração)
INSERT INTO player_pull_history (player_id, moedas)
SELECT id, 500 FROM players
WHERE NOT EXISTS (
  SELECT 1 FROM player_pull_history WHERE player_id = players.id
);

-- View para estatísticas agregadas de pulls
CREATE OR REPLACE VIEW player_pull_stats AS
SELECT 
  ph.player_id,
  ph.total_pulls,
  ph.pity_epico,
  ph.pity_lendario,
  ph.pity_mitico,
  ph.moedas,
  ph.boosters_disponiveis,
  
  -- Percentuais
  CASE WHEN ph.total_pulls > 0 THEN (ph.pulls_mitico::FLOAT / ph.total_pulls * 100) ELSE 0 END as percentual_mitico,
  CASE WHEN ph.total_pulls > 0 THEN (ph.pulls_lendario::FLOAT / ph.total_pulls * 100) ELSE 0 END as percentual_lendario,
  CASE WHEN ph.total_pulls > 0 THEN (ph.pulls_epico::FLOAT / ph.total_pulls * 100) ELSE 0 END as percentual_epico,
  
  -- Pulls garantidos restantes
  (15 - ph.pity_epico) as pulls_ate_epico_garantido,
  (90 - ph.pity_lendario) as pulls_ate_lendario_garantido,
  (300 - ph.pity_mitico) as pulls_ate_mitico_garantido,
  
  -- Último pull
  (SELECT MAX(pulled_at) FROM pull_records WHERE player_id = ph.player_id) as ultimo_pull
FROM player_pull_history ph;

COMMENT ON TABLE player_pull_history IS 'Armazena contadores de pity e estatísticas de pulls de cada jogador';
COMMENT ON TABLE pull_records IS 'Histórico detalhado de cada carta obtida via booster';
COMMENT ON VIEW player_pull_stats IS 'Estatísticas agregadas e calculadas do sistema de pulls';

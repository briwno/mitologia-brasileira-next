-- Refatoração da tabela public.matches para controle de turnos e sincronização
-- Execute este script no banco Supabase associado ao projeto.

BEGIN;

-- Garantir defaults previsíveis para estruturas JSON
ALTER TABLE public.matches
  ALTER COLUMN state SET DEFAULT '{}'::jsonb;

ALTER TABLE public.matches
  ALTER COLUMN game_state SET DEFAULT '{}'::jsonb;

ALTER TABLE public.matches
  ALTER COLUMN current_turn SET DEFAULT 1;

-- Novos campos para rastrear o progresso de cada jogador por turno
ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS player_a_has_acted boolean DEFAULT false;

ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS player_b_has_acted boolean DEFAULT false;

ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS turn_phase text DEFAULT 'action';

ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS turn_history jsonb DEFAULT '[]'::jsonb;

-- Garantir consistência das novas colunas
UPDATE public.matches
SET player_a_has_acted = COALESCE(player_a_has_acted, false),
    player_b_has_acted = COALESCE(player_b_has_acted, false),
    turn_phase = COALESCE(turn_phase, 'action'),
    turn_history = COALESCE(turn_history, '[]'::jsonb);

ALTER TABLE public.matches
  ALTER COLUMN player_a_has_acted SET DEFAULT false,
  ALTER COLUMN player_b_has_acted SET DEFAULT false,
  ALTER COLUMN turn_phase SET DEFAULT 'action';

ALTER TABLE public.matches
  ALTER COLUMN player_a_has_acted SET NOT NULL,
  ALTER COLUMN player_b_has_acted SET NOT NULL;

-- Constraint para garantir que current_player_id pertença ao match
ALTER TABLE public.matches
  ADD CONSTRAINT IF NOT EXISTS matches_current_player_id_check
  CHECK (
    current_player_id IS NULL OR
    current_player_id = player_a_id OR
    current_player_id = player_b_id
  );

-- Resetar indicadores de turno em partidas ativas para evitar deadlocks antigos
UPDATE public.matches
SET player_a_has_acted = false,
    player_b_has_acted = false
WHERE status = 'active';

COMMIT;

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.cards (
  id text NOT NULL,
  name text NOT NULL,
  region text NOT NULL,
  category text NOT NULL,
  card_type text NOT NULL,
  attack integer,
  defense integer,
  health integer,
  rarity text NOT NULL,
  element text,
  abilities jsonb NOT NULL DEFAULT '{}'::jsonb,
  lore text,
  images jsonb NOT NULL DEFAULT '{}'::jsonb,
  tags ARRAY DEFAULT ARRAY[]::text[],
  unlock_condition text,
  seasonal_bonus jsonb,
  is_starter boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cards_pkey PRIMARY KEY (id)
);
CREATE TABLE public.collections (
  player_id uuid NOT NULL,
  cards jsonb NOT NULL DEFAULT '[]'::jsonb,
  item_cards jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT collections_pkey PRIMARY KEY (player_id),
  CONSTRAINT collections_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id)
);
CREATE TABLE public.contos (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  slug text NOT NULL UNIQUE,
  card_id text,
  titulo text NOT NULL,
  subtitulo text,
  resumo text,
  corpo text NOT NULL,
  regiao text,
  categoria text,
  tags ARRAY DEFAULT ARRAY[]::text[],
  tema text,
  fonte text,
  fonte_url text,
  imagem_capa text,
  estimated_read_time integer,
  versao integer DEFAULT 1,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  published_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  author_id uuid,
  CONSTRAINT contos_pkey PRIMARY KEY (id),
  CONSTRAINT contos_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.players(id),
  CONSTRAINT contos_card_id_fkey FOREIGN KEY (card_id) REFERENCES public.cards(id)
);
CREATE TABLE public.decks (
  id bigint NOT NULL DEFAULT nextval('decks_id_seq'::regclass),
  name text NOT NULL,
  cards jsonb NOT NULL,
  is_active boolean DEFAULT false,
  format text DEFAULT 'standard'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  owner_id uuid,
  CONSTRAINT decks_pkey PRIMARY KEY (id),
  CONSTRAINT decks_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.players(id)
);
CREATE TABLE public.item_cards (
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
CREATE TABLE public.item_cards_backup (
  id text,
  name text,
  description text,
  item_type text,
  rarity text,
  effects jsonb,
  lore text,
  images jsonb,
  unlock_condition text,
  is_tradeable boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);
CREATE TABLE public.matches (
  id bigint NOT NULL DEFAULT nextval('matches_id_seq'::regclass),
  room_id text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'active'::text,
  version integer NOT NULL DEFAULT 0,
  state jsonb NOT NULL,
  snapshot jsonb,
  duration_seconds integer,
  started_at timestamp with time zone DEFAULT now(),
  finished_at timestamp with time zone,
  player_a_id uuid,
  player_b_id uuid,
  winner_id uuid,
  CONSTRAINT matches_pkey PRIMARY KEY (id),
  CONSTRAINT matches_player_a_id_fkey FOREIGN KEY (player_a_id) REFERENCES public.players(id),
  CONSTRAINT matches_player_b_id_fkey FOREIGN KEY (player_b_id) REFERENCES public.players(id),
  CONSTRAINT matches_winner_id_fkey FOREIGN KEY (winner_id) REFERENCES public.players(id)
);
CREATE TABLE public.player_boosters (
  player_id uuid NOT NULL,
  boosters_disponiveis integer DEFAULT 0,
  booster_inicial_aberto boolean DEFAULT false,
  pity_epico integer DEFAULT 0,
  pity_lendario integer DEFAULT 0,
  pity_mitico integer DEFAULT 0,
  total_boosters_abertos integer DEFAULT 0,
  total_cartas_obtidas integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT player_boosters_pkey PRIMARY KEY (player_id),
  CONSTRAINT player_boosters_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id)
);
CREATE TABLE public.players (
  id uuid NOT NULL,
  nickname text NOT NULL UNIQUE,
  avatar_url text DEFAULT 'https://img.icons8.com/emoji/96/man-technologist.png'::text,
  mmr integer DEFAULT 1000,
  level integer DEFAULT 1,
  xp integer DEFAULT 0,
  banned boolean DEFAULT false,
  coins integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  titulos_desbloqueados jsonb DEFAULT '[]'::jsonb,
  titulo_selecionado text,
  CONSTRAINT players_pkey PRIMARY KEY (id),
  CONSTRAINT players_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.quizzes (
  id bigint NOT NULL DEFAULT nextval('quizzes_id_seq'::regclass),
  title text NOT NULL,
  description text,
  questions jsonb NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT quizzes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.titulos (
  id text NOT NULL,
  nome text NOT NULL,
  descricao text,
  cor text DEFAULT '#3B82F6'::text,
  raridade text DEFAULT 'comum'::text,
  condicao_desbloqueio text,
  icone text,
  ordem_exibicao integer DEFAULT 0,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT titulos_pkey PRIMARY KEY (id)
);
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
  player_id bigint NOT NULL,
  cards jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamp with time zone DEFAULT now(),
  item_cards jsonb NOT NULL DEFAULT '[]'::jsonb,
  CONSTRAINT collections_pkey PRIMARY KEY (player_id),
  CONSTRAINT collections_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id)
);
CREATE TABLE public.contos (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  slug text NOT NULL UNIQUE,
  card_id text,
  author_id bigint,
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
  CONSTRAINT contos_pkey PRIMARY KEY (id),
  CONSTRAINT contos_card_id_fkey FOREIGN KEY (card_id) REFERENCES public.cards(id),
  CONSTRAINT contos_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.players(id)
);
CREATE TABLE public.decks (
  id bigint NOT NULL DEFAULT nextval('decks_id_seq'::regclass),
  owner_id bigint NOT NULL,
  name text NOT NULL,
  cards jsonb NOT NULL,
  is_active boolean DEFAULT false,
  format text DEFAULT 'standard'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
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
CREATE TABLE public.matches (
  id bigint NOT NULL DEFAULT nextval('matches_id_seq'::regclass),
  room_id text NOT NULL UNIQUE,
  player_a_id bigint NOT NULL,
  player_b_id bigint NOT NULL,
  winner_id bigint,
  status text NOT NULL DEFAULT 'active'::text,
  version integer NOT NULL DEFAULT 0,
  state jsonb NOT NULL,
  snapshot jsonb,
  duration_seconds integer,
  started_at timestamp with time zone DEFAULT now(),
  finished_at timestamp with time zone,
  CONSTRAINT matches_pkey PRIMARY KEY (id),
  CONSTRAINT matches_player_a_id_fkey FOREIGN KEY (player_a_id) REFERENCES public.players(id),
  CONSTRAINT matches_player_b_id_fkey FOREIGN KEY (player_b_id) REFERENCES public.players(id),
  CONSTRAINT matches_winner_id_fkey FOREIGN KEY (winner_id) REFERENCES public.players(id)
);
CREATE TABLE public.players (
  id bigint NOT NULL DEFAULT nextval('players_id_seq'::regclass),
  uid text NOT NULL UNIQUE,
  username text NOT NULL UNIQUE,
  email text UNIQUE,
  password text,
  avatar_url text,
  mmr integer DEFAULT 1000,
  level integer DEFAULT 1,
  xp integer DEFAULT 0,
  title text DEFAULT 'Novato'::text,
  banned boolean DEFAULT false,
  last_login_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  coins integer,
  CONSTRAINT players_pkey PRIMARY KEY (id)
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
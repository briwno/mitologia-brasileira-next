-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.achievements (
  id text NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  icon text,
  category text NOT NULL,
  rarity text NOT NULL,
  criteria jsonb NOT NULL,
  rewards jsonb DEFAULT '{}'::jsonb,
  is_hidden boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT achievements_pkey PRIMARY KEY (id)
);
CREATE TABLE public.cards (
  id text NOT NULL,
  name text NOT NULL,
  region text NOT NULL,
  category text NOT NULL,
  card_type text NOT NULL,
  cost integer NOT NULL,
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
CREATE TABLE public.contos_cards (
  conto_id bigint NOT NULL,
  card_id text NOT NULL,
  rel_type text DEFAULT 'mention'::text,
  CONSTRAINT contos_cards_pkey PRIMARY KEY (card_id, conto_id),
  CONSTRAINT contos_cards_conto_id_fkey FOREIGN KEY (conto_id) REFERENCES public.contos(id),
  CONSTRAINT contos_cards_card_id_fkey FOREIGN KEY (card_id) REFERENCES public.cards(id),
  CONSTRAINT contos_cards_item_card_id_fkey FOREIGN KEY (card_id) REFERENCES public.item_cards(id)
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
CREATE TABLE public.friendships (
  id bigint NOT NULL DEFAULT nextval('friendships_id_seq'::regclass),
  requester_id bigint NOT NULL,
  addressee_id bigint NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT friendships_pkey PRIMARY KEY (id),
  CONSTRAINT friendships_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.players(id),
  CONSTRAINT friendships_addressee_id_fkey FOREIGN KEY (addressee_id) REFERENCES public.players(id)
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
CREATE TABLE public.match_history (
  id bigint NOT NULL DEFAULT nextval('match_history_id_seq'::regclass),
  match_id bigint NOT NULL,
  player_id bigint NOT NULL,
  opponent_id bigint NOT NULL,
  deck_used jsonb NOT NULL,
  result text NOT NULL,
  mmr_before integer NOT NULL,
  mmr_after integer NOT NULL,
  mmr_change integer NOT NULL,
  duration_seconds integer,
  cards_played ARRAY DEFAULT ARRAY[]::text[],
  damage_dealt integer DEFAULT 0,
  damage_taken integer DEFAULT 0,
  turns_taken integer DEFAULT 0,
  special_achievements ARRAY DEFAULT ARRAY[]::text[],
  replay_data jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT match_history_pkey PRIMARY KEY (id),
  CONSTRAINT match_history_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id),
  CONSTRAINT match_history_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id),
  CONSTRAINT match_history_opponent_id_fkey FOREIGN KEY (opponent_id) REFERENCES public.players(id)
);
CREATE TABLE public.matches (
  id bigint NOT NULL DEFAULT nextval('matches_id_seq'::regclass),
  room_id text NOT NULL UNIQUE,
  player_a_id bigint NOT NULL,
  player_b_id bigint NOT NULL,
  winner_id bigint,
  match_type text NOT NULL DEFAULT 'casual'::text,
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
CREATE TABLE public.player_achievements (
  player_id bigint NOT NULL,
  achievement_id text NOT NULL,
  unlocked_at timestamp with time zone DEFAULT now(),
  progress jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT player_achievements_pkey PRIMARY KEY (achievement_id, player_id),
  CONSTRAINT player_achievements_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id),
  CONSTRAINT player_achievements_achievement_id_fkey FOREIGN KEY (achievement_id) REFERENCES public.achievements(id)
);
CREATE TABLE public.player_currencies (
  player_id bigint NOT NULL,
  gold integer DEFAULT 1000,
  gems integer DEFAULT 0,
  dust integer DEFAULT 0,
  tokens integer DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT player_currencies_pkey PRIMARY KEY (player_id),
  CONSTRAINT player_currencies_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id)
);
CREATE TABLE public.player_quests (
  player_id bigint NOT NULL,
  quest_id text NOT NULL,
  assigned_at timestamp with time zone DEFAULT now(),
  progress jsonb DEFAULT '{}'::jsonb,
  completed_at timestamp with time zone,
  claimed_at timestamp with time zone,
  expires_at timestamp with time zone,
  CONSTRAINT player_quests_pkey PRIMARY KEY (player_id, quest_id),
  CONSTRAINT player_quests_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id),
  CONSTRAINT player_quests_quest_id_fkey FOREIGN KEY (quest_id) REFERENCES public.quests(id)
);
CREATE TABLE public.player_stats (
  player_id bigint NOT NULL,
  total_matches integer DEFAULT 0,
  wins integer DEFAULT 0,
  losses integer DEFAULT 0,
  draws integer DEFAULT 0,
  ranked_matches integer DEFAULT 0,
  ranked_wins integer DEFAULT 0,
  win_streak integer DEFAULT 0,
  best_win_streak integer DEFAULT 0,
  total_damage_dealt bigint DEFAULT 0,
  total_damage_taken bigint DEFAULT 0,
  favorite_card_id text,
  most_used_cards jsonb DEFAULT '{}'::jsonb,
  achievements_unlocked ARRAY DEFAULT ARRAY[]::text[],
  last_match_at timestamp with time zone,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT player_stats_pkey PRIMARY KEY (player_id),
  CONSTRAINT player_stats_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id)
);
CREATE TABLE public.players (
  id bigint NOT NULL DEFAULT nextval('players_id_seq'::regclass),
  uid text NOT NULL UNIQUE,
  name text NOT NULL UNIQUE,
  email text,
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
  CONSTRAINT players_pkey PRIMARY KEY (id)
);
CREATE TABLE public.quests (
  id text NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  quest_type text NOT NULL,
  category text NOT NULL,
  objectives jsonb NOT NULL,
  rewards jsonb NOT NULL,
  duration_hours integer DEFAULT 24,
  requirements jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT quests_pkey PRIMARY KEY (id)
);
CREATE TABLE public.seasons (
  id bigint NOT NULL DEFAULT nextval('seasons_id_seq'::regclass),
  name text NOT NULL,
  description text,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  theme text,
  rewards jsonb DEFAULT '{}'::jsonb,
  special_rules jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT seasons_pkey PRIMARY KEY (id)
);
CREATE TABLE public.transactions (
  id bigint NOT NULL DEFAULT nextval('transactions_id_seq'::regclass),
  player_id bigint NOT NULL,
  transaction_type text NOT NULL,
  currency_type text NOT NULL,
  amount integer NOT NULL,
  reason text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id)
);
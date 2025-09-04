-- Enhanced schema for Ka'aguy Card Game
-- Note: enable Realtime on public.matches

create table if not exists public.players (
  id bigserial primary key,
  uid text unique not null,
  name text not null unique,
  email text,
  password text,
  avatar_url text,
  mmr integer default 1000,
  level integer default 1,
  xp integer default 0,
  title text default 'Novato',
  banned boolean default false,
  last_login_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- username must be unique for login by username
create unique index if not exists players_name_unique on public.players(name);

create table if not exists public.collections (
  player_id bigint primary key references public.players(id) on delete cascade,
  cards jsonb not null default '[]'::jsonb,
  updated_at timestamptz default now()
);
create index if not exists collections_player_id_idx on public.collections(player_id);

create table if not exists public.decks (
  id bigserial primary key,
  owner_id bigint not null references public.players(id) on delete cascade,
  name text not null,
  cards jsonb not null,
  is_active boolean default false,
  format text default 'standard',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists decks_owner_id_idx on public.decks(owner_id);

create table if not exists public.matches (
  id bigserial primary key,
  room_id text unique not null,
  player_a_id bigint not null references public.players(id) on delete cascade,
  player_b_id bigint not null references public.players(id) on delete cascade,
  winner_id bigint references public.players(id),
  match_type text not null default 'casual',
  status text not null default 'active',
  version integer not null default 0,
  state jsonb not null,
  snapshot jsonb,
  duration_seconds integer,
  started_at timestamptz default now(),
  finished_at timestamptz
);
create index if not exists matches_room_id_idx on public.matches(room_id);
create index if not exists matches_status_idx on public.matches(status);

-- Recommended RLS policies (adjust as needed)
alter table public.players enable row level security;
create policy players_read on public.players for select using (true);
create policy players_write on public.players for update using (true);
create policy players_insert on public.players for insert with check (true);

alter table public.collections enable row level security;
create policy collections_read on public.collections for select using (true);
create policy collections_write on public.collections for insert with check (true);
create policy collections_update on public.collections for update using (true);

alter table public.decks enable row level security;
create policy decks_read on public.decks for select using (true);
create policy decks_write on public.decks for insert with check (true);
create policy decks_update on public.decks for update using (true);
create policy decks_delete on public.decks for delete using (true);

alter table public.matches enable row level security;
create policy matches_read on public.matches for select using (true);
create policy matches_write on public.matches for insert with check (true);
create policy matches_update on public.matches for update using (true);

-- ============================================================================
-- NEW TABLES FOR COMPLETE GAME SYSTEM
-- ============================================================================

-- Master cards catalog
create table if not exists public.cards (
  id text primary key,
  name text not null,
  region text not null,
  category text not null,
  card_type text not null,
  cost integer not null,
  attack integer,
  defense integer,
  health integer,
  rarity text not null,
  element text,
  abilities jsonb not null default '{}'::jsonb,
  lore text,
  discovered boolean default false,
  images jsonb not null default '{}'::jsonb,
  tags text[] default array[]::text[],
  unlock_condition text,
  seasonal_bonus jsonb,
  is_starter boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Player economy
create table if not exists public.player_currencies (
  player_id bigint primary key references public.players(id) on delete cascade,
  gold integer default 1000,
  gems integer default 0,
  dust integer default 0,
  tokens integer default 0,
  updated_at timestamptz default now()
);

-- Transaction history
create table if not exists public.transactions (
  id bigserial primary key,
  player_id bigint not null references public.players(id) on delete cascade,
  transaction_type text not null,
  currency_type text not null,
  amount integer not null,
  reason text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Player statistics
create table if not exists public.player_stats (
  player_id bigint primary key references public.players(id) on delete cascade,
  total_matches integer default 0,
  wins integer default 0,
  losses integer default 0,
  draws integer default 0,
  ranked_matches integer default 0,
  ranked_wins integer default 0,
  win_streak integer default 0,
  best_win_streak integer default 0,
  total_damage_dealt bigint default 0,
  total_damage_taken bigint default 0,
  favorite_card_id text,
  most_used_cards jsonb default '{}'::jsonb,
  achievements_unlocked text[] default array[]::text[],
  last_match_at timestamptz,
  updated_at timestamptz default now()
);

-- Achievements
create table if not exists public.achievements (
  id text primary key,
  name text not null,
  description text not null,
  icon text,
  category text not null,
  rarity text not null,
  criteria jsonb not null,
  rewards jsonb default '{}'::jsonb,
  is_hidden boolean default false,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.player_achievements (
  player_id bigint not null references public.players(id) on delete cascade,
  achievement_id text not null references public.achievements(id) on delete cascade,
  unlocked_at timestamptz default now(),
  progress jsonb default '{}'::jsonb,
  primary key (player_id, achievement_id)
);

-- Quests system
create table if not exists public.quests (
  id text primary key,
  name text not null,
  description text not null,
  quest_type text not null,
  category text not null,
  objectives jsonb not null,
  rewards jsonb not null,
  duration_hours integer default 24,
  requirements jsonb default '{}'::jsonb,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.player_quests (
  player_id bigint not null references public.players(id) on delete cascade,
  quest_id text not null references public.quests(id) on delete cascade,
  assigned_at timestamptz default now(),
  progress jsonb default '{}'::jsonb,
  completed_at timestamptz,
  claimed_at timestamptz,
  expires_at timestamptz,
  primary key (player_id, quest_id)
);

-- Match history
create table if not exists public.match_history (
  id bigserial primary key,
  match_id bigint not null references public.matches(id) on delete cascade,
  player_id bigint not null references public.players(id) on delete cascade,
  opponent_id bigint not null references public.players(id) on delete cascade,
  deck_used jsonb not null,
  result text not null,
  mmr_before integer not null,
  mmr_after integer not null,
  mmr_change integer not null,
  duration_seconds integer,
  cards_played text[] default array[]::text[],
  damage_dealt integer default 0,
  damage_taken integer default 0,
  turns_taken integer default 0,
  special_achievements text[] default array[]::text[],
  replay_data jsonb,
  created_at timestamptz default now()
);

-- Social system
create table if not exists public.friendships (
  id bigserial primary key,
  requester_id bigint not null references public.players(id) on delete cascade,
  addressee_id bigint not null references public.players(id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(requester_id, addressee_id),
  check (requester_id != addressee_id)
);

-- Seasons
create table if not exists public.seasons (
  id bigserial primary key,
  name text not null,
  description text,
  start_date timestamptz not null,
  end_date timestamptz not null,
  theme text,
  rewards jsonb default '{}'::jsonb,
  special_rules jsonb default '{}'::jsonb,
  is_active boolean default false,
  created_at timestamptz default now()
);

-- Performance indexes
create index if not exists cards_region_idx on public.cards(region);
create index if not exists cards_rarity_idx on public.cards(rarity);
create index if not exists cards_discovered_idx on public.cards(discovered);
create index if not exists transactions_player_id_idx on public.transactions(player_id);
create index if not exists match_history_player_id_idx on public.match_history(player_id);
create index if not exists player_quests_assigned_at_idx on public.player_quests(assigned_at desc);
create index if not exists friendships_status_idx on public.friendships(status);

-- Initialize player data function
create or replace function initialize_player_data()
returns trigger as $$
begin
    insert into public.player_currencies (player_id, gold, gems, dust, tokens)
    values (new.id, 1000, 50, 0, 0);
    
    insert into public.player_stats (player_id)
    values (new.id);
    
    return new;
end;
$$ language plpgsql;

create trigger if not exists initialize_player_data_trigger 
    after insert on public.players
    for each row execute function initialize_player_data();

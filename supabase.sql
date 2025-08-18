-- Basic schema for migration from Drizzle to Supabase
-- Note: enable Realtime on public.matches

create table if not exists public.players (
  id bigserial primary key,
  uid text unique not null,
  name text not null,
  password text,
  avatar_url text,
  mmr integer default 1000,
  level integer default 1,
  xp integer default 0,
  banned boolean default false,
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
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists decks_owner_id_idx on public.decks(owner_id);

create table if not exists public.matches (
  id bigserial primary key,
  room_id text unique not null,
  player_a_id bigint not null references public.players(id) on delete cascade,
  player_b_id bigint not null references public.players(id) on delete cascade,
  status text not null default 'active',
  version integer not null default 0,
  state jsonb not null,
  snapshot jsonb,
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

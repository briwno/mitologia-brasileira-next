-- 🚀 TEMPLATE UNIVERSAL DE LIBERAÇÃO DE TABELA (modo DEV)

-- 🧩 Substitua o nome da tabela aqui:
-- Exemplo: players, collections, player_boosters...
\set tablename 'SUA_TABELA_AQUI'

-- 1️⃣ Verifica se o RLS está ligado ou não
select tablename, rowsecurity 
from pg_tables 
where tablename = :'tablename';

-- 2️⃣ Dá permissão total para a role service_role
grant all on table public.:tablename to service_role;
grant all on all sequences in schema public to service_role;

-- 3️⃣ Remove policies antigas que possam estar travando o acesso
drop policy if exists :tablename || '_read' on public.:tablename;
drop policy if exists :tablename || '_write' on public.:tablename;
drop policy if exists :tablename || '_update' on public.:tablename;
drop policy if exists :tablename || '_delete' on public.:tablename;

-- 4️⃣ (Opcional, mas recomendado)
-- Desativa RLS completamente pra garantir acesso total durante o desenvolvimento
alter table public.:tablename disable row level security;

-- ✅ Pronto! Agora o service_role tem acesso total e o RLS está desativado.

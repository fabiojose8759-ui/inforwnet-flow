-- ═══════════════════════════════════════════════════════════════
-- Inforwnet OS Manager — Supabase Schema
-- Master: vê e edita/apaga tudo | Usuário: edita/apaga só o que registrou
-- Todos autenticados: leem tudo + lista de palavras-chave compartilhada
-- ═══════════════════════════════════════════════════════════════

-- Perfis (vinculado ao Auth)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  email text,
  role text not null default 'user' check (role in ('master', 'user')),
  created_at timestamptz not null default now()
);

-- Palavras-chave — UMA lista para toda a equipe
create table if not exists keywords (
  id bigint generated always as identity primary key,
  name text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Ordens de serviço
create table if not exists orders (
  id bigint generated always as identity primary key,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_by_name text not null,
  os_date date not null,
  team text not null,
  tecnico text,
  tipo text,
  num_os text,
  extracted jsonb not null default '{}',
  extras jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create index if not exists orders_os_date_idx on orders (os_date desc);
create index if not exists orders_created_by_idx on orders (created_by);

-- Entregas (controle diário)
create table if not exists entregas (
  id bigint generated always as identity primary key,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_by_name text not null,
  data date not null,
  equipe text not null,
  material text not null,
  qtd int not null check (qtd > 0),
  obs text,
  hora text,
  created_at timestamptz not null default now()
);

create index if not exists entregas_data_idx on entregas (data desc);

-- ── Funções auxiliares (RLS) ──
create or replace function public.is_master()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'master'
  );
$$;

create or replace function public.can_modify_record(owner_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_master() or auth.uid() = owner_id;
$$;

-- ── Trigger: perfil ao cadastrar (primeiro usuário = master) ──
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  master_count int;
  assigned_role text;
  display text;
begin
  select count(*) into master_count from profiles where role = 'master';

  if master_count = 0 then
    assigned_role := 'master';
  else
    assigned_role := 'user';
  end if;

  display := coalesce(
    nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
    split_part(new.email, '@', 1)
  );

  insert into profiles (id, display_name, email, role)
  values (new.id, display, new.email, assigned_role)
  on conflict (id) do update set
    display_name = excluded.display_name,
    email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── RLS: profiles ──
alter table profiles enable row level security;

drop policy if exists "profiles_select_authenticated" on profiles;
create policy "profiles_select_authenticated"
  on profiles for select to authenticated using (true);

drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own"
  on profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles_master_update_role" on profiles;
create policy "profiles_master_update_role"
  on profiles for update to authenticated
  using (public.is_master()) with check (public.is_master());

-- ── RLS: keywords (lista compartilhada) ──
alter table keywords enable row level security;

drop policy if exists "keywords_select_all" on keywords;
create policy "keywords_select_all"
  on keywords for select to authenticated using (true);

drop policy if exists "keywords_insert_all" on keywords;
create policy "keywords_insert_all"
  on keywords for insert to authenticated with check (true);

drop policy if exists "keywords_update_master" on keywords;
create policy "keywords_update_master"
  on keywords for update to authenticated
  using (public.is_master()) with check (public.is_master());

drop policy if exists "keywords_delete_master" on keywords;
create policy "keywords_delete_master"
  on keywords for delete to authenticated using (public.is_master());

-- ── RLS: orders ──
alter table orders enable row level security;

drop policy if exists "orders_select_all" on orders;
create policy "orders_select_all"
  on orders for select to authenticated using (true);

drop policy if exists "orders_insert_own" on orders;
create policy "orders_insert_own"
  on orders for insert to authenticated
  with check (auth.uid() = created_by);

drop policy if exists "orders_update_own_or_master" on orders;
create policy "orders_update_own_or_master"
  on orders for update to authenticated
  using (public.can_modify_record(created_by))
  with check (public.can_modify_record(created_by));

drop policy if exists "orders_delete_own_or_master" on orders;
create policy "orders_delete_own_or_master"
  on orders for delete to authenticated
  using (public.can_modify_record(created_by));

-- ── RLS: entregas ──
alter table entregas enable row level security;

drop policy if exists "entregas_select_all" on entregas;
create policy "entregas_select_all"
  on entregas for select to authenticated using (true);

drop policy if exists "entregas_insert_own" on entregas;
create policy "entregas_insert_own"
  on entregas for insert to authenticated
  with check (auth.uid() = created_by);

drop policy if exists "entregas_update_own_or_master" on entregas;
create policy "entregas_update_own_or_master"
  on entregas for update to authenticated
  using (public.can_modify_record(created_by))
  with check (public.can_modify_record(created_by));

drop policy if exists "entregas_delete_own_or_master" on entregas;
create policy "entregas_delete_own_or_master"
  on entregas for delete to authenticated
  using (public.can_modify_record(created_by));

-- ── Palavras-chave iniciais (opcional) ──
insert into keywords (name, sort_order) values
  ('CABO LAN', 1),
  ('CONECTOR RJ45', 2),
  ('FIXA FIO', 3),
  ('METROS DE DROP', 4),
  ('CONECTOR UPC/APC', 5),
  ('ACOPLADOR', 6)
on conflict (name) do nothing;

-- ══ Promover usuário a master manualmente (SQL Editor): ══
-- update profiles set role = 'master' where email = 'seu@email.com';

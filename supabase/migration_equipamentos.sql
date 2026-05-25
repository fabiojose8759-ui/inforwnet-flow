-- Equipamentos (ONT, roteador, ONU) — separados das palavras-chave de material
-- Rode no SQL Editor do Supabase (uma vez)

create table if not exists equipamentos (
  id bigint generated always as identity primary key,
  name text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table orders add column if not exists equipamentos jsonb not null default '[]';

alter table equipamentos enable row level security;

drop policy if exists "equipamentos_select_all" on equipamentos;
create policy "equipamentos_select_all"
  on equipamentos for select to authenticated using (true);

drop policy if exists "equipamentos_insert_all" on equipamentos;
create policy "equipamentos_insert_all"
  on equipamentos for insert to authenticated with check (true);

drop policy if exists "equipamentos_delete_master" on equipamentos;
create policy "equipamentos_delete_master"
  on equipamentos for delete to authenticated using (public.is_master());

insert into equipamentos (name, sort_order) values
  ('ONT TP LINK', 1),
  ('ROTEADOR TP LINK', 2),
  ('ONU', 3)
on conflict (name) do nothing;

-- Adiciona coluna para guardar o texto completo colado na OS
-- Rode no SQL Editor do Supabase (uma vez)

alter table orders add column if not exists texto_os text;

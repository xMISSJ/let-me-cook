create table if not exists public.recipes (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id),
  editor_name text,
  title text not null,
  description text not null,
  thumbnail text,
  image_url text,
  cuisine text not null,
  meal_type text not null,
  difficulty text not null,
  cook_time_minutes integer not null check (cook_time_minutes > 0),
  servings integer not null check (servings > 0),
  ingredients jsonb not null default '[]'::jsonb,
  steps jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

grant usage on schema public to anon, authenticated;
grant select, insert on table public.recipes to anon, authenticated;
grant update, delete on table public.recipes to anon, authenticated;
grant usage, select on sequence public.recipes_id_seq to anon, authenticated;

alter table public.recipes enable row level security;

drop policy if exists "Allow read recipes" on public.recipes;
create policy "Allow read recipes"
  on public.recipes
  for select
  using (true);

drop policy if exists "Allow insert recipes" on public.recipes;
create policy "Allow insert recipes"
  on public.recipes
  for insert
  with check (true);

drop policy if exists "Allow update recipes" on public.recipes;
create policy "Allow update recipes"
  on public.recipes
  for update
  using (true)
  with check (true);

drop policy if exists "Allow delete recipes" on public.recipes;
create policy "Allow delete recipes"
  on public.recipes
  for delete
  using (true);

insert into storage.buckets (id, name, public)
values ('recipe-images', 'recipe-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read recipe images" on storage.objects;
create policy "Public read recipe images"
  on storage.objects
  for select
  using (bucket_id = 'recipe-images');

drop policy if exists "Authenticated upload recipe images" on storage.objects;
create policy "Authenticated upload recipe images"
  on storage.objects
  for insert
  with check (bucket_id = 'recipe-images');

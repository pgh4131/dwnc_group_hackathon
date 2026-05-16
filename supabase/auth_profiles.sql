create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  account_type text not null default 'general' check (account_type in ('general', 'startup')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant usage on schema public to anon, authenticated;
grant select on public.profiles to authenticated;

alter table public.profiles enable row level security;

drop policy if exists "users can read own profile" on public.profiles;
create policy "users can read own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create schema if not exists private;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, account_type)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'account_type', 'general')
  )
  on conflict (id) do update set
    email = excluded.email,
    account_type = excluded.account_type,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

insert into public.profiles (id, email, account_type)
select
  users.id,
  users.email,
  coalesce(users.raw_user_meta_data ->> 'account_type', 'general')
from auth.users
on conflict (id) do update set
  email = excluded.email,
  account_type = excluded.account_type,
  updated_at = now();

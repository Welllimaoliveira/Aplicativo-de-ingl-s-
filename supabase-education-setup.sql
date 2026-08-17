-- Base exclusiva e compartilhada por Fala Real Academy e Soletra Hero Arcade.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null,
  role text not null default 'user' check (role in ('user','admin','master')),
  is_active boolean not null default true,
  last_sign_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.handle_new_education_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(id,full_name,email,role)
  values(
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name',''),
    coalesce(new.email,''),
    case when lower(coalesce(new.email,''))='wellinson25@hotmail.com' then 'master' else 'user' end
  )
  on conflict(id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_education_user_created on auth.users;
create trigger on_auth_education_user_created
after insert on auth.users
for each row execute function public.handle_new_education_user();

create or replace function public.current_user_is_education_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.profiles
    where id=auth.uid() and is_active and role in ('admin','master')
  );
$$;

drop policy if exists "education profile own or staff read" on public.profiles;
create policy "education profile own or staff read" on public.profiles
for select to authenticated
using(id=auth.uid() or public.current_user_is_education_staff());

drop policy if exists "education profile own safe update" on public.profiles;
create policy "education profile own safe update" on public.profiles
for update to authenticated
using(id=auth.uid()) with check(id=auth.uid());

revoke update on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant update(full_name) on public.profiles to authenticated;

create or replace function public.admin_manage_profile(
  target_user uuid,
  new_role text default null,
  new_active boolean default null
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  actor public.profiles;
  target public.profiles;
begin
  select * into actor from public.profiles where id=auth.uid();
  if actor.id is null or not actor.is_active or actor.role not in ('admin','master') then
    raise exception 'Acesso restrito';
  end if;
  select * into target from public.profiles where id=target_user for update;
  if target.id is null then raise exception 'Usuário não encontrado'; end if;
  if new_role is not null then
    if actor.role<>'master' then raise exception 'Somente Master altera permissões'; end if;
    if new_role not in ('user','admin','master') then raise exception 'Perfil inválido'; end if;
    if target.id=actor.id and new_role<>'master' then raise exception 'O Master não pode remover o próprio acesso'; end if;
    target.role:=new_role;
  end if;
  if new_active is not null then
    if target.id=actor.id and not new_active then raise exception 'Não é possível desativar a própria conta'; end if;
    target.is_active:=new_active;
  end if;
  update public.profiles
     set role=target.role,is_active=target.is_active,updated_at=now()
   where id=target.id returning * into target;
  return target;
end;
$$;

revoke all on function public.admin_manage_profile(uuid,text,boolean) from public,anon;
grant execute on function public.admin_manage_profile(uuid,text,boolean) to authenticated;

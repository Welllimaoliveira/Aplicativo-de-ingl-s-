-- Execute uma vez no SQL Editor do projeto leitor-fluxo-insight.
-- Permite que o painel compartilhado gerencie usuários sem expor a chave secreta.
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
  select * into actor from public.profiles where id = auth.uid();
  if actor.id is null or not actor.is_active or actor.role not in ('admin','master') then
    raise exception 'Acesso restrito';
  end if;

  select * into target from public.profiles where id = target_user for update;
  if target.id is null then raise exception 'Usuário não encontrado'; end if;

  if new_role is not null then
    if actor.role <> 'master' then raise exception 'Somente Master altera permissões'; end if;
    if new_role not in ('user','admin','master') then raise exception 'Perfil inválido'; end if;
    if target.id = actor.id and new_role <> 'master' then
      raise exception 'O Master não pode remover o próprio acesso';
    end if;
    target.role := new_role;
  end if;

  if new_active is not null then
    if target.id = actor.id and not new_active then
      raise exception 'Não é possível desativar a própria conta';
    end if;
    target.is_active := new_active;
  end if;

  update public.profiles
     set role = target.role, is_active = target.is_active, updated_at = now()
   where id = target.id
   returning * into target;
  return target;
end;
$$;

revoke all on function public.admin_manage_profile(uuid,text,boolean) from public, anon;
grant execute on function public.admin_manage_profile(uuid,text,boolean) to authenticated;

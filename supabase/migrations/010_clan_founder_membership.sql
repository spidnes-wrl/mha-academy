-- Automatically make the clan creator its first leader and reject empty names.
create or replace function public.hma_create_founder_membership()
returns trigger language plpgsql security definer set search_path=public,pg_temp
as $$
begin
 insert into public.hma_clan_members(clan_id,user_id,member_role,membership_status)
 values(new.id,new.created_by,'leader','active');
 return new;
end;
$$;
drop trigger if exists trg_hma_create_founder_membership on public.hma_clans;
create trigger trg_hma_create_founder_membership after insert on public.hma_clans
for each row execute function public.hma_create_founder_membership();

create or replace function public.hma_update_clan_profile(target_clan uuid, new_name text, new_description text, new_emblem_url text)
returns void language plpgsql security definer set search_path=public,pg_temp
as $$
begin
 if not public.hma_is_clan_leader(target_clan) then raise exception 'Only the clan leader can edit its profile'; end if;
 if new_name is null or char_length(trim(new_name)) not between 3 and 32 then
  raise exception 'Clan name must contain 3 to 32 characters';
 end if;
 update public.hma_clans
 set name=trim(new_name),description=coalesce(new_description,''),emblem_url=new_emblem_url,updated_at=now()
 where id=target_clan and status='approved';
 if not found then raise exception 'Clan not found or not approved'; end if;
end;
$$;

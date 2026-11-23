-- Harden client-controlled clan fields and expose safe leader workflows.
drop policy if exists "Invitee responds to invitation" on public.hma_clan_invitations;

create or replace function public.hma_prepare_clan_insert()
returns trigger language plpgsql security definer set search_path=public,pg_temp
as $$
begin
 new.total_points:=0;
 new.level:=1;
 new.status:='pending';
 new.verification_status:='none';
 new.reviewed_by:=null;
 new.reviewed_at:=null;
 new.created_by:=auth.uid();
 return new;
end;
$$;
drop trigger if exists trg_hma_prepare_clan_insert on public.hma_clans;
create trigger trg_hma_prepare_clan_insert before insert on public.hma_clans
for each row execute function public.hma_prepare_clan_insert();

create or replace function public.hma_prepare_clan_member_insert()
returns trigger language plpgsql security definer set search_path=public,pg_temp
as $$
begin
 new.individual_points:=0;
 new.last_activity_at:=now();
 new.joined_at:=now();
 new.left_at:=null;
 new.membership_status:='active';
 return new;
end;
$$;
drop trigger if exists trg_hma_prepare_clan_member_insert on public.hma_clan_members;
create trigger trg_hma_prepare_clan_member_insert before insert on public.hma_clan_members
for each row execute function public.hma_prepare_clan_member_insert();

create or replace function public.hma_prepare_clan_invitation_insert()
returns trigger language plpgsql security definer set search_path=public,pg_temp
as $$
begin
 new.status:='pending';
 new.responded_at:=null;
 return new;
end;
$$;
drop trigger if exists trg_hma_prepare_clan_invitation_insert on public.hma_clan_invitations;
create trigger trg_hma_prepare_clan_invitation_insert before insert on public.hma_clan_invitations
for each row execute function public.hma_prepare_clan_invitation_insert();

create or replace function public.hma_respond_to_clan_invitation(target_invitation uuid, accept_invitation boolean)
returns void language plpgsql security definer set search_path=public,pg_temp
as $$
declare invitation_row public.hma_clan_invitations%rowtype;
declare replacement_id uuid;
begin
 select * into invitation_row from public.hma_clan_invitations
 where id=target_invitation and invited_user_id=auth.uid() and status='pending' for update;
 if invitation_row.id is null then raise exception 'Invitation not found or already answered'; end if;

 select id into replacement_id from public.hma_clan_replacement_requests
 where invitation_id=target_invitation and status='auto_approved_pending_acceptance';

 if replacement_id is not null then
  perform public.hma_respond_to_clan_replacement(replacement_id,accept_invitation);
  return;
 end if;

 if accept_invitation then
  if exists(select 1 from public.hma_clan_members where user_id=auth.uid() and membership_status='active') then
   raise exception 'You already belong to a clan';
  end if;
  if not exists(select 1 from public.hma_clans where id=invitation_row.clan_id and status='approved') then
   raise exception 'This clan is not approved yet';
  end if;
  update public.hma_clan_invitations set status='accepted',responded_at=now() where id=target_invitation;
  insert into public.hma_clan_members(clan_id,user_id,member_role,membership_status)
  values(invitation_row.clan_id,auth.uid(),'member','active');
 else
  update public.hma_clan_invitations set status='declined',responded_at=now() where id=target_invitation;
 end if;
end;
$$;
revoke all on function public.hma_respond_to_clan_invitation(uuid,boolean) from public,anon;
grant execute on function public.hma_respond_to_clan_invitation(uuid,boolean) to authenticated;

create or replace function public.hma_update_clan_profile(target_clan uuid, new_name text, new_description text, new_emblem_url text)
returns void language plpgsql security definer set search_path=public,pg_temp
as $$
begin
 if not public.hma_is_clan_leader(target_clan) then raise exception 'Only the clan leader can edit its profile'; end if;
 if char_length(trim(new_name)) not between 3 and 32 then raise exception 'Clan name must contain 3 to 32 characters'; end if;
 update public.hma_clans
 set name=trim(new_name),description=coalesce(new_description,''),emblem_url=new_emblem_url,updated_at=now()
 where id=target_clan and status='approved';
 if not found then raise exception 'Clan not found or not approved'; end if;
end;
$$;
revoke all on function public.hma_update_clan_profile(uuid,text,text,text) from public,anon;
grant execute on function public.hma_update_clan_profile(uuid,text,text,text) to authenticated;

create or replace function public.hma_leader_remove_clan_member(target_clan uuid, target_user uuid)
returns void language plpgsql security definer set search_path=public,pg_temp
as $$
begin
 if not public.hma_is_clan_leader(target_clan) then raise exception 'Only the clan leader can manage members'; end if;
 if target_user=auth.uid() then raise exception 'The leader cannot remove themselves with this action'; end if;
 update public.hma_clan_members
 set membership_status='removed',left_at=now()
 where clan_id=target_clan and user_id=target_user and membership_status='active' and member_role='member';
 if not found then raise exception 'Active member not found'; end if;
end;
$$;
revoke all on function public.hma_leader_remove_clan_member(uuid,uuid) from public,anon;
grant execute on function public.hma_leader_remove_clan_member(uuid,uuid) to authenticated;

-- Invitation acceptance is now performed through the checked RPC above.

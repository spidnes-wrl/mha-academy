-- Pending clans can recruit invited members before review; rejected applications release all places.
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
  if not exists(select 1 from public.hma_clans where id=invitation_row.clan_id and status in ('pending','approved')) then
   raise exception 'This clan application was rejected';
  end if;
  update public.hma_clan_invitations set status='accepted',responded_at=now() where id=target_invitation;
  insert into public.hma_clan_members(clan_id,user_id,member_role,membership_status)
  values(invitation_row.clan_id,auth.uid(),'member','active');
 else
  update public.hma_clan_invitations set status='declined',responded_at=now() where id=target_invitation;
 end if;
end;
$$;

create or replace function public.hma_cleanup_rejected_clan()
returns trigger language plpgsql security definer set search_path=public,pg_temp
as $$
begin
 if new.status='rejected' and old.status is distinct from new.status then
  update public.hma_clan_members
  set membership_status='removed',left_at=now()
  where clan_id=new.id and membership_status='active';
  update public.hma_clan_invitations
  set status='cancelled',responded_at=now()
  where clan_id=new.id and status='pending';
 end if;
 return new;
end;
$$;
drop trigger if exists trg_hma_cleanup_rejected_clan on public.hma_clans;
create trigger trg_hma_cleanup_rejected_clan after update of status on public.hma_clans
for each row execute function public.hma_cleanup_rejected_clan();

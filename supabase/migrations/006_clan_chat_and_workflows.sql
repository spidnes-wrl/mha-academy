-- Clan private chat, automatic member replacement, and election finalization.
create table if not exists public.hma_clan_messages (
 id uuid primary key default gen_random_uuid(),
 clan_id uuid not null references public.hma_clans(id) on delete cascade,
 sender_id uuid not null references public.hma_profiles(user_id) on delete cascade,
 content text not null check(char_length(content) between 1 and 4000),
 message_type text not null default 'text' check(message_type in ('text','image','file')),
 created_at timestamptz not null default now()
);
alter table public.hma_clan_messages enable row level security;
create policy "Only active clan members read private chat" on public.hma_clan_messages for select
using(public.hma_is_clan_member(clan_id));
create policy "Only active clan members send private messages" on public.hma_clan_messages for insert
with check(sender_id=auth.uid() and public.hma_is_clan_member(clan_id));
create index if not exists hma_clan_messages_timeline on public.hma_clan_messages(clan_id,created_at desc);

create table if not exists public.hma_clan_replacement_requests (
 id uuid primary key default gen_random_uuid(),
 clan_id uuid not null references public.hma_clans(id) on delete cascade,
 requested_by uuid not null references public.hma_profiles(user_id) on delete cascade,
 replacement_user_id uuid not null references public.hma_profiles(user_id) on delete cascade,
 invitation_id uuid references public.hma_clan_invitations(id) on delete set null,
 status text not null default 'auto_approved_pending_acceptance'
   check(status in ('auto_approved_pending_acceptance','accepted','declined')),
 created_at timestamptz not null default now(),
 responded_at timestamptz,
 check(requested_by<>replacement_user_id)
);
alter table public.hma_clan_replacement_requests enable row level security;
create policy "Replacement request visible to both students and admins"
on public.hma_clan_replacement_requests for select
using(requested_by=auth.uid() or replacement_user_id=auth.uid() or public.hma_is_admin());

create or replace function public.hma_request_clan_member_replacement(target_clan uuid, candidate_user uuid)
returns uuid
language plpgsql
security definer
set search_path=public,pg_temp
as $$
declare request_id uuid;
declare invite_id uuid;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if candidate_user=auth.uid() then raise exception 'Choose another student'; end if;
 if not exists(select 1 from public.hma_clan_members m where m.clan_id=target_clan and m.user_id=auth.uid() and m.membership_status='active' and m.member_role='member') then
  raise exception 'Only an active non-leader member can request a replacement';
 end if;
 if exists(select 1 from public.hma_clan_members m where m.user_id=candidate_user and m.membership_status='active') then
  raise exception 'The proposed student already belongs to a clan';
 end if;
 update public.hma_clan_members set membership_status='removed',left_at=now()
 where clan_id=target_clan and user_id=auth.uid() and membership_status='active';
 insert into public.hma_clan_invitations(clan_id,invited_by,invited_user_id,status)
 values(target_clan,auth.uid(),candidate_user,'pending')
 returning id into invite_id;
 insert into public.hma_clan_replacement_requests(clan_id,requested_by,replacement_user_id,invitation_id)
 values(target_clan,auth.uid(),candidate_user,invite_id)
 returning id into request_id;
 return request_id;
end;
$$;

create or replace function public.hma_respond_to_clan_replacement(target_request uuid, accept_request boolean)
returns void
language plpgsql
security definer
set search_path=public,pg_temp
as $$
declare request_row public.hma_clan_replacement_requests%rowtype;
begin
 select * into request_row from public.hma_clan_replacement_requests where id=target_request for update;
 if request_row.id is null or request_row.replacement_user_id<>auth.uid() then raise exception 'Replacement request not found'; end if;
 if request_row.status<>'auto_approved_pending_acceptance' then raise exception 'Request already answered'; end if;
 if accept_request then
  if exists(select 1 from public.hma_clan_members m where m.user_id=auth.uid() and m.membership_status='active') then
   raise exception 'You already belong to a clan';
  end if;
  update public.hma_clan_invitations set status='accepted',responded_at=now() where id=request_row.invitation_id;
  insert into public.hma_clan_members(clan_id,user_id,member_role,membership_status)
  values(request_row.clan_id,auth.uid(),'member','active');
  update public.hma_clan_replacement_requests set status='accepted',responded_at=now() where id=target_request;
 else
  update public.hma_clan_invitations set status='declined',responded_at=now() where id=request_row.invitation_id;
  update public.hma_clan_replacement_requests set status='declined',responded_at=now() where id=target_request;
 end if;
end;
$$;
revoke all on function public.hma_request_clan_member_replacement(uuid,uuid) from public,anon;
revoke all on function public.hma_respond_to_clan_replacement(uuid,boolean) from public,anon;
grant execute on function public.hma_request_clan_member_replacement(uuid,uuid) to authenticated;
grant execute on function public.hma_respond_to_clan_replacement(uuid,boolean) to authenticated;

create or replace function public.hma_finalize_clan_election(target_election uuid)
returns uuid
language plpgsql
security definer
set search_path=public,pg_temp
as $$
declare election_row public.hma_clan_elections%rowtype;
declare winner uuid;
begin
 select * into election_row from public.hma_clan_elections where id=target_election for update;
 if election_row.id is null or election_row.status<>'open' then raise exception 'Election is not open'; end if;
 if election_row.ends_at is null or election_row.ends_at>now() then raise exception 'Election has not ended'; end if;
 select v.candidate_user_id into winner
 from public.hma_clan_election_votes v
 join public.hma_clan_members m on m.clan_id=election_row.clan_id and m.user_id=v.candidate_user_id and m.membership_status='active'
 where v.election_id=target_election
 group by v.candidate_user_id,m.individual_points,m.joined_at
 order by count(*) desc,m.individual_points desc,m.joined_at asc
 limit 1;
 if winner is not null then
  update public.hma_clan_members set member_role='member'
  where clan_id=election_row.clan_id and member_role='leader' and membership_status='active';
  update public.hma_clan_members set member_role='leader'
  where clan_id=election_row.clan_id and user_id=winner and membership_status='active';
 end if;
 update public.hma_clan_elections set status='closed',winner_user_id=winner where id=target_election;
 return winner;
end;
$$;
revoke all on function public.hma_finalize_clan_election(uuid) from public,anon,authenticated;
grant execute on function public.hma_finalize_clan_election(uuid) to service_role;

drop policy if exists "Inspection records are admin-only" on public.hma_clan_admin_inspections;
create policy "Admins and clan members can see inspection notices"
on public.hma_clan_admin_inspections for select
using(public.hma_is_admin() or public.hma_is_clan_member(clan_id));

-- Schedule election finalization and inactive-leader succession from trusted server-side jobs.

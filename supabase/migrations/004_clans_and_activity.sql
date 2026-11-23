-- MHA Academy — clan system foundation. Apply after migrations 001–003.
create table if not exists public.hma_clans (
 id uuid primary key default gen_random_uuid(),
 name text not null check (char_length(name) between 3 and 32),
 slug text not null unique,
 description text not null default '',
 emblem_url text,
 created_by uuid not null references public.hma_profiles(user_id) on delete restrict,
 status text not null default 'pending' check (status in ('pending','approved','rejected')),
 verification_status text not null default 'none' check (verification_status in ('none','verified','revoked')),
 total_points bigint not null default 0 check (total_points >= 0),
 level integer not null default 1 check (level >= 1),
 reviewed_by uuid references public.hma_profiles(user_id) on delete set null,
 reviewed_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.hma_clan_members (
 id uuid primary key default gen_random_uuid(),
 clan_id uuid not null references public.hma_clans(id) on delete cascade,
 user_id uuid not null references public.hma_profiles(user_id) on delete cascade,
 member_role text not null default 'member' check (member_role in ('leader','member')),
 membership_status text not null default 'active' check (membership_status in ('active','left','removed')),
 individual_points bigint not null default 0 check (individual_points >= 0),
 last_activity_at timestamptz not null default now(),
 joined_at timestamptz not null default now(),
 left_at timestamptz
);
create unique index if not exists hma_one_active_clan_per_student on public.hma_clan_members(user_id) where membership_status = 'active';
create unique index if not exists hma_one_active_membership_per_clan_user on public.hma_clan_members(clan_id,user_id) where membership_status = 'active';
create index if not exists hma_clan_members_clan_active on public.hma_clan_members(clan_id,membership_status);

create table if not exists public.hma_clan_invitations (
 id uuid primary key default gen_random_uuid(),
 clan_id uuid not null references public.hma_clans(id) on delete cascade,
 invited_by uuid not null references public.hma_profiles(user_id) on delete cascade,
 invited_user_id uuid not null references public.hma_profiles(user_id) on delete cascade,
 status text not null default 'pending' check (status in ('pending','accepted','declined','cancelled')),
 created_at timestamptz not null default now(),
 responded_at timestamptz,
 unique(clan_id,invited_user_id)
);
create table if not exists public.hma_clan_follows (
 clan_id uuid not null references public.hma_clans(id) on delete cascade,
 user_id uuid not null references public.hma_profiles(user_id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(clan_id,user_id)
);
create table if not exists public.hma_clan_posts (
 id uuid primary key default gen_random_uuid(),
 clan_id uuid not null references public.hma_clans(id) on delete cascade,
 author_id uuid not null references public.hma_profiles(user_id) on delete restrict,
 caption text not null check (char_length(caption) between 1 and 2000),
 image_url text,
 created_at timestamptz not null default now()
);
create table if not exists public.hma_clan_post_likes (
 post_id uuid not null references public.hma_clan_posts(id) on delete cascade,
 user_id uuid not null references public.hma_profiles(user_id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(post_id,user_id)
);
create table if not exists public.hma_clan_post_comments (
 id uuid primary key default gen_random_uuid(),
 post_id uuid not null references public.hma_clan_posts(id) on delete cascade,
 user_id uuid not null references public.hma_profiles(user_id) on delete cascade,
 content text not null check (char_length(content) between 1 and 1000),
 created_at timestamptz not null default now()
);
create table if not exists public.hma_clan_level_thresholds (
 level integer primary key check(level >= 1),
 points_required bigint not null unique check(points_required >= 0)
);
insert into public.hma_clan_level_thresholds(level,points_required) values(1,0) on conflict(level) do nothing;
create table if not exists public.hma_clan_point_events (
 id uuid primary key default gen_random_uuid(),
 clan_id uuid not null references public.hma_clans(id) on delete cascade,
 user_id uuid references public.hma_profiles(user_id) on delete set null,
 source_type text not null check(source_type in ('game','post','clan_battle','tournament','quiz','manipulation_game','admin_adjustment')),
 source_id text,
 points integer not null check(points > 0),
 description text not null default '',
 created_at timestamptz not null default now()
);
create unique index if not exists hma_clan_point_event_once on public.hma_clan_point_events(clan_id,source_type,source_id) where source_id is not null;

create table if not exists public.hma_clan_elections (
 id uuid primary key default gen_random_uuid(),
 clan_id uuid not null references public.hma_clans(id) on delete cascade,
 status text not null default 'open' check(status in ('open','closed','cancelled')),
 starts_at timestamptz not null default now(),
 ends_at timestamptz,
 winner_user_id uuid references public.hma_profiles(user_id) on delete set null,
 created_by uuid not null references public.hma_profiles(user_id) on delete restrict,
 created_at timestamptz not null default now()
);
create table if not exists public.hma_clan_election_votes (
 election_id uuid not null references public.hma_clan_elections(id) on delete cascade,
 voter_user_id uuid not null references public.hma_profiles(user_id) on delete cascade,
 candidate_user_id uuid not null references public.hma_profiles(user_id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(election_id,voter_user_id),
 check(voter_user_id <> candidate_user_id)
);
create table if not exists public.hma_clan_admin_inspections (
 id uuid primary key default gen_random_uuid(),
 clan_id uuid not null references public.hma_clans(id) on delete cascade,
 inspector_user_id uuid not null references public.hma_profiles(user_id) on delete restrict,
 purpose text not null check(char_length(purpose) between 10 and 1000),
 member_notice text not null,
 member_notice_at timestamptz not null default now(),
 started_at timestamptz not null default now(),
 ended_at timestamptz,
 created_at timestamptz not null default now(),
 check(ended_at is null or ended_at >= started_at)
);

create or replace function public.hma_is_admin()
returns boolean language sql stable security definer set search_path=public,pg_temp
as $$ select exists(select 1 from public.hma_profiles p where p.user_id=auth.uid() and p.role in ('teacher','director')); $$;
create or replace function public.hma_is_clan_member(target_clan uuid)
returns boolean language sql stable security definer set search_path=public,pg_temp
as $$ select exists(select 1 from public.hma_clan_members m where m.clan_id=target_clan and m.user_id=auth.uid() and m.membership_status='active'); $$;
create or replace function public.hma_is_clan_leader(target_clan uuid)
returns boolean language sql stable security definer set search_path=public,pg_temp
as $$ select exists(select 1 from public.hma_clan_members m where m.clan_id=target_clan and m.user_id=auth.uid() and m.membership_status='active' and m.member_role='leader'); $$;

create or replace function public.hma_touch_clan_activity(target_clan uuid)
returns void language plpgsql security definer set search_path=public,pg_temp
as $$ begin
 update public.hma_clan_members set last_activity_at=now()
 where clan_id=target_clan and user_id=auth.uid() and membership_status='active';
end; $$;

create or replace function public.hma_enforce_clan_capacity()
returns trigger language plpgsql security definer set search_path=public,pg_temp
as $$ declare active_count integer; begin
 if new.membership_status='active' then
  perform pg_advisory_xact_lock(hashtextextended(new.clan_id::text,0));
  select count(*) into active_count from public.hma_clan_members
   where clan_id=new.clan_id and membership_status='active' and id is distinct from new.id;
  if active_count>=5 then raise exception 'A clan cannot have more than five active members'; end if;
 end if;
 return new;
end; $$;
drop trigger if exists trg_hma_clan_capacity on public.hma_clan_members;
create trigger trg_hma_clan_capacity before insert or update of membership_status,clan_id
on public.hma_clan_members for each row execute function public.hma_enforce_clan_capacity();

create or replace function public.hma_apply_clan_points()
returns trigger language plpgsql security definer set search_path=public,pg_temp
as $$ declare new_total bigint; declare new_level integer; begin
 update public.hma_clans set total_points=total_points+new.points,updated_at=now()
 where id=new.clan_id returning total_points into new_total;
 select coalesce(max(level),1) into new_level from public.hma_clan_level_thresholds where points_required<=new_total;
 update public.hma_clans set level=new_level where id=new.clan_id;
 if new.user_id is not null then
  update public.hma_clan_members set individual_points=individual_points+new.points,last_activity_at=now()
  where clan_id=new.clan_id and user_id=new.user_id and membership_status='active';
 end if;
 return new;
end; $$;
drop trigger if exists trg_hma_apply_clan_points on public.hma_clan_point_events;
create trigger trg_hma_apply_clan_points after insert on public.hma_clan_point_events
for each row execute function public.hma_apply_clan_points();

create or replace function public.hma_process_inactive_clan_leaders()
returns integer language plpgsql security definer set search_path=public,pg_temp
as $$ declare changed_count integer:=0; declare clan_row record; declare successor_id uuid; begin
 for clan_row in
  select c.id as clan_id,m.user_id as leader_id from public.hma_clans c
  join public.hma_clan_members m on m.clan_id=c.id
  where c.status='approved' and m.member_role='leader' and m.membership_status='active'
    and m.last_activity_at<=now()-interval '10 days'
 loop
  select user_id into successor_id from public.hma_clan_members
  where clan_id=clan_row.clan_id and membership_status='active' and user_id<>clan_row.leader_id
  order by individual_points desc,joined_at asc limit 1;
  if successor_id is not null then
   update public.hma_clan_members set membership_status='removed',left_at=now()
   where clan_id=clan_row.clan_id and user_id=clan_row.leader_id;
   update public.hma_clan_members set member_role='leader',last_activity_at=now()
   where clan_id=clan_row.clan_id and user_id=successor_id and membership_status='active';
   changed_count:=changed_count+1;
  end if;
 end loop;
 return changed_count;
end; $$;

alter table public.hma_clans enable row level security;
alter table public.hma_clan_members enable row level security;
alter table public.hma_clan_invitations enable row level security;
alter table public.hma_clan_follows enable row level security;
alter table public.hma_clan_posts enable row level security;
alter table public.hma_clan_post_likes enable row level security;
alter table public.hma_clan_post_comments enable row level security;
alter table public.hma_clan_level_thresholds enable row level security;
alter table public.hma_clan_point_events enable row level security;
alter table public.hma_clan_elections enable row level security;
alter table public.hma_clan_election_votes enable row level security;
alter table public.hma_clan_admin_inspections enable row level security;

create policy "Approved clans are public" on public.hma_clans for select
using(status='approved' or created_by=auth.uid() or public.hma_is_admin());
create policy "Students submit clans" on public.hma_clans for insert
with check(created_by=auth.uid() and status='pending' and verification_status='none');
create policy "Admins review clans" on public.hma_clans for update
using(public.hma_is_admin()) with check(public.hma_is_admin());

create policy "Public clan member lists" on public.hma_clan_members for select
using(exists(select 1 from public.hma_clans c where c.id=clan_id and c.status='approved') or user_id=auth.uid() or public.hma_is_admin());
create policy "Clan founder becomes initial leader" on public.hma_clan_members for insert
with check(user_id=auth.uid() and member_role='leader' and exists(select 1 from public.hma_clans c where c.id=clan_id and c.created_by=auth.uid() and c.status='pending'));
create policy "Invitee joins after accepting invitation" on public.hma_clan_members for insert
with check(user_id=auth.uid() and member_role='member' and exists(select 1 from public.hma_clan_invitations i where i.clan_id=clan_id and i.invited_user_id=auth.uid() and i.status='accepted'));

create policy "Invitation visible to sender and recipient" on public.hma_clan_invitations for select
using(invited_user_id=auth.uid() or invited_by=auth.uid() or public.hma_is_admin());
create policy "Leader creates invitations" on public.hma_clan_invitations for insert
with check(invited_by=auth.uid() and public.hma_is_clan_leader(clan_id));
create policy "Invitee responds to invitation" on public.hma_clan_invitations for update
using(invited_user_id=auth.uid()) with check(invited_user_id=auth.uid() and status in ('accepted','declined'));

create policy "Clan follows are visible" on public.hma_clan_follows for select using(true);
create policy "Students follow approved clans" on public.hma_clan_follows for insert
with check(user_id=auth.uid() and exists(select 1 from public.hma_clans c where c.id=clan_id and c.status='approved'));
create policy "Students unfollow clans" on public.hma_clan_follows for delete using(user_id=auth.uid());

create policy "Approved clan posts are public" on public.hma_clan_posts for select
using(exists(select 1 from public.hma_clans c where c.id=clan_id and c.status='approved'));
create policy "Only leaders publish clan posts" on public.hma_clan_posts for insert
with check(author_id=auth.uid() and public.hma_is_clan_leader(clan_id));

create policy "Post likes are public" on public.hma_clan_post_likes for select using(true);
create policy "Followers like clan posts" on public.hma_clan_post_likes for insert
with check(user_id=auth.uid() and exists(select 1 from public.hma_clan_posts p join public.hma_clan_follows f on f.clan_id=p.clan_id where p.id=post_id and f.user_id=auth.uid()));
create policy "Users remove own likes" on public.hma_clan_post_likes for delete using(user_id=auth.uid());
create policy "Post comments are public" on public.hma_clan_post_comments for select using(true);
create policy "Followers comment on clan posts" on public.hma_clan_post_comments for insert
with check(user_id=auth.uid() and exists(select 1 from public.hma_clan_posts p join public.hma_clan_follows f on f.clan_id=p.clan_id where p.id=post_id and f.user_id=auth.uid()));
create policy "Users or admins remove comments" on public.hma_clan_post_comments for delete
using(user_id=auth.uid() or public.hma_is_admin());

create policy "Clan level thresholds are readable" on public.hma_clan_level_thresholds for select using(true);
create policy "Admins configure clan level thresholds" on public.hma_clan_level_thresholds for all
using(public.hma_is_admin()) with check(public.hma_is_admin());
create policy "Members and admins view clan point history" on public.hma_clan_point_events for select
using(public.hma_is_admin() or public.hma_is_clan_member(clan_id));
create policy "Admins award clan points" on public.hma_clan_point_events for insert
with check(public.hma_is_admin());

create policy "Clan members view elections" on public.hma_clan_elections for select
using(public.hma_is_admin() or public.hma_is_clan_member(clan_id));
create policy "Leader or admin opens election" on public.hma_clan_elections for insert
with check(public.hma_is_admin() or (created_by=auth.uid() and public.hma_is_clan_leader(clan_id)));
create policy "Clan members view election votes" on public.hma_clan_election_votes for select
using(public.hma_is_admin() or exists(select 1 from public.hma_clan_elections e where e.id=election_id and public.hma_is_clan_member(e.clan_id)));
create policy "Members vote once in an open election" on public.hma_clan_election_votes for insert
with check(voter_user_id=auth.uid() and exists(select 1 from public.hma_clan_elections e where e.id=election_id and e.status='open' and public.hma_is_clan_member(e.clan_id)) and exists(select 1 from public.hma_clan_members m join public.hma_clan_elections e on e.clan_id=m.clan_id where e.id=election_id and m.user_id=candidate_user_id and m.membership_status='active'));

create policy "Inspection records are admin-only" on public.hma_clan_admin_inspections for select using(public.hma_is_admin());
create policy "Admins create disclosed inspections" on public.hma_clan_admin_inspections for insert
with check(inspector_user_id=auth.uid() and public.hma_is_admin() and char_length(member_notice)>=10);
create policy "Admins close inspections" on public.hma_clan_admin_inspections for update
using(public.hma_is_admin()) with check(public.hma_is_admin());

create index if not exists hma_clan_posts_timeline on public.hma_clan_posts(clan_id,created_at desc);
create index if not exists hma_clan_comments_post on public.hma_clan_post_comments(post_id,created_at);
create index if not exists hma_clan_invites_user on public.hma_clan_invitations(invited_user_id,status);
create index if not exists hma_clan_events_timeline on public.hma_clan_point_events(clan_id,created_at desc);
create index if not exists hma_clan_leader_activity on public.hma_clan_members(last_activity_at) where member_role='leader' and membership_status='active';

revoke all on function public.hma_process_inactive_clan_leaders() from public, anon, authenticated;
grant execute on function public.hma_process_inactive_clan_leaders() to service_role;

-- Schedule hma_process_inactive_clan_leaders() hourly with Supabase Cron or a secured Edge Function.

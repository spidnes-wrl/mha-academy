create extension if not exists pgcrypto;

create table if not exists public.hma_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.hma_profiles(user_id) on delete cascade,
  receiver_id uuid not null references public.hma_profiles(user_id) on delete cascade,
  content text not null default '',
  message_type text not null default 'text' check (message_type in ('text', 'image', 'file')),
  created_at timestamptz not null default now()
);

create table if not exists public.hma_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  owner_id uuid not null references public.hma_profiles(user_id) on delete cascade,
  is_private boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.hma_group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.hma_groups(id) on delete cascade,
  user_id uuid not null references public.hma_profiles(user_id) on delete cascade,
  role text not null default 'member' check (role in ('member','mod','owner')),
  joined_at timestamptz not null default now(),
  unique(group_id, user_id)
);

create table if not exists public.hma_user_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.hma_profiles(user_id) on delete cascade,
  blocked_user_id uuid not null references public.hma_profiles(user_id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, blocked_user_id),
  check (user_id <> blocked_user_id)
);

alter table public.hma_messages enable row level security;
alter table public.hma_groups enable row level security;
alter table public.hma_group_members enable row level security;
alter table public.hma_user_blocks enable row level security;

create policy "Users can read own messages"
on public.hma_messages
for select
using (
  sender_id = auth.uid() or receiver_id = auth.uid()
);

create policy "Users can insert own messages"
on public.hma_messages
for insert
with check (
  sender_id = auth.uid()
  and receiver_id is not null
  and not exists (
    select 1 from public.hma_user_blocks b
    where b.user_id = auth.uid() and b.blocked_user_id = hma_messages.receiver_id
  )
);

create or replace function public.hma_is_group_member(target_group uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.hma_group_members
    where group_id = target_group and user_id = auth.uid()
  )
$$;

create or replace function public.hma_is_group_manager(target_group uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.hma_groups
    where id = target_group and owner_id = auth.uid()
  ) or exists (
    select 1 from public.hma_group_members
    where group_id = target_group and user_id = auth.uid() and role in ('owner', 'mod')
  )
$$;

create policy "Users can read groups they belong to or public groups"
on public.hma_groups
for select
using (
  is_private = false
  or owner_id = auth.uid()
  or public.hma_is_group_member(id)
);

create policy "Authenticated users can create groups"
on public.hma_groups
for insert
with check (owner_id = auth.uid());

create policy "Members can see group membership"
on public.hma_group_members
for select
using (
  user_id = auth.uid()
  or public.hma_is_group_manager(group_id)
);

create policy "Owners or mods manage members"
on public.hma_group_members
for insert
with check (public.hma_is_group_manager(hma_group_members.group_id));

create policy "Users can read own blocks"
on public.hma_user_blocks
for select
using (user_id = auth.uid());

create policy "Users can create and delete own blocks"
on public.hma_user_blocks
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create index if not exists idx_hma_messages_sender_receiver on public.hma_messages(sender_id, receiver_id);
create index if not exists idx_hma_messages_created_at on public.hma_messages(created_at);
create index if not exists idx_hma_groups_owner on public.hma_groups(owner_id);
create index if not exists idx_hma_group_members_group on public.hma_group_members(group_id);
create index if not exists idx_hma_user_blocks_user on public.hma_user_blocks(user_id);

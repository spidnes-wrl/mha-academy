create extension if not exists pgcrypto;

create schema if not exists hma_private;

create table if not exists public.hma_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  username text not null unique,
  private_id text unique,
  email text not null unique,
  first_name text,
  last_name text,
  avatar_url text,
  bio text,
  class_rank text not null default 'A' check (class_rank in ('A','B','C','E','S')),
  role text not null default 'student' check (role in ('student','teacher','director')),
  exam_points integer not null default 0 check (exam_points >= 0),
  xp integer not null default 0 check (xp >= 0),
  virtual_coins integer not null default 0 check (virtual_coins >= 0),
  is_active boolean not null default true,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hma_rules (
  id uuid primary key default gen_random_uuid(),
  rule_name text not null unique,
  rule_value jsonb not null default '{}'::jsonb,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hma_hymn (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  lyrics text,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hma_missions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,
  status text not null default 'active' check (status in ('active','inactive')),
  reward_xp integer not null default 0 check (reward_xp >= 0),
  reward_coins integer not null default 0 check (reward_coins >= 0),
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hma_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date timestamptz not null,
  banner_url text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hma_shop_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price integer not null check (price >= 0),
  image_url text,
  external_link text,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hma_shop_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.hma_profiles(user_id) on delete cascade,
  item_id uuid not null references public.hma_shop_items(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  total_price integer not null check (total_price >= 0),
  status text not null default 'pending' check (status in ('pending','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hma_point_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.hma_profiles(user_id) on delete cascade,
  amount integer not null,
  transaction_type text not null check (transaction_type in ('purchase','reward','admin','refund')),
  description text,
  balance_before integer not null default 0,
  balance_after integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.hma_matches (
  id uuid primary key default gen_random_uuid(),
  player1_id uuid not null references public.hma_profiles(user_id) on delete cascade,
  player2_id uuid not null references public.hma_profiles(user_id) on delete cascade,
  winner_id uuid references public.hma_profiles(user_id),
  status text not null default 'pending' check (status in ('pending','active','completed','abandoned')),
  bet_amount integer not null default 0 check (bet_amount >= 0),
  pgn text,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hma_matches_not_same_player check (player1_id <> player2_id)
);

create table if not exists public.action_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_token text not null unique,
  ip_address text,
  user_agent text,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists hma_private.profile_secrets (
  profile_id uuid primary key references public.hma_profiles(id) on delete cascade,
  private_identifier text unique not null,
  private_secret_hash text,
  secret_hint text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at
before update on public.hma_profiles
for each row execute procedure public.set_updated_at();

create trigger trg_rules_updated_at
before update on public.hma_rules
for each row execute procedure public.set_updated_at();

create trigger trg_hymn_updated_at
before update on public.hma_hymn
for each row execute procedure public.set_updated_at();

create trigger trg_missions_updated_at
before update on public.hma_missions
for each row execute procedure public.set_updated_at();

create trigger trg_events_updated_at
before update on public.hma_events
for each row execute procedure public.set_updated_at();

create trigger trg_shop_items_updated_at
before update on public.hma_shop_items
for each row execute procedure public.set_updated_at();

create trigger trg_shop_orders_updated_at
before update on public.hma_shop_orders
for each row execute procedure public.set_updated_at();

create trigger trg_matches_updated_at
before update on public.hma_matches
for each row execute procedure public.set_updated_at();

create trigger trg_private_secrets_updated_at
before update on hma_private.profile_secrets
for each row execute procedure public.set_updated_at();

alter table public.hma_profiles enable row level security;
alter table public.hma_rules enable row level security;
alter table public.hma_hymn enable row level security;
alter table public.hma_missions enable row level security;
alter table public.hma_events enable row level security;
alter table public.hma_shop_items enable row level security;
alter table public.hma_shop_orders enable row level security;
alter table public.hma_point_transactions enable row level security;
alter table public.hma_matches enable row level security;
alter table public.action_logs enable row level security;
alter table public.sessions enable row level security;
alter table hma_private.profile_secrets enable row level security;

create policy "Public profiles viewable by everyone or their owner"
on public.hma_profiles
for select
using (
  is_public = true
  or user_id = auth.uid()
  or exists (
    select 1 from public.hma_profiles ap
    where ap.user_id = auth.uid() and ap.role in ('teacher', 'director')
  )
);

create policy "Users may update only own profile fields"
on public.hma_profiles
for update
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and role = old.role
  and exam_points = old.exam_points
  and xp = old.xp
  and virtual_coins = old.virtual_coins
);

create policy "Admin may manage member profiles"
on public.hma_profiles
for insert
with check (
  exists (
    select 1 from public.hma_profiles ap
    where ap.user_id = auth.uid() and ap.role in ('teacher','director')
  )
);

create policy "Admins manage rules"
on public.hma_rules
for all
using (
  exists (
    select 1 from public.hma_profiles ap
    where ap.user_id = auth.uid() and ap.role = 'director'
  )
)
with check (
  exists (
    select 1 from public.hma_profiles ap
    where ap.user_id = auth.uid() and ap.role = 'director'
  )
);

create policy "Users can read their own logs"
on public.action_logs
for select
using (user_id = auth.uid());

create policy "Users can insert their own logs"
on public.action_logs
for insert
with check (user_id = auth.uid());

create policy "Users can read their own sessions"
on public.sessions
for select
using (user_id = auth.uid());

create policy "Users can insert and update own sessions"
on public.sessions
for insert
with check (user_id = auth.uid());

create policy "Users can update own session"
on public.sessions
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can read only own secrets"
on hma_private.profile_secrets
for select
using (
  profile_id in (
    select id from public.hma_profiles where user_id = auth.uid()
  )
);

create policy "Users can manage own secrets"
on hma_private.profile_secrets
for all
using (
  profile_id in (
    select id from public.hma_profiles where user_id = auth.uid()
  )
)
with check (
  profile_id in (
    select id from public.hma_profiles where user_id = auth.uid()
  )
);

create index if not exists idx_hma_profiles_user_id on public.hma_profiles(user_id);
create index if not exists idx_hma_profiles_username on public.hma_profiles(username);
create index if not exists idx_hma_profiles_class_rank on public.hma_profiles(class_rank);
create index if not exists idx_hma_transactions_user_id on public.hma_point_transactions(user_id);
create index if not exists idx_hma_orders_user_id on public.hma_shop_orders(user_id);
create index if not exists idx_hma_events_date on public.hma_events(event_date);
create index if not exists idx_hma_matches_status on public.hma_matches(status);

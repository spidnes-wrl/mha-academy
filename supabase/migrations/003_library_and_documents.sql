create table if not exists public.hma_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  file_url text,
  access_level text not null default 'public' check (access_level in ('public','private')),
  category text not null default 'general',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.hma_documents enable row level security;

create policy "Public documents viewable by all authenticated users"
on public.hma_documents
for select
using (access_level = 'public' or public.hma_current_role() in ('teacher', 'director'));

create policy "Only admins manage documents"
on public.hma_documents
for insert
with check (public.hma_current_role() in ('teacher', 'director'));

create index if not exists idx_hma_documents_access on public.hma_documents(access_level);
create index if not exists idx_hma_documents_category on public.hma_documents(category);

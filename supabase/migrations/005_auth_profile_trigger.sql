-- Create a MHA profile automatically after Supabase Auth registration.
-- This is required because clients must never be allowed to assign their own role or points.
create or replace function public.hma_handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  base_username text;
  final_username text;
begin
  base_username := lower(coalesce(new.raw_user_meta_data->>'username', split_part(coalesce(new.email,''),'@',1)));
  base_username := regexp_replace(base_username, '[^a-z0-9_]', '', 'g');
  if char_length(base_username) < 3 then
    base_username := 'student';
  end if;
  final_username := left(base_username, 20);

  begin
    insert into public.hma_profiles (
      user_id, username, email, first_name, last_name, role, class_rank
    ) values (
      new.id,
      final_username,
      coalesce(new.email, ''),
      nullif(trim(new.raw_user_meta_data->>'first_name'), ''),
      nullif(trim(new.raw_user_meta_data->>'last_name'), ''),
      'student',
      'A'
    )
    on conflict (user_id) do nothing;
  exception when unique_violation then
    insert into public.hma_profiles (
      user_id, username, email, first_name, last_name, role, class_rank
    ) values (
      new.id,
      left(base_username, 12) || '_' || substr(replace(new.id::text, '-', ''), 1, 6),
      coalesce(new.email, ''),
      nullif(trim(new.raw_user_meta_data->>'first_name'), ''),
      nullif(trim(new.raw_user_meta_data->>'last_name'), ''),
      'student',
      'A'
    )
    on conflict (user_id) do nothing;
  end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_hma_profile on auth.users;
create trigger on_auth_user_created_hma_profile
after insert on auth.users
for each row execute function public.hma_handle_new_auth_user();

revoke all on function public.hma_handle_new_auth_user() from public, anon, authenticated;

-- Keep inactivity tracking accurate and let ordinary members leave without a vote.
create or replace function public.hma_touch_activity_after_clan_message()
returns trigger
language plpgsql
security definer
set search_path=public,pg_temp
as $$
begin
 update public.hma_clan_members
 set last_activity_at=now()
 where clan_id=new.clan_id and user_id=new.sender_id and membership_status='active';
 return new;
end;
$$;
drop trigger if exists trg_hma_clan_message_activity on public.hma_clan_messages;
create trigger trg_hma_clan_message_activity
after insert on public.hma_clan_messages
for each row execute function public.hma_touch_activity_after_clan_message();

create or replace function public.hma_request_clan_exit(target_clan uuid)
returns void
language plpgsql
security definer
set search_path=public,pg_temp
as $$
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if not exists(
  select 1 from public.hma_clan_members
  where clan_id=target_clan and user_id=auth.uid()
    and membership_status='active' and member_role='member'
 ) then
  raise exception 'Only an active non-leader member can leave directly';
 end if;
 update public.hma_clan_members
 set membership_status='left',left_at=now()
 where clan_id=target_clan and user_id=auth.uid() and membership_status='active';
end;
$$;
revoke all on function public.hma_request_clan_exit(uuid) from public,anon;
grant execute on function public.hma_request_clan_exit(uuid) to authenticated;

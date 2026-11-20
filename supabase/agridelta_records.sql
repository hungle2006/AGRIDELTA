-- AGRIDELTA: dedicated Supabase PostgreSQL schema.
-- Apply ONLY to a separate AGRIDELTA project, never a shared project without approval.
-- Frontend uses a PUBLISHABLE/anon key with an authenticated user JWT.
-- The service role key must never be used in browser code.

begin;

create table if not exists public.agridelta_records (
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('fields','seasons','tasks','observations','orders')),
  record_id text not null check (length(record_id) between 1 and 160),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, kind, record_id)
);

create index if not exists agridelta_records_user_kind_idx
  on public.agridelta_records(user_id,kind,updated_at desc);

alter table public.agridelta_records enable row level security;

drop policy if exists agridelta_select_own on public.agridelta_records;
create policy agridelta_select_own on public.agridelta_records
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists agridelta_insert_own on public.agridelta_records;
create policy agridelta_insert_own on public.agridelta_records
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists agridelta_update_own on public.agridelta_records;
create policy agridelta_update_own on public.agridelta_records
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists agridelta_delete_own on public.agridelta_records;
create policy agridelta_delete_own on public.agridelta_records
  for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on public.agridelta_records from anon;
grant select,insert,update,delete on public.agridelta_records to authenticated;

commit;

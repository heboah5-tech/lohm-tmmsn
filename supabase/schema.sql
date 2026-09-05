create extension if not exists pgcrypto;

create table if not exists public.visitor_records (
  visitor_id text primary key,
  data jsonb not null default '{}'::jsonb,
  is_online boolean not null default false,
  is_blocked boolean not null default false,
  is_unread boolean not null default false,
  current_page text,
  current_step integer,
  redirect_page text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists visitor_records_updated_at_idx
  on public.visitor_records (updated_at desc);

create index if not exists visitor_records_online_idx
  on public.visitor_records (is_online);

create index if not exists visitor_records_status_idx
  on public.visitor_records ((data->>'status'));

create index if not exists visitor_records_redirect_idx
  on public.visitor_records (redirect_page);

create or replace function public.touch_visitor_record()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists visitor_records_touch on public.visitor_records;

create trigger visitor_records_touch
before update on public.visitor_records
for each row execute function public.touch_visitor_record();

create table if not exists public.application_settings (
  id text primary key,
  settings jsonb not null default
    '{"blockedCardBins":[],"allowedCountries":[]}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  application_id text not null,
  sender_id text not null,
  sender_name text not null,
  sender_role text not null
    check (sender_role in ('customer', 'professional', 'admin')),
  message text not null,
  timestamp timestamptz not null default now(),
  read boolean not null default false
);

create index if not exists chat_messages_application_idx
  on public.chat_messages (application_id, timestamp);

create table if not exists public.page_view_events (
  id bigint generated always as identity primary key,
  page text,
  visitor_id text,
  event_name text not null default 'page_view',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists page_view_events_created_at_idx
  on public.page_view_events (created_at desc);

create index if not exists page_view_events_visitor_idx
  on public.page_view_events (visitor_id);

-- Required for postgres_changes subscriptions used by the dashboard.
do $$
begin
  alter publication supabase_realtime add table public.visitor_records;
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table public.chat_messages;
exception
  when duplicate_object then null;
end;
$$;
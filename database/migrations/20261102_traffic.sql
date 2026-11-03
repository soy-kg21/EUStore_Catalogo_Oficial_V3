-- Uses the existing Supabase project. Run before enabling EUSTORE_TRAFFIC_ENABLED=1.
begin;
create table if not exists public.eustore_traffic_sessions (
 id text primary key check (id ~ '^[a-f0-9]{64}$'),
 started_at timestamptz not null default now(), seen_at timestamptz not null default now(),
 path text not null, source text not null default '', campaign text not null default '', event_count integer not null default 0
);
create index if not exists eustore_traffic_seen on public.eustore_traffic_sessions(seen_at);
create table if not exists public.eustore_traffic_events (
 id text primary key, session_id text not null references public.eustore_traffic_sessions(id) on delete cascade,
 at timestamptz not null default now(), kind text not null check(kind in ('view','whatsapp')),
 path text not null, source text not null default '', campaign text not null default ''
);
create index if not exists eustore_traffic_at on public.eustore_traffic_events(at);
create index if not exists eustore_traffic_session_events on public.eustore_traffic_events(session_id);
alter table public.eustore_traffic_sessions enable row level security;
alter table public.eustore_traffic_events enable row level security;
revoke all on public.eustore_traffic_sessions,public.eustore_traffic_events from public,anon,authenticated;
grant select,insert,update,delete on public.eustore_traffic_sessions,public.eustore_traffic_events to service_role;

create or replace function public.eustore_traffic_collect(p_session text,p_event text,p_kind text,p_path text,p_source text,p_campaign text)
returns boolean language plpgsql security invoker set search_path='' as $$
declare counter integer; inserted integer;
begin
 if p_session is null or p_event is null or p_kind is null or p_path is null or p_source is null or p_campaign is null
 or p_session !~ '^[a-f0-9]{64}$' or p_event !~ '^[a-f0-9]{64}$' or p_kind not in ('view','heartbeat','whatsapp')
 or p_path !~ '^/([a-z0-9-]+/?)*$' or length(p_path)>220 or length(p_source)>120 or length(p_campaign)>80 then
  raise exception 'Invalid traffic event';
 end if;
 insert into public.eustore_traffic_sessions(id,path,source,campaign) values(p_session,p_path,p_source,p_campaign) on conflict do nothing;
 select event_count into counter from public.eustore_traffic_sessions where id=p_session for update;
 if counter>=200 then return false; end if;
 update public.eustore_traffic_sessions set seen_at=now(),path=p_path where id=p_session;
 if p_kind<>'heartbeat' then
  insert into public.eustore_traffic_events(id,session_id,kind,path,source,campaign) values(p_event,p_session,p_kind,p_path,p_source,p_campaign) on conflict do nothing;
  get diagnostics inserted=row_count;
  update public.eustore_traffic_sessions set event_count=event_count+inserted where id=p_session;
 end if;
 -- Bounded history; deleted sessions cascade to their events. Indexed cleanup.
 if random()<0.01 then delete from public.eustore_traffic_sessions where seen_at<now()-interval '31 days'; end if;
 return true;
end $$;

create or replace function public.eustore_traffic_summary()
returns jsonb language plpgsql security invoker set search_path='' as $$
declare today_start timestamptz := date_trunc('day',now() at time zone 'America/Bogota') at time zone 'America/Bogota'; result jsonb;
begin
 delete from public.eustore_traffic_sessions where seen_at<now()-interval '31 days';
 select jsonb_build_object(
  'generatedAt',now(),'activeWindowSeconds',90,'retentionDays',31,
  'active',(select count(*) from public.eustore_traffic_sessions where seen_at>now()-interval '90 seconds'),
  'sessionsToday',(select count(*) from public.eustore_traffic_sessions where started_at>=today_start),
  'viewsToday',(select count(*) from public.eustore_traffic_events where at>=today_start and kind='view'),
  'whatsappToday',(select count(*) from public.eustore_traffic_events where at>=today_start and kind='whatsapp'),
  'daily',coalesce((select jsonb_agg(to_jsonb(d) order by d.day) from (
    select to_char(at at time zone 'America/Bogota','YYYY-MM-DD') as day,count(*) filter(where kind='view') as views,count(*) filter(where kind='whatsapp') as whatsapp
    from public.eustore_traffic_events where at>=today_start-interval '29 days' group by 1) d),'[]'::jsonb),
  'pages',coalesce((select jsonb_agg(to_jsonb(p)) from (select path,count(*) as views from public.eustore_traffic_events where at>=today_start-interval '29 days' and kind='view' group by path order by count(*) desc,path limit 10)p),'[]'::jsonb),
  'sources',coalesce((select jsonb_agg(to_jsonb(s)) from (select source,campaign,count(*) as sessions from public.eustore_traffic_sessions where started_at>=today_start-interval '29 days' group by source,campaign order by count(*) desc,source,campaign limit 10)s),'[]'::jsonb)
 ) into result;
 return result;
end $$;
revoke execute on function public.eustore_traffic_collect(text,text,text,text,text,text),public.eustore_traffic_summary() from public,anon,authenticated;
grant execute on function public.eustore_traffic_collect(text,text,text,text,text,text),public.eustore_traffic_summary() to service_role;
notify pgrst,'reload schema';
commit;

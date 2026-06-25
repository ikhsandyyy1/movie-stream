create type public.content_type as enum ('movie', 'series');
create type public.source_type as enum ('owned', 'official_embed', 'licensed_provider');
create type public.profile_role as enum ('user', 'admin');
create type public.audit_event_type as enum (
  'admin_login',
  'admin_logout',
  'content_created',
  'content_updated',
  'content_deleted',
  'content_published',
  'content_unpublished',
  'media_uploaded',
  'source_updated',
  'title_viewed',
  'title_played',
  'search_performed'
);

create schema if not exists app_private;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  role public.profile_role not null default 'user',
  created_at timestamptz not null default now()
);

create table public.genres (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique
);

create table public.titles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  type public.content_type not null,
  tmdb_id int,
  imdb_id text unique,
  imdb_rank int,
  imdb_rating numeric(3,1),
  imdb_votes int,
  year int not null,
  country text not null,
  network text not null,
  duration text not null,
  rating text not null,
  synopsis text not null,
  poster_path text,
  backdrop_path text,
  genre_names text[] not null default '{}',
  is_published boolean not null default false,
  is_featured boolean not null default false,
  is_trending boolean not null default false,
  is_recently_added boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index titles_imdb_rank_idx on public.titles (type, imdb_rank) where imdb_rank is not null;

create table public.title_genres (
  title_id uuid not null references public.titles(id) on delete cascade,
  genre_id uuid not null references public.genres(id) on delete cascade,
  primary key (title_id, genre_id)
);

create table public.video_sources (
  id uuid primary key default gen_random_uuid(),
  title_id uuid not null references public.titles(id) on delete cascade,
  label text not null,
  type public.source_type not null,
  url text not null,
  quality text not null default '1080p',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  title_id uuid not null references public.titles(id) on delete cascade,
  season_number int not null check (season_number > 0),
  name text not null,
  synopsis text,
  poster_path text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (title_id, season_number)
);

create table public.episodes (
  id uuid primary key default gen_random_uuid(),
  title_id uuid not null references public.titles(id) on delete cascade,
  season_id uuid not null references public.seasons(id) on delete cascade,
  season_number int not null check (season_number > 0),
  episode_number int not null check (episode_number > 0),
  title text not null,
  synopsis text,
  duration text not null default 'TBA',
  still_path text,
  air_date date,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (title_id, season_number, episode_number)
);

create table public.episode_video_sources (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references public.episodes(id) on delete cascade,
  title_id uuid not null references public.titles(id) on delete cascade,
  label text not null,
  type public.source_type not null,
  url text not null,
  quality text not null default '1080p',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.watch_history (
  user_id uuid not null references public.profiles(id) on delete cascade,
  title_id uuid not null references public.titles(id) on delete cascade,
  progress int not null default 0 check (progress between 0 and 100),
  updated_at timestamptz not null default now(),
  primary key (user_id, title_id)
);

create table public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  title_id uuid not null references public.titles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, title_id)
);

create table public.homepage_rails (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  sort_order int not null default 0,
  filter jsonb not null default '{}',
  is_active boolean not null default true
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  event_type public.audit_event_type not null,
  actor_id uuid references public.profiles(id) on delete set null,
  actor_email text,
  title_id uuid references public.titles(id) on delete set null,
  title_slug text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.genres enable row level security;
alter table public.titles enable row level security;
alter table public.title_genres enable row level security;
alter table public.video_sources enable row level security;
alter table public.seasons enable row level security;
alter table public.episodes enable row level security;
alter table public.episode_video_sources enable row level security;
alter table public.watch_history enable row level security;
alter table public.favorites enable row level security;
alter table public.homepage_rails enable row level security;
alter table public.audit_events enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke execute on function public.is_admin() from public, anon, authenticated;

create or replace function app_private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on schema app_private from public, anon, authenticated;
grant usage on schema app_private to anon, authenticated;
revoke execute on function app_private.is_admin() from public;
grant execute on function app_private.is_admin() to anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(coalesce(new.email, ''), '@', 1))
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = coalesce(public.profiles.display_name, excluded.display_name);
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create policy "profiles read own or admin"
on public.profiles for select
using (id = auth.uid() or app_private.is_admin());

create policy "profiles update own"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "published titles are readable"
on public.titles for select
using (is_published or app_private.is_admin());

create policy "genres are readable"
on public.genres for select
using (true);

create policy "title genres are readable"
on public.title_genres for select
using (true);

create policy "active sources are readable for published titles"
on public.video_sources for select
using (
  app_private.is_admin()
  or (
    is_active
    and exists (
      select 1
      from public.titles
      where titles.id = video_sources.title_id
        and titles.is_published
    )
  )
);

create policy "published seasons are readable"
on public.seasons for select
using (
  app_private.is_admin()
  or (
    is_published
    and exists (
      select 1
      from public.titles
      where titles.id = seasons.title_id
        and titles.is_published
    )
  )
);

create policy "published episodes are readable"
on public.episodes for select
using (
  app_private.is_admin()
  or (
    is_published
    and exists (
      select 1
      from public.titles
      where titles.id = episodes.title_id
        and titles.is_published
    )
    and exists (
      select 1
      from public.seasons
      where seasons.id = episodes.season_id
        and seasons.is_published
    )
  )
);

create policy "active episode sources are readable"
on public.episode_video_sources for select
using (
  app_private.is_admin()
  or (
    is_active
    and exists (
      select 1
      from public.episodes
      join public.titles on titles.id = episodes.title_id
      join public.seasons on seasons.id = episodes.season_id
      where episodes.id = episode_video_sources.episode_id
        and episodes.is_published
        and seasons.is_published
        and titles.is_published
    )
  )
);

create policy "watch history own read"
on public.watch_history for select
using (user_id = auth.uid());

create policy "watch history own write"
on public.watch_history for insert
with check (user_id = auth.uid());

create policy "watch history own update"
on public.watch_history for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "favorites own read"
on public.favorites for select
using (user_id = auth.uid());

create policy "favorites own write"
on public.favorites for insert
with check (user_id = auth.uid());

create policy "favorites own delete"
on public.favorites for delete
using (user_id = auth.uid());

create policy "homepage rails readable"
on public.homepage_rails for select
using (is_active or app_private.is_admin());

create policy "admin manages titles"
on public.titles for all
using (app_private.is_admin())
with check (app_private.is_admin());

create policy "admin manages genres"
on public.genres for all
using (app_private.is_admin())
with check (app_private.is_admin());

create policy "admin manages title genres"
on public.title_genres for all
using (app_private.is_admin())
with check (app_private.is_admin());

create policy "admin manages sources"
on public.video_sources for all
using (app_private.is_admin())
with check (app_private.is_admin());

create policy "admin manages seasons"
on public.seasons for all
using (app_private.is_admin())
with check (app_private.is_admin());

create policy "admin manages episodes"
on public.episodes for all
using (app_private.is_admin())
with check (app_private.is_admin());

create policy "admin manages episode sources"
on public.episode_video_sources for all
using (app_private.is_admin())
with check (app_private.is_admin());

create policy "admin manages rails"
on public.homepage_rails for all
using (app_private.is_admin())
with check (app_private.is_admin());

create policy "admin reads audit events"
on public.audit_events for select
to authenticated
using (app_private.is_admin());

create policy "admin inserts audit events"
on public.audit_events for insert
to authenticated
with check (app_private.is_admin());

create policy "public inserts website events"
on public.audit_events for insert
to anon, authenticated
with check (event_type in ('title_viewed', 'title_played', 'search_performed'));

revoke all on public.profiles from anon;
revoke insert, update, delete, truncate on public.genres from anon, authenticated;
revoke insert, update, delete, truncate on public.title_genres from anon, authenticated;
revoke insert, update, delete, truncate on public.titles from anon, authenticated;
revoke insert, update, delete, truncate on public.video_sources from anon, authenticated;
revoke insert, update, delete, truncate on public.seasons from anon, authenticated;
revoke insert, update, delete, truncate on public.episodes from anon, authenticated;
revoke insert, update, delete, truncate on public.episode_video_sources from anon, authenticated;
revoke insert, update, delete, truncate on public.homepage_rails from anon, authenticated;
revoke all on public.watch_history from anon;
revoke all on public.favorites from anon;

grant usage on schema public to anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;
grant select on public.genres to anon, authenticated;
grant select on public.title_genres to anon, authenticated;
grant select on public.titles to anon, authenticated;
grant select on public.video_sources to anon, authenticated;
grant select on public.seasons to anon, authenticated;
grant select on public.episodes to anon, authenticated;
grant select on public.episode_video_sources to anon, authenticated;
grant select on public.homepage_rails to anon, authenticated;
grant select, insert, update, delete on public.watch_history to authenticated;
grant select, insert, delete on public.favorites to authenticated;
grant insert, update, delete on public.titles to authenticated;
grant insert, update, delete on public.genres to authenticated;
grant insert, update, delete on public.title_genres to authenticated;
grant insert, update, delete on public.video_sources to authenticated;
grant insert, update, delete on public.seasons to authenticated;
grant insert, update, delete on public.episodes to authenticated;
grant insert, update, delete on public.episode_video_sources to authenticated;
grant insert, update, delete on public.homepage_rails to authenticated;
grant select, insert on public.audit_events to authenticated;
grant insert on public.audit_events to anon;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('posters', 'posters', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('backdrops', 'backdrops', true, 10485760, array['image/jpeg','image/png','image/webp']),
  ('subtitles', 'subtitles', false, 1048576, array['text/vtt','application/x-subrip','text/plain']),
  ('videos', 'videos', false, 1073741824, array['video/mp4','video/webm','video/quicktime'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "public read public media buckets"
on storage.objects for select
to anon, authenticated
using (bucket_id in ('posters', 'backdrops'));

create policy "admin manages media buckets"
on storage.objects for all
to authenticated
using (bucket_id in ('posters', 'backdrops', 'subtitles', 'videos') and app_private.is_admin())
with check (bucket_id in ('posters', 'backdrops', 'subtitles', 'videos') and app_private.is_admin());

create policy "admin uploads media buckets"
on storage.objects for insert
to authenticated
with check (bucket_id in ('posters', 'backdrops', 'subtitles', 'videos') and app_private.is_admin());

create policy "admin updates media buckets"
on storage.objects for update
to authenticated
using (bucket_id in ('posters', 'backdrops', 'subtitles', 'videos') and app_private.is_admin())
with check (bucket_id in ('posters', 'backdrops', 'subtitles', 'videos') and app_private.is_admin());

create policy "admin deletes media buckets"
on storage.objects for delete
to authenticated
using (bucket_id in ('posters', 'backdrops', 'subtitles', 'videos') and app_private.is_admin());

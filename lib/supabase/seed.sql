insert into public.titles (
  slug,
  title,
  type,
  tmdb_id,
  year,
  country,
  network,
  duration,
  rating,
  synopsis,
  poster_path,
  backdrop_path,
  genre_names,
  is_published,
  is_featured,
  is_trending,
  is_recently_added
) values
(
  'red-notice',
  'Red Notice',
  'movie',
  512195,
  2021,
  'United States',
  'Netflix',
  '1j 58m',
  '13+',
  'Seorang profiler FBI bekerja dalam situasi penuh tipu daya saat memburu pencuri seni kelas dunia dan artefak langka.',
  'https://en.wikipedia.org/wiki/Special:FilePath/Red_Notice_-_film_promotional_image.jpg',
  'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1800&q=80',
  array['Action', 'Comedy', 'Crime'],
  true,
  true,
  true,
  true
),
(
  'rick-and-morty-2013',
  'Rick and Morty',
  'series',
  60625,
  2013,
  'United States',
  'Adult Swim',
  '9 Musim',
  '18+',
  'Ilmuwan genius yang kacau menyeret cucunya ke petualangan lintas semesta yang absurd, berbahaya, dan sering menguji keluarga mereka.',
  'https://en.wikipedia.org/wiki/Special:FilePath/Rick_and_Morty_season_1.png',
  'https://image.tmdb.org/t/p/w1280/cikAVDLDrO7pehCJ0YKkhdYJSUr.jpg',
  array['Adventure', 'Animation', 'Comedy', 'Sci-Fi'],
  true,
  false,
  true,
  true
),
(
  'stranger-things',
  'Stranger Things',
  'series',
  66732,
  2016,
  'United States',
  'Netflix',
  '4 Musim',
  '16+',
  'Anak-anak Hawkins menghadapi eksperimen rahasia, dimensi lain, dan ancaman supernatural yang makin besar.',
  'https://en.wikipedia.org/wiki/Special:FilePath/Stranger_Things_season_1.jpg',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1800&q=80',
  array['Drama', 'Horror', 'Sci-Fi'],
  true,
  false,
  true,
  true
),
(
  'the-big-4',
  'The Big 4',
  'movie',
  740952,
  2022,
  'Indonesia',
  'Netflix',
  '2j 21m',
  '18+',
  'Seorang detektif mengikuti jejak ayahnya dan bertemu empat mantan pembunuh bayaran yang terseret konflik baru.',
  'https://en.wikipedia.org/wiki/Special:FilePath/The_Big_4_film_poster.jpg',
  'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=1800&q=80',
  array['Action', 'Comedy', 'Crime'],
  true,
  false,
  true,
  true
),
(
  'night-of-the-living-dead',
  'Night of the Living Dead',
  'movie',
  10331,
  1968,
  'United States',
  'Internet Archive',
  '1j 36m',
  '18+',
  'Sekelompok orang berlindung di sebuah rumah terpencil saat mayat hidup mengepung pedesaan Pennsylvania.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Night_of_the_Living_Dead_%281968%29_theatrical_poster.jpg/500px-Night_of_the_Living_Dead_%281968%29_theatrical_poster.jpg',
  'https://archive.org/download/NightOfTheLivingDead720p1968/__ia_thumb.jpg',
  array['Horror', 'Classic', 'Public Domain'],
  true,
  false,
  false,
  true
) on conflict (slug) do update set
  title = excluded.title,
  type = excluded.type,
  tmdb_id = excluded.tmdb_id,
  year = excluded.year,
  country = excluded.country,
  network = excluded.network,
  duration = excluded.duration,
  rating = excluded.rating,
  synopsis = excluded.synopsis,
  poster_path = excluded.poster_path,
  backdrop_path = excluded.backdrop_path,
  genre_names = excluded.genre_names,
  is_published = excluded.is_published,
  is_featured = excluded.is_featured,
  is_trending = excluded.is_trending,
  is_recently_added = excluded.is_recently_added;

insert into public.video_sources (
  title_id,
  label,
  type,
  url,
  quality,
  is_active
)
select
  id,
  'Licensed provider placeholder',
  'licensed_provider',
  'https://provider.example/licensed-title',
  '1080p',
  true
from public.titles
where slug in ('red-notice', 'stranger-things', 'the-big-4')
on conflict do nothing;

delete from public.video_sources
where title_id = (select id from public.titles where slug = 'night-of-the-living-dead');

insert into public.video_sources (
  title_id,
  label,
  type,
  url,
  quality,
  is_active
)
select
  id,
  'Internet Archive embed',
  'official_embed',
  'https://archive.org/embed/NightOfTheLivingDead720p1968',
  '720p',
  true
from public.titles
where slug = 'night-of-the-living-dead';

with season_counts(season_number, episode_count) as (
  values
    (1, 11),
    (2, 10),
    (3, 10),
    (4, 10),
    (5, 10),
    (6, 10),
    (7, 10),
    (8, 10),
    (9, 10)
),
rick as (
  select id, slug, synopsis
  from public.titles
  where slug = 'rick-and-morty-2013'
),
upserted_seasons as (
  insert into public.seasons (
    title_id,
    season_number,
    name,
    synopsis,
    poster_path,
    is_published
  )
  select
    rick.id,
    season_counts.season_number,
    'Season ' || season_counts.season_number,
    'Rick and Morty season ' || season_counts.season_number || '.',
    'https://en.wikipedia.org/wiki/Special:FilePath/Rick_and_Morty_season_1.png',
    true
  from rick
  cross join season_counts
  on conflict (title_id, season_number) do update set
    name = excluded.name,
    synopsis = excluded.synopsis,
    poster_path = excluded.poster_path,
    is_published = excluded.is_published,
    updated_at = now()
  returning id, title_id, season_number
),
all_seasons as (
  select seasons.id, seasons.title_id, seasons.season_number, season_counts.episode_count
  from public.seasons
  join rick on rick.id = seasons.title_id
  join season_counts on season_counts.season_number = seasons.season_number
),
upserted_episodes as (
  insert into public.episodes (
    title_id,
    season_id,
    season_number,
    episode_number,
    title,
    synopsis,
    duration,
    still_path,
    is_published
  )
  select
    all_seasons.title_id,
    all_seasons.id,
    all_seasons.season_number,
    episode_number,
    case
      when all_seasons.season_number = 1 and episode_number = 1 then 'Pilot'
      else 'Episode ' || episode_number
    end,
    'Petualangan Rick and Morty season ' || all_seasons.season_number || ' episode ' || episode_number || '.',
    '24m',
    'https://image.tmdb.org/t/p/w1280/cikAVDLDrO7pehCJ0YKkhdYJSUr.jpg',
    true
  from all_seasons
  cross join lateral generate_series(1, all_seasons.episode_count) as episode_number
  on conflict (title_id, season_number, episode_number) do update set
    season_id = excluded.season_id,
    title = excluded.title,
    synopsis = excluded.synopsis,
    duration = excluded.duration,
    still_path = excluded.still_path,
    is_published = excluded.is_published,
    updated_at = now()
  returning id, title_id
)
insert into public.episode_video_sources (
  episode_id,
  title_id,
  label,
  type,
  url,
  quality,
  is_active
)
select
  episodes.id,
  episodes.title_id,
  'Episode placeholder',
  'licensed_provider',
  'https://provider.example/licensed-episode',
  '1080p',
  true
from public.episodes
join public.titles on titles.id = episodes.title_id
where titles.slug = 'rick-and-morty-2013'
  and not exists (
    select 1
    from public.episode_video_sources
    where episode_video_sources.episode_id = episodes.id
  );

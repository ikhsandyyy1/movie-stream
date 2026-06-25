#!/usr/bin/env node

import { createGunzip } from "node:zlib";
import { createInterface } from "node:readline";
import { Readable } from "node:stream";
import { mkdir, writeFile } from "node:fs/promises";

const DATASET_BASE = "https://datasets.imdbws.com";
const GENERATED_TS = new URL("../lib/generated/imdb-top-titles.ts", import.meta.url);
const GENERATED_SQL = new URL("../lib/supabase/imdb-top-upsert.sql", import.meta.url);
const TOP_LIMIT = Number(process.env.IMDB_TOP_LIMIT ?? 50);
const MIN_VOTES = Number(process.env.IMDB_MIN_VOTES ?? 25000);
const TOKEN = process.env.TMDB_ACCESS_TOKEN;

const ratings = await loadRatings();
const basics = await loadBasics(ratings);
const movieCandidates = rankTitles(basics, ratings, "movie").slice(0, TOP_LIMIT * 3);
const seriesCandidates = rankTitles(basics, ratings, "tvSeries").slice(0, TOP_LIMIT * 3);
const wikidataTmdbIds = TOKEN ? null : await resolveWikidataTmdbIds([...movieCandidates, ...seriesCandidates]);
const enriched = [];

for (const item of movieCandidates) {
  if (enriched.filter((title) => title.type === "movie").length >= TOP_LIMIT) break;
  const type = item.titleType === "movie" ? "movie" : "series";
  const tmdb = await resolveTmdb(item.tconst, type, wikidataTmdbIds);
  if (!tmdb) continue;
  const details = await fetchTmdbDetails(tmdb.id, type);
  if (!details) continue;

  enriched.push(toTitleSeed(item, ratings.get(item.tconst), tmdb.id, details, type));
}

for (const item of seriesCandidates) {
  if (enriched.filter((title) => title.type === "series").length >= TOP_LIMIT) break;
  const type = item.titleType === "movie" ? "movie" : "series";
  const tmdb = await resolveTmdb(item.tconst, type, wikidataTmdbIds);
  if (!tmdb) continue;
  const details = await fetchTmdbDetails(tmdb.id, type);
  if (!details) continue;

  enriched.push(toTitleSeed(item, ratings.get(item.tconst), tmdb.id, details, type));
}

normalizeImportedRanks(enriched, "movie");
normalizeImportedRanks(enriched, "series");

await mkdir(new URL("../lib/generated/", import.meta.url), { recursive: true });
await writeFile(GENERATED_TS, renderTypeScript(enriched));
await writeFile(GENERATED_SQL, renderSql(enriched));

console.log(`Generated ${enriched.filter((item) => item.type === "movie").length} movies and ${enriched.filter((item) => item.type === "series").length} series.`);
console.log(`Wrote ${GENERATED_TS.pathname}`);
console.log(`Wrote ${GENERATED_SQL.pathname}`);

async function loadRatings() {
  const map = new Map();
  for await (const row of tsvRows(`${DATASET_BASE}/title.ratings.tsv.gz`)) {
    if (row.tconst === "tconst") continue;
    map.set(row.tconst, {
      averageRating: Number(row.averageRating),
      numVotes: Number(row.numVotes)
    });
  }
  return map;
}

async function loadBasics(ratings) {
  const titles = [];
  for await (const row of tsvRows(`${DATASET_BASE}/title.basics.tsv.gz`)) {
    if (row.tconst === "tconst") continue;
    if (row.isAdult !== "0") continue;
    if (row.titleType !== "movie" && row.titleType !== "tvSeries") continue;
    const rating = ratings.get(row.tconst);
    if (!rating || rating.numVotes < MIN_VOTES) continue;
    if (!row.startYear || row.startYear === "\\N") continue;

    titles.push({
      tconst: row.tconst,
      titleType: row.titleType,
      primaryTitle: cleanText(row.primaryTitle),
      originalTitle: cleanText(row.originalTitle),
      startYear: Number(row.startYear),
      runtimeMinutes: row.runtimeMinutes === "\\N" ? null : Number(row.runtimeMinutes),
      genres: row.genres === "\\N" ? [] : row.genres.split(",")
    });
  }
  return titles;
}

function rankTitles(basics, ratings, titleType) {
  return basics
    .filter((title) => title.titleType === titleType)
    .sort((a, b) => {
      const ar = ratings.get(a.tconst);
      const br = ratings.get(b.tconst);
      return br.averageRating - ar.averageRating || br.numVotes - ar.numVotes || a.primaryTitle.localeCompare(b.primaryTitle);
    })
    .map((title, index) => ({ ...title, imdbRank: index + 1 }));
}

function normalizeImportedRanks(items, type) {
  items
    .filter((item) => item.type === type)
    .sort((a, b) => a.imdbRank - b.imdbRank)
    .forEach((item, index) => {
      item.imdbRank = index + 1;
    });
}

async function resolveTmdb(imdbId, type, wikidataTmdbIds) {
  if (!TOKEN) {
    const id = wikidataTmdbIds.get(imdbId);
    return id ? { id } : null;
  }

  const data = await tmdbFetch(`/find/${imdbId}`, { external_source: "imdb_id" });
  const results = type === "movie" ? data.movie_results : data.tv_results;
  const first = results?.[0];
  return first ? { id: first.id } : null;
}

async function fetchTmdbDetails(tmdbId, type) {
  if (!TOKEN) return fetchTmdbWebDetails(tmdbId, type);

  const append = type === "movie" ? "release_dates" : "content_ratings";
  return tmdbFetch(`/${type === "movie" ? "movie" : "tv"}/${tmdbId}`, {
    append_to_response: append
  });
}

async function tmdbFetch(path, params = {}) {
  const url = new URL(`https://api.themoviedb.org/3${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      authorization: `Bearer ${TOKEN}`
    }
  });
  if (!response.ok) throw new Error(`TMDB ${path} failed: ${response.status}`);
  return response.json();
}

async function resolveWikidataTmdbIds(items) {
  const map = new Map();
  const chunks = chunk(items, 40);

  for (const group of chunks) {
    const values = group.map((item) => `"${item.tconst}"`).join(" ");
    const query = `SELECT ?imdb ?movieTmdb ?tvTmdb WHERE {
      VALUES ?imdb { ${values} }
      ?item wdt:P345 ?imdb.
      OPTIONAL { ?item wdt:P4947 ?movieTmdb. }
      OPTIONAL { ?item wdt:P4983 ?tvTmdb. }
    }`;
    const url = new URL("https://query.wikidata.org/sparql");
    url.searchParams.set("format", "json");
    url.searchParams.set("query", query);

    const response = await fetch(url, {
      headers: {
        accept: "application/sparql-results+json",
        "user-agent": "movie-stream-imdb-importer/1.0"
      }
    });
    if (!response.ok) throw new Error(`Wikidata lookup failed: ${response.status}`);
    const data = await response.json();
    data.results.bindings.forEach((binding) => {
      const imdb = binding.imdb?.value;
      const tmdb = binding.movieTmdb?.value ?? binding.tvTmdb?.value;
      if (imdb && tmdb) map.set(imdb, Number(tmdb));
    });
  }

  return map;
}

async function fetchTmdbWebDetails(tmdbId, type) {
  const pageType = type === "movie" ? "movie" : "tv";
  const response = await fetch(`https://www.themoviedb.org/${pageType}/${tmdbId}`, {
    headers: { "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126 Safari/537.36" }
  });
  if (!response.ok) return null;
  const html = await response.text();
  const title = decodeHtml(meta(html, "og:title") ?? "");
  const description = decodeHtml(meta(html, "description") ?? "");
  const images = [...html.matchAll(/<meta property="og:image" content="([^"]+)"/g)].map((match) => match[1]);
  return {
    title: type === "movie" ? title.replace(/\s*\(\d{4}\).*$/, "") : undefined,
    name: type === "series" ? title.replace(/\s*\([^)]*\).*$/, "") : undefined,
    overview: description,
    runtime: undefined,
    episode_run_time: [],
    number_of_seasons: 1,
    genres: [],
    poster_path: tmdbImagePath(images[0]),
    backdrop_path: tmdbImagePath(images[1]),
    production_countries: [],
    origin_country: [],
    networks: [],
    production_companies: []
  };
}

function toTitleSeed(imdb, imdbRating, tmdbId, tmdb, type) {
  const title = cleanText(type === "movie" ? tmdb.title ?? imdb.primaryTitle : tmdb.name ?? imdb.primaryTitle);
  const seasonCount = type === "series" ? Math.max(1, Number(tmdb.number_of_seasons ?? 1)) : undefined;
  const runtime = type === "movie" ? tmdb.runtime ?? imdb.runtimeMinutes : tmdb.episode_run_time?.[0] ?? imdb.runtimeMinutes;

  return {
    slug: slugify(`${title}-${imdb.startYear}`),
    title,
    type,
    tmdbId,
    imdbId: imdb.tconst,
    imdbRank: imdb.imdbRank,
    imdbRating: imdbRating.averageRating,
    imdbVotes: imdbRating.numVotes,
    year: imdb.startYear,
    country: countryName(tmdb),
    network: networkName(tmdb, type),
    duration: type === "movie" ? formatRuntime(runtime) : `${seasonCount} Musim`,
    rating: imdbCertification(tmdb, type) ?? `IMDb ${imdbRating.averageRating.toFixed(1)}`,
    genres: tmdb.genres?.length ? tmdb.genres.map((genre) => genre.name) : imdb.genres,
    synopsis: cleanText(tmdb.overview) || `${title} berdasarkan data IMDb Top Rated dan metadata TMDB.`,
    posterFile: tmdb.poster_path ?? "",
    backdropUrl: tmdb.backdrop_path ?? undefined,
    featured: imdb.imdbRank <= 5,
    trending: imdb.imdbRank <= 20,
    recentlyAdded: true,
    seasonEpisodeCounts: type === "series" ? Array.from({ length: seasonCount }, () => 8) : undefined
  };
}

function imdbCertification(tmdb, type) {
  if (type === "movie") {
    const us = tmdb.release_dates?.results?.find((item) => item.iso_3166_1 === "US");
    return us?.release_dates?.find((item) => item.certification)?.certification || null;
  }
  const us = tmdb.content_ratings?.results?.find((item) => item.iso_3166_1 === "US");
  return us?.rating || null;
}

function countryName(tmdb) {
  return tmdb.production_countries?.[0]?.name ?? tmdb.origin_country?.[0] ?? "Unknown";
}

function networkName(tmdb, type) {
  if (type === "series") return tmdb.networks?.[0]?.name ?? "TV";
  return tmdb.production_companies?.[0]?.name ?? "Movie";
}

function tmdbImagePath(url) {
  if (!url) return "";
  const match = url.match(/\/t\/p\/[^/]+\/([^?#]+)/);
  return match ? `/${match[1]}` : url;
}

function formatRuntime(minutes) {
  const value = Number(minutes);
  if (!value) return "TBA";
  const hours = Math.floor(value / 60);
  const mins = value % 60;
  return hours ? `${hours}j ${mins.toString().padStart(2, "0")}m` : `${mins}m`;
}

async function* tsvRows(url) {
  const response = await fetch(url);
  if (!response.ok || !response.body) throw new Error(`Failed to fetch ${url}: ${response.status}`);

  const input = Readable.fromWeb(response.body).pipe(createGunzip());
  const lines = createInterface({ input, crlfDelay: Infinity });
  let headers = null;
  for await (const line of lines) {
    const cells = line.split("\t");
    if (!headers) {
      headers = cells;
      continue;
    }
    yield Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
  }
}

function renderTypeScript(items) {
  return `import type { TitleSeed } from "@/lib/data";

// Generated by scripts/import-imdb-top.mjs from IMDb public datasets and TMDB metadata.
export const imdbTopTitleSeeds = ${JSON.stringify(items, null, 2)} satisfies readonly TitleSeed[];
`;
}

function renderSql(items) {
  const values = items.map((item) => {
    return `(${[
      sql(item.slug),
      sql(item.title),
      sql(item.type),
      item.tmdbId,
      sql(item.imdbId),
      item.imdbRank,
      item.imdbRating.toFixed(1),
      item.imdbVotes,
      item.year,
      sql(item.country),
      sql(item.network),
      sql(item.duration),
      sql(item.rating),
      sql(item.synopsis),
      sql(item.posterFile),
      sql(item.backdropUrl ?? null),
      `array[${item.genres.map(sql).join(", ")}]`,
      item.featured,
      item.trending,
      item.recentlyAdded
    ].join(", ")})`;
  });

  const series = items.filter((item) => item.type === "series");
  return `alter table public.titles add column if not exists tmdb_id int;
alter table public.titles add column if not exists imdb_id text unique;
alter table public.titles add column if not exists imdb_rank int;
alter table public.titles add column if not exists imdb_rating numeric(3,1);
alter table public.titles add column if not exists imdb_votes int;
create index if not exists titles_imdb_rank_idx on public.titles (type, imdb_rank) where imdb_rank is not null;

insert into public.titles (
  slug, title, type, tmdb_id, imdb_id, imdb_rank, imdb_rating, imdb_votes, year, country, network, duration,
  rating, synopsis, poster_path, backdrop_path, genre_names, is_published, is_featured, is_trending, is_recently_added
) values
${values.join(",\n")}
on conflict (slug) do update set
  title = excluded.title,
  type = excluded.type,
  tmdb_id = excluded.tmdb_id,
  imdb_id = excluded.imdb_id,
  imdb_rank = excluded.imdb_rank,
  imdb_rating = excluded.imdb_rating,
  imdb_votes = excluded.imdb_votes,
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
  is_recently_added = excluded.is_recently_added,
  updated_at = now();

insert into public.video_sources (title_id, label, type, url, quality, is_active)
select
  titles.id,
  'NxSha TMDb/IMDb embed',
  'official_embed',
  case when titles.type = 'series' then 'https://web.nxsha.app/embed/tv/' || titles.tmdb_id || '/1/1?sub=id&lang=id' else 'https://web.nxsha.app/embed/movie/' || titles.tmdb_id || '?sub=id&lang=id' end,
  '1080p',
  true
from public.titles
where titles.imdb_id is not null
  and not exists (
    select 1 from public.video_sources where video_sources.title_id = titles.id and video_sources.label = 'NxSha TMDb/IMDb embed'
  );

${renderSeriesSql(series)}
`;
}

function renderSeriesSql(series) {
  if (series.length === 0) return "";
  const values = series
    .map((item) => {
      const count = item.seasonEpisodeCounts?.length ?? 1;
      return `(${sql(item.slug)}, ${count}, ${sql(item.posterFile)})`;
    })
    .join(",\n");

  return `with series_data(slug, season_count, poster_path) as (
  values
${values}
),
series_titles as (
  select titles.id, titles.slug, titles.title, titles.synopsis, series_data.season_count, series_data.poster_path
  from public.titles
  join series_data on series_data.slug = titles.slug
),
season_numbers as (
  select series_titles.*, generate_series(1, series_titles.season_count) as season_number
  from series_titles
),
upserted_seasons as (
  insert into public.seasons (title_id, season_number, name, synopsis, poster_path, is_published)
  select id, season_number, 'Season ' || season_number, title || ' season ' || season_number || '.', poster_path, true
  from season_numbers
  on conflict (title_id, season_number) do update set
    name = excluded.name,
    synopsis = excluded.synopsis,
    poster_path = excluded.poster_path,
    is_published = excluded.is_published,
    updated_at = now()
  returning id, title_id, season_number
)
insert into public.episodes (title_id, season_id, season_number, episode_number, title, synopsis, duration, still_path, is_published)
select
  upserted_seasons.title_id,
  upserted_seasons.id,
  upserted_seasons.season_number,
  episode_number,
  'Episode ' || episode_number,
  'Episode ' || episode_number || ' season ' || upserted_seasons.season_number || '.',
  'TBA',
  titles.backdrop_path,
  true
from upserted_seasons
join public.titles on titles.id = upserted_seasons.title_id
cross join lateral generate_series(1, 8) as episode_number
on conflict (title_id, season_number, episode_number) do update set
  season_id = excluded.season_id,
  title = excluded.title,
  synopsis = excluded.synopsis,
  duration = excluded.duration,
  still_path = excluded.still_path,
  is_published = excluded.is_published,
  updated_at = now();`;
}

function sql(value) {
  if (value === null || value === undefined || value === "") return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function cleanText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function meta(html, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return html.match(new RegExp(`<meta (?:name|property)="${escaped}" content="([^"]*)"`, "i"))?.[1] ?? null;
}

function decodeHtml(value) {
  return value
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&#8212;", "-")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function chunk(items, size) {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, index * size + size));
}

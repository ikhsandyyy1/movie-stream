#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";

const TOKEN = process.env.TMDB_ACCESS_TOKEN;
const IMDB_URL = "https://www.imdb.com/search/title/?moviemeter=%2C10&ref_=hm_tenup_sm";
const OUT = new URL("../lib/generated/imdb-featured.json", import.meta.url);
const FALLBACK_MOVIEMETER = ["Disclosure Day", "Obsession", "Backrooms", "Masters of the Universe", "Michael"];

if (!TOKEN) {
  console.error("TMDB_ACCESS_TOKEN is required to resolve IMDb MOVIEmeter titles to TMDB metadata.");
  process.exit(1);
}

const names = await fetchImdbMoviemeterNames();
const featured = [];

for (const name of names.slice(0, 10)) {
  if (featured.length >= 5) break;
  const result = await searchTmdb(name);
  if (!result) continue;
  const type = result.media_type === "tv" ? "series" : "movie";
  const details = await tmdbFetch(`/${result.media_type}/${result.id}`, {
    append_to_response: result.media_type === "tv" ? "external_ids,content_ratings,images" : "external_ids,release_dates,images"
  });
  featured.push({
    title: details.title ?? details.name ?? name,
    type,
    tmdbId: details.id,
    imdbId: details.external_ids?.imdb_id,
    year: Number((details.release_date ?? details.first_air_date ?? "").slice(0, 4)) || new Date().getFullYear(),
    posterFile: details.poster_path,
    backdropUrl: pickWideBackdrop(details.images?.backdrops ?? []) ?? details.backdrop_path,
    synopsis: details.overview ?? "",
    genres: details.genres?.map((genre) => genre.name) ?? [],
    sourceUrl: IMDB_URL
  });
}

await mkdir(new URL("../lib/generated/", import.meta.url), { recursive: true });
await writeFile(OUT, `${JSON.stringify({ source: IMDB_URL, fetchedAt: new Date().toISOString(), featured }, null, 2)}\n`);
console.log(`Wrote ${featured.length} IMDb MOVIEmeter featured items to ${OUT.pathname}`);

async function fetchImdbMoviemeterNames() {
  const response = await fetch(IMDB_URL, {
    headers: {
      "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126 Safari/537.36",
      "accept-language": "en-US,en;q=0.9"
    }
  });
  const html = await response.text();
  const names = [...html.matchAll(/"originalTitleText"\s*:\s*\{\s*"text"\s*:\s*"([^"]+)"/g)].map((match) => match[1]);
  return names.length ? [...new Set(names)] : FALLBACK_MOVIEMETER;
}

async function searchTmdb(name) {
  const data = await tmdbFetch("/search/multi", { query: name, include_adult: "false" });
  return data.results?.find((item) => item.media_type === "movie" || item.media_type === "tv") ?? null;
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

function pickWideBackdrop(images) {
  return images
    .filter((image) => image.aspect_ratio >= 1.6 && image.file_path)
    .sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0) || (b.width ?? 0) - (a.width ?? 0))[0]?.file_path;
}

#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";

const IDLIX_BASE = "https://z2.idlixku.com";
const GENERATED_TS = new URL("../lib/generated/idlix-latest.ts", import.meta.url);
const LIMIT = Number(process.env.IDLIX_LATEST_LIMIT ?? 20);
const CANDIDATE_LIMIT = Number(process.env.IDLIX_LATEST_CANDIDATE_LIMIT ?? 80);
const TOKEN = process.env.TMDB_ACCESS_TOKEN;

const latestMovies = await scrapeIdlixList(`${IDLIX_BASE}/movie`, "movie");
const latestSeries = await scrapeIdlixList(`${IDLIX_BASE}/series`, "series");
const enriched = [];

await enrichList(latestMovies, "movie");
await enrichList(latestSeries, "series");

await mkdir(new URL("../lib/generated/", import.meta.url), { recursive: true });
await writeFile(GENERATED_TS, renderTypeScript(enriched));

console.log(`Generated ${enriched.filter((item) => item.type === "movie").length}/${LIMIT} IDLIX latest movies.`);
console.log(`Generated ${enriched.filter((item) => item.type === "series").length}/${LIMIT} IDLIX latest series.`);
console.log(`Wrote ${GENERATED_TS.pathname}`);

async function enrichList(items, type) {
  let resolved = 0;
  for (const item of items) {
    if (resolved >= LIMIT) break;
    const tmdb = await resolveTmdb(item);
    if (!tmdb) {
      console.warn(`Skipped ${item.type}: ${item.title} (${item.year ?? "unknown year"}) - TMDB match not found`);
      continue;
    }

    const details = await fetchTmdbDetails(tmdb.id, item.type);
    if (!details?.poster_path || !details?.backdrop_path) {
      console.warn(`Skipped ${item.type}: ${item.title} - TMDB media incomplete`);
      continue;
    }

    resolved += 1;
    enriched.push(toTitleSeed({ ...item, rank: resolved }, tmdb.id, details));
  }

  if (resolved < LIMIT) {
    console.warn(`Only resolved ${resolved}/${LIMIT} IDLIX latest ${type} items from ${items.length} candidates.`);
  }
}

async function scrapeIdlixList(url, type) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126 Safari/537.36",
      accept: "text/html,application/xhtml+xml",
      "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7"
    }
  });
  if (!response.ok) throw new Error(`IDLIX ${url} failed: ${response.status}`);

  const html = await response.text();
  const prefix = type === "movie" ? "/movie/" : "/series/";
  const items = extractIdlixItems(html, prefix);
  return items.slice(0, CANDIDATE_LIMIT).map((item, index) => ({
    ...item,
    type,
    rank: index + 1,
    idlixUrl: `${IDLIX_BASE}${item.href}`
  }));
}

function extractIdlixItems(html, prefix) {
  const normalized = decodeRsc(html);
  const seen = new Set();
  const items = [];
  const patterns = [
    /href="(\/(?:movie|series)\/[^"#?]+)"[^>]*>([\s\S]*?)<\/a>/gi,
    /"href":"(\/(?:movie|series)\/[^"#?]+)"[\s\S]{0,400}?"children":"([^"]+)"/gi,
    /\["\$","a",null,\{"href":"(\/(?:movie|series)\/[^"#?]+)"[\s\S]{0,400}?\{"children":"([^"]+)"/gi
  ];

  for (const pattern of patterns) {
    for (const match of normalized.matchAll(pattern)) {
      const href = match[1];
      if (!href.startsWith(prefix) || seen.has(href)) continue;
      const text = cleanText(stripTags(match[2]));
      const slugParts = href.split("/").filter(Boolean);
      const fallbackTitle = titleFromSlug(slugParts[1] ?? "");
      const year = yearFromText(text) ?? yearFromText(href);
      const title = cleanTitle(text) || fallbackTitle;
      if (!title || title.length < 2) continue;

      seen.add(href);
      items.push({ href, title, year });
      if (items.length >= CANDIDATE_LIMIT) return items;
    }
  }

  return items;
}

function decodeRsc(value) {
  return value
    .replaceAll('\\"', '"')
    .replaceAll("\\/", "/")
    .replaceAll("\\u0026", "&")
    .replaceAll("\\u003c", "<")
    .replaceAll("\\u003e", ">")
    .replaceAll("\\u0027", "'");
}

async function resolveTmdb(item) {
  if (TOKEN) return resolveTmdbApi(item);
  return (await resolveTmdbWikidata(item)) ?? resolveTmdbWeb(item);
}

async function resolveTmdbApi(item) {
  const data = await tmdbFetch(`/search/${item.type === "movie" ? "movie" : "tv"}`, {
    query: item.title,
    year: item.type === "movie" && item.year ? item.year : undefined,
    first_air_date_year: item.type === "series" && item.year ? item.year : undefined,
    include_adult: "false"
  });
  const results = data.results ?? [];
  const exactYear = results.find((result) => resultYear(result, item.type) === item.year);
  const first = exactYear ?? results[0];
  return first ? { id: first.id } : null;
}

async function resolveTmdbWeb(item) {
  const queries = item.year ? [`${item.title} ${item.year}`, item.title] : [item.title];
  for (const query of queries) {
    const url = new URL("https://www.themoviedb.org/search");
    url.searchParams.set("query", query);
    const response = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126 Safari/537.36",
        "accept-language": "en-US,en;q=0.8"
      }
    });
    if (!response.ok) continue;

    const html = await response.text();
    const pageType = item.type === "movie" ? "movie" : "tv";
    const ids = [...html.matchAll(new RegExp(`href="/${pageType}/(\\d+)(?:-[^"]*)?"`, "g"))]
      .map((match) => Number(match[1]))
      .filter(Boolean);
    const id = ids[0];
    if (id) return { id };
  }

  return null;
}

async function resolveTmdbWikidata(item) {
  const tmdbProperty = item.type === "movie" ? "P4947" : "P4983";
  const escapedTitle = sparqlString(item.title);
  const query = `SELECT ?tmdb ?date WHERE {
    ?entity rdfs:label ${escapedTitle}@en;
      wdt:${tmdbProperty} ?tmdb.
    OPTIONAL { ?entity wdt:P577 ?date. }
    OPTIONAL { ?entity wdt:P580 ?date. }
  } LIMIT 10`;
  const url = new URL("https://query.wikidata.org/sparql");
  url.searchParams.set("format", "json");
  url.searchParams.set("query", query);

  const response = await fetch(url, {
    headers: {
      accept: "application/sparql-results+json",
      "user-agent": "movie-stream-idlix-importer/1.0"
    }
  });
  if (!response.ok) return null;

  const data = await response.json();
  const bindings = data.results?.bindings ?? [];
  const exactYear = bindings.find((binding) => yearFromText(binding.date?.value) === item.year);
  const first = exactYear ?? bindings[0];
  const id = Number(first?.tmdb?.value);
  return id ? { id } : null;
}

async function fetchTmdbDetails(tmdbId, type) {
  if (TOKEN) {
    const append = type === "movie" ? "release_dates" : "content_ratings";
    return tmdbFetch(`/${type === "movie" ? "movie" : "tv"}/${tmdbId}`, {
      append_to_response: append
    });
  }

  return fetchTmdbWebDetails(tmdbId, type);
}

async function tmdbFetch(path, params = {}) {
  const url = new URL(`https://api.themoviedb.org/3${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, value);
  });
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      authorization: `Bearer ${TOKEN}`
    }
  });
  if (!response.ok) throw new Error(`TMDB ${path} failed: ${response.status}`);
  return response.json();
}

async function fetchTmdbWebDetails(tmdbId, type) {
  const pageType = type === "movie" ? "movie" : "tv";
  const response = await fetch(`https://www.themoviedb.org/${pageType}/${tmdbId}`, {
    headers: {
      "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126 Safari/537.36",
      "accept-language": "en-US,en;q=0.8"
    }
  });
  if (!response.ok) return null;

  const html = await response.text();
  const title = decodeHtml(meta(html, "og:title") ?? "");
  const description = decodeHtml(meta(html, "description") ?? "");
  const images = [...html.matchAll(/<meta property="og:image" content="([^"]+)"/g)].map((match) => match[1]);
  const poster = tmdbImagePath(images.find((image) => image.includes("/t/p/")));
  const backdrop = tmdbImagePath(images.find((image) => image.includes("/t/p/") && image !== images[0])) || poster;
  const year = yearFromText(title);

  return {
    title: type === "movie" ? title.replace(/\s*\(\d{4}\).*$/, "") : undefined,
    name: type === "series" ? title.replace(/\s*\([^)]*\).*$/, "") : undefined,
    overview: description,
    runtime: undefined,
    episode_run_time: [],
    number_of_seasons: 1,
    first_air_date: year ? `${year}-01-01` : undefined,
    release_date: year ? `${year}-01-01` : undefined,
    vote_average: undefined,
    genres: [],
    poster_path: poster,
    backdrop_path: backdrop,
    production_countries: [],
    origin_country: [],
    networks: [],
    production_companies: []
  };
}

function toTitleSeed(item, tmdbId, tmdb) {
  const title = cleanText(item.type === "movie" ? tmdb.title ?? item.title : tmdb.name ?? item.title);
  const year = resultYear(tmdb, item.type) ?? item.year ?? new Date().getFullYear();
  const seasonCount = item.type === "series" ? Math.max(1, Number(tmdb.number_of_seasons ?? 1)) : undefined;
  const runtime = item.type === "movie" ? tmdb.runtime : tmdb.episode_run_time?.[0];
  const tmdbRating = Number(tmdb.vote_average);

  return {
    slug: slugify(`${title}-${year}`),
    title,
    type: item.type,
    tmdbId,
    year,
    country: countryName(tmdb),
    network: networkName(tmdb, item.type),
    duration: item.type === "movie" ? formatRuntime(runtime) : `${seasonCount} Musim`,
    rating: tmdbRating ? `TMDB ${tmdbRating.toFixed(1)}` : "TMDB",
    genres: tmdb.genres?.length ? tmdb.genres.map((genre) => genre.name) : ["Drama"],
    synopsis: cleanText(tmdb.overview) || `${title} terbaru dari IDLIX dengan metadata TMDB.`,
    posterFile: tmdb.poster_path ?? "",
    backdropUrl: tmdb.backdrop_path ?? undefined,
    trending: item.rank <= 10,
    recentlyAdded: true,
    idlixLatestRank: item.rank,
    seasonEpisodeCounts: item.type === "series" ? Array.from({ length: seasonCount }, () => 8) : undefined
  };
}

function renderTypeScript(items) {
  return `import type { TitleSeed } from "@/lib/data";

// Generated by scripts/import-idlix-latest.mjs from IDLIX latest movie and series lists.
export const idlixLatestTitleSeeds = ${JSON.stringify(items, null, 2)} satisfies readonly TitleSeed[];
`;
}

function resultYear(item, type) {
  const date = type === "movie" ? item.release_date : item.first_air_date;
  const year = Number(String(date ?? "").slice(0, 4));
  return Number.isFinite(year) && year > 0 ? year : undefined;
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

function cleanTitle(value) {
  return cleanText(value)
    .replace(/\s*\(\d{4}\)\s*$/, "")
    .replace(/\s+Nonton\s+.*$/i, "")
    .trim();
}

function titleFromSlug(slug) {
  return slug
    .replace(/-\d{4}$/, "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function yearFromText(value) {
  const match = String(value ?? "").match(/\b(19\d{2}|20\d{2})\b/);
  return match ? Number(match[1]) : undefined;
}

function stripTags(value) {
  return String(value ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}

function cleanText(value) {
  return decodeHtml(String(value ?? ""))
    .replace(/\s+/g, " ")
    .trim();
}

function meta(html, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return html.match(new RegExp(`<meta (?:name|property)="${escaped}" content="([^"]*)"`, "i"))?.[1] ?? null;
}

function decodeHtml(value) {
  return String(value ?? "")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&#x27;", "'")
    .replaceAll("&#8211;", "-")
    .replaceAll("&#8212;", "-")
    .replaceAll("&#8217;", "'")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function slugify(value) {
  return cleanText(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function sparqlString(value) {
  return `"${String(value ?? "").replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

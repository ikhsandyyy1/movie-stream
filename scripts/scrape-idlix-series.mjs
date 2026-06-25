#!/usr/bin/env node

const url = process.argv[2];

if (!url) {
  console.error("Usage: node scripts/scrape-idlix-series.mjs <idlix-series-url>");
  process.exit(1);
}

const response = await fetch(url, {
  headers: {
    "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126 Safari/537.36"
  }
});

if (!response.ok) {
  throw new Error(`Failed to fetch ${url}: ${response.status}`);
}

const html = await response.text();
const jsonLd = extractJsonLd(html);
const tvSeries = jsonLd.find((item) => item["@type"] === "TVSeries") ?? {};
const seasonLinks = Array.from(
  new Set([...html.matchAll(/\/series\/[^"'<\\\s]+\/season\/(\d+)\/episode\/(\d+)/g)].map((match) => match[0].replaceAll("\\", "")))
);

const seasons = new Map();
for (const link of seasonLinks) {
  const match = link.match(/\/season\/(\d+)\/episode\/(\d+)/);
  if (!match) continue;
  const seasonNumber = Number(match[1]);
  const episodeNumber = Number(match[2]);
  const season = seasons.get(seasonNumber) ?? {
    seasonNumber,
    name: `Season ${seasonNumber}`,
    episodes: []
  };
  if (!season.episodes.some((episode) => episode.episodeNumber === episodeNumber)) {
    season.episodes.push({
      episodeNumber,
      title: episodeNumber === 1 && seasonNumber === 1 ? "Pilot" : `Episode ${episodeNumber}`,
      url: new URL(link, url).toString()
    });
  }
  seasons.set(seasonNumber, season);
}

const output = {
  sourceUrl: url,
  title: tvSeries.name,
  synopsis: tvSeries.description,
  year: tvSeries.startDate ? Number(String(tvSeries.startDate).slice(0, 4)) : undefined,
  country: tvSeries.countryOfOrigin?.name,
  network: tvSeries.productionCompany?.[0]?.name,
  poster: tvSeries.image?.[0],
  backdrop: tvSeries.image?.[1],
  numberOfSeasons: tvSeries.numberOfSeasons,
  numberOfEpisodes: tvSeries.numberOfEpisodes,
  seasons: Array.from(seasons.values())
    .sort((a, b) => a.seasonNumber - b.seasonNumber)
    .map((season) => ({
      ...season,
      episodes: season.episodes.sort((a, b) => a.episodeNumber - b.episodeNumber)
    }))
};

console.log(JSON.stringify(output, null, 2));

function extractJsonLd(html) {
  const scripts = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/g)];
  return scripts.flatMap((script) => {
    try {
      const parsed = JSON.parse(decodeHtml(script[1].trim()));
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [];
    }
  });
}

function decodeHtml(value) {
  return value
    .replaceAll("&quot;", '"')
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";

const IDLIX_URL = "https://z2.idlixku.com/";
const OUT = new URL("../lib/generated/idlix-insights.json", import.meta.url);

const fallback = {
  source: IDLIX_URL,
  fetchedAt: new Date().toISOString(),
  status: "fallback",
  sections: [
    "Trending",
    "Film Terbaru",
    "Serial TV Terbaru",
    "Recently Added Episodes",
    "Anime",
    "Drama Korea",
    "Network Originals",
    "Collections",
    "Negara",
    "Tahun",
    "Genre"
  ],
  featureIdeas: [
    "Rail kategori ala IDLIX untuk anime, drama Korea, network originals, dan episode terbaru.",
    "Filter cepat berdasarkan negara, tahun, genre, dan network.",
    "Collection rail untuk rating tinggi dan franchise/tema populer."
  ],
  titles: []
};

try {
  const response = await fetch(IDLIX_URL, {
    headers: {
      "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126 Safari/537.36",
      accept: "text/html,application/xhtml+xml",
      "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7"
    }
  });
  const html = await response.text();
  if (!response.ok) throw new Error(`IDLIX returned ${response.status}`);

  const headings = [...html.matchAll(/<h[1-4][^>]*>(.*?)<\/h[1-4]>/gis)]
    .map((match) => stripTags(match[1]))
    .filter(Boolean)
    .slice(0, 40);
  const titles = [...html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gis)]
    .map((match) => ({ href: match[1], title: stripTags(match[2]) }))
    .filter((item) => item.title.length > 2 && !item.title.match(/^(home|genre|country|year|login)$/i))
    .slice(0, 80);

  await writeJson({
    source: IDLIX_URL,
    fetchedAt: new Date().toISOString(),
    status: "ok",
    sections: headings.length ? headings : fallback.sections,
    featureIdeas: fallback.featureIdeas,
    titles
  });
  console.log(`Wrote IDLIX insights to ${OUT.pathname}`);
} catch (error) {
  await writeJson({ ...fallback, error: error instanceof Error ? error.message : String(error) });
  console.log(`IDLIX fetch blocked; wrote fallback insights to ${OUT.pathname}`);
}

async function writeJson(value) {
  await mkdir(new URL("../lib/generated/", import.meta.url), { recursive: true });
  await writeFile(OUT, `${JSON.stringify(value, null, 2)}\n`);
}

function stripTags(value) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8217;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

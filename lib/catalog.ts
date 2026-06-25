import { cache } from "react";
import {
  titles as fallbackTitles,
  type ContentType,
  type Episode,
  type EpisodeVideoSource,
  type Season,
  type SourceType,
  type Title,
  type VideoSource
} from "@/lib/data";
import { cssImage, posterImage } from "@/lib/images";
import { buildNxshaEmbedUrl, NXSHA_EMBED_LABEL } from "@/lib/nxsha";
import { createClient } from "@/lib/supabase/server";

type SupabaseVideoSource = {
  id: string;
  label: string;
  type: SourceType;
  url: string;
  quality: "720p" | "1080p" | "4K" | string;
  is_active?: boolean;
};

type SupabaseTitle = {
  id: string;
  slug: string;
  title: string;
  type: ContentType;
  tmdb_id?: number | null;
  imdb_id?: string | null;
  imdb_rank?: number | null;
  imdb_rating?: number | null;
  imdb_votes?: number | null;
  year: number;
  country: string;
  network: string;
  duration: string;
  rating: string;
  synopsis: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  genre_names?: string[] | null;
  is_featured?: boolean | null;
  is_trending?: boolean | null;
  is_recently_added?: boolean | null;
  video_sources?: SupabaseVideoSource[] | null;
  seasons?: SupabaseSeason[] | null;
};

type SupabaseEpisodeSource = SupabaseVideoSource & {
  episode_id?: string;
};

type SupabaseEpisode = {
  id: string;
  title_id: string;
  season_id: string;
  season_number: number;
  episode_number: number;
  title: string;
  synopsis?: string | null;
  duration?: string | null;
  still_path?: string | null;
  air_date?: string | null;
  is_published?: boolean | null;
  episode_video_sources?: SupabaseEpisodeSource[] | null;
};

type SupabaseSeason = {
  id: string;
  title_id: string;
  season_number: number;
  name?: string | null;
  synopsis?: string | null;
  poster_path?: string | null;
  is_published?: boolean | null;
  episodes?: SupabaseEpisode[] | null;
};

export const getCatalogTitles = cache(async () => {
  const fromSupabase = await fetchSupabaseTitles();
  if (fromSupabase.length === 0) return fallbackTitles;

  const enrichedSupabaseTitles = fromSupabase.map(enrichSupabaseTitle).filter(hasTmdbMedia);
  const supabaseSlugs = new Set(enrichedSupabaseTitles.map((title) => title.slug));
  const localOnlyTitles = fallbackTitles.filter((title) => !supabaseSlugs.has(title.slug));
  return [...enrichedSupabaseTitles, ...localOnlyTitles];
});

export async function getCatalogTitleBySlug(slug: string) {
  const titles = await getCatalogTitles();
  return titles.find((title) => title.slug === slug);
}

export function getFirstEpisode(title: Title) {
  return title.seasons?.find((season) => season.episodes.length > 0)?.episodes[0];
}

export async function getCatalogEpisode(slug: string, seasonNumber: number, episodeNumber: number) {
  const title = await getCatalogTitleBySlug(slug);
  if (!title) return null;
  const episode = title.seasons
    ?.find((season) => season.seasonNumber === seasonNumber)
    ?.episodes.find((item) => item.episodeNumber === episodeNumber);

  return episode ? { title, episode } : null;
}

export async function getRelatedTitles(title: Title) {
  const titles = await getCatalogTitles();
  return titles
    .filter((item) => item.id !== title.id && item.genres.some((genre) => title.genres.includes(genre)))
    .slice(0, 5);
}

export async function getCatalogFilters() {
  const titles = await getCatalogTitles();
  return {
    genres: Array.from(new Set(titles.flatMap((title) => title.genres))).sort(),
    countries: Array.from(new Set(titles.map((title) => title.country))).sort(),
    networks: Array.from(new Set(titles.map((title) => title.network))).sort(),
    years: Array.from(new Set(titles.map((title) => title.year))).sort((a, b) => b - a)
  };
}

export async function getFilteredCatalogTitles(params: {
  type?: ContentType;
  genre?: string;
  country?: string;
  year?: string;
  network?: string;
  q?: string;
}) {
  const titles = await getCatalogTitles();

  return titles.filter((title) => {
    if (params.type && title.type !== params.type) return false;
    if (params.genre && !title.genres.includes(params.genre)) return false;
    if (params.country && title.country !== params.country) return false;
    if (params.year && String(title.year) !== params.year) return false;
    if (params.network && title.network !== params.network) return false;
    if (params.q) {
      const term = params.q.toLowerCase();
      return [title.title, title.country, title.network, title.synopsis, ...title.genres]
        .join(" ")
        .toLowerCase()
        .includes(term);
    }
    return true;
  });
}

async function fetchSupabaseTitles(): Promise<Title[]> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  ) {
    return [];
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("titles")
      .select("*, video_sources(*), seasons(*, episodes(*, episode_video_sources(*)))")
      .eq("is_published", true)
      .order("is_featured", { ascending: false })
      .order("is_trending", { ascending: false })
      .order("year", { ascending: false });

    if (error || !data) return [];
    return (data as SupabaseTitle[]).map(mapSupabaseTitle);
  } catch {
    return [];
  }
}

function mapSupabaseTitle(title: SupabaseTitle): Title {
  const sources = (title.video_sources ?? [])
    .filter((source) => source.is_active !== false)
    .map<VideoSource>((source) => ({
      id: source.id,
      label: source.label,
      type: source.type,
      url: source.url,
      quality: normalizeQuality(source.quality)
    }));

  return {
    id: title.id,
    slug: title.slug,
    title: title.title,
    type: title.type,
    tmdbId: title.tmdb_id ?? undefined,
    imdbId: title.imdb_id ?? undefined,
    imdbRank: title.imdb_rank ?? undefined,
    imdbRating: title.imdb_rating ?? undefined,
    imdbVotes: title.imdb_votes ?? undefined,
    year: title.year,
    country: title.country,
    network: title.network,
    duration: title.duration,
    rating: title.rating,
    synopsis: title.synopsis,
    poster: posterImage(title.poster_path, "w342"),
    backdrop: toCssImage(title.backdrop_path),
    genres: title.genre_names?.length ? title.genre_names : ["Drama"],
    featured: Boolean(title.is_featured),
    trending: Boolean(title.is_trending),
    recentlyAdded: Boolean(title.is_recently_added),
    sources: sources.length > 0 ? sources : [],
    seasons: mapSupabaseSeasons(title)
  };
}

function enrichSupabaseTitle(title: Title): Title {
  const fallback = findFallbackTitle(title);
  if (!fallback) {
    return {
      ...title,
      sources: title.tmdbId || title.imdbId ? nxshaVideoSource(title) : title.sources
    };
  }

  const tmdbTitle = {
    ...fallback,
    featured: title.featured || fallback.featured,
    trending: title.trending || fallback.trending,
    recentlyAdded: title.recentlyAdded || fallback.recentlyAdded,
    progress: title.progress ?? fallback.progress,
    sources: nxshaVideoSource(fallback),
    seasons: fallback.seasons
  };

  return {
    ...tmdbTitle,
    id: title.id,
    slug: fallback.slug,
    title: fallback.title
  };
}

function nxshaVideoSource(title: Title): VideoSource[] {
  const url = buildNxshaEmbedUrl({ tmdbId: title.tmdbId, imdbId: title.imdbId, type: title.type });
  if (!url) return title.sources;

  return [
    {
      id: `source-${title.slug}`,
      label: NXSHA_EMBED_LABEL,
      type: "official_embed",
      url,
      quality: "1080p"
    }
  ];
}

function findFallbackTitle(title: Title) {
  const normalizedTitle = normalizeTitle(title.title);
  return fallbackTitles.find((item) => item.slug === title.slug || normalizeTitle(item.title) === normalizedTitle);
}

function normalizeTitle(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function hasTmdbMedia(title: Title) {
  return Boolean(title.tmdbId && title.poster && title.backdrop && title.sources.length > 0);
}

function mapSupabaseSeasons(title: SupabaseTitle): Season[] | undefined {
  const seasons = (title.seasons ?? [])
    .filter((season) => season.is_published !== false)
    .sort((a, b) => a.season_number - b.season_number)
    .map<Season>((season) => ({
      id: season.id,
      titleId: title.id,
      seasonNumber: season.season_number,
      name: season.name || `Season ${season.season_number}`,
      synopsis: season.synopsis || `${title.title} season ${season.season_number}.`,
      poster: posterImage(season.poster_path ?? title.poster_path, "w342"),
      episodes: (season.episodes ?? [])
        .filter((episode) => episode.is_published !== false)
        .sort((a, b) => a.episode_number - b.episode_number)
        .map<Episode>((episode) => ({
          id: episode.id,
          titleId: title.id,
          seasonId: season.id,
          seasonNumber: season.season_number,
          episodeNumber: episode.episode_number,
          title: episode.title,
          synopsis: episode.synopsis || title.synopsis,
          duration: episode.duration || "TBA",
          still: toCssImage(episode.still_path ?? title.backdrop_path),
          airDate: episode.air_date ?? undefined,
          sources: mapEpisodeSources(episode, title.tmdb_id, title.imdb_id, season.season_number, episode.episode_number)
        }))
    }))
    .filter((season) => season.episodes.length > 0);

  return seasons.length > 0 ? seasons : undefined;
}

function mapEpisodeSources(
  episode: SupabaseEpisode,
  tmdbId: number | null | undefined,
  imdbId: string | null | undefined,
  seasonNumber: number,
  episodeNumber: number
): EpisodeVideoSource[] {
  const nxshaUrl = buildNxshaEmbedUrl({
    tmdbId,
    imdbId,
    type: "series",
    seasonNumber,
    episodeNumber
  });
  if (nxshaUrl) {
    return [
      {
        id: `episode-source-${episode.id}`,
        episodeId: episode.id,
        label: NXSHA_EMBED_LABEL,
        type: "official_embed",
        url: nxshaUrl,
        quality: "1080p"
      }
    ];
  }

  const sources = (episode.episode_video_sources ?? [])
    .filter((source) => source.is_active !== false)
    .map<EpisodeVideoSource>((source) => ({
      id: source.id,
      episodeId: episode.id,
      label: source.label,
      type: source.type,
      url: source.url,
      quality: normalizeQuality(source.quality)
    }));

  return sources;
}

function toCssImage(path?: string | null) {
  return cssImage(path);
}

function normalizeQuality(quality: string): "720p" | "1080p" | "4K" {
  if (quality === "720p" || quality === "1080p" || quality === "4K") return quality;
  return "1080p";
}

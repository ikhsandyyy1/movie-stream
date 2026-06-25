export type ContentType = "movie" | "series";
import { buildNxshaEmbedUrl, NXSHA_EMBED_LABEL } from "@/lib/nxsha";
import { cssImage, posterImage } from "@/lib/images";

export type SourceType = "owned" | "official_embed" | "licensed_provider";

export type VideoSource = {
  id: string;
  label: string;
  type: SourceType;
  url: string;
  quality: "720p" | "1080p" | "4K";
};

export type EpisodeVideoSource = VideoSource & {
  episodeId?: string;
};

export type Episode = {
  id: string;
  titleId: string;
  seasonId: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  synopsis: string;
  duration: string;
  still: string;
  airDate?: string;
  sources: EpisodeVideoSource[];
};

export type Season = {
  id: string;
  titleId: string;
  seasonNumber: number;
  name: string;
  synopsis: string;
  poster: string;
  episodes: Episode[];
};

export type EpisodeSeed = {
  episodeNumber: number;
  title: string;
  synopsis?: string;
  duration?: string;
  stillUrl?: string;
  airDate?: string;
};

export type SeasonSeed = {
  seasonNumber: number;
  name: string;
  synopsis?: string;
  posterFile?: string;
  episodes: EpisodeSeed[];
};

export type Title = {
  id: string;
  slug: string;
  title: string;
  type: ContentType;
  tmdbId?: number;
  imdbId?: string;
  imdbRank?: number;
  imdbRating?: number;
  imdbVotes?: number;
  year: number;
  country: string;
  network: string;
  duration: string;
  rating: string;
  genres: string[];
  synopsis: string;
  poster: string;
  backdrop: string;
  progress?: number;
  sources: VideoSource[];
  seasons?: Season[];
  featured?: boolean;
  trending?: boolean;
  recentlyAdded?: boolean;
  idlixLatestRank?: number;
};

function posterAsset(fileName: string) {
  return posterImage(fileName, "w500");
}

function source(id: string, tmdbId: number | undefined, imdbId: string | undefined, type: ContentType): VideoSource[] {
  const url = buildNxshaEmbedUrl({ tmdbId, imdbId, type });
  if (!url) return [];
  return [
    {
      id: `source-${id}`,
      label: NXSHA_EMBED_LABEL,
      type: "official_embed",
      url,
      quality: "1080p"
    }
  ];
}

function episodeSource(
  id: string,
  tmdbId: number | undefined,
  imdbId: string | undefined,
  seasonNumber: number,
  episodeNumber: number
): EpisodeVideoSource[] {
  const url = buildNxshaEmbedUrl({ tmdbId, imdbId, type: "series", seasonNumber, episodeNumber });
  if (!url) return [];
  return [
    {
      id: `episode-source-${id}`,
      label: NXSHA_EMBED_LABEL,
      type: "official_embed",
      url,
      quality: "1080p"
    }
  ];
}

export type TitleSeed = Omit<Title, "id" | "poster" | "backdrop" | "sources" | "seasons"> & {
  posterFile: string;
  backdropUrl?: string;
  sources?: VideoSource[];
  seasonEpisodeCounts?: number[];
  seasonDetails?: SeasonSeed[];
};

function makeTitle(index: number, item: TitleSeed): Title {
  const id = String(index + 1);
  const poster = posterAsset(item.posterFile);
  const backdrop = cssImage(item.backdropUrl);
  const title: Title = {
    ...item,
    id,
    poster,
    backdrop,
    sources: item.sources ?? source(item.slug, item.tmdbId, item.imdbId, item.type)
  };

  if (item.type === "series") {
    title.seasons = item.seasonDetails?.length
      ? makeSeasonsFromDetails(title, item.seasonDetails)
      : makeSeasons(title, item.seasonEpisodeCounts ?? inferSeasonEpisodeCounts(item.duration));
  }

  return title;
}

function makeSeasonsFromDetails(
  title: Pick<Title, "id" | "slug" | "title" | "synopsis" | "poster" | "backdrop" | "tmdbId" | "imdbId">,
  seasons: SeasonSeed[]
): Season[] {
  return seasons
    .filter((season) => season.episodes.length > 0)
    .map((season) => {
      const seasonId = `${title.id}-s${season.seasonNumber}`;
      const poster = posterAsset(season.posterFile ?? "") || title.poster;
      return {
        id: seasonId,
        titleId: title.id,
        seasonNumber: season.seasonNumber,
        name: season.name || `Season ${season.seasonNumber}`,
        synopsis: season.synopsis || `${title.title} season ${season.seasonNumber}.`,
        poster,
        episodes: season.episodes.map((episode) => {
          const episodeId = `${title.id}-s${season.seasonNumber}e${episode.episodeNumber}`;
          const still = episode.stillUrl ? `url('${episode.stillUrl}')` : title.backdrop;
          return {
            id: episodeId,
            titleId: title.id,
            seasonId,
            seasonNumber: season.seasonNumber,
            episodeNumber: episode.episodeNumber,
            title: episode.title || `Episode ${episode.episodeNumber}`,
            synopsis: episode.synopsis || title.synopsis,
            duration: episode.duration || "TBA",
            still,
            airDate: episode.airDate,
            sources: episodeSource(episodeId, title.tmdbId, title.imdbId, season.seasonNumber, episode.episodeNumber)
          };
        })
      };
    });
}

function inferSeasonEpisodeCounts(duration: string) {
  const match = duration.match(/(\d+)/);
  const seasonCount = match ? Math.max(1, Number(match[1])) : 1;
  return Array.from({ length: seasonCount }, () => 8);
}

function makeSeasons(
  title: Pick<Title, "id" | "slug" | "title" | "synopsis" | "poster" | "backdrop" | "tmdbId" | "imdbId">,
  episodeCounts: number[]
): Season[] {
  return episodeCounts.map((episodeCount, seasonIndex) => {
    const seasonNumber = seasonIndex + 1;
    const seasonId = `${title.id}-s${seasonNumber}`;
    return {
      id: seasonId,
      titleId: title.id,
      seasonNumber,
      name: `Season ${seasonNumber}`,
      synopsis: `${title.title} season ${seasonNumber}.`,
      poster: title.poster,
      episodes: Array.from({ length: episodeCount }, (_, episodeIndex) => {
        const episodeNumber = episodeIndex + 1;
        const episodeId = `${title.id}-s${seasonNumber}e${episodeNumber}`;
        return {
          id: episodeId,
          titleId: title.id,
          seasonId,
          seasonNumber,
          episodeNumber,
          title: episodeNumber === 1 && title.slug === "rick-and-morty-2013" && seasonNumber === 1 ? "Pilot" : `Episode ${episodeNumber}`,
          synopsis: `${title.synopsis} Episode ${episodeNumber} dari season ${seasonNumber}.`,
          duration: "24m",
          still: title.backdrop,
          sources: episodeSource(episodeId, title.tmdbId, title.imdbId, seasonNumber, episodeNumber)
        };
      })
    };
  });
}

import { imdbTopTitleSeeds } from "@/lib/generated/imdb-top-titles";
import { idlixLatestTitleSeeds } from "@/lib/generated/idlix-latest";

const titleSeeds = dedupeTitleSeeds([...idlixLatestTitleSeeds, ...imdbTopTitleSeeds]);

export const titles: Title[] = titleSeeds
  .filter((item) => Boolean(item.tmdbId && item.posterFile && item.backdropUrl))
  .map((item, index) => makeTitle(index, item));

export const genres = Array.from(new Set(titles.flatMap((title) => title.genres))).sort();
export const countries = Array.from(new Set(titles.map((title) => title.country))).sort();
export const networks = Array.from(new Set(titles.map((title) => title.network))).sort();
export const years = Array.from(new Set(titles.map((title) => title.year))).sort((a, b) => b - a);

export function getTitleBySlug(slug: string) {
  return titles.find((title) => title.slug === slug);
}

export function getRelated(title: Title) {
  return titles
    .filter((item) => item.id !== title.id && item.genres.some((genre) => title.genres.includes(genre)))
    .slice(0, 5);
}

function dedupeTitleSeeds(items: readonly TitleSeed[]) {
  const seen = new Set<string>();
  const output: TitleSeed[] = [];

  for (const item of items) {
    const key = item.tmdbId ? `${item.type}:${item.tmdbId}` : item.slug;
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(item);
  }

  return output;
}

export function getFilteredTitles(params: {
  type?: ContentType;
  genre?: string;
  country?: string;
  year?: string;
  network?: string;
  q?: string;
}) {
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

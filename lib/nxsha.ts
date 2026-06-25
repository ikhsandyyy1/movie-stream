import type { ContentType } from "@/lib/data";

const NXSHA_ORIGIN = "https://web.nxsha.app";
const DEFAULT_SUBTITLE_LANGUAGE = "id";
const DEFAULT_AUDIO_LANGUAGE = "id";

type NxshaParams = {
  tmdbId?: number | null;
  imdbId?: string | null;
  type: ContentType;
  seasonNumber?: number;
  episodeNumber?: number;
};

export const NXSHA_EMBED_LABEL = "NxSha TMDb/IMDb embed";

export function buildNxshaEmbedUrl({ tmdbId, imdbId, type, seasonNumber = 1, episodeNumber = 1 }: NxshaParams) {
  const mediaId = tmdbId ? String(tmdbId) : imdbId?.trim();
  if (!mediaId) return null;

  const path = type === "series" ? `/embed/tv/${mediaId}/${seasonNumber}/${episodeNumber}` : `/embed/movie/${mediaId}`;
  const url = new URL(path, NXSHA_ORIGIN);
  url.searchParams.set("sub", DEFAULT_SUBTITLE_LANGUAGE);
  url.searchParams.set("lang", DEFAULT_AUDIO_LANGUAGE);
  return url.toString();
}

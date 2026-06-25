const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export type TmdbImageSize = "w185" | "w342" | "w500" | "w780" | "w1280" | "original";

export function tmdbImage(path: string, size: TmdbImageSize = "w342") {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${TMDB_IMAGE_BASE}/${size}/${path.startsWith("/") ? path.slice(1) : path}`;
}

export function cssImage(path?: string | null, size: TmdbImageSize = "w1280") {
  if (!path) return "linear-gradient(135deg, #1f2937, #05070b)";
  if (path.startsWith("url(") || path.startsWith("linear-gradient(")) return path;
  return `url('${tmdbImage(path, size)}')`;
}

export function posterImage(path?: string | null, size: TmdbImageSize = "w342") {
  if (!path) return "";
  if (path.startsWith("linear-gradient(")) return "";
  const raw = path.startsWith("url('") || path.startsWith('url("') ? path.slice(5, -2) : path.startsWith("url(") ? path.slice(4, -1) : path;
  return tmdbImage(raw, size);
}

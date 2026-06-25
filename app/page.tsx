import { FeaturedCarousel } from "@/components/featured-carousel";
import { TitleRail } from "@/components/title-rail";
import { getCatalogTitles } from "@/lib/catalog";
import type { Title } from "@/lib/data";

export default async function HomePage() {
  const titles = await getCatalogTitles();
  const featured = titles
    .filter((title) => title.featured && title.tmdbId && title.imdbId)
    .sort((a, b) => (a.imdbRank ?? 999) - (b.imdbRank ?? 999))
    .slice(0, 5);
  const movies = titles.filter((title) => title.type === "movie");
  const series = titles.filter((title) => title.type === "series");
  const nowPlaying = takeUnique(
    [
      ...movies.filter((title) => title.idlixLatestRank).sort(byIdlixRank),
      ...movies.filter((title) => title.recentlyAdded).sort(byYearDesc),
      ...movies.sort(byYearDesc)
    ],
    20
  );
  const trendingMovies = takeUnique(
    [
      ...movies.filter((title) => title.trending).sort(byIdlixRankThenImdbRank),
      ...movies.filter((title) => title.idlixLatestRank).sort(byIdlixRank),
      ...movies.sort(byImdbRank)
    ],
    20
  );
  const topRated = takeUnique([...movies.filter((title) => title.imdbRank).sort(byImdbRank), ...movies.sort(byRatingDesc)], 20);
  const trendingTvShow = takeUnique(
    [
      ...series.filter((title) => title.trending).sort(byIdlixRankThenImdbRank),
      ...series.filter((title) => title.idlixLatestRank).sort(byIdlixRank),
      ...series.sort(byImdbRank)
    ],
    20
  );

  return (
    <>
      <FeaturedCarousel items={featured.length ? featured : titles.slice(0, 5)} />

      <div className="page">
        <TitleRail title="Now Playing" href="/movies" items={nowPlaying} />
        <TitleRail title="Trending Movies" href="/movies" items={trendingMovies} />
        <TitleRail title="Top Rated" href="/ranking" items={topRated} />
        <TitleRail title="Trending TV Show" href="/series" items={trendingTvShow} />
      </div>
    </>
  );
}

function takeUnique(items: Title[], limit: number) {
  const seen = new Set<string>();
  const output: Title[] = [];

  for (const item of items) {
    const key = item.tmdbId ? `${item.type}:${item.tmdbId}` : item.slug;
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(item);
    if (output.length >= limit) break;
  }

  return output;
}

function byIdlixRank(a: Title, b: Title) {
  return (a.idlixLatestRank ?? 999) - (b.idlixLatestRank ?? 999);
}

function byImdbRank(a: Title, b: Title) {
  return (a.imdbRank ?? 999) - (b.imdbRank ?? 999);
}

function byIdlixRankThenImdbRank(a: Title, b: Title) {
  return byIdlixRank(a, b) || byImdbRank(a, b);
}

function byYearDesc(a: Title, b: Title) {
  return b.year - a.year || a.title.localeCompare(b.title);
}

function byRatingDesc(a: Title, b: Title) {
  return (b.imdbRating ?? 0) - (a.imdbRating ?? 0) || byImdbRank(a, b);
}

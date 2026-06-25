import { MovieCard } from "@/components/movie-card";
import { ContainerStagger, ContainerAnimated } from "@/components/ui/container-scroll";
import { getCatalogTitles } from "@/lib/catalog";
import type { ContentType, Title } from "@/lib/data";

export default async function RankingPage() {
  const titles = await getCatalogTitles();
  const topMovies = rankedByImdb(titles, "movie");
  const topSeries = rankedByImdb(titles, "series");

  return (
    <div className="page">
      <ContainerStagger>
        <ContainerAnimated animation="fade">
          <div className="eyebrow">Papan Peringkat IMDb</div>
          <h1 className="page-title">Top Rated Movies & Series</h1>
          <p className="lead">Peringkat memakai rating dan vote IMDb, dengan poster dan detail dari TMDB.</p>
        </ContainerAnimated>
        <RankingSection title="Top 50 Movies" items={topMovies} />
        <RankingSection title="Top 50 Series" items={topSeries} />
      </ContainerStagger>
    </div>
  );
}

function RankingSection({ title, items }: { title: string; items: Title[] }) {
  return (
    <ContainerStagger className="section">
      <ContainerAnimated animation="left">
        <div className="section-head">
          <div>
            <div className="eyebrow">IMDb</div>
            <h2>{title}</h2>
          </div>
          <span className="card-meta">{items.length} judul</span>
        </div>
      </ContainerAnimated>
      <div className="grid">
        {items.map((item) => (
          <ContainerAnimated key={item.id} animation="bottom">
            <MovieCard title={item} />
          </ContainerAnimated>
        ))}
      </div>
    </ContainerStagger>
  );
}

function rankedByImdb(titles: Title[], type: ContentType) {
  return titles
    .filter((title) => title.type === type)
    .sort((a, b) => {
      if (a.imdbRank && b.imdbRank) return a.imdbRank - b.imdbRank;
      if (a.imdbRank) return -1;
      if (b.imdbRank) return 1;
      return (b.imdbRating ?? 0) - (a.imdbRating ?? 0) || (b.imdbVotes ?? 0) - (a.imdbVotes ?? 0) || b.year - a.year;
    })
    .slice(0, 50);
}

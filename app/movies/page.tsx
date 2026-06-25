import { MovieCard } from "@/components/movie-card";
import { getCatalogTitles } from "@/lib/catalog";

export default async function MoviesPage() {
  const titles = await getCatalogTitles();
  const movies = titles.filter((title) => title.type === "movie");

  return (
    <div className="page">
      <div className="eyebrow">Katalog</div>
      <h1 className="page-title">Film</h1>
      <p className="lead">Koleksi film yang sudah dipublish untuk penonton.</p>
      <div className="grid">
        {movies.map((title) => (
          <MovieCard key={title.id} title={title} />
        ))}
      </div>
    </div>
  );
}

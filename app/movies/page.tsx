import { FeaturedCarousel } from "@/components/featured-carousel";
import { MovieCard3D } from "@/components/movie-card-3d";
import { getCatalogTitles } from "@/lib/catalog";

export const revalidate = 3600;

export default async function MoviesPage() {
  const titles = await getCatalogTitles();
  const movies = titles.filter((title) => title.type === "movie");
  const featured = movies.filter((t) => t.featured).slice(0, 5);

  return (
    <>
      <FeaturedCarousel items={featured.length ? featured : movies.slice(0, 5)} />
      <div className="page">
        <div className="eyebrow">Katalog</div>
        <h1 className="page-title">Film</h1>
        <p className="lead">Koleksi film yang sudah dipublish untuk penonton.</p>
        <div className="grid">
          {movies.map((title) => (
            <MovieCard3D key={title.id} title={title} />
          ))}
        </div>
      </div>
    </>
  );
}

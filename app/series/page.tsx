import { FeaturedCarousel } from "@/components/featured-carousel";
import { MovieCard3D } from "@/components/movie-card-3d";
import { getCatalogTitles } from "@/lib/catalog";

export const revalidate = 3600;

export default async function SeriesPage() {
  const titles = await getCatalogTitles();
  const series = titles.filter((title) => title.type === "series");
  const featured = series.filter((t) => t.featured).slice(0, 5);

  return (
    <>
      <FeaturedCarousel items={featured.length ? featured : series.slice(0, 5)} />
      <div className="page">
        <div className="eyebrow">Katalog</div>
        <h1 className="page-title">Serial TV</h1>
        <p className="lead">Serial dan episode terbaru dari konten milik sendiri maupun provider resmi.</p>
        <div className="grid">
          {series.map((title) => (
            <MovieCard3D key={title.id} title={title} />
          ))}
        </div>
      </div>
    </>
  );
}

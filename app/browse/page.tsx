import { getCatalogTitles } from "@/lib/catalog";
import { GalleryBento } from "@/components/gallery-bento";

export default async function BrowsePage() {
  const titles = await getCatalogTitles();
  const movies = titles.filter((t) => t.type === "movie");

  return (
    <div className="page">
      <div className="eyebrow">Eksplorasi</div>
      <h1 className="page-title">Browse 3D Gallery</h1>
      <p className="lead">Jelajahi koleksi dalam tampilan bento grid interaktif.</p>
      <GalleryBento titles={movies} />
    </div>
  );
}

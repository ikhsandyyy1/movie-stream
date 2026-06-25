import Link from "next/link";
import type { Title } from "@/lib/data";
import { MovieCard } from "@/components/movie-card";

export function TitleRail({
  title,
  href,
  items
}: {
  title: string;
  href?: string;
  items: Title[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="section" aria-labelledby={title.toLowerCase().replaceAll(" ", "-")}>
      <div className="section-head">
        <h2 id={title.toLowerCase().replaceAll(" ", "-")}>{title}</h2>
        {href ? (
          <Link className="nav-link" href={href}>
            Lihat semua
          </Link>
        ) : null}
      </div>
      <div className="rail">
        {items.map((item) => (
          <MovieCard key={item.id} title={item} />
        ))}
      </div>
    </section>
  );
}

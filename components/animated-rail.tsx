import Link from "next/link";
import { ContainerStagger, ContainerAnimated } from "@/components/ui/container-scroll";
import type { Title } from "@/lib/data";
import { MovieCard3D } from "@/components/movie-card-3d";

export function AnimatedRail({
  title,
  href,
  items,
}: {
  title: string;
  href?: string;
  items: Title[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="section">
      <ContainerStagger>
        <ContainerAnimated animation="left">
          <div className="section-head">
            <h2>{title}</h2>
            {href ? (
              <Link className="nav-link" href={href}>
                Lihat semua
              </Link>
            ) : null}
          </div>
        </ContainerAnimated>
        <div className="rail">
          {items.map((item) => (
            <ContainerAnimated key={item.id} animation="bottom">
              <MovieCard3D title={item} />
            </ContainerAnimated>
          ))}
        </div>
      </ContainerStagger>
    </section>
  );
}

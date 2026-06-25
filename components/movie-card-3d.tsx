import Link from "next/link";
import { PosterImage } from "@/components/poster-image";
import { InteractiveCard } from "@/components/ui/interactive-card";
import type { Title } from "@/lib/data";

export function MovieCard3D({ title }: { title: Title }) {
  return (
    <InteractiveCard tiltDegree={8} className="group movie-card">
      <Link href={`/watch/${title.slug}`} aria-label={`Buka ${title.title}`}>
        <PosterImage
          src={title.poster}
          alt={title.title}
          badge={title.type === "movie" ? "Film" : "Series"}
        />
        <div className="card-title">{title.title}</div>
        <div className="card-meta">
          {title.imdbRank ? `#${title.imdbRank} · ` : ""}
          {title.imdbRating ? `IMDb ${title.imdbRating.toFixed(1)} · ` : ""}
          {title.year} · {title.genres[0]}
        </div>
        {title.progress ? (
          <div
            aria-label={`Progress tontonan ${title.progress}%`}
            style={{ marginTop: 8 }}
          >
            <div
              style={{
                height: 4,
                background: "rgba(255,255,255,.12)",
                borderRadius: 999,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${title.progress}%`,
                  height: "100%",
                  background: "var(--primary)",
                }}
              />
            </div>
          </div>
        ) : null}
      </Link>
    </InteractiveCard>
  );
}

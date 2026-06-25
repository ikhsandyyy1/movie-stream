import Link from "next/link";
import { Play } from "lucide-react";
import { PosterImage } from "@/components/poster-image";
import type { Title } from "@/lib/data";

export function MovieCard({ title }: { title: Title }) {
  return (
    <Link className="movie-card" href={`/watch/${title.slug}`} aria-label={`Buka ${title.title}`}>
      <PosterImage src={title.poster} alt={title.title} badge={title.type === "movie" ? "Film" : "Series"} />
      <div className="card-title">{title.title}</div>
      <div className="card-meta">
        {title.imdbRank ? `#${title.imdbRank} · ` : ""}
        {title.imdbRating ? `IMDb ${title.imdbRating.toFixed(1)} · ` : ""}
        {title.year} · {title.genres[0]}
      </div>
      {title.progress ? (
        <div aria-label={`Progress tontonan ${title.progress}%`} style={{ marginTop: 8 }}>
          <div
            style={{
              height: 4,
              background: "rgba(255,255,255,.12)",
              borderRadius: 999,
              overflow: "hidden"
            }}
          >
            <div style={{ width: `${title.progress}%`, height: "100%", background: "var(--primary)" }} />
          </div>
        </div>
      ) : null}
    </Link>
  );
}

export function MiniTitleRow({ title }: { title: Title }) {
  return (
    <Link className="panel" href={`/watch/${title.slug}`} style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <div style={{ width: 58, flex: "0 0 58px" }}>
        <PosterImage src={title.poster} alt={title.title} sizes="58px" />
      </div>
      <span style={{ minWidth: 0 }}>
        <strong style={{ display: "block" }}>{title.title}</strong>
        <span className="card-meta">
          {title.type === "movie" ? "Film" : "Series"} · {title.year}
        </span>
      </span>
      <Play size={18} style={{ marginLeft: "auto", color: "var(--primary-strong)" }} aria-hidden="true" />
    </Link>
  );
}

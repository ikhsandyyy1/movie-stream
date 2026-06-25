import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Play } from "lucide-react";
import type { Metadata } from "next";
import { getCatalogTitleBySlug, getFirstEpisode } from "@/lib/catalog";
import { buildNxshaEmbedUrl, NXSHA_EMBED_LABEL } from "@/lib/nxsha";
import { recordAuditEvent } from "@/lib/studio";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const title = await getCatalogTitleBySlug(slug);

  if (!title) {
    return { title: "Not Found - IMOV" };
  }

  return {
    title: `Playing ${title.title} - IMOV`,
    description: title.synopsis.slice(0, 160),
    robots: { index: false, follow: true },
  };
}

export default async function PlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = await getCatalogTitleBySlug(slug);
  if (!title) notFound();
  const firstEpisode = getFirstEpisode(title);

  if (title.type === "series") {
    if (!firstEpisode) notFound();
    redirect(`/watch/${title.slug}/season/${firstEpisode.seasonNumber}/episode/${firstEpisode.episodeNumber}`);
  }

  await recordAuditEvent({
    eventType: "title_played",
    titleId: title.id,
    titleSlug: title.slug,
    metadata: { source: "player" }
  });
  const source = title.sources[0];
  const nxshaUrl = buildNxshaEmbedUrl({ tmdbId: title.tmdbId, imdbId: title.imdbId, type: title.type });
  const embedUrl = nxshaUrl ?? (source.type === "official_embed" ? source.url : null);
  const sourceLabel = nxshaUrl ? NXSHA_EMBED_LABEL : source.label;
  const sourceQuality = nxshaUrl ? "Auto" : source.quality;

  return (
    <div className="page">
      <div className="player-shell">
        <Link className="nav-link" href={`/watch/${title.slug}`} style={{ width: "fit-content" }}>
          <ArrowLeft size={18} />
          Kembali ke detail
        </Link>

        {embedUrl ? (
          <iframe
            className="video-frame"
            src={embedUrl}
            title={`Player ${title.title}`}
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write"
            allowFullScreen
          />
        ) : (
          <div className="video-frame" style={{ "--hero-image": title.backdrop } as React.CSSProperties}>
            <div className="video-placeholder">
              <Play size={54} style={{ color: "var(--primary-strong)", margin: "0 auto 14px" }} aria-hidden="true" />
              <h1 style={{ margin: "0 0 8px" }}>{title.title}</h1>
              <p className="lead" style={{ margin: "0 auto 18px" }}>
                Placeholder player untuk sumber {source.type.replaceAll("_", " ")}. Sambungkan URL signed Supabase Storage atau provider resmi di tahap backend.
              </p>
              <button className="button" type="button">
                <Play size={18} />
                Simulasi Play
              </button>
            </div>
          </div>
        )}

        <section className="panel">
          <div className="section-head" style={{ marginBottom: 0 }}>
            <div>
              <div className="eyebrow">{sourceQuality}</div>
              <h1 style={{ margin: "4px 0" }}>{title.title}</h1>
              <p className="lead" style={{ margin: 0 }}>
                Film · {sourceLabel}
              </p>
            </div>
            <Link className="button secondary" href="/search">
              Cari lainnya
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

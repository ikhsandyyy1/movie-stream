import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { getCatalogEpisode } from "@/lib/catalog";
import { buildNxshaEmbedUrl } from "@/lib/nxsha";
import { recordAuditEvent } from "@/lib/studio";

export default async function EpisodePlayerPage({
  params
}: {
  params: Promise<{ slug: string; seasonNumber: string; episodeNumber: string }>;
}) {
  const { slug, seasonNumber, episodeNumber } = await params;
  const season = Number(seasonNumber);
  const episodeNo = Number(episodeNumber);
  const result = await getCatalogEpisode(slug, season, episodeNo);
  if (!result) notFound();

  const { title, episode } = result;
  const source = episode.sources[0];
  const seasonEpisodes = title.seasons?.find((item) => item.seasonNumber === episode.seasonNumber)?.episodes ?? [];
  const currentIndex = seasonEpisodes.findIndex((item) => item.episodeNumber === episode.episodeNumber);
  const previous = currentIndex > 0 ? seasonEpisodes[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < seasonEpisodes.length - 1 ? seasonEpisodes[currentIndex + 1] : null;
  const nxshaUrl = buildNxshaEmbedUrl({
    tmdbId: title.tmdbId,
    imdbId: title.imdbId,
    type: title.type,
    seasonNumber: episode.seasonNumber,
    episodeNumber: episode.episodeNumber
  });
  const embedUrl = nxshaUrl ?? (source.type === "official_embed" ? source.url : null);
  const sourceQuality = nxshaUrl ? "Auto" : source.quality;

  await recordAuditEvent({
    eventType: "title_played",
    titleId: title.id,
    titleSlug: title.slug,
    metadata: {
      source: "episode-player",
      season: episode.seasonNumber,
      episode: episode.episodeNumber
    }
  });

  return (
    <div className="page">
      <div className="player-shell">
        <Link className="nav-link" href={`/watch/${title.slug}#season-${episode.seasonNumber}`} style={{ width: "fit-content" }}>
          <ArrowLeft size={18} />
          Kembali ke episode
        </Link>

        {embedUrl ? (
          <iframe
            className="video-frame"
            src={embedUrl}
            title={`Player ${title.title} S${episode.seasonNumber}E${episode.episodeNumber}`}
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write"
            allowFullScreen
          />
        ) : (
          <div className="video-frame" style={{ "--hero-image": episode.still } as React.CSSProperties}>
            <div className="video-placeholder">
              <Play size={54} style={{ color: "var(--primary-strong)", margin: "0 auto 14px" }} aria-hidden="true" />
              <h1 style={{ margin: "0 0 8px" }}>
                S{episode.seasonNumber}E{episode.episodeNumber} · {episode.title}
              </h1>
              <p className="lead" style={{ margin: "0 auto 18px" }}>
                Placeholder player untuk episode ini. Isi URL owned video, official embed, atau provider berlisensi dari Studio.
              </p>
              <button className="button" type="button">
                <Play size={18} />
                Simulasi Play
              </button>
            </div>
          </div>
        )}

        <section className="panel">
          <div className="section-head episode-player-head">
            <div>
              <div className="eyebrow">{sourceQuality}</div>
              <h1 style={{ margin: "4px 0" }}>{title.title}</h1>
              <p className="lead" style={{ margin: 0 }}>
                Season {episode.seasonNumber} · Episode {episode.episodeNumber} · {episode.title}
              </p>
            </div>
            <div className="episode-nav">
              {previous ? (
                <Link className="button secondary" href={`/watch/${title.slug}/season/${previous.seasonNumber}/episode/${previous.episodeNumber}`}>
                  <ChevronLeft size={18} />
                  Sebelumnya
                </Link>
              ) : null}
              {next ? (
                <Link className="button secondary" href={`/watch/${title.slug}/season/${next.seasonNumber}/episode/${next.episodeNumber}`}>
                  Berikutnya
                  <ChevronRight size={18} />
                </Link>
              ) : null}
            </div>
          </div>
          <p className="lead">{episode.synopsis}</p>
        </section>
      </div>
    </div>
  );
}

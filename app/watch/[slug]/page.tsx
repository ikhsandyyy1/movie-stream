import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, Heart, Play } from "lucide-react";
import { MovieCard } from "@/components/movie-card";
import { PosterImage } from "@/components/poster-image";
import { getCatalogTitleBySlug, getFirstEpisode, getRelatedTitles } from "@/lib/catalog";
import { recordAuditEvent } from "@/lib/studio";

export default async function WatchDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ season?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const title = await getCatalogTitleBySlug(slug);
  if (!title) notFound();
  await recordAuditEvent({
    eventType: "title_viewed",
    titleId: title.id,
    titleSlug: title.slug,
    metadata: { source: "detail" }
  });
  const related = await getRelatedTitles(title);
  const firstEpisode = getFirstEpisode(title);
  const requestedSeason = Number(query?.season);
  const activeSeason =
    title.seasons?.find((season) => season.seasonNumber === requestedSeason) ??
    title.seasons?.find((season) => season.episodes.length > 0);
  const playHref =
    title.type === "series" && firstEpisode
      ? `/watch/${title.slug}/season/${firstEpisode.seasonNumber}/episode/${firstEpisode.episodeNumber}`
      : `/watch/${title.slug}/play`;

  return (
    <>
      <section className="hero" style={{ "--hero-image": title.backdrop } as React.CSSProperties}>
        <div className="hero-content">
          <div className="eyebrow">{title.type === "movie" ? "Film" : "Serial TV"}</div>
          <h1>{title.title}</h1>
          <p>{title.synopsis}</p>
          <div className="meta-row">
            <span className="meta-pill">{title.year}</span>
            <span className="meta-pill">{title.country}</span>
            <span className="meta-pill">{title.network}</span>
            <span className="meta-pill">{title.duration}</span>
            <span className="meta-pill">{title.rating}</span>
            {title.imdbRating ? <span className="meta-pill">IMDb {title.imdbRating.toFixed(1)}</span> : null}
          </div>
          <div className="actions-row">
            <Link className="button" href={playHref}>
              <Play size={19} />
              {title.type === "series" && firstEpisode ? `Putar S${firstEpisode.seasonNumber} E${firstEpisode.episodeNumber}` : "Putar"}
            </Link>
            <button className="button secondary" type="button">
              <Heart size={19} />
              Favorit
            </button>
          </div>
        </div>
      </section>

      <div className="page">
        <div className="detail-layout">
          <div className="detail-poster">
            <PosterImage src={title.poster} alt={title.title} priority sizes="(max-width: 920px) 230px, 280px" />
          </div>
          <div>
            <section className="panel">
              <h2>Info Konten</h2>
              <p className="lead">{title.synopsis}</p>
              <div className="meta-row">
                {title.genres.map((genre) => (
                  <Link className="meta-pill" href={`/search?genre=${encodeURIComponent(genre)}`} key={genre}>
                    {genre}
                  </Link>
                ))}
              </div>
              <h3>Sumber video resmi</h3>
              <div style={{ display: "grid", gap: 10 }}>
                {title.sources.map((source) => (
                  <div className="panel" key={source.id} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <strong>{source.label}</strong>
                    <span className="card-meta">
                      {source.type.replaceAll("_", " ")} · {source.quality}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {title.type === "series" ? (
              <section className="section" id="episodes">
                <div className="section-head episode-head">
                  <div>
                    <div className="eyebrow">Episode</div>
                    <h2>Pilih Season</h2>
                  </div>
                  <span className="card-meta">{title.seasons?.reduce((count, season) => count + season.episodes.length, 0) ?? 0} episode</span>
                </div>

                {title.seasons?.length ? (
                  <div className="season-stack">
                    <nav className="season-tabs" aria-label="Daftar season">
                      {title.seasons.map((season) => (
                        <Link
                          className={`season-tab${season.seasonNumber === activeSeason?.seasonNumber ? " active" : ""}`}
                          href={`/watch/${title.slug}?season=${season.seasonNumber}#episodes`}
                          key={season.id}
                          aria-current={season.seasonNumber === activeSeason?.seasonNumber ? "true" : undefined}
                        >
                          <span>{season.name}</span>
                          <small>{season.episodes.length} episode</small>
                        </Link>
                      ))}
                    </nav>

                    {activeSeason ? (
                      <section className="season-panel" id={`season-${activeSeason.seasonNumber}`} key={activeSeason.id}>
                        <div className="section-head">
                          <div>
                            <h3>{activeSeason.name}</h3>
                            <p className="card-meta">{activeSeason.synopsis}</p>
                          </div>
                        </div>
                        <div className="episode-grid">
                          {activeSeason.episodes.map((episode) => (
                            <Link
                              className="episode-card"
                              href={`/watch/${title.slug}/season/${episode.seasonNumber}/episode/${episode.episodeNumber}`}
                              key={episode.id}
                            >
                              <div className="episode-still" style={{ "--episode-image": episode.still } as React.CSSProperties}>
                                <span className="episode-code">
                                  S{episode.seasonNumber}E{episode.episodeNumber}
                                </span>
                                <span className="episode-play" aria-hidden="true">
                                  <Play size={18} />
                                </span>
                              </div>
                              <div className="episode-copy">
                                <strong>{episode.title}</strong>
                                <span className="card-meta">
                                  <Clock size={14} /> {episode.duration}
                                  {episode.airDate ? (
                                    <>
                                      {" "}
                                      <Calendar size={14} /> {new Date(episode.airDate).getFullYear()}
                                    </>
                                  ) : null}
                                </span>
                                <p>{episode.synopsis}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </section>
                    ) : null}
                  </div>
                ) : (
                  <div className="panel">
                    <h3>Episode belum tersedia</h3>
                    <p className="lead">Season dan episode akan muncul di sini setelah ditambahkan dari Studio.</p>
                  </div>
                )}
              </section>
            ) : null}

            <section className="section">
              <div className="section-head">
                <h2>Judul Terkait</h2>
              </div>
              <div className="grid">
                {related.map((item) => (
                  <MovieCard key={item.id} title={item} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, Heart, Play, ChevronDown } from "lucide-react";
import type { Metadata } from "next";
import { MovieCard } from "@/components/movie-card";
import { PosterImage } from "@/components/poster-image";
import { getCatalogTitleBySlug, getFirstEpisode, getRelatedTitles } from "@/lib/catalog";
import { recordAuditEvent } from "@/lib/studio";
import { createClient } from "@/lib/supabase/server";
import { toggleFavorite } from "@/app/actions/favorites";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const title = await getCatalogTitleBySlug(slug);

  if (!title) {
    return { title: "Not Found - IMOV" };
  }

  return {
    title: `${title.title} - IMOV`,
    description: title.synopsis.slice(0, 160),
    openGraph: {
      title: `${title.title} - IMOV`,
      description: title.synopsis.slice(0, 160),
      type: title.type === "movie" ? "video.movie" : "video.tv_show",
      images: [{ url: title.poster, width: 500, height: 750 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title.title} - IMOV`,
      description: title.synopsis.slice(0, 160),
      images: [title.poster],
    },
  };
}

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

  // Check if favorited
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let isFavorited = false;
  if (user) {
    const { data: fav } = await supabase
      .from("favorites")
      .select("title_id")
      .eq("user_id", user.id)
      .eq("title_id", title.id)
      .maybeSingle();
    isFavorited = !!fav;
  }

  const playHref =
    title.type === "series" && firstEpisode
      ? `/watch/${title.slug}/season/${firstEpisode.seasonNumber}/episode/${firstEpisode.episodeNumber}`
      : `/watch/${title.slug}/play`;

  return (
    <>
      {/* ===== HERO SECTION (nxsha-style) ===== */}
      <section className="detail-hero" style={{ "--hero-image": title.backdrop } as React.CSSProperties}>
        <div className="detail-hero-overlay" />
        <div className="detail-hero-content">
          <div className="detail-hero-poster">
            <PosterImage src={title.poster} alt={title.title} priority sizes="200px" />
          </div>
          <div className="detail-hero-info">
            {/* Type badge */}
            <div className="detail-hero-badge">{title.type === "movie" ? "Movie" : "Series"}</div>

            {/* Title */}
            <h1 className="detail-hero-title">{title.title}</h1>

            {/* Meta row: rating + year + duration */}
            <div className="detail-hero-meta">
              {title.imdbRating ? (
                <span className="detail-hero-pill detail-hero-pill-rating">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFC300" stroke="#FFC300" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span>{title.imdbRating.toFixed(1)}</span>
                </span>
              ) : null}
              <span className="detail-hero-pill">{title.year}</span>
              <span className="detail-hero-pill">{title.duration}</span>
              <span className="detail-hero-pill">{title.rating}</span>
            </div>

            {/* Synopsis */}
            <p className="detail-hero-synopsis">{title.synopsis}</p>

            {/* Genre pills */}
            <div className="detail-hero-genres">
              {title.genres.map((genre) => (
                <Link className="detail-hero-genre" href={`/search?genre=${encodeURIComponent(genre)}`} key={genre}>
                  {genre}
                </Link>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="detail-hero-actions">
              <Link className="btn-yellow" href={playHref}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><polygon points="3,1 14,8 3,15" /></svg>
                {title.type === "series" && firstEpisode ? `Play S${firstEpisode.seasonNumber} E${firstEpisode.episodeNumber}` : "Watch Now"}
              </Link>
              <form action={toggleFavorite} style={{ display: "inline" }}>
                <input type="hidden" name="title_id" value={title.id} />
                <input type="hidden" name="slug" value={title.slug} />
                <button className={`btn-outline${isFavorited ? " favorited" : ""}`} type="submit">
                  <Heart size={18} fill={isFavorited ? "var(--primary)" : "none"} />
                  {isFavorited ? "Saved" : "Save to Watchlist"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ===== EPISODES (untuk series) ===== */}
      {title.type === "series" ? (
        <div className="page">
          {title.seasons?.length ? (
            <section id="episodes">
              {/* Season tabs */}
              <nav className="detail-season-tabs" aria-label="Seasons">
                {title.seasons.map((season) => (
                  <Link
                    key={season.id}
                    className={`detail-season-tab${season.seasonNumber === activeSeason?.seasonNumber ? " active" : ""}`}
                    href={`/watch/${title.slug}?season=${season.seasonNumber}#episodes`}
                    aria-current={season.seasonNumber === activeSeason?.seasonNumber ? "true" : undefined}
                  >
                    {season.name}
                  </Link>
                ))}
              </nav>

              {/* Season info + episode grid */}
              {activeSeason ? (
                <div key={activeSeason.id} className="detail-season-panel">
                  {activeSeason.episodes.map((episode) => (
                    <Link
                      key={episode.id}
                      className="detail-episode-card"
                      href={`/watch/${title.slug}/season/${episode.seasonNumber}/episode/${episode.episodeNumber}`}
                    >
                      <div className="detail-episode-still" style={{ backgroundImage: episode.still, backgroundSize: "cover", backgroundPosition: "center" }}>
                        <span className="detail-episode-num">EPISODE {episode.episodeNumber}</span>
                        <div className="detail-episode-still-overlay">
                          <Play size={36} />
                        </div>
                      </div>
                      <div className="detail-episode-info">
                        <div className="detail-episode-header">
                          <strong>{episode.title}</strong>
                          <span className="detail-episode-dur">
                            <Clock size={14} /> {episode.duration}
                          </span>
                        </div>
                        <p className="detail-episode-synopsis">{episode.synopsis}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : null}
            </section>
          ) : (
            <div className="panel">
              <h3>Episode belum tersedia</h3>
              <p className="lead">Season dan episode akan muncul di sini setelah ditambahkan dari Studio.</p>
            </div>
          )}
        </div>
      ) : null}

      {/* ===== RELATED TITLES ===== */}
      {related.length > 0 ? (
        <div className="page">
          <section>
            <div className="section-head">
              <h2>More Like This</h2>
              <Link className="nav-link" href="/search">Browse all</Link>
            </div>
            <div className="grid">
              {related.map((item) => (
                <MovieCard key={item.id} title={item} />
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

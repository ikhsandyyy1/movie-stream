import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Film, LogOut, Plus, Upload } from "lucide-react";
import { deleteEpisode, deleteSeason, deleteTitle, saveEpisode, saveSeason, saveTitle, signOutAdmin } from "@/app/studio/actions";
import { getStudioDashboard, type StudioEpisodeRow, type StudioSeasonRow, type StudioTitleRow } from "@/lib/studio";

export const metadata: Metadata = {
  title: "Studio - IMOV",
  robots: {
    index: false,
    follow: false
  }
};

export default async function StudioPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string; saved?: string; deleted?: string }>;
}) {
  const [{ titles, events }, params] = await Promise.all([getStudioDashboard(), searchParams]);
  const publishedCount = titles.filter((title) => title.is_published).length;
  const playCount = events.filter((event) => event.event_type === "title_played").length;
  const viewCount = events.filter((event) => event.event_type === "title_viewed").length;

  return (
    <div className="page">
      <div className="studio-head">
        <div>
          <div className="eyebrow">Admin Studio</div>
          <h1 className="page-title">Kelola IMOV</h1>
          <p className="lead">Konten, media, publish status, dan audit aktivitas website.</p>
        </div>
        <form action={signOutAdmin}>
          <button className="button secondary" type="submit">
            <LogOut size={18} />
            Keluar
          </button>
        </form>
      </div>

      {params?.error ? (
        <p className="panel" style={{ color: "var(--danger)" }}>
          {params.error}
        </p>
      ) : null}

      <div className="studio-metrics">
        <Metric icon={<Film />} label="Total Konten" value={String(titles.length)} />
        <Metric icon={<Upload />} label="Published" value={String(publishedCount)} />
        <Metric icon={<BarChart3 />} label="Views Tercatat" value={String(viewCount)} />
        <Metric icon={<BarChart3 />} label="Plays Tercatat" value={String(playCount)} />
      </div>

      <div className="admin-layout">
        <aside className="panel studio-nav">
          <a className="nav-link" href="#content">
            <Film size={18} />
            Konten
          </a>
          <a className="nav-link" href="#new">
            <Plus size={18} />
            Tambah
          </a>
          <a className="nav-link" href="#events">
            <BarChart3 size={18} />
            Audit
          </a>
        </aside>

        <div className="studio-stack">
          <section className="panel" id="new">
            <div className="section-head">
              <div>
                <h2>Tambah Konten</h2>
                <p className="lead" style={{ margin: "6px 0 0" }}>
                  Upload poster/backdrop atau gunakan URL yang sudah ada.
                </p>
              </div>
            </div>
            <TitleForm />
          </section>

          <section className="panel" id="content">
            <div className="section-head">
              <h2>Daftar Konten</h2>
            </div>
            <div className="studio-stack">
              {titles.map((title) => (
                <details className="studio-item" key={title.id}>
                  <summary>
                    <span>
                      <strong>{title.title}</strong>
                      <span className="card-meta">
                        {title.year} · {title.type} · {title.is_published ? "Published" : "Draft"}
                      </span>
                    </span>
                    <Link className="meta-pill" href={`/watch/${title.slug}`}>
                      Lihat
                    </Link>
                  </summary>
                  <TitleForm title={title} />
                  {title.type === "series" ? <SeasonManager title={title} /> : null}
                  <form action={deleteTitle}>
                    <input type="hidden" name="title_id" value={title.id} />
                    <input type="hidden" name="slug" value={title.slug} />
                    <button className="button ghost" type="submit" style={{ color: "var(--danger)" }}>
                      Hapus Konten
                    </button>
                  </form>
                </details>
              ))}
            </div>
          </section>

          <section className="panel" id="events">
            <div className="section-head">
              <h2>Audit Aktivitas</h2>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Waktu</th>
                    <th>Event</th>
                    <th>Actor</th>
                    <th>Konten</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id}>
                      <td>{new Date(event.created_at).toLocaleString("id-ID")}</td>
                      <td>{String(event.event_type).replaceAll("_", " ")}</td>
                      <td>{event.actor_email ?? "public"}</td>
                      <td>{event.title_slug ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="panel studio-metric">
      <span aria-hidden="true">{icon}</span>
      <div>
        <strong>{value}</strong>
        <p className="card-meta">{label}</p>
      </div>
    </div>
  );
}

function TitleForm({ title }: { title?: StudioTitleRow }) {
  const source = title?.video_sources?.[0];

  return (
    <form action={saveTitle} className="studio-form">
      <input type="hidden" name="title_id" value={title?.id ?? ""} />
      <input type="hidden" name="source_id" value={source?.id ?? ""} />
      <input type="hidden" name="previous_published" value={String(Boolean(title?.is_published))} />
      <div className="studio-grid">
        <Field label="Judul" name="title" defaultValue={title?.title} required />
        <Field label="Slug" name="slug" defaultValue={title?.slug} placeholder="otomatis dari judul jika kosong" />
        <label className="field">
          Tipe
          <select className="input" name="type" defaultValue={title?.type ?? "movie"}>
            <option value="movie">Film</option>
            <option value="series">Series</option>
          </select>
        </label>
        <Field label="Tahun" name="year" type="number" defaultValue={title?.year ? String(title.year) : String(new Date().getFullYear())} />
        <Field label="TMDB ID" name="tmdb_id" type="number" defaultValue={title?.tmdb_id ? String(title.tmdb_id) : ""} placeholder="dipakai NxSha" />
        <Field label="Negara" name="country" defaultValue={title?.country ?? "United States"} />
        <Field label="Network" name="network" defaultValue={title?.network ?? "Netflix"} />
        <Field label="Durasi" name="duration" defaultValue={title?.duration ?? "1j 40m"} />
        <Field label="Rating" name="rating" defaultValue={title?.rating ?? "13+"} />
      </div>

      <label className="field">
        Sinopsis
        <textarea className="input textarea" name="synopsis" defaultValue={title?.synopsis ?? ""} />
      </label>

      <Field label="Genres, pisahkan koma" name="genre_names" defaultValue={title?.genre_names?.join(", ") ?? "Drama"} />

      <div className="studio-grid">
        <Field label="Poster URL" name="poster_path" defaultValue={title?.poster_path ?? ""} />
        <label className="field">
          Upload Poster
          <input className="input" type="file" name="poster_file" accept="image/jpeg,image/png,image/webp" />
        </label>
        <Field label="Backdrop URL" name="backdrop_path" defaultValue={title?.backdrop_path ?? ""} />
        <label className="field">
          Upload Backdrop
          <input className="input" type="file" name="backdrop_file" accept="image/jpeg,image/png,image/webp" />
        </label>
      </div>

      <div className="studio-grid">
        <Field label="Source label" name="source_label" defaultValue={source?.label ?? "NxSha TMDb/IMDb embed"} />
        <label className="field">
          Source type
          <select className="input" name="source_type" defaultValue={source?.type ?? "official_embed"}>
            <option value="licensed_provider">Licensed provider</option>
            <option value="official_embed">Official embed</option>
            <option value="owned">Owned video</option>
          </select>
        </label>
        <Field label="Source URL" name="source_url" defaultValue={source?.url ?? "https://web.nxsha.app/embed/movie/TMDB_OR_IMDB_ID?sub=id&lang=id"} />
        <Field label="Quality" name="source_quality" defaultValue={source?.quality ?? "1080p"} />
      </div>

      <div className="studio-checks">
        <Check name="is_published" label="Published" checked={title?.is_published} />
        <Check name="is_featured" label="Featured" checked={title?.is_featured} />
        <Check name="is_trending" label="Trending" checked={title?.is_trending} />
        <Check name="is_recently_added" label="Recently added" checked={title?.is_recently_added} />
      </div>

      <button className="button" type="submit">
        {title ? "Simpan Perubahan" : "Tambah Konten"}
      </button>
    </form>
  );
}

function SeasonManager({ title }: { title: StudioTitleRow }) {
  return (
    <div className="studio-seasons">
      <div className="section-head">
        <div>
          <h3>Season dan Episode</h3>
          <p className="card-meta">Atur season, daftar episode, dan source legal per episode.</p>
        </div>
      </div>

      <details className="studio-item">
        <summary>
          <span>
            <strong>Tambah Season</strong>
            <span className="card-meta">Season baru untuk {title.title}</span>
          </span>
        </summary>
        <SeasonForm title={title} />
      </details>

      {(title.seasons ?? []).map((season) => (
        <details className="studio-item" key={season.id}>
          <summary>
            <span>
              <strong>{season.name}</strong>
              <span className="card-meta">
                Season {season.season_number} · {season.episodes?.length ?? 0} episode · {season.is_published ? "Published" : "Draft"}
              </span>
            </span>
          </summary>
          <SeasonForm title={title} season={season} />
          <form action={deleteSeason}>
            <input type="hidden" name="season_id" value={season.id} />
            <input type="hidden" name="title_id" value={title.id} />
            <input type="hidden" name="title_slug" value={title.slug} />
            <input type="hidden" name="season_number" value={season.season_number} />
            <button className="button ghost" type="submit" style={{ color: "var(--danger)" }}>
              Hapus Season
            </button>
          </form>

          <div className="studio-stack">
            <details className="studio-item">
              <summary>
                <span>
                  <strong>Tambah Episode</strong>
                  <span className="card-meta">Episode baru untuk {season.name}</span>
                </span>
              </summary>
              <EpisodeForm title={title} season={season} />
            </details>

            {(season.episodes ?? []).map((episode) => (
              <details className="studio-item" key={episode.id}>
                <summary>
                  <span>
                    <strong>
                      S{episode.season_number}E{episode.episode_number} · {episode.title}
                    </strong>
                    <span className="card-meta">
                      {episode.duration} · {episode.is_published ? "Published" : "Draft"}
                    </span>
                  </span>
                </summary>
                <EpisodeForm title={title} season={season} episode={episode} />
                <form action={deleteEpisode}>
                  <input type="hidden" name="episode_id" value={episode.id} />
                  <input type="hidden" name="title_id" value={title.id} />
                  <input type="hidden" name="title_slug" value={title.slug} />
                  <input type="hidden" name="season_number" value={episode.season_number} />
                  <input type="hidden" name="episode_number" value={episode.episode_number} />
                  <button className="button ghost" type="submit" style={{ color: "var(--danger)" }}>
                    Hapus Episode
                  </button>
                </form>
              </details>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}

function SeasonForm({ title, season }: { title: StudioTitleRow; season?: StudioSeasonRow }) {
  return (
    <form action={saveSeason} className="studio-form">
      <input type="hidden" name="title_id" value={title.id} />
      <input type="hidden" name="title_slug" value={title.slug} />
      <input type="hidden" name="season_id" value={season?.id ?? ""} />
      <div className="studio-grid">
        <Field label="Nomor season" name="season_number" type="number" defaultValue={String(season?.season_number ?? (title.seasons?.length ?? 0) + 1)} />
        <Field label="Nama season" name="season_name" defaultValue={season?.name ?? `Season ${(title.seasons?.length ?? 0) + 1}`} />
        <Field label="Poster season URL" name="season_poster_path" defaultValue={season?.poster_path ?? title.poster_path ?? ""} />
      </div>
      <label className="field">
        Sinopsis season
        <textarea className="input textarea" name="season_synopsis" defaultValue={season?.synopsis ?? ""} />
      </label>
      <div className="studio-checks">
        <Check name="season_is_published" label="Published" checked={season?.is_published ?? true} />
      </div>
      <button className="button" type="submit">
        {season ? "Simpan Season" : "Tambah Season"}
      </button>
    </form>
  );
}

function EpisodeForm({ title, season, episode }: { title: StudioTitleRow; season: StudioSeasonRow; episode?: StudioEpisodeRow }) {
  const source = episode?.episode_video_sources?.[0];

  return (
    <form action={saveEpisode} className="studio-form">
      <input type="hidden" name="title_id" value={title.id} />
      <input type="hidden" name="title_slug" value={title.slug} />
      <input type="hidden" name="season_id" value={season.id} />
      <input type="hidden" name="episode_id" value={episode?.id ?? ""} />
      <input type="hidden" name="episode_source_id" value={source?.id ?? ""} />
      <input type="hidden" name="episode_season_number" value={season.season_number} />
      <div className="studio-grid">
        <Field label="Nomor episode" name="episode_number" type="number" defaultValue={String(episode?.episode_number ?? (season.episodes?.length ?? 0) + 1)} />
        <Field label="Judul episode" name="episode_title" defaultValue={episode?.title ?? `Episode ${(season.episodes?.length ?? 0) + 1}`} />
        <Field label="Durasi" name="episode_duration" defaultValue={episode?.duration ?? "24m"} />
        <Field label="Tanggal rilis" name="episode_air_date" type="date" defaultValue={episode?.air_date ?? ""} />
        <Field label="Still/backdrop URL" name="episode_still_path" defaultValue={episode?.still_path ?? title.backdrop_path ?? ""} />
      </div>
      <label className="field">
        Sinopsis episode
        <textarea className="input textarea" name="episode_synopsis" defaultValue={episode?.synopsis ?? ""} />
      </label>
      <div className="studio-grid">
        <Field label="Source label" name="episode_source_label" defaultValue={source?.label ?? "NxSha TMDb/IMDb embed"} />
        <label className="field">
          Source type
          <select className="input" name="episode_source_type" defaultValue={source?.type ?? "official_embed"}>
            <option value="licensed_provider">Licensed provider</option>
            <option value="official_embed">Official embed</option>
            <option value="owned">Owned video</option>
          </select>
        </label>
        <Field label="Source URL" name="episode_source_url" defaultValue={source?.url ?? "https://web.nxsha.app/embed/tv/TMDB_OR_IMDB_ID/1/1?sub=id&lang=id"} />
        <Field label="Quality" name="episode_source_quality" defaultValue={source?.quality ?? "1080p"} />
      </div>
      <div className="studio-checks">
        <Check name="episode_is_published" label="Episode published" checked={episode?.is_published ?? true} />
        <Check name="episode_source_is_active" label="Source active" checked={source?.is_active ?? true} />
      </div>
      <button className="button" type="submit">
        {episode ? "Simpan Episode" : "Tambah Episode"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  required
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="field">
      {label}
      <input className="input" name={name} type={type} defaultValue={defaultValue} placeholder={placeholder} required={required} />
    </label>
  );
}

function Check({ name, label, checked }: { name: string; label: string; checked?: boolean }) {
  return (
    <label className="meta-pill studio-check">
      <input type="checkbox" name={name} defaultChecked={Boolean(checked)} />
      {label}
    </label>
  );
}

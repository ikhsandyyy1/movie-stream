import { redirect } from "next/navigation";
import Link from "next/link";
import { Heart, Clapperboard, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCatalogTitles } from "@/lib/catalog";
import { removeFavorite } from "@/app/actions/favorites";
import { PosterImage } from "@/components/poster-image";

export default async function FavoritesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=Silakan masuk untuk melihat favorit.");
  }

  // Get user's favorite title IDs
  const { data: favorites } = await supabase
    .from("favorites")
    .select("title_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (!favorites || favorites.length === 0) {
    return (
      <div className="page" style={{ maxWidth: 520, margin: "0 auto", paddingTop: 60, textAlign: "center" }}>
        <div style={{ marginBottom: 32 }}>
          <span
            className="brand-mark"
            style={{
              width: 72,
              height: 72,
              margin: "0 auto",
              fontSize: 32,
              display: "grid",
              placeItems: "center",
              borderRadius: "50%"
            }}
          >
            <Heart size={36} />
          </span>
          <h1 className="page-title" style={{ fontSize: "clamp(24px, 4vw, 32px)" }}>Favorit Saya</h1>
          <p className="lead">Belum ada judul yang difavoritkan.</p>
        </div>
        <Link className="button" href="/" style={{ justifyContent: "center" }}>
          Jelajahi Film & Serial
        </Link>
      </div>
    );
  }

  // Match favorites to catalog titles
  const allTitles = await getCatalogTitles();
  const favoriteIds = new Set(favorites.map((f) => f.title_id));
  const favoriteTitles = allTitles
    .filter((title) => favoriteIds.has(title.id))
    .map((title) => ({
      ...title,
      favoritedAt: favorites.find((f) => f.title_id === title.id)?.created_at ?? "",
    }));

  return (
    <div className="page" style={{ maxWidth: 720, margin: "0 auto", paddingTop: 60 }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <span
          className="brand-mark"
          style={{
            width: 72,
            height: 72,
            margin: "0 auto",
            fontSize: 32,
            display: "grid",
            placeItems: "center",
            borderRadius: "50%"
          }}
        >
          <Heart size={36} />
        </span>
        <h1 className="page-title" style={{ fontSize: "clamp(24px, 4vw, 32px)" }}>Favorit Saya</h1>
        <p className="lead">{favoriteTitles.length} judul tersimpan</p>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {favoriteTitles.map((title) => (
          <div
            className="panel"
            key={title.id}
            style={{ display: "flex", gap: 14, alignItems: "center" }}
          >
            <Link
              href={`/watch/${title.slug}`}
              style={{ flex: "0 0 64px", lineHeight: 0 }}
            >
              <PosterImage src={title.poster} alt={title.title} sizes="64px" />
            </Link>
            <div style={{ minWidth: 0, flex: 1 }}>
              <Link href={`/watch/${title.slug}`}>
                <strong style={{ display: "block" }}>{title.title}</strong>
              </Link>
              <span className="card-meta">
                {title.type === "movie" ? "Film" : "Serial TV"} · {title.year}
              </span>
            </div>
            <form action={removeFavorite}>
              <input type="hidden" name="title_id" value={title.id} />
              <input type="hidden" name="slug" value={title.slug} />
              <button
                className="icon-button"
                type="submit"
                aria-label={`Hapus ${title.title} dari favorit`}
                style={{ color: "var(--danger)" }}
              >
                <Trash2 size={18} />
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

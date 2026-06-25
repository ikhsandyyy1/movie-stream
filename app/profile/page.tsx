import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOutUser } from "@/app/login/actions";
import { Clapperboard, Heart, LogOut, Mail, User } from "lucide-react";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=Silakan masuk terlebih dahulu.");
  }

  return (
    <div className="page" style={{ maxWidth: 520, margin: "0 auto", paddingTop: 60 }}>
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
          <User size={36} />
        </span>
        <h1 className="page-title" style={{ fontSize: "clamp(24px, 4vw, 32px)" }}>Profil</h1>
      </div>

      <div className="panel" style={{ display: "grid", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Mail size={18} style={{ color: "var(--muted-2)" }} />
          <div>
            <div className="card-meta">Email</div>
            <strong>{user.email}</strong>
          </div>
        </div>
      </div>

      <div className="studio-form" style={{ marginTop: 24 }}>
        <Link
          className="button secondary"
          href="/profile/favorites"
          style={{ width: "100%", justifyContent: "center" }}
        >
          <Heart size={18} />
          Favorit Saya
        </Link>

        <form action={signOutUser}>
          <button
            className="button ghost"
            type="submit"
            style={{ width: "100%", justifyContent: "center", color: "var(--danger)" }}
          >
            <LogOut size={18} />
            Keluar
          </button>
        </form>
      </div>
    </div>
  );
}

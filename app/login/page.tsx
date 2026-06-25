import Link from "next/link";
import { signIn, signInWithGoogle } from "@/app/login/actions";
import { Clapperboard } from "lucide-react";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; success?: string; next?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="page" style={{ maxWidth: 420, margin: "0 auto", paddingTop: 60 }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <span className="brand-mark" style={{ width: 56, height: 56, margin: "0 auto", fontSize: 24, display: "grid", placeItems: "center" }}>
          <Clapperboard size={28} />
        </span>
        <h1 className="page-title" style={{ fontSize: "clamp(24px, 4vw, 32px)" }}>Masuk ke IMOV</h1>
        <p className="lead">Masuk untuk menyimpan favorit dan melanjutkan tontonan.</p>
      </div>

      {params?.success ? (
        <div className="panel" style={{ color: "var(--success)", marginBottom: 16, padding: "12px 16px" }}>
          {params.success}
        </div>
      ) : null}

      {params?.error ? (
        <div className="panel" style={{ color: "var(--danger)", marginBottom: 16, padding: "12px 16px" }}>
          {params.error}
        </div>
      ) : null}

      <form action={signIn} className="studio-form">
        <label className="field">
          Email
          <input className="input" type="email" name="email" placeholder="contoh@email.com" required />
        </label>
        <label className="field">
          Password
          <input className="input" type="password" name="password" placeholder="Minimal 6 karakter" required />
        </label>
        <input type="hidden" name="next" value={params?.next ?? "/"} />
        <button className="button" type="submit" style={{ width: "100%", justifyContent: "center" }}>
          Masuk
        </button>
      </form>

      <div style={{ marginTop: 20, textAlign: "center" }}>
        <div style={{ color: "var(--muted)", marginBottom: 12, fontSize: 13 }}>atau</div>
        <form action={signInWithGoogle}>
          <button className="button secondary" type="submit" style={{ width: "100%", justifyContent: "center" }}>
            Lanjutkan dengan Google
          </button>
        </form>
      </div>

      <div style={{ textAlign: "center", marginTop: 20 }}>
        <Link className="nav-link" href="/register">Belum punya akun? Daftar</Link>
      </div>
    </div>
  );
}

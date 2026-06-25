import Link from "next/link";
import { signUp } from "@/app/register/actions";
import { Clapperboard } from "lucide-react";

export default async function RegisterPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="page" style={{ maxWidth: 420, margin: "0 auto", paddingTop: 60 }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <span className="brand-mark" style={{ width: 56, height: 56, margin: "0 auto", fontSize: 24, display: "grid", placeItems: "center" }}>
          <Clapperboard size={28} />
        </span>
        <h1 className="page-title" style={{ fontSize: "clamp(24px, 4vw, 32px)" }}>Daftar Akun IMOV</h1>
        <p className="lead">Buat akun untuk menyimpan favorit dan melanjutkan tontonan.</p>
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

      <form action={signUp} className="studio-form">
        <label className="field">
          Email
          <input className="input" type="email" name="email" placeholder="contoh@email.com" required />
        </label>
        <label className="field">
          Password
          <input className="input" type="password" name="password" placeholder="Minimal 6 karakter" required />
        </label>
        <label className="field">
          Konfirmasi Password
          <input className="input" type="password" name="confirm_password" placeholder="Ulangi password" required />
        </label>
        <button className="button" type="submit" style={{ width: "100%", justifyContent: "center" }}>
          Daftar
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: 20 }}>
        <Link className="nav-link" href="/login">Sudah punya akun? Masuk</Link>
      </div>
    </div>
  );
}

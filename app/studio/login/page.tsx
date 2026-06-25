import type { Metadata } from "next";
import Link from "next/link";
import { signInAdmin } from "@/app/studio/actions";

export const metadata: Metadata = {
  title: "Studio Login - IMOV",
  robots: {
    index: false,
    follow: false
  }
};

export default async function StudioLoginPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <div className="page" style={{ maxWidth: 520 }}>
      <div className="eyebrow">Admin Studio</div>
      <h1 className="page-title">Masuk Studio</h1>
      <p className="lead">Area ini hanya untuk admin IMOV.</p>

      <form action={signInAdmin} className="panel studio-form">
        {error ? (
          <p className="meta-pill" style={{ color: "var(--danger)", margin: 0 }}>
            {error === "missing" ? "Email dan password wajib diisi." : "Akses admin tidak valid."}
          </p>
        ) : null}
        <div className="field">
          <label htmlFor="email">Email admin</label>
          <input className="input" id="email" type="email" name="email" autoComplete="email" required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input className="input" id="password" type="password" name="password" autoComplete="current-password" required />
        </div>
        <button className="button" type="submit">
          Masuk Studio
        </button>
        <Link className="nav-link" href="/">
          Kembali ke IMOV
        </Link>
      </form>
    </div>
  );
}

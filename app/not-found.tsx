import Link from "next/link";
import { Clapperboard, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="page" style={{ textAlign: "center", paddingBlock: "80px" }}>
      <div style={{ marginBottom: 24 }}>
        <span className="brand-mark" style={{ width: 64, height: 64, margin: "0 auto", fontSize: 28 }}>
          <Clapperboard size={32} />
        </span>
      </div>
      <h1 className="page-title" style={{ marginBottom: 8 }}>404 — Halaman Tidak Ditemukan</h1>
      <p className="lead" style={{ maxWidth: 480, margin: "0 auto 24px" }}>
        Halaman yang Anda cari tidak ada atau telah dipindahkan.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <Link className="button" href="/">Kembali ke Beranda</Link>
        <Link className="button secondary" href="/search">
          <Search size={18} />
          Cari Konten
        </Link>
      </div>
    </div>
  );
}

"use client";
export default function SearchError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="page" style={{ textAlign: "center", paddingBlock: "80px" }}>
      <h1 className="page-title">Gagal Memuat Pencarian</h1>
      <p className="lead">Terjadi kesalahan saat memuat hasil pencarian.</p>
      <button className="button" onClick={reset} type="button">Coba Lagi</button>
    </div>
  );
}

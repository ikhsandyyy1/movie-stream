"use client";
export default function MoviesError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="page" style={{ textAlign: "center", paddingBlock: "80px" }}>
      <h1 className="page-title">Gagal Memuat Film</h1>
      <p className="lead">Terjadi kesalahan saat memuat katalog film.</p>
      <button className="button" onClick={reset} type="button">Coba Lagi</button>
    </div>
  );
}

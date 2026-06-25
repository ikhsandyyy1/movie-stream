"use client";
export default function SeriesError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="page" style={{ textAlign: "center", paddingBlock: "80px" }}>
      <h1 className="page-title">Gagal Memuat Serial</h1>
      <p className="lead">Terjadi kesalahan saat memuat katalog serial TV.</p>
      <button className="button" onClick={reset} type="button">Coba Lagi</button>
    </div>
  );
}

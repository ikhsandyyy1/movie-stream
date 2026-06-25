"use client";
import { useEffect } from "react";

export default function StudioError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="page" style={{ textAlign: "center", paddingBlock: "80px" }}>
      <h1 className="page-title">Gagal Memuat Studio</h1>
      <p className="lead">Terjadi kesalahan saat memuat panel admin studio.</p>
      <button className="button" onClick={reset} type="button">Coba Lagi</button>
    </div>
  );
}

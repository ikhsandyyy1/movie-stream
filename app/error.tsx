"use client";

import { useEffect } from "react";
import { Clapperboard } from "lucide-react";

export default function RootError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="page" style={{ textAlign: "center", paddingBlock: "80px" }}>
      <div style={{ marginBottom: 24 }}>
        <span className="brand-mark" style={{ width: 64, height: 64, margin: "0 auto", fontSize: 28 }}>
          <Clapperboard size={32} />
        </span>
      </div>
      <h1 className="page-title" style={{ marginBottom: 8 }}>Terjadi Kesalahan</h1>
      <p className="lead" style={{ maxWidth: 480, margin: "0 auto 24px" }}>
        Maaf, terjadi kesalahan yang tidak terduga. Tim kami sudah mendapat notifikasi.
      </p>
      <button className="button" onClick={reset} type="button">
        Coba Lagi
      </button>
    </div>
  );
}

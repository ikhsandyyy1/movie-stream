"use client";

import Image from "next/image";
import { useState } from "react";
import { posterImage } from "@/lib/images";

export function PosterImage({
  src,
  alt,
  badge,
  priority = false,
  sizes = "(max-width: 560px) 42vw, (max-width: 920px) 22vw, 188px"
}: {
  src?: string | null;
  alt: string;
  badge?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  const imageSrc = failed ? "" : posterImage(src, "w342");
  const optimized = imageSrc
    ? ["image.tmdb.org", "qcbtbbajmvailfolkqoq.supabase.co"].some((host) => imageSrc.includes(host))
    : false;

  return (
    <div className={`poster${imageSrc ? " has-image" : ""}`}>
      {imageSrc && optimized ? (
        <Image
          src={imageSrc}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="poster-img"
          onError={() => setFailed(true)}
        />
      ) : imageSrc ? (
        <img
          src={imageSrc}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="poster-img"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="poster-fallback" aria-hidden="true">
          {alt.slice(0, 1).toUpperCase()}
        </span>
      )}
      {badge ? <span className="poster-badge">{badge}</span> : null}
    </div>
  );
}

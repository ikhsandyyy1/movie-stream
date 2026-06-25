import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/movies", "/series", "/ranking", "/search", "/watch"],
        disallow: ["/studio", "/admin", "/api/"],
      },
    ],
    sitemap: "https://movie-stream.vercel.app/sitemap.xml",
  };
}

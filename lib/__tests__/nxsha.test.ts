import { describe, it, expect } from "vitest";
import { buildNxshaEmbedUrl, NXSHA_EMBED_LABEL } from "@/lib/nxsha";

describe("buildNxshaEmbedUrl", () => {
  it("builds movie URL from tmdbId", () => {
    const url = buildNxshaEmbedUrl({ tmdbId: 550, type: "movie" });
    expect(url).toContain("web.nxsha.app/embed/movie/550");
    expect(url).toContain("sub=id");
    expect(url).toContain("lang=id");
  });

  it("builds series URL from tmdbId", () => {
    const url = buildNxshaEmbedUrl({
      tmdbId: 1399,
      type: "series",
      seasonNumber: 2,
      episodeNumber: 5,
    });
    expect(url).toContain("embed/tv/1399/2/5");
  });

  it("returns null when no media ID provided", () => {
    expect(buildNxshaEmbedUrl({ type: "movie" })).toBeNull();
  });

  it("returns null when tmdbId and imdbId are both null", () => {
    expect(
      buildNxshaEmbedUrl({ tmdbId: null, imdbId: null, type: "movie" })
    ).toBeNull();
  });

  it("uses imdbId as fallback when tmdbId missing", () => {
    const url = buildNxshaEmbedUrl({
      imdbId: "tt0111161",
      type: "movie",
    });
    expect(url).toContain("tt0111161");
  });

  it("uses default season/episode for series", () => {
    const url = buildNxshaEmbedUrl({ tmdbId: 1399, type: "series" });
    expect(url).toContain("embed/tv/1399/1/1");
  });

  it("trims whitespace from imdbId", () => {
    const url = buildNxshaEmbedUrl({
      imdbId: "  tt0111161  ",
      type: "movie",
    });
    expect(url).toContain("tt0111161");
    expect(url).not.toContain("  ");
  });

  it("prioritizes tmdbId over imdbId", () => {
    const url = buildNxshaEmbedUrl({
      tmdbId: 550,
      imdbId: "tt0111161",
      type: "movie",
    });
    expect(url).toContain("/movie/550");
    expect(url).not.toContain("tt0111161");
  });

  it("has constant NXSHA_EMBED_LABEL", () => {
    expect(NXSHA_EMBED_LABEL).toBe("NxSha TMDb/IMDb embed");
  });
});

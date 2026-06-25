import { describe, it, expect } from "vitest";
import { tmdbImage, cssImage, posterImage } from "@/lib/images";

describe("tmdbImage", () => {
  it("returns full TMDB URL for relative path", () => {
    expect(tmdbImage("/abc.jpg", "w342")).toBe(
      "https://image.tmdb.org/t/p/w342/abc.jpg"
    );
  });

  it("strips leading slash from relative path", () => {
    expect(tmdbImage("/abc.jpg", "w185")).toBe(
      "https://image.tmdb.org/t/p/w185/abc.jpg"
    );
  });

  it("handles path without leading slash", () => {
    expect(tmdbImage("abc.jpg", "w342")).toBe(
      "https://image.tmdb.org/t/p/w342/abc.jpg"
    );
  });

  it("returns full URL as-is if already absolute", () => {
    expect(tmdbImage("https://example.com/img.jpg")).toBe(
      "https://example.com/img.jpg"
    );
  });

  it("returns empty string for empty input", () => {
    expect(tmdbImage("")).toBe("");
  });

  it("uses default size w342", () => {
    expect(tmdbImage("/path.jpg")).toContain("/w342/");
  });

  it("supports original size", () => {
    expect(tmdbImage("/path.jpg", "original")).toContain("/original/");
  });
});

describe("cssImage", () => {
  it("returns gradient fallback for null", () => {
    const result = cssImage(null);
    expect(result).toContain("linear-gradient");
  });

  it("returns gradient fallback for undefined", () => {
    const result = cssImage(undefined);
    expect(result).toContain("linear-gradient");
  });

  it("returns gradient fallback for empty string", () => {
    const result = cssImage("");
    expect(result).toContain("linear-gradient");
  });

  it("wraps TMDB path as url() with default size w1280", () => {
    const result = cssImage("/test.jpg");
    expect(result).toContain("url(");
    expect(result).toContain("/w1280/");
  });

  it("passes through existing url() value", () => {
    expect(cssImage("url('https://example.com/img.jpg')")).toBe(
      "url('https://example.com/img.jpg')"
    );
  });

  it("passes through existing linear-gradient value", () => {
    expect(cssImage("linear-gradient(red, blue)")).toBe(
      "linear-gradient(red, blue)"
    );
  });

  it("accepts custom size parameter", () => {
    const result = cssImage("/test.jpg", "w500");
    expect(result).toContain("/w500/");
  });
});

describe("posterImage", () => {
  it("returns empty string for null input", () => {
    expect(posterImage(null)).toBe("");
  });

  it("returns empty string for undefined input", () => {
    expect(posterImage(undefined)).toBe("");
  });

  it("returns empty string for gradient input", () => {
    expect(posterImage("linear-gradient(135deg, #1f2937, #05070b)")).toBe("");
  });

  it("extracts URL from url() css image value", () => {
    const result = posterImage(
      "url('https://image.tmdb.org/t/p/w342/test.jpg')"
    );
    expect(result).toContain("test.jpg");
    expect(result).toContain("/w342/");
  });

  it("uses custom size parameter", () => {
    // Pass a relative path wrapped in url() to test custom size
    const result = posterImage("url('/test.jpg')", "w780");
    expect(result).toBe(
      "https://image.tmdb.org/t/p/w780/test.jpg"
    );
  });
});

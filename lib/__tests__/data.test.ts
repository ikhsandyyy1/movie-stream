import { describe, it, expect } from "vitest";
import { getFilteredTitles, titles } from "@/lib/data";

describe("getFilteredTitles", () => {
  it("returns all titles with no params", () => {
    expect(getFilteredTitles({}).length).toBeGreaterThan(0);
  });

  it("filters by type movie", () => {
    const movies = getFilteredTitles({ type: "movie" });
    expect(movies.every((t) => t.type === "movie")).toBe(true);
  });

  it("filters by type series", () => {
    const series = getFilteredTitles({ type: "series" });
    expect(series.every((t) => t.type === "series")).toBe(true);
  });

  it("filters by genre", () => {
    const filtered = getFilteredTitles({ genre: "Action" });
    expect(filtered.every((t) => t.genres.includes("Action"))).toBe(true);
  });

  it("filters by country", () => {
    const filtered = getFilteredTitles({ country: "US" });
    expect(filtered.every((t) => t.country === "US")).toBe(true);
  });

  it("filters by network", () => {
    const filtered = getFilteredTitles({ network: "Netflix" });
    expect(filtered.every((t) => t.network === "Netflix")).toBe(true);
  });

  it("filters by year", () => {
    const filtered = getFilteredTitles({ year: "2020" });
    expect(filtered.every((t) => String(t.year) === "2020")).toBe(true);
  });

  it("filters by search query in title", () => {
    const results = getFilteredTitles({ q: "batman" });
    expect(results.length).toBeGreaterThan(0);
  });

  it("returns empty for non-matching search", () => {
    expect(
      getFilteredTitles({ q: "xyznonexistent12345" }).length
    ).toBe(0);
  });

  it("combines type and genre filters", () => {
    const results = getFilteredTitles({ type: "movie", genre: "Action" });
    expect(
      results.every((t) => t.type === "movie" && t.genres.includes("Action"))
    ).toBe(true);
  });
});

describe("titles", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(titles)).toBe(true);
    expect(titles.length).toBeGreaterThan(0);
  });

  it("each title has required fields", () => {
    for (const title of titles) {
      expect(title.id).toBeDefined();
      expect(title.slug).toBeDefined();
      expect(title.title).toBeDefined();
      expect(title.type).toMatch(/^(movie|series)$/);
      expect(Array.isArray(title.genres)).toBe(true);
      expect(typeof title.synopsis).toBe("string");
    }
  });

  it("each title has at least one source", () => {
    for (const title of titles) {
      expect(title.sources.length).toBeGreaterThan(0);
    }
  });

  it("each title has poster and backdrop", () => {
    for (const title of titles) {
      expect(typeof title.poster).toBe("string");
      expect(title.poster.length).toBeGreaterThan(0);
      expect(typeof title.backdrop).toBe("string");
      expect(title.backdrop.length).toBeGreaterThan(0);
    }
  });

  it("genres are non-empty for each title", () => {
    for (const title of titles) {
      expect(title.genres.length).toBeGreaterThan(0);
    }
  });
});

import { Suspense } from "react";
import { FilterBar } from "@/components/filter-bar";
import { MovieCard } from "@/components/movie-card";
import { getCatalogFilters, getFilteredCatalogTitles } from "@/lib/catalog";
import { recordAuditEvent } from "@/lib/studio";

export const dynamic = "force-dynamic"; // search needs fresh data

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = asString(params.q);
  const items = await getFilteredCatalogTitles({
    genre: asString(params.genre),
    country: asString(params.country),
    year: asString(params.year),
    network: asString(params.network),
    q: query
  });
  const { genres, countries, years, networks } = await getCatalogFilters();

  if (query) {
    await recordAuditEvent({
      eventType: "search_performed",
      metadata: { query, results: items.length }
    });
  }

  return (
    <div className="page">
      <div className="eyebrow">Browse</div>
      <h1 className="page-title">Cari Film dan Serial</h1>
      <p className="lead">Filter berdasarkan genre, negara, tahun, network, atau kata kunci. Semua layar utama dapat diakses lewat URL.</p>
      <Suspense>
        <FilterBar genres={genres} countries={countries} years={years} networks={networks} />
      </Suspense>
      {items.length > 0 ? (
        <div className="grid">
          {items.map((title) => (
            <MovieCard key={title.id} title={title} />
          ))}
        </div>
      ) : (
        <div className="panel">
          <h2>Tidak ada hasil</h2>
          <p className="lead">Coba ubah filter atau kata kunci pencarian.</p>
        </div>
      )}
    </div>
  );
}

function asString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

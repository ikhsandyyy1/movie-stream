"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function FilterBar({
  genres,
  countries,
  years,
  networks
}: {
  genres: string[];
  countries: string[];
  years: number[];
  networks: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/search?${next.toString()}`);
  }

  return (
    <form className="filters" role="search" onSubmit={(event) => event.preventDefault()}>
      <div className="field">
        <label htmlFor="q">Cari judul</label>
        <input
          className="input"
          id="q"
          name="q"
          placeholder="Cari film, serial, genre..."
          defaultValue={searchParams.get("q") ?? ""}
          onChange={(event) => update("q", event.target.value)}
        />
      </div>
      <SelectFilter id="genre" label="Genre" values={genres} value={searchParams.get("genre")} onChange={update} />
      <SelectFilter id="country" label="Negara" values={countries} value={searchParams.get("country")} onChange={update} />
      <SelectFilter id="year" label="Tahun" values={years.map(String)} value={searchParams.get("year")} onChange={update} />
      <SelectFilter id="network" label="Network" values={networks} value={searchParams.get("network")} onChange={update} />
    </form>
  );
}

function SelectFilter({
  id,
  label,
  values,
  value,
  onChange
}: {
  id: string;
  label: string;
  values: string[];
  value: string | null;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select className="select" id={id} value={value ?? ""} onChange={(event) => onChange(id, event.target.value)}>
        <option value="">Semua</option>
        {values.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function StudioLoading() {
  return (
    <div className="page">
      <div className="skeleton" style={{ width: "12%", height: 16, marginBottom: 8 }} />
      <div className="skeleton" style={{ width: "28%", height: 40, marginBottom: 8 }} />
      <div className="skeleton" style={{ width: "45%", height: 18, marginBottom: 24 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 64, borderRadius: "var(--radius)" }} />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 22, alignItems: "start" }}>
        <div className="skeleton" style={{ height: 200 }} />
        <div className="skeleton" style={{ height: 400 }} />
      </div>
    </div>
  );
}

export default function SearchLoading() {
  return (
    <div className="page">
      <div className="skeleton" style={{ width: "15%", height: 16, marginBottom: 8 }} />
      <div className="skeleton" style={{ width: "30%", height: 40, marginBottom: 8 }} />
      <div className="skeleton" style={{ width: "60%", height: 18, marginBottom: 24 }} />
      <div className="skeleton" style={{ width: "100%", height: 46, marginBottom: 24 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 18 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i}>
            <div className="skeleton poster-skeleton" />
            <div className="skeleton" style={{ width: "80%", height: 16, marginTop: 10 }} />
            <div className="skeleton" style={{ width: "50%", height: 12, marginTop: 6 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

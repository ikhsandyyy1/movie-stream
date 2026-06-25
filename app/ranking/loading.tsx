export default function RankingLoading() {
  return (
    <div className="page">
      <div className="skeleton" style={{ width: "15%", height: 16, marginBottom: 8 }} />
      <div className="skeleton" style={{ width: "40%", height: 40, marginBottom: 8 }} />
      <div className="skeleton" style={{ width: "55%", height: 18, marginBottom: 24 }} />
      <div className="skeleton" style={{ width: "20%", height: 16, marginBottom: 14 }} />
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

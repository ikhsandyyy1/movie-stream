export default function WatchLoading() {
  return (
    <>
      <div className="hero" style={{ minHeight: 520, display: "grid", placeItems: "center" }}>
        <div style={{ width: "100%", padding: "120px var(--page-gutter) 54px" }}>
          <div className="skeleton" style={{ width: "12%", height: 16, marginBottom: 12 }} />
          <div className="skeleton" style={{ width: "50%", height: 60, marginBottom: 14 }} />
          <div className="skeleton" style={{ width: "70%", height: 18, marginBottom: 16 }} />
          <div className="skeleton" style={{ width: "60%", height: 18, marginBottom: 18 }} />
          <div style={{ display: "flex", gap: 12 }}>
            <div className="skeleton" style={{ width: 130, height: 44 }} />
            <div className="skeleton" style={{ width: 130, height: 44 }} />
          </div>
        </div>
      </div>
      <div className="page">
        <div style={{ display: "grid", gridTemplateColumns: "minmax(180px, 300px) 1fr", gap: 28 }}>
          <div className="skeleton poster-skeleton" style={{ position: "sticky", top: 96 }} />
          <div>
            <div className="skeleton" style={{ height: 200 }} />
            <div className="skeleton" style={{ height: 300, marginTop: 34 }} />
          </div>
        </div>
      </div>
    </>
  );
}

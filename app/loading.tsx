export default function RootLoading() {
  return (
    <div className="page" style={{ paddingBlock: "80px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div className="skeleton" style={{ width: "40%", height: 32, marginBottom: 16 }} />
        <div className="skeleton" style={{ width: "70%", height: 18, marginBottom: 32 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 18 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <div className="skeleton poster-skeleton" />
              <div className="skeleton" style={{ width: "80%", height: 16, marginTop: 10 }} />
              <div className="skeleton" style={{ width: "50%", height: 12, marginTop: 6 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { ImageResponse } from "next/og";

export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #05070b 0%, #101621 50%, #172033 100%)",
          color: "#f8fafc",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 800, marginBottom: 16, display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ background: "linear-gradient(135deg, #e50914 0%, #ff3d1f 45%, #ff8a00 100%)", borderRadius: 12, padding: "0 16px", color: "white" }}>IMOV</span>
        </div>
        <div style={{ fontSize: 28, fontWeight: 600, color: "#b9c2d3" }}>Movie & Series Streaming</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

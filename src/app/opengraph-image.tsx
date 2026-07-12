import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Navio — Sizin maliyyə bələdçiniz";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(150deg, #0A1F44 0%, #12306B 100%)",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 48 }}>
          <div style={{ width: 34, height: 46, background: "#38bdf8", borderRadius: 8 }} />
          <div style={{ width: 34, height: 68, background: "#3b82f6", borderRadius: 8 }} />
          <div style={{ width: 34, height: 92, background: "#6d8dff", borderRadius: 8 }} />
          <div style={{ fontSize: 64, fontWeight: 800, marginLeft: 20 }}>Navio</div>
        </div>
        <div style={{ fontSize: 58, fontWeight: 800, lineHeight: 1.15, maxWidth: 900 }}>
          Kredit almaq şansınızı yoxlayın
        </div>
        <div style={{ fontSize: 30, color: "#B9C4E0", marginTop: 24 }}>
          Sorğusuz · Pulsuz · 3 dəqiqəyə — kredit tarixçənizə təsir etmir
        </div>
      </div>
    ),
    size,
  );
}

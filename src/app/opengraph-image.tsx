import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background:
            "linear-gradient(135deg, #07131f 0%, #0a1c2b 35%, #07253a 70%, #041019 100%)",
          color: "white",
          fontFamily: "sans-serif",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 18% 20%, rgba(0, 212, 170, 0.28), transparent 28%), radial-gradient(circle at 82% 18%, rgba(59, 130, 246, 0.24), transparent 24%), radial-gradient(circle at 70% 82%, rgba(20, 184, 166, 0.16), transparent 26%)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: "56px 64px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.16)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 34,
                fontWeight: 800,
              }}
            >
              AI
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 28, opacity: 0.82 }}>AquaSmart AI</div>
              <div style={{ fontSize: 20, color: "#99f6e4" }}>Premium Aquaculture Intelligence</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", maxWidth: 860 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                alignSelf: "flex-start",
                marginBottom: 22,
                padding: "10px 18px",
                borderRadius: 999,
                background: "rgba(0,212,170,0.12)",
                border: "1px solid rgba(0,212,170,0.28)",
                color: "#99f6e4",
                fontSize: 22,
              }}
            >
              Real-Time Pond Monitoring for Modern Fish Farms
            </div>

            <div style={{ fontSize: 66, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>
              Manage ponds, alerts, water quality, and AI insights in one dashboard.
            </div>

            <div style={{ marginTop: 28, fontSize: 28, lineHeight: 1.35, color: "rgba(255,255,255,0.82)" }}>
              Built for premium aquaculture operations with live monitoring, instant alerts, and smart control.
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "16px 26px",
                borderRadius: 18,
                background: "#00d4aa",
                color: "#04202b",
                fontSize: 26,
                fontWeight: 800,
              }}
            >
              Explore the Platform
            </div>
            <div style={{ fontSize: 24, color: "rgba(255,255,255,0.72)" }}>aquasmart-frontend-sovt.vercel.app</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}

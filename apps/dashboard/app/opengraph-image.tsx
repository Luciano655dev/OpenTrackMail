import { ImageResponse } from "next/og";

export const alt = "OpenTrackMail – open-source email tracking";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "72px 84px", color: "#17191d", background: "linear-gradient(135deg, #ffffff 45%, #e8f0fc 100%)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, color: "#5f83c5", fontSize: 30, fontWeight: 700 }}>
        <div style={{ width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, color: "white", background: "#5f83c5", fontSize: 18 }}>OT</div>
        OpenTrackMail
      </div>
      <div style={{ display: "flex", maxWidth: 950, marginTop: 52, fontSize: 72, lineHeight: 1.05, letterSpacing: "-3px", fontWeight: 700 }}>Know when your emails are opened.</div>
      <div style={{ display: "flex", marginTop: 30, color: "#56606d", fontSize: 30 }}>Open-source email tracking. No CRM required.</div>
    </div>,
    size,
  );
}

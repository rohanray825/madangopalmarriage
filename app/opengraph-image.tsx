import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Madangopal Matrimony devotional marriage portal preview";
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
          height: "100%",
          width: "100%",
          display: "flex",
          position: "relative",
          background:
            "radial-gradient(circle at 20% 20%, rgba(243, 210, 123, 0.45), transparent 28%), radial-gradient(circle at 80% 65%, rgba(191, 207, 137, 0.34), transparent 24%), linear-gradient(135deg, #f8f0e4 0%, #fff8ef 100%)",
          color: "#2e2417",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 36,
            display: "flex",
            borderRadius: 36,
            border: "1px solid rgba(155, 92, 23, 0.18)",
            background: "rgba(255, 250, 242, 0.82)",
            boxShadow: "0 25px 60px rgba(129, 93, 40, 0.16)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 72px",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div
              style={{
                height: 78,
                width: 78,
                borderRadius: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#9b5c17",
                color: "#fffaf2",
                fontSize: 40,
                fontWeight: 700,
              }}
            >
              ✿
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div
                style={{
                  fontSize: 22,
                  letterSpacing: "0.34em",
                  textTransform: "uppercase",
                  color: "#7b6449",
                }}
              >
                Hare Krishna
              </div>
              <div style={{ fontSize: 42, fontWeight: 700 }}>Madangopal Matrimony</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 860 }}>
            <div
              style={{
                display: "inline-flex",
                alignSelf: "flex-start",
                padding: "14px 24px",
                borderRadius: 9999,
                border: "1px solid rgba(155, 92, 23, 0.14)",
                fontSize: 22,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#7b6449",
                background: "rgba(255, 255, 255, 0.72)",
              }}
            >
              Devotional. Modern. Carefully guided.
            </div>

            <div style={{ fontSize: 72, lineHeight: 1.02, fontWeight: 700 }}>
              A marriage portal built for devotees.
            </div>

            <div style={{ fontSize: 28, lineHeight: 1.5, color: "#6f5a42", maxWidth: 860 }}>
              Verified profiles, thoughtful questionnaires, and private admin-led recommendations
              for Hare Krishna devotees.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              color: "#9b5c17",
              fontSize: 24,
              fontWeight: 600,
            }}
          >
            <span>Temple-inspired modern interface</span>
            <span style={{ color: "#7b6449", fontWeight: 500 }}>mgmatrimony.live</span>
          </div>
        </div>
      </div>
    ),
    size
  );
}

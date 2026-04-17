import { ImageResponse } from "next/og";

export const alt =
  "Summer Kids CrossFit Program at CrossFit Canvas — Ages 6–12, June 1 through July 31";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const photoData = await fetch(
    new URL("./og-photo.png", import.meta.url)
  ).then((res) => res.arrayBuffer());
  const photoBase64 = Buffer.from(photoData).toString("base64");
  const photoSrc = `data:image/png;base64,${photoBase64}`;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#000",
          fontFamily: '"Noto Sans", system-ui, sans-serif',
          position: "relative",
        }}
      >
        {/* Subtle gradient backdrop */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, #000 0%, #1a1a1a 55%, #000 100%)",
          }}
        />

        {/* Left editorial column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "60px 56px",
            width: "620px",
            height: "100%",
            zIndex: 2,
          }}
        >
          {/* Top markers */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
            }}
          >
            <span
              style={{
                fontSize: "56px",
                color: "#ffffff",
                fontWeight: 800,
                letterSpacing: "-2px",
                lineHeight: 1,
              }}
            >
              01
            </span>
            <div
              style={{
                height: "2px",
                width: "70px",
                background: "rgba(255,255,255,0.4)",
              }}
            />
            <span
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.7)",
                fontWeight: 700,
                letterSpacing: "6px",
                textTransform: "uppercase",
              }}
            >
              Summer 2026
            </span>
          </div>

          {/* Title block */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: "132px",
                fontWeight: 900,
                color: "#ffffff",
                lineHeight: 0.88,
                letterSpacing: "-4px",
                textTransform: "uppercase",
              }}
            >
              <span>Kids</span>
              <span>
                Cross
                <span
                  style={{
                    fontStyle: "italic",
                    fontWeight: 900,
                    color: "rgba(255,255,255,0.65)",
                  }}
                >
                  Fit
                </span>
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                marginTop: "28px",
              }}
            >
              <div
                style={{
                  height: "3px",
                  width: "48px",
                  background: "#ffffff",
                }}
              />
              <span
                style={{
                  fontSize: "16px",
                  color: "#ffffff",
                  fontWeight: 800,
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                }}
              >
                Ages 6–12 · Caldwell, ID
              </span>
            </div>
          </div>

          {/* Bottom stats */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.5)",
                fontWeight: 700,
                letterSpacing: "6px",
                textTransform: "uppercase",
              }}
            >
              Runs
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: "54px",
                fontWeight: 900,
                color: "#ffffff",
                letterSpacing: "-1px",
                lineHeight: 1,
              }}
            >
              <span>06.01</span>
              <span
                style={{
                  color: "rgba(255,255,255,0.35)",
                  margin: "0 18px",
                }}
              >
                —
              </span>
              <span>07.31</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginTop: "18px",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  color: "#ffffff",
                  fontWeight: 800,
                  letterSpacing: "5px",
                  textTransform: "uppercase",
                }}
              >
                CrossFit Canvas
              </span>
              <div
                style={{
                  height: "2px",
                  width: "40px",
                  background: "#ffffff",
                }}
              />
              <span
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.6)",
                  fontWeight: 700,
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                }}
              >
                Build · Move · Belong
              </span>
            </div>
          </div>
        </div>

        {/* Right: B&W photo with diagonal clip */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: "640px",
            overflow: "hidden",
            clipPath: "polygon(12% 0, 100% 0, 100% 100%, 0 100%, 0 20%)",
          }}
        >
          <img
            src={photoSrc}
            alt=""
            width={640}
            height={630}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "grayscale(100%) contrast(1.08)",
            }}
          />
          {/* Left-edge gradient to blend into black panel */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 30%)",
            }}
          />
        </div>

        {/* Echo outline frame behind photo */}
        <div
          style={{
            position: "absolute",
            right: "-14px",
            top: "14px",
            width: "640px",
            height: "630px",
            border: "2px solid rgba(255,255,255,0.25)",
            clipPath: "polygon(12% 0, 100% 0, 100% 100%, 0 100%, 0 20%)",
            zIndex: 1,
          }}
        />
      </div>
    ),
    { ...size }
  );
}

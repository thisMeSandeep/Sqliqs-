import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { APP_TITLE, DESCRIPTION } from "@/lib/seo";

export const alt = APP_TITLE;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Dynamic 1200×630 social card. 
export default async function OpengraphImage() {
  const icon = await readFile(join(process.cwd(), "public/icon-512.png"));
  const iconSrc = `data:image/png;base64,${icon.toString("base64")}`;

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
          backgroundColor: "#0A0A0A",
          backgroundImage:
            "radial-gradient(circle at 100% 0%, rgba(52,224,161,0.18), transparent 45%)",
        }}
      >
        <img src={iconSrc} width={120} height={120} alt="" style={{ borderRadius: 28 }} />
        <div
          style={{
            marginTop: 48,
            fontSize: 76,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            backgroundImage: "linear-gradient(90deg, #34E0A1, #2EE0B8, #22D3EE)",
            backgroundClip: "text",
            color: "transparent",
            lineHeight: 1.05,
          }}
        >
          Ask your database in plain English
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 32,
            color: "#A3A3A3",
            maxWidth: 900,
            lineHeight: 1.35,
          }}
        >
          {DESCRIPTION}
        </div>
      </div>
    ),
    { ...size }
  );
}

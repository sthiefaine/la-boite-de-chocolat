import { ImageResponse } from "next/og";
import {
  OGImageLayout,
  DefaultContent,
} from "@/components/OGImageLayout/OGImageLayout";

export const runtime = "edge";

export async function GET() {
  try {
    return new ImageResponse(
      (
        <OGImageLayout
          leftContent={
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
              }}
            >
              {/* Icône principale */}
              <div
                style={{
                  width: "150px",
                  height: "150px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #6b3e26 0%, #a67c52 50%, #d4a574 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "4px solid rgba(255, 255, 255, 0.8)",
                  boxShadow:
                    "0 15px 40px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.1)",
                  position: "relative",
                }}
              >
                {/* Icône moderne */}
                <div
                  style={{
                    fontSize: "60px",
                    fontWeight: "900",
                    color: "white",
                    textShadow: "0 4px 8px rgba(0, 0, 0, 0.8)",
                    transform: "rotate(-5deg)",
                  }}
                >
                  🎬
                </div>
              </div>
            </div>
          }
          rightContent={
            <DefaultContent
              title="LA BOÎTE DE CHOCOLAT"
              subtitle="PODCAST CINÉMA"
              description="Du cinéma, de la mauvaise foi, un soupçon de beauferie"
            />
          }
        />
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response("Failed to generate OG Image", { status: 500 });
  }
}

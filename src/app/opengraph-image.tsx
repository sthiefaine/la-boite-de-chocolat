import { ImageResponse } from "next/og";
import { DefaultTemplate } from "@/components/OGImageLayout/OGImageLayout";

export const runtime = "edge";
export const contentType = "image/png";
export const size = {
  width: 1200,
  height: 630,
};
export const alt = "La Boîte de Chocolat - Podcast sur le cinéma";

export default function Image() {
  return new ImageResponse(<DefaultTemplate />, {
    ...size,
  });
}

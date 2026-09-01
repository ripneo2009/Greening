import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Greening - 반려식물 케어",
    short_name: "Greening",
    description: "내 공간에 맞는 반려식물을 찾고 오래 함께 관리하세요.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f4f7ee",
    theme_color: "#263f39",
    lang: "ko-KR",
    orientation: "portrait-primary",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}

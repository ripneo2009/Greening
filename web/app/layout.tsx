import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { PwaRegister } from "./pwa-register";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") || "http";
  const origin = `${protocol}://${host}`;
  return {
    title: "Greening | 오래 함께할 반려식물 찾기",
    description: "공간과 생활 리듬에 맞는 반려식물을 추천받고 함께할 준비를 시작해 보세요.",
    applicationName: "Greening",
    manifest: "/manifest.webmanifest",
    appleWebApp: { capable: true, statusBarStyle: "default", title: "Greening" },
    icons: { icon: "/icon.svg", apple: "/icon.svg" },
    robots: { index: false, follow: false },
    openGraph: {
      title: "Greening | 오래 함께할 초록을 찾다",
      description: "생존 가능성부터 살펴보는 나만의 반려식물 추천 경험",
      images: [`${origin}/og.png`],
    },
    twitter: {
      card: "summary_large_image",
      title: "Greening | 오래 함께할 초록을 찾다",
      description: "생존 가능성부터 살펴보는 나만의 반려식물 추천 경험",
      images: [`${origin}/og.png`],
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="ko"><body>{children}<PwaRegister /></body></html>;
}

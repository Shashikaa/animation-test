import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteProvider } from "../app/context/SiteContext";
import SmoothScroll from "../components/SmoothScroll";
import HeaderWrapper from "../components/HeaderWrapper";
import NavMenuWrapper from "../components/NavMenuWrapper";
import PreloaderWrapper from "../components/PreloaderWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Animation test site",
  description: "A scroll-driven animation test site built with Next.js and GSAP.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="preloading min-h-full flex flex-col">
        <SiteProvider>
          <SmoothScroll>
            <PreloaderWrapper />
            <HeaderWrapper />
            <NavMenuWrapper />
            {children}
          </SmoothScroll>
        </SiteProvider>
      </body>
    </html>
  );
}
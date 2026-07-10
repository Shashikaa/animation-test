import type { Metadata } from "next";
import { Instrument_Sans, Cormorant_Garamond } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { SiteProvider } from "../app/context/SiteContext";
import HeaderWrapper from "../components/HeaderWrapper";
import NavMenuWrapper from "../components/NavMenuWrapper";
import PreloaderToggle from "../components/PreloaderToggle";
import SmoothScroll from "../components/SmoothScroll";

const instrumentSans = Instrument_Sans({
  subsets:   ["latin"],
  weight:    ["400", "500", "600", "700"],
  style:     ["normal", "italic"],
  variable:  "--font-body",
  display:   "swap" 
});

const cormorantGaramond = Cormorant_Garamond({
  subsets:   ["latin"],
  weight:    ["300", "400", "500", "600", "700"],
  style:     ["normal", "italic"],
  variable:  "--font-cormorant",
  display:   "swap" 
});

const canelaText = localFont({
  src: [
    { path: "../../public/fonts/CanelaText-Thin-Trial.otf",      weight: "100", style: "normal" },
    { path: "../../public/fonts/Canela-Light-Trial.otf",         weight: "300", style: "normal" },
    { path: "../../public/fonts/CanelaText-Regular-Trial.otf",   weight: "400", style: "normal" },
    { path: "../../public/fonts/Canela-RegularItalic-Trial.otf", weight: "400", style: "italic" },
  ],
  variable: "--font-display",
  display:  "swap",
});

export const metadata: Metadata = {
  title:       "Grand Pools",
  description: "Crafting Custom Swimming Pools with Style, Function, and Quality.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${instrumentSans.variable} ${cormorantGaramond.variable} ${canelaText.variable} antialiased`}>
      {/* Note: "preloading" class is safely handled and stripped by your Preloader toggle logic */}
      <body className="flex flex-col min-h-screen preloading" suppressHydrationWarning>
        <SiteProvider>
          <SmoothScroll>
            <HeaderWrapper />
            <NavMenuWrapper />

            <main className="site-root flex flex-col flex-1 w-full overflow-x-hidden">
              {children}
            </main>
          </SmoothScroll>

          {/* This component safely captures performance metrics, lag spikes, and timeouts */}
          <PreloaderToggle />
        </SiteProvider>
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Instrument_Sans, Cormorant_Garamond } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { SiteProvider } from "../app/context/SiteContext";
import SmoothScroll from "../components/SmoothScroll";
import HeaderWrapper from "../components/HeaderWrapper";
import NavMenuWrapper from "../components/NavMenuWrapper";
import PreloaderWrapper from "../components/PreloaderWrapper";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-body",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

const canelaText = localFont({
  src: [
    {
      path: "../../public/fonts/CanelaText-Regular-Trial.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Canela-RegularItalic-Trial.otf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Grand Pools",
  description: "Crafting Custom Swimming Pools with Style, Function, and Quality. Transform Your Outdoor Space with Our Expertly Designed Pools.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-preloading=""  
       className={`${instrumentSans.variable} ${cormorantGaramond.variable} ${canelaText.variable} h-full antialiased`}
    >
      <body className="preloading min-h-full flex flex-col">
        <SiteProvider>
          <SmoothScroll>
            <HeaderWrapper />
            <NavMenuWrapper />
            {children}
          </SmoothScroll>
        </SiteProvider>
      </body>
    </html>
  );
}
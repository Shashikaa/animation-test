import type { Metadata } from "next";
import { Instrument_Sans, Cormorant_Garamond } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { SiteProvider } from "../app/context/SiteContext";
import SmoothScroll from "../components/SmoothScroll";
import HeaderWrapper from "../components/HeaderWrapper";
import NavMenuWrapper from "../components/NavMenuWrapper";

const instrumentSans = Instrument_Sans({
  subsets:  ["latin"],
  weight:   ["400", "500", "600", "700"],
  style:    ["normal", "italic"],
  variable: "--font-body",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets:  ["latin"],
  weight:   ["300", "400", "500", "600", "700"],
  style:    ["normal", "italic"],
  variable: "--font-cormorant",
});

const canelaText = localFont({
  src: [
    {
      path:   "../../public/fonts/CanelaText-Thin-Trial.otf",
      weight: "100",
      style:  "normal",
    },
    {
      path:   "../../public/fonts/Canela-Light-Trial.otf",
      weight: "300",
      style:  "normal",
    },
    {
      path:   "../../public/fonts/CanelaText-Regular-Trial.otf",
      weight: "400",
      style:  "normal",
    },
    {
      path:   "../../public/fonts/Canela-RegularItalic-Trial.otf",
      weight: "400",
      style:  "italic",
    },
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
    <html
      lang="en"
      data-preloading=""
      className={`${instrumentSans.variable} ${cormorantGaramond.variable} ${canelaText.variable} antialiased`}
    >
      <head>
        {/* Set --app-height before any JS or CSS paint. Runs synchronously
            so GSAP/Lenis never see a stale value. Uses innerHeight which
            is the viewport height before any scroll expansion. */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var h = window.innerHeight;
            document.documentElement.style.setProperty('--app-height', h + 'px');
          })();
        `}} />
      </head>
      <body className="flex flex-col">
        <SiteProvider>
          <SmoothScroll>
            <div className="site-root flex flex-col flex-1 overflow-x-hidden">
              <HeaderWrapper />
              <NavMenuWrapper />
              {children}
            </div>
          </SmoothScroll>
        </SiteProvider>
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Instrument_Sans, Cormorant_Garamond } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { SiteProvider } from "../app/context/SiteContext";
import SmoothScroll from "../components/SmoothScroll";
import HeaderWrapper from "../components/HeaderWrapper";
import NavMenuWrapper from "../components/NavMenuWrapper";
import Footer from "../components/Footer";

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
      path: "../../public/fonts/Canela-Light-Trial.otf",
      weight: "300",
      style: "normal",
    },
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
  description:
    "Crafting Custom Swimming Pools with Style, Function, and Quality. Transform Your Outdoor Space with Our Expertly Designed Pools.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-preloading=""
      className={`${instrumentSans.variable} ${cormorantGaramond.variable} ${canelaText.variable} antialiased`}
      /*
       * FIX: h-full REMOVED from <html>.
       * h-full sets height:100% which creates a fixed-height root context.
       * Lenis requires html/body to have height:auto so it can measure
       * the true document scroll height. h-full was capping the measured
       * height at the viewport, making ScrollTrigger calculate wrong
       * pin end positions and causing Lenis to think the scroll limit
       * is 0 on first render.
       *
       * The Lenis CSS rule "html.lenis, html.lenis body { height: auto }"
       * in globals.css fights this — but Tailwind's h-full (height:100%)
       * has higher specificity via the class and was winning.
       */
    >
      <body
        className={`
          preloading
          flex flex-col
        `}
        /*
         * FIX: min-h-full REMOVED from body.
         * Same reason as h-full on html — forces a height context that
         * breaks Lenis scroll limit calculation.
         *
         * FIX: overflow-x:hidden moved here from body CSS in globals.css.
         * In Next.js App Router there is no #__next wrapper — children
         * render directly inside <body>. We contain horizontal overflow
         * on body but ONLY overflow-x, never overflow-y, and never the
         * shorthand `overflow:hidden` — that would block compositing.
         *
         * Tailwind class "overflow-x-hidden" maps to overflow-x:hidden
         * which is safe and does not defeat GPU layer promotion.
         */
      >
        <SiteProvider>
          <SmoothScroll>
            {/*
              FIX: site-root wrapper replaces the missing #__next.
              This div is the actual scroll content container.
              overflow-x-hidden here is belt-and-suspenders to catch
              any section that bleeds horizontally.
              flex-col + flex-1 makes Footer push to bottom correctly
              without needing min-h-full on body.
            */}
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
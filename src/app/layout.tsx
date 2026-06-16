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
    { path: "../../public/fonts/CanelaText-Thin-Trial.otf",     weight: "100", style: "normal" },
    { path: "../../public/fonts/Canela-Light-Trial.otf",        weight: "300", style: "normal" },
    { path: "../../public/fonts/CanelaText-Regular-Trial.otf",  weight: "400", style: "normal" },
    { path: "../../public/fonts/Canela-RegularItalic-Trial.otf",weight: "400", style: "italic" },
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
        {/*
          Runs synchronously before any CSS or JS — guarantees --app-height
          is a real px value before GSAP or React touch it.

          Touch devices: visualViewport.height = usable area BELOW the
          browser address bar. This is the value we want to lock forever
          so the pinned layout never jumps when the bar shows/hides.

          Desktop / DevTools emulator: ontouchstart is absent so we fall
          back to window.innerHeight which equals visualViewport.height
          on desktop anyway.

          We also listen for the FIRST touchstart to re-measure once —
          on some Android browsers visualViewport.height at document-start
          still includes the bar. The touchstart fires after the bar has
          settled, giving us the correct locked value.
        */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function () {
            var vv = window.visualViewport;
            var h  = (vv ? vv.height : window.innerHeight);
            document.documentElement.style.setProperty('--app-height', h + 'px');

            // One-time re-lock on first touch (Android bar settle fix)
            function onFirstTouch() {
              var vv2 = window.visualViewport;
              var h2  = (vv2 ? vv2.height : window.innerHeight);
              document.documentElement.style.setProperty('--app-height', h2 + 'px');
              window.removeEventListener('touchstart', onFirstTouch);
            }
            window.addEventListener('touchstart', onFirstTouch, { once: true, passive: true });
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
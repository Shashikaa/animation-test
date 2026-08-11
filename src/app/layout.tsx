import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Cormorant_Garamond } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { SiteProvider } from "../app/context/SiteContext";
import HeaderWrapper from "../components/HeaderWrapper";
import NavMenuWrapper from "../components/NavMenuWrapper";
import PreloaderToggle from "../components/PreloaderToggle";
import SmoothScroll from "../components/SmoothScroll";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const canelaText = localFont({
  src: [
    { path: "../../public/fonts/CanelaText-Thin-Trial.otf", weight: "100", style: "normal" },
    { path: "../../public/fonts/Canela-Light-Trial.otf", weight: "300", style: "normal" },
    { path: "../../public/fonts/CanelaText-Regular-Trial.otf", weight: "400", style: "normal" },
    { path: "../../public/fonts/Canela-RegularItalic-Trial.otf", weight: "400", style: "italic" },
  ],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Grand Pools",
  description: "Crafting Custom Swimming Pools with Style, Function, and Quality.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html 
      lang="en" 
      className={`${instrumentSans.variable} ${cormorantGaramond.variable} ${canelaText.variable} antialiased preloading`}
      style={{ backgroundColor: "#162D24", minHeight: "100vh" }}
    >
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body {
                background: #162D24 !important;
                background-color: #162D24 !important;
                margin: 0 !important;
                padding: 0 !important;
                min-height: 100vh !important;
              }

              @font-face {
                font-family: 'CanelaText';
                font-display: block;
              }

              html.preloading,
              body.preloading {
                overflow: hidden !important;
                min-height: 100vh !important;
              }

              html.preloading .site-root,
              body.preloading .site-root,
              html.preloading .home-desktop-scope {
                opacity: 0 !important;
                visibility: hidden !important;
                pointer-events: none !important;
              }

              html:not(.show-brand-preloader) #brand-preloader-root {
                display: none !important;
              }

              html:not(.show-fade-preloader) #fade-preloader-root {
                display: none !important;
              }
            `,
          }}
        />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var p = window.location.pathname;
                  if (p === '/terms' || p === '/privacy-policy') {
                    document.documentElement.classList.remove('preloading');
                    return;
                  }
                  
                  document.documentElement.classList.add('preloading');
                  var isSeen = sessionStorage.getItem('hasSeenBrandPreloader') === 'true';

                  if (p === '/' && !isSeen) {
                    document.documentElement.classList.add('show-brand-preloader');
                  } else {
                    document.documentElement.classList.add('show-fade-preloader');
                  }
                } catch (e) {
                  document.documentElement.classList.add('show-fade-preloader');
                }
              })();
            `,
          }}
        />

        <link rel="preload" href="/fonts/CanelaText-Regular-Trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/Canela-Light-Trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
      </head>
      <body 
        className="flex flex-col min-h-[100vh]" 
        style={{ backgroundColor: "#162D24" }}
        suppressHydrationWarning
      >
        <SiteProvider>
          <SmoothScroll>
            <HeaderWrapper />
            <NavMenuWrapper />

            <main className="site-root flex flex-col flex-1 w-full overflow-x-clip min-h-[100vh]">
              {children}
            </main>
          </SmoothScroll>

          <PreloaderToggle />
        </SiteProvider>
      </body>
    </html>
  );
}
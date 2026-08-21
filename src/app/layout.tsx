import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Cormorant_Garamond } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

import { SiteProvider } from "./context/SiteContext";
import HeaderWrapper from "../components/HeaderWrapper";
import NavMenuWrapper from "../components/NavMenuWrapper";
import PreloaderToggle from "../components/PreloaderToggle";
import SmoothScroll from "../components/SmoothScroll";

const SITE_URL = "https://www.grandpools.com.au";

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
    {
      path: "../../public/fonts/Canela-Thin.ttf",
      weight: "100",
      style: "normal",
    },
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
  metadataBase: new URL(SITE_URL),

title: {
  default: "Grand Pools",
  template: "Grand Pools - %s",
},

  description:
    "Grand Pools designs and builds custom swimming pools in Melbourne. Discover thoughtfully crafted pools combining style, quality and functionality.",

  applicationName: "Grand Pools",

  keywords: [
    "pool builders Melbourne",
    "custom pools Melbourne",
    "swimming pool builders Melbourne",
    "luxury pools Melbourne",
    "concrete pools Melbourne",
    "pool construction Melbourne",
    "pool design Melbourne",
    "Grand Pools",
  ],

  authors: [{ name: "Grand Pools", url: SITE_URL }],
  creator: "Grand Pools",
  publisher: "Grand Pools",

  category: "Swimming Pool Construction",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_AU",
    url: SITE_URL,
    siteName: "Grand Pools",
    title: "Grand Pools | Custom Pool Builders Melbourne",
    description:
      "Custom swimming pools designed and built for beautiful Melbourne homes.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Custom swimming pool designed and built by Grand Pools",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Grand Pools | Custom Pool Builders Melbourne",
    description:
      "Custom swimming pools designed and built for beautiful Melbourne homes.",
    images: ["/og-image.jpg"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },

  manifest: "/site.webmanifest",

  other: {
    "geo.region": "AU-VIC",
    "geo.placename": "Melbourne",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#162D24",
};

const businessSchema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "HomeAndConstructionBusiness"],
  "@id": `${SITE_URL}/#business`,
  name: "Grand Pools",
  url: SITE_URL,
  email: "admin@grandpools.com.au",
  description:
    "Grand Pools designs and builds custom swimming pools for homes across Melbourne.",
  image: `${SITE_URL}/og-image.jpg`,
  logo: `${SITE_URL}/icon.png`,
  sameAs: ["https://www.instagram.com/grandpools_aus/"],
  areaServed: {
    "@type": "City",
    name: "Melbourne",
    containedInPlace: {
      "@type": "State",
      name: "Victoria",
    },
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Melbourne",
    addressRegion: "VIC",
    addressCountry: "AU",
  },
  knowsAbout: [
    "Custom swimming pools",
    "Swimming pool construction",
    "Pool design",
    "Concrete pools",
    "Pool renovations",
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: "Grand Pools",
  inLanguage: "en-AU",
  publisher: {
    "@id": `${SITE_URL}/#business`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-AU"
      className={`${instrumentSans.variable} ${cormorantGaramond.variable} ${canelaText.variable} antialiased`}
      style={{ backgroundColor: "#162D24", minHeight: "100vh" }}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(businessSchema).replace(/</g, "\\u003c"),
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema).replace(/</g, "\\u003c"),
          }}
        />

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

                  var isSeen =
                    sessionStorage.getItem('hasSeenBrandPreloader') === 'true';

                  if (p === '/' && !isSeen) {
                    document.documentElement.classList.add(
                      'show-brand-preloader'
                    );
                  } else {
                    document.documentElement.classList.add(
                      'show-fade-preloader'
                    );
                  }
                } catch (e) {
                  document.documentElement.classList.add(
                    'show-fade-preloader'
                  );
                }
              })();
            `,
          }}
        />

        <link
          rel="preload"
          href="/fonts/CanelaText-Regular-Trial.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />

        <link
          rel="preload"
          href="/fonts/Canela-Light-Trial.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
      </head>

      <body
        className="flex min-h-[100vh] flex-col"
        style={{ backgroundColor: "#162D24" }}
        suppressHydrationWarning
      >
        <SiteProvider>
          <SmoothScroll>
            <HeaderWrapper />
            <NavMenuWrapper />

            <main className="site-root flex min-h-[100vh] w-full flex-1 flex-col overflow-x-hidden">
              {children}
            </main>
          </SmoothScroll>

          <PreloaderToggle />
        </SiteProvider>
      </body>
    </html>
  );
}
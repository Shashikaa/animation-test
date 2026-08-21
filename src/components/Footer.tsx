"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      window.location.reload();
    }
  };

  return (
    <>
      <footer className="footer-container">
        <div className="footer-wrapper">
          {/* ROW 1: Logo */}
          <div className="footer-logo-row">
            <Link
              href="/"
              onClick={handleLogoClick}
              className="footer-logo-link"
            >
              <Image
                src="/Footer.svg"
                alt="Grand Pools"
                width={380}
                height={80}
                className="footer-logo-img"
                priority
              />
            </Link>
          </div>

          {/* ROW 2: Links */}
          <div className="footer-links-row">
            {/* Nav Columns */}
            <div className="footer-nav-columns">
              {/* Col 1 */}
              <nav className="footer-nav-col">
                <Link href="/">Home</Link>
                <Link href="/about">About Us</Link>
                <Link href="/services">Services</Link>
                <Link href="/projects">Projects</Link>
                <Link href="/contact">Contact Us</Link>
              </nav>

              {/* Col 2 */}
              <nav className="footer-nav-col footer-nav-col-right">
                <Link href="/services/residential-pools-construction">
                  Residential Pools Construction
                </Link>
                <Link href="/services/pool-equipment-and-installation">
                  Pool Equipment &amp; Installation
                </Link>
                <Link href="/services/commercial-pool-construction">
                  Commercial Pool Construction
                </Link>
              </nav>
            </div>

            {/* Social Icons */}
            <div className="footer-social-col">
              <div className="footer-social-icons">
                <a
                  href="mailto:admin@grandpools.com.au"
                  aria-label="Email"
                  className="social-icon-link"
                >
                  <Image
                    src="/email.svg"
                    alt="Email"
                    width={24}
                    height={24}
                  />
                </a>
                <a
                  href="https://www.instagram.com/grandpools_aus/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="social-icon-link"
                >
                  <Image
                    src="/ig.svg"
                    alt="Instagram"
                    width={27}
                    height={27}
                  />
                </a>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="footer-divider" />

          {/* ROW 3: Bottom Row */}
          <div className="footer-bottom-row">
            {/* Mobile Policy Links */}
            <div className="footer-mobile-policies">
              <Link href="/terms-of-use">Terms of Use</Link>
              <Link href="/privacy-policy">Privacy Policy</Link>
            </div>

            {/* Desktop Copyright */}
            <span className="footer-desktop-copyright">
              © 2026 Grand Pools. All Rights Reserved.
            </span>

            {/* Desktop Policy Links */}
            <div className="footer-desktop-policies">
              <Link href="/terms-of-use">Terms of Use</Link>
              <Link href="/privacy-policy">Privacy Policy</Link>
            </div>

            {/* Attribution & Mobile Copyright */}
            <div className="footer-attribution-col">
              <span>
                Design &amp; Development by{" "}
                <a
                  href="https://tactik.com.au/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Tactik.
                </a>
              </span>

              <span className="footer-mobile-copyright">
                © 2026 Grand Pools. All Rights Reserved.
              </span>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .footer-container {
          position: relative;
          width: 100%;
          z-index: 20;
          box-sizing: border-box;
          color: #f4ebe4;
          font-family: var(--font-body);
        }

        .footer-wrapper {
          width: 100%;
          padding: 28px 20px 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          background: linear-gradient(to bottom right, #162d24, #094146);
          transform: translate3d(0, 0, 0);
          isolation: isolate;
        }

        .footer-logo-row {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          overflow: hidden;
          margin-bottom: 28px;
          position: relative;
          z-index: 20;
        }

        .footer-logo-link {
          display: block;
          width: 100%;
          max-width: 380px;
          position: relative;
          z-index: 20;
        }

        .footer-logo-img {
          width: 100%;
          height: auto;
          display: block;
          cursor: pointer;
          pointer-events: auto;
        }

        .footer-links-row {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 24px;
        }

        .footer-nav-columns {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          width: 100%;
          font-size: 14px;
        }

        .footer-nav-col {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }

        .footer-nav-col-right {
          align-items: flex-end;
          text-align: right;
        }

        .footer-nav-col :global(a),
        .footer-desktop-policies :global(a),
        .footer-mobile-policies :global(a),
        .footer-attribution-col :global(a) {
          transition: opacity 0.2s ease;
        }

        .footer-nav-col :global(a:hover),
        .footer-desktop-policies :global(a:hover),
        .footer-mobile-policies :global(a:hover),
        .footer-attribution-col :global(a:hover),
        .social-icon-link:hover {
          opacity: 0.7;
        }

        .footer-social-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }

        .footer-social-icons {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-top: 12px;
        }

        .social-icon-link {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.2s ease;
        }

        .footer-divider {
          width: 100%;
          height: 1px;
          background-color: rgba(244, 235, 228, 0.2);
          margin-bottom: 20px;
        }

        .footer-bottom-row {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          gap: 32px;
          font-size: 14px;
        }

        .footer-mobile-policies {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }

        .footer-desktop-copyright {
          display: none;
        }

        .footer-desktop-policies {
          display: none;
        }

        .footer-attribution-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          gap: 16px;
        }

        .footer-mobile-copyright {
          display: inline;
          text-align: center;
          width: 100%;
        }

        @media (min-width: 768px) {
          .footer-wrapper {
            padding-left: 30px;
            padding-right: 30px;
            padding-top: 40px;
          }

          .footer-nav-columns {
            font-size: 16px;
          }

          .footer-bottom-row {
            font-size: 16px;
          }

          .footer-attribution-col {
            flex-direction: row;
            gap: 24px;
          }
        }

        @media (min-width: 1024px) {
          .footer-links-row {
            flex-direction: row;
            align-items: flex-start;
            gap: 0;
            margin-bottom: 48px;
          }

          .footer-nav-columns {
            width: 60%;
          }

          .footer-nav-col-right {
            align-items: flex-start;
            text-align: left;
          }

          .footer-social-col {
            align-items: flex-end;
            width: auto;
          }

          .footer-bottom-row {
            flex-direction: row;
            gap: 0;
          }

          .footer-mobile-policies {
            display: none;
          }

          .footer-desktop-copyright {
            display: inline;
          }

          .footer-desktop-policies {
            display: flex;
            gap: 24px;
            align-items: center;
          }

          .footer-attribution-col {
            width: auto;
          }

          .footer-mobile-copyright {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
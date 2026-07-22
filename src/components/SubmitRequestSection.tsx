"use client";
import { useState } from "react";


export default function SubmitRequestSection({ onClose }: { onClose?: () => void }) {
  const [activeTab, setActiveTab] = useState<"request" | "callback">("request");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Instrument+Sans:wght@400;500&display=swap');

        .sar-section::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        .sar-left h2,
        .sar-left h2.font-display {
          font-weight: 300 !important;
          font-variation-settings: 'wght' 300;
          margin: 0;
        }

        /* Layout */
        .sar-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr;
        }
        .sar-left {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 0 60px 64px 72px;
          min-height: 100svh;
        }
        .sar-right {
          display: flex;
          flex-direction: column;
          padding: 52px 72px 64px 48px;
          min-height: 100svh;
        }

        /* Tab pill indicator */
        .sar-tabs {
          display: inline-flex;
          position: relative;
          border: 1px solid #F4EEDF66;
          border-radius: 100px;
          padding: 0;
          background: transparent;
        }
        .sar-tabs::after {
          content: '';
          position: absolute;
          top: -1px; bottom: -1px;
          width: 50%;
          border-radius: 100px;
          border: 1px solid #F4EEDF;
          pointer-events: none;
          transition: left 0.35s cubic-bezier(0.4,0,0.2,1);
          z-index: 2;
        }
        .sar-tabs[data-active="request"]::after  { left: -1px; }
        .sar-tabs[data-active="callback"]::after { left: calc(50% + 1px); }

        /* Tab buttons */
        .sar-tab {
          background: transparent;
          border: none;
          cursor: pointer;
          font-family: 'Instrument Sans', sans-serif;
          font-size: 12px;
          font-weight: 400;
          text-transform: uppercase;
          padding: 15px 2px;
          border-radius: 100px;
          color: #F4EEDF;
          position: relative;
          overflow: hidden;
          white-space: nowrap;
          perspective: 400px;
          z-index: 1;
          transition: color 0.25s;
          min-width: 110px;
          text-align: center;
        }
        .sar-tab.active { color: #F4EEDF; }

        .sar-tab:first-child:hover {
          background: linear-gradient(90deg, rgba(244,238,223,0.24) 0%, rgba(244,238,223,0.00) 100%);
        }
        .sar-tab:last-child:hover {
          background: linear-gradient(270deg, rgba(244,238,223,0.24) 0%, rgba(244,238,223,0.00) 100%);
        }

        /* Close button */
        .sar-close {
          width: 44px; height: 44px;
          border-radius: 50%;
          background: #ffffff;
          border: 1.5px solid #1a1a1a;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #1a1a1a;
          font-size: 13px;
          flex-shrink: 0;
          transition: background 0.22s, color 0.22s, border-color 0.22s;
          font-family: inherit;
          position: relative;
          overflow: hidden;
          perspective: 400px;
        }
        .sar-close:hover { background: #1a1a1a; color: #ffffff; }

        /* Submit button */
        .sar-submit-btn {
          background: #F4EEDF;
          border: 1px solid #F4EEDF;
          border-radius: 100px;
          cursor: pointer;
          font-family: 'Instrument Sans', sans-serif;
          font-size: 12px;
          font-weight: 400;
          text-transform: uppercase;
          color: #19211C;
          padding: 18px 18px;
          white-space: nowrap;
          overflow: hidden;
          position: relative;
          perspective: 600px;
          transition: background 0.28s ease, border-color 0.28s ease;
        }
        .sar-submit-btn:hover {
          background: rgba(244,238,223,0.85);
          border-color: rgba(244,238,223,0.85);
        }
        .sar-submit-btn .btn-label,
        .sar-submit-btn .btn-label-hover { color: #19211C; }

        /* Rotate animation */
        .btn-label {
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.5s cubic-bezier(0.22,1,0.36,1), opacity 0.45s cubic-bezier(0.22,1,0.36,1);
          transform: rotateX(0deg);
          transform-origin: center top;
          opacity: 1;
          backface-visibility: hidden;
          will-change: transform, opacity;
        }
        .btn-label-hover {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.5s cubic-bezier(0.22,1,0.36,1), opacity 0.45s cubic-bezier(0.22,1,0.36,1);
          transform: rotateX(90deg);
          transform-origin: center bottom;
          opacity: 0;
          backface-visibility: hidden;
          will-change: transform, opacity;
        }
        .sar-tab:hover .btn-label,
        .sar-close:hover .btn-label,
        .sar-submit-btn:hover .btn-label { transform: rotateX(-90deg); opacity: 0; }
        .sar-tab:hover .btn-label-hover,
        .sar-close:hover .btn-label-hover,
        .sar-submit-btn:hover .btn-label-hover { transform: rotateX(0deg); opacity: 1; }

        /* Form fields */
        .sar-field { padding-bottom: 32px; }
        .sar-field.span-2 { grid-column: 1 / -1; width: 100%; }

        .sar-input {
          background: transparent;
          border: none;
          border-bottom: 1px solid #F4EEDFB2;
          color: #F4EEDF;
          font-size: 16px;
          font-family: 'Instrument Sans', sans-serif;
          letter-spacing: 0.03em;
          padding: 8px 0;
          width: 100%;
          transition: border-bottom-color 0.25s;
        }
        .sar-input::placeholder { color: #F4EEDFB2; }
        .sar-input:focus { outline: none; border-bottom-color: rgba(244,238,223,0.65); }

        .sar-select-wrap { position: relative; width: 100%; }
        .sar-select {
          -webkit-appearance: none; appearance: none;
          background: transparent;
          border: none;
          border-bottom: 1px solid #F4EEDFB2;
          font-size: 16px;
          font-family: 'Instrument Sans', sans-serif;
          letter-spacing: 0.03em;
          padding: 8px 22px 8px 0;
          width: 100%;
          cursor: pointer;
          transition: border-bottom-color 0.25s;
          color: #F4EEDFB2;
        }
        .sar-select.has-value { color: #F4EEDF; }
        .sar-select:focus { outline: none; border-bottom-color: rgba(244,238,223,0.65); }
        .sar-select option { background: #163e3e; color: #F4EEDF; }

        /* ── MOBILE LAYOUT ── */
        @media (max-width: 900px) {
          .sar-section {
            grid-template-columns: 1fr;
            grid-template-rows: auto;
          }

          /* Hide the left "Submit a request" panel on mobile */
          .sar-left {
            display: none;
          }

          .sar-right {
            min-height: 100svh;
            padding: 0 32px 60px;
          }

          /* Top row: tabs left, close button right — one line */
          .sar-top-row {
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
            width: 100%;
            padding-top: 32px;
            margin-bottom: 0 !important;
          }

          /* Form collapses to single column */
          .sar-grid {
            grid-template-columns: 1fr !important;
          }
          .sar-field {
            padding-bottom: 24px;
          }

          /* Privacy text: right-aligned */
          .sar-bottom-row {
            justify-content: flex-end !important;
            align-items: flex-end !important;
          }
          .sar-bottom-row p {
            text-align: right !important;
          }
        }

        @media (max-width: 580px) {
          .sar-field.span-2 { grid-column: 1 / -1; }
        }
      `}</style>

      <section
        id="submit-request-section"
        className="sar-section relative w-full overflow-hidden z-10000 !h-full"
        style={{
          fontFamily: "'Instrument Sans', sans-serif",
          background: "linear-gradient(160deg, #1d5050 0%, #1a4a4a 35%, #163e3e 65%, #112e30 100%)",
        }}
      >
        <img
          src="/IntroReveal.webp"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover z-0"
        />



        {/* LEFT */}
        <div className="sar-left relative z-10 !font-display !font-[300] !leading-1.2">
          <h2 style={{ fontSize: "72px", lineHeight: 0.9, fontWeight: 300, margin: 0 }}>
            Submit<br />a request
          </h2>
        </div>

        {/* RIGHT */}
        <div className="sar-right relative z-10">

          {/* Top row — tabs + close button */}
          <div className="sar-top-row flex items-center justify-between mb-auto">
            <div className="sar-tabs" data-active={activeTab}>
              <button
                className={`sar-tab ${activeTab === "request" ? "active" : ""}`}
                onClick={() => setActiveTab("request")}
              >
                <span className="btn-label">Request</span>
                <span className="btn-label-hover">Request</span>
              </button>
              <button
                className={`sar-tab ${activeTab === "callback" ? "active" : ""}`}
                onClick={() => setActiveTab("callback")}
              >
                <span className="btn-label">Call Back</span>
                <span className="btn-label-hover">Call Back</span>
              </button>
            </div>

            {onClose && (
              <button className="sar-close" onClick={onClose} aria-label="Close">
                <span className="btn-label">✕</span>
                <span className="btn-label-hover">✕</span>
              </button>
            )}
          </div>

          {/* Form area + submit button */}
          <div className="flex flex-col flex-1 justify-center py-12">
            {activeTab === "request" ? (
              <div className="sar-grid grid grid-cols-2 gap-x-14">
                <div className="sar-field"><SarInput placeholder="Full Name" /></div>
                <div className="sar-field"><SarInput placeholder="Email" type="email" /></div>
                <div className="sar-field"><SarInput placeholder="Phone No." type="tel" /></div>
                <div className="sar-field"><SarInput placeholder="Post Code" /></div>
                <div className="sar-field">
                  <SarSelect placeholder="Budget Type" options={["Residential", "Commercial", "Mixed Use"]} />
                </div>
                <div className="sar-field">
                  <SarSelect placeholder="Budget Range" options={["$10k – $30k", "$30k – $75k", "$75k – $150k", "$150k+"]} />
                </div>
                <div className="sar-field">
                  <SarSelect placeholder="Preferred Contract Method" options={["Fixed Price", "Cost Plus", "Design & Build", "Negotiated"]} />
                </div>
              </div>
            ) : (
              <div className="sar-grid grid grid-cols-2 gap-x-14">
                <div className="sar-field"><SarInput placeholder="Full Name" /></div>
                <div className="sar-field"><SarInput placeholder="Phone No." type="tel" /></div>
                <div className="sar-field">
                  <SarSelect placeholder="Budget Type" options={["Residential", "Commercial", "Mixed Use"]} />
                </div>
                <div className="sar-field">
                  <SarSelect placeholder="Budget Range" options={["$10k – $30k", "$30k – $75k", "$75k – $150k", "$150k+"]} />
                </div>
                <div className="sar-field">
                  <SarSelect placeholder="Call Time" options={["Morning (8am – 12pm)", "Afternoon (12pm – 5pm)", "Evening (5pm – 7pm)"]} />
                </div>
              </div>
            )}

            {/* Submit button */}
            <div className="mt-2">
              <button type="button" className="sar-submit-btn">
                <span className="btn-label">Submit A Request</span>
                <span className="btn-label-hover">Submit A Request</span>
              </button>
            </div>
          </div>

          {/* Bottom row — privacy text */}
          <div className="sar-bottom-row flex items-end justify-end">
            <p className="text-[12px] text-[#F4EEDFB2] uppercase leading-[1.65] text-right">
              By clicking the button you agree<br />
              to our <span className="text-[#F4EEDF] cursor-pointer font-bold">Privacy Policy</span>
            </p>
          </div>

        </div>
      </section>
    </>
  );
}

function SarInput({ placeholder, type = "text" }: { placeholder: string; type?: string }) {
  return <input type={type} placeholder={placeholder} className="sar-input" />;
}

function SarSelect({ placeholder, options }: { placeholder: string; options: string[] }) {
  const [hasValue, setHasValue] = useState(false);
  return (
    <div className="sar-select-wrap">
      <select
        defaultValue=""
        className={`sar-select ${hasValue ? "has-value" : ""}`}
        onChange={(e) => setHasValue(e.target.value !== "")}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <svg
        aria-hidden
        style={{ position: "absolute", right: 2, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: 0.35 }}
        width="11" height="7" viewBox="0 0 14 8" fill="none"
      >
        <path d="M1 1L7 7L13 1" stroke="#F4EEDF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
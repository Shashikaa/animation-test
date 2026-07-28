"use client";

import { useState, useRef, useEffect } from "react";

// Uses environment variable with your live WordPress staging URL as fallback
const WP_BASE_URL =
  process.env.NEXT_PUBLIC_WP_URL || "https://grandpools.live.tactik.com.au";
const WP_API_URL = `${WP_BASE_URL}/wp-json/custom/v1/submit-cta`;

type CtaFormProps = {
  isMobile?: boolean;
  nameSuffix?: string;
};

// Australian Phone & Postcode Regex
const AU_PHONE_REGEX = /^(?:\+?61|0)[23478](?:[ -]?\d){8}$/;
const AU_POSTCODE_REGEX = /^(?:0[89]\d{2}|[1-9]\d{3})$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CtaForm({
  isMobile = false,
  nameSuffix = "",
}: CtaFormProps) {
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [invalidFields, setInvalidFields] = useState<string[]>([]);

  // State key to reset custom select dropdowns on submit
  const [resetKey, setResetKey] = useState(0);

  const getName = (baseName: string) =>
    nameSuffix ? `${baseName}_${nameSuffix}` : baseName;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setGlobalError(null);
    setSuccessMessage(null);
    setInvalidFields([]);

    const formElement = e.currentTarget;
    const formData = new FormData(formElement);

    const fullName = formData.get(getName("fullName"))?.toString().trim() || "";
    const email = formData.get(getName("email"))?.toString().trim() || "";
    const phone = formData.get(getName("phone"))?.toString().trim() || "";
    const postCode = formData.get(getName("postCode"))?.toString().trim() || "";
    const budgetType = formData.get(getName("budgetType"))?.toString().trim() || "";
    const budgetRange = formData.get(getName("budgetRange"))?.toString().trim() || "";
    const contractMethod = formData.get(getName("contractMethod"))?.toString().trim() || "";
    
    // Honeypot field check
    const honeypot = formData.get(getName("website_hp"))?.toString().trim() || "";

    const errors: string[] = [];
    const badFields: string[] = [];

    if (!fullName) {
      errors.push("Full Name is required.");
      badFields.push(getName("fullName"));
    }

    if (!email || !EMAIL_REGEX.test(email)) {
      errors.push("Please enter a valid email address.");
      badFields.push(getName("email"));
    }

    if (phone && !AU_PHONE_REGEX.test(phone.replace(/\s+/g, ""))) {
      errors.push("Please enter a valid Australian phone number (e.g. 0412 345 678).");
      badFields.push(getName("phone"));
    }

    if (postCode && !AU_POSTCODE_REGEX.test(postCode)) {
      errors.push("Please enter a valid 4-digit Australian Postcode.");
      badFields.push(getName("postCode"));
    }

    if (errors.length > 0) {
      setGlobalError(errors[0]);
      setInvalidFields(badFields);
      setLoading(false);
      return;
    }

    const payload = {
      fullName,
      email,
      phone,
      postCode,
      budgetType,
      budgetRange,
      contractMethod,
      website_hp: honeypot, // Passed for backend anti-spam check
    };

    try {
      const response = await fetch(WP_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccessMessage("Thank you! Your submission has been received.");
        formElement.reset();
        setResetKey((prev) => prev + 1);
      } else {
        setGlobalError(result.message || "Failed to submit form. Please try again.");
      }
    } catch {
      setGlobalError("Network error. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full" noValidate>
      {/* Honeypot Field (Invisible to human users, traps spam bots) */}
      <div style={{ display: "none" }} aria-hidden="true">
        <input
          type="text"
          name={getName("website_hp")}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div
        className={
          isMobile
            ? "flex flex-col md:grid md:grid-cols-2 gap-2 md:gap-x-[72px] md:gap-y-4 w-full max-w-[500px] md:max-w-[100%] !mt-8 md:!mt-34 mx-auto"
            : "flex flex-col gap-4 max-w-[560px] w-full"
        }
      >
        <div
          className={
            isMobile
              ? "contents md:grid md:grid-cols-2 md:gap-x-[72px]"
              : "grid grid-cols-2 gap-[72px]"
          }
        >
          <CtaInput
            placeholder="Full Name *"
            name={getName("fullName")}
            isMobile={isMobile}
            hasError={invalidFields.includes(getName("fullName"))}
          />
          <CtaInput
            placeholder="Email *"
            type="email"
            name={getName("email")}
            isMobile={isMobile}
            hasError={invalidFields.includes(getName("email"))}
          />
        </div>

        <div
          className={
            isMobile
              ? "contents md:grid md:grid-cols-2 md:gap-x-[72px]"
              : "grid grid-cols-2 gap-[72px]"
          }
        >
          <CtaInput
            placeholder="Phone No *"
            type="tel"
            name={getName("phone")}
            isMobile={isMobile}
            hasError={invalidFields.includes(getName("phone"))}
          />
          <CtaInput
            placeholder="Post Code *"
            name={getName("postCode")}
            isMobile={isMobile}
            hasError={invalidFields.includes(getName("postCode"))}
          />
        </div>

        <div
          className={
            isMobile
              ? "contents md:grid md:grid-cols-2 md:gap-x-[72px]"
              : "grid grid-cols-2 gap-[72px]"
          }
        >
          <CtaSelect
            key={`bt_${resetKey}`}
            placeholder="Budget Type *"
            options={["Residential", "Commercial", "Mixed Use"]}
            name={getName("budgetType")}
            isMobile={isMobile}
          />
          <CtaSelect
            key={`br_${resetKey}`}
            placeholder="Budget Range *"
            options={["$10k – $30k", "$30k – $75k", "$75k – $150k", "$150k+"]}
            name={getName("budgetRange")}
            isMobile={isMobile}
          />
        </div>

        <div
          className={
            isMobile
              ? "contents md:grid md:grid-cols-2 md:gap-x-[72px]"
              : "grid grid-cols-2 gap-[72px]"
          }
        >
          <CtaSelect
            key={`cm_${resetKey}`}
            placeholder="Preferred Contract Method *"
            options={[
              "Fixed Price",
              "Cost Plus",
              "Design & Build",
              "Negotiated",
            ]}
            name={getName("contractMethod")}
            isMobile={isMobile}
          />
          <div className="hidden md:block" />
        </div>

        <div
          style={{ marginTop: isMobile ? 44 : 18 }}
          className={isMobile ? "self-center md:!self-start" : undefined}
        >
          <SubmitButton loading={loading} />
        </div>

        {/* Global Error Banner */}
        {globalError && (
          <div
            role="alert"
            style={{
              marginTop: 12,
              padding: "10px 14px",
              borderRadius: "4px",
              background: "rgba(254, 178, 178, 0.15)",
              border: "1px solid #feb2b2",
              color: "#feb2b2",
              fontSize: 13,
              fontFamily: "inherit",
              lineHeight: "1.4",
            }}
          >
            {globalError}
          </div>
        )}

        {/* Success Message Banner */}
        {successMessage && (
          <div
            role="status"
            style={{
              marginTop: 12,
              padding: "10px 14px",
              borderRadius: "4px",
              background: "rgba(129, 230, 217, 0.15)",
              border: "1px solid #81e6d9",
              color: "#81e6d9",
              fontSize: 13,
              fontFamily: "inherit",
              lineHeight: "1.4",
            }}
          >
            {successMessage}
          </div>
        )}
      </div>
    </form>
  );
}

function SubmitButton({ loading }: { loading: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        position: "relative",
        display: "inline-block",
        width: "fit-content",
        fontSize: 14,
        fontWeight: 500,
        textTransform: "uppercase",
        color: "#F4EEDF",
        background: "transparent",
        border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        fontFamily: "inherit",
        padding: "0 0 8px 0",
        opacity: loading ? 0.6 : 1,
      }}
      className="group transition-opacity duration-200 hover:opacity-70"
    >
      {loading ? "Submitting..." : "Submit Now"}
      <span
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 1,
          background: "#F4EEDF",
          transition: "transform 0.2s ease",
        }}
        className="group-hover:-translate-y-[2px]"
      />
    </button>
  );
}

function CtaInput({
  placeholder,
  type = "text",
  name,
  isMobile = false,
  hasError = false,
}: {
  placeholder: string;
  type?: string;
  name?: string;
  isMobile?: boolean;
  hasError?: boolean;
}) {
  const borderOpacity = isMobile ? "1" : "0.35";
  const defaultBorder = `1px solid ${
    hasError ? "#feb2b2" : `rgba(244, 238, 223, ${borderOpacity})`
  }`;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .cta-input-field::placeholder {
          color: rgba(244, 238, 223, 0.4);
          opacity: 1;
        }
        .cta-input-field-mobile::placeholder {
          color: #F4EEDF !important;
          opacity: 1;
        }
      `,
        }}
      />
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        aria-invalid={hasError}
        className={isMobile ? "cta-input-field-mobile" : "cta-input-field"}
        style={{
          background: "transparent",
          border: "none",
          borderBottom: defaultBorder,
          color: "#F4EEDF",
          fontSize: 14,
          padding: "10px 10px 10px 0",
          outline: "none",
          width: "100%",
          fontFamily: "inherit",
          letterSpacing: "0.02em",
          transition: "border-color 0.25s",
        }}
        onFocus={(e) =>
          ((e.target as HTMLInputElement).style.borderColor = hasError
            ? "#feb2b2"
            : "rgba(244,238,223,0.75)")
        }
        onBlur={(e) =>
          ((e.target as HTMLInputElement).style.borderColor = hasError
            ? "#feb2b2"
            : `rgba(244, 238, 223, ${borderOpacity})`)
        }
      />
    </>
  );
}

function CtaSelect({
  placeholder,
  options,
  name,
  isMobile = false,
}: {
  placeholder: string;
  options: string[];
  name?: string;
  isMobile?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const borderOpacity = isMobile ? "1" : "0.35";
  const placeholderColor = isMobile ? "#F4EEDF" : "rgba(244, 238, 223, 0.4)";
  const arrowOpacity = isMobile ? 0.9 : isOpen ? 0.9 : 0.5;

  return (
    <div ref={dropdownRef} style={{ position: "relative", width: "100%" }}>
      <input type="hidden" name={name} value={selectedValue} />

      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        style={{
          background: "transparent",
          borderBottom: isOpen
            ? "1px solid rgba(244,238,223,0.75)"
            : `1px solid rgba(244, 238, 223, ${borderOpacity})`,
          fontSize: 14,
          padding: "10px 10px 10px 0",
          width: "100%",
          fontFamily: "inherit",
          cursor: "pointer",
          letterSpacing: "0.02em",
          color: selectedValue ? "#F4EEDF" : placeholderColor,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          userSelect: "none",
          outline: "none",
          transition: "border-color 0.25s",
        }}
      >
        <span style={{ flexGrow: 1 }}>{selectedValue || placeholder}</span>

        <svg
          style={{
            transform: `rotate(${isOpen ? "180deg" : "0deg"})`,
            opacity: arrowOpacity,
            transition:
              "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s",
          }}
          width="11"
          height="7"
          viewBox="0 0 11 7"
          fill="none"
        >
          <path
            d="M1 1.5L5.5 5.5L10 1.5"
            stroke="#F4EEDF"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {isOpen && (
        <div
          role="listbox"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "6px",
            background: "linear-gradient(135deg, #162D24 0%, #094146 100%)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
            zIndex: 100,
            overflow: "hidden",
            maxHeight: "220px",
            overflowY: "auto",
          }}
        >
          {options.map((option) => (
            <div
              key={option}
              role="option"
              aria-selected={selectedValue === option}
              onClick={() => {
                setSelectedValue(option);
                setIsOpen(false);
              }}
              style={{
                padding: "12px 16px",
                color: selectedValue === option ? "#162D24" : "#F4EEDF",
                background:
                  selectedValue === option ? "#F4EEDF" : "transparent",
                fontSize: 14,
                cursor: "pointer",
                transition: "background 0.15s ease, color 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (selectedValue !== option) {
                  e.currentTarget.style.background =
                    "rgba(244, 238, 223, 0.08)";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedValue !== option) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
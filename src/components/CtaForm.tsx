"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const WP_BASE_URL =
  process.env.NEXT_PUBLIC_WP_URL || "https://grandpools.live.tactik.com.au";
const WP_API_URL = `${WP_BASE_URL}/wp-json/custom/v1/submit-cta`;

type CtaFormProps = {
  isMobile?: boolean;
  nameSuffix?: string;
};

const AU_PHONE_REGEX = /^(?:\+?61|0)[23478](?:[ -]?\d){8}$/;
const AU_POSTCODE_REGEX = /^(?:0[89]\d{2}|[1-9]\d{3})$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CtaForm({
  isMobile = false,
  nameSuffix = "",
}: CtaFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [resetKey, setResetKey] = useState(0);

  const getName = (baseName: string) =>
    nameSuffix ? `${baseName}_${nameSuffix}` : baseName;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setGlobalError(null);
    setFieldErrors({});

    const formElement = e.currentTarget;
    const formData = new FormData(formElement);

    const fullName = formData.get(getName("fullName"))?.toString().trim() || "";
    const email = formData.get(getName("email"))?.toString().trim() || "";
    const phone = formData.get(getName("phone"))?.toString().trim() || "";
    const postCode = formData.get(getName("postCode"))?.toString().trim() || "";
    const budgetType = formData.get(getName("budgetType"))?.toString().trim() || "";
    const budgetRange = formData.get(getName("budgetRange"))?.toString().trim() || "";
    const contractMethod = formData.get(getName("contractMethod"))?.toString().trim() || "";
    const honeypot = formData.get(getName("website_hp"))?.toString().trim() || "";

    const errors: Record<string, string> = {};

    if (!fullName) errors[getName("fullName")] = "Full name is required.";
    if (!email) {
      errors[getName("email")] = "Email is required.";
    } else if (!EMAIL_REGEX.test(email)) {
      errors[getName("email")] = "Please enter a valid email address.";
    }

    if (!phone) {
      errors[getName("phone")] = "Phone number is required.";
    } else if (!AU_PHONE_REGEX.test(phone.replace(/\s+/g, ""))) {
      errors[getName("phone")] = "Please enter a valid Australian phone number.";
    }

    if (!postCode) {
      errors[getName("postCode")] = "Post Code is required.";
    } else if (!AU_POSTCODE_REGEX.test(postCode)) {
      errors[getName("postCode")] = "Please enter a valid 4-digit Post Code.";
    }

    if (!budgetType) errors[getName("budgetType")] = "Budget type is required.";
    if (!budgetRange) errors[getName("budgetRange")] = "Budget range is required.";
    if (!contractMethod) errors[getName("contractMethod")] = "Contract method is required.";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
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
      website_hp: honeypot,
    };

    try {
      const response = await fetch(WP_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        formElement.reset();
        setResetKey((prev) => prev + 1);
        router.push("/thank-you");
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
    <form onSubmit={handleSubmit} className="w-full h-auto" noValidate>
      {/* Honeypot Field */}
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
            ? "flex flex-col gap-4 w-full max-w-[500px] md:max-w-[100%] mt-4 md:!mt-34 mx-auto pb-6"
            : "flex flex-col gap-4 max-w-[560px] w-full"
        }
      >
        <div className="grid grid-cols-1 md:grid md:grid-cols-2 md:gap-x-[72px] gap-y-4">
          <CtaInput
            placeholder="Full Name *"
            name={getName("fullName")}
            isMobile={isMobile}
            error={fieldErrors[getName("fullName")]}
          />
          <CtaInput
            placeholder="Email *"
            type="email"
            name={getName("email")}
            isMobile={isMobile}
            error={fieldErrors[getName("email")]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid md:grid-cols-2 md:gap-x-[72px] gap-y-4">
          <CtaInput
            placeholder="Phone Number *"
            type="tel"
            name={getName("phone")}
            isMobile={isMobile}
            error={fieldErrors[getName("phone")]}
          />
          <CtaInput
            placeholder="Post Code *"
            name={getName("postCode")}
            isMobile={isMobile}
            error={fieldErrors[getName("postCode")]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid md:grid-cols-2 md:gap-x-[72px] gap-y-4">
          <CtaSelect
            key={`bt_${resetKey}`}
            placeholder="Budget Type *"
            options={["Residential", "Commercial", "Mixed Use"]}
            name={getName("budgetType")}
            isMobile={isMobile}
            error={fieldErrors[getName("budgetType")]}
          />
          <CtaSelect
            key={`br_${resetKey}`}
            placeholder="Budget Range *"
            options={["$10k – $30k", "$30k – $75k", "$75k – $150k", "$150k+"]}
            name={getName("budgetRange")}
            isMobile={isMobile}
            error={fieldErrors[getName("budgetRange")]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid md:grid-cols-2 md:gap-x-[72px] gap-y-4">
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
            error={fieldErrors[getName("contractMethod")]}
          />
          <div className="hidden md:block" />
        </div>

        <div
          style={{ marginTop: isMobile ? 24 : 18 }}
          className={isMobile ? "self-center md:!self-start" : undefined}
        >
          <SubmitButton loading={loading} />
        </div>

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
              fontSize: 14,
              fontFamily: "inherit",
              lineHeight: "1.4",
            }}
          >
            {globalError}
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
      className="btn-underline cursor-pointer font-body !pb-2 text-[16px]"
    >
      {loading ? "Submitting..." : "Submit Now"}
    </button>
  );
}

function CtaInput({
  placeholder,
  type = "text",
  name,
  isMobile = false,
  error,
}: {
  placeholder: string;
  type?: string;
  name?: string;
  isMobile?: boolean;
  error?: string;
}) {
  const borderOpacity = isMobile ? "1" : "0.35";
  const defaultBorder = `1px solid ${
    error ? "#feb2b2" : `rgba(244, 238, 223, ${borderOpacity})`
  }`;

  return (
    <div className="w-full flex flex-col">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .cta-input-field::placeholder {
          color: rgba(244, 238, 223, 0.4);
          opacity: 1;
          font-size: 16px;
        }
        .cta-input-field-mobile::placeholder {
          color: #F4EEDF !important;
          opacity: 1;
          font-size: 16px;
        }
      `,
        }}
      />
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        aria-invalid={!!error}
        className={isMobile ? "cta-input-field-mobile" : "cta-input-field"}
        style={{
          background: "transparent",
          border: "none",
          borderBottom: defaultBorder,
          color: "#F4EEDF",
          fontSize: 16,
          padding: "10px 10px 10px 0",
          outline: "none",
          width: "100%",
          fontFamily: "inherit",
          letterSpacing: "0.02em",
          transition: "border-color 0.25s",
        }}
        onFocus={(e) => {
          (e.target as HTMLInputElement).style.borderColor = error
            ? "#feb2b2"
            : "rgba(244,238,223,0.75)";
        }}
        onBlur={(e) => {
          (e.target as HTMLInputElement).style.borderColor = error
            ? "#feb2b2"
            : `rgba(244, 238, 223, ${borderOpacity})`;
        }}
      />
      {error && (
        <span
          style={{
            color: "#feb2b2",
            fontSize: "12px",
            marginTop: "6px",
            lineHeight: "1.2",
            fontFamily: "inherit",
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}

function CtaSelect({
  placeholder,
  options,
  name,
  isMobile = false,
  error,
}: {
  placeholder: string;
  options: string[];
  name?: string;
  isMobile?: boolean;
  error?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");
  const [mounted, setMounted] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({
    top: 0,
    left: 0,
    width: 0,
    openUpward: false,
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownMaxHeight = 180;
      const spaceBelow = viewportHeight - rect.bottom;
      const openUpward =
        spaceBelow < dropdownMaxHeight || rect.bottom > viewportHeight - 120;

      setDropdownPos({
        top: openUpward
          ? rect.top + window.scrollY - dropdownMaxHeight - 6
          : rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
        width: rect.width,
        openUpward,
      });
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();

    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        const portalElement = document.getElementById(`portal_${name}`);
        if (portalElement && portalElement.contains(event.target as Node)) {
          return;
        }
        setIsOpen(false);
      }
    }

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, name]);

  const handleToggle = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen((prev) => !prev);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      handleToggle(e);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const borderOpacity = isMobile ? "1" : "0.35";
  const placeholderColor = isMobile ? "#F4EEDF" : "rgba(244, 238, 223, 0.4)";
  const arrowOpacity = isMobile ? 0.9 : isOpen ? 0.9 : 0.5;

  const defaultBorder = error
    ? "1px solid #feb2b2"
    : isOpen
    ? "1px solid rgba(244,238,223,0.75)"
    : `1px solid rgba(244, 238, 223, ${borderOpacity})`;

  const renderDropdownList = () => {
    if (!isOpen || !mounted) return null;

    const portalContent = (
      <div
        id={`portal_${name}`}
        role="listbox"
        style={{
          position: "absolute",
          top: `${dropdownPos.top}px`,
          left: `${dropdownPos.left}px`,
          width: `${dropdownPos.width}px`,
          background: "linear-gradient(135deg, #162D24 0%, #094146 100%)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.8)",
          zIndex: 999999,
          maxHeight: "180px",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
        }}
      >
        {options.map((option) => (
          <div
            key={option}
            role="option"
            aria-selected={selectedValue === option}
            onClick={(e) => {
              e.preventDefault();
              setSelectedValue(option);
              setIsOpen(false);
            }}
            style={{
              padding: "12px 16px",
              color: selectedValue === option ? "#162D24" : "#F4EEDF",
              background:
                selectedValue === option ? "#F4EEDF" : "transparent",
              fontSize: 16,
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
    );

    return createPortal(portalContent, document.body);
  };

  return (
    <div
      ref={dropdownRef}
      className="flex flex-col"
      style={{ position: "relative", width: "100%", zIndex: isOpen ? 9999 : 1 }}
    >
      <input type="hidden" name={name} value={selectedValue} />

      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-invalid={!!error}
        tabIndex={0}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        style={{
          background: "transparent",
          borderBottom: defaultBorder,
          fontSize: 16,
          padding: "10px 10px 10px 0",
          width: "100%",
          fontFamily: "inherit",
          cursor: "pointer",
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

      {renderDropdownList()}

      {error && (
        <span
          style={{
            color: "#feb2b2",
            fontSize: "12px",
            marginTop: "6px",
            lineHeight: "1.2",
            fontFamily: "inherit",
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}
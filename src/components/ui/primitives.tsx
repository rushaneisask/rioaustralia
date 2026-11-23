import Link from "next/link";
import type { ReactNode } from "react";

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "light";
  className?: string;
};

const variants = {
  primary:
    "bg-brand text-white shadow-[0_10px_30px_-10px_rgba(11,122,133,0.65)] hover:bg-teal-900 hover:shadow-[0_14px_34px_-10px_rgba(7,59,69,0.6)]",
  secondary: "bg-white text-teal-900 ring-1 ring-line hover:ring-aqua-300 hover:bg-aqua-100/60",
  ghost: "text-teal-700 hover:text-teal-900 underline-offset-4 hover:underline",
  light: "bg-white text-teal-900 hover:bg-aqua-100",
};

export function Button({ href, children, variant = "primary", className = "" }: ButtonProps) {
  const cls = `inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 font-display text-[0.98rem] font-semibold transition-all duration-200 cursor-pointer active:scale-[0.98] ${variants[variant]} ${className}`;
  if (href.startsWith("tel:") || href.startsWith("sms:") || href.startsWith("mailto:") || href.startsWith("http")) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`inline-flex items-center gap-2 font-display text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-brand ${className}`}>
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-coral" />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  className = "",
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  align?: "left" | "center";
  className?: string;
}) {
  const a = align === "center" ? "mx-auto text-center items-center" : "";
  return (
    <div className={`flex max-w-2xl flex-col gap-4 ${a} ${className}`}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="font-display text-[2.1rem] font-semibold leading-[1.08] text-ink sm:text-5xl">{title}</h2>
      {lead ? <p className="text-lg leading-relaxed text-ink-soft">{lead}</p> : null}
    </div>
  );
}

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-7xl px-5 sm:px-8 ${className}`}>{children}</div>;
}

export function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="M4 10h11m0 0-4.5-4.5M15 10l-4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PhoneIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M5 4h3l1.5 4-2 1.5a11 11 0 0 0 7 7l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="m4.5 10.5 3.5 3.5 7.5-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

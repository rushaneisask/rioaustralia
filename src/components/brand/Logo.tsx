import { useId } from "react";

/**
 * RIO Australia logo.
 * Mark: a water droplet (aqua → teal) with a white highlight swoosh and a
 * coral sparkle, the brand's single "splash" of contrast colour.
 */
export function LogoMark({ className = "h-9 w-9", title }: { className?: string; title?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <linearGradient id={`${id}-drop`} x1="18" y1="6" x2="46" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#5fd8de" />
          <stop offset="0.55" stopColor="#19b8c4" />
          <stop offset="1" stopColor="#0b7a85" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="26" cy="30" r="22" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path
        d="M30 5.5c.9-1.2 3.1-1.2 4 0C38.6 11.6 52 28.4 52 40.5 52 51.8 43 60 32 60S12 51.8 12 40.5C12 28.4 25.4 11.6 30 5.5Z"
        fill={`url(#${id}-drop)`}
      />
      <path
        d="M30 5.5c.9-1.2 3.1-1.2 4 0C38.6 11.6 52 28.4 52 40.5 52 51.8 43 60 32 60S12 51.8 12 40.5C12 28.4 25.4 11.6 30 5.5Z"
        fill={`url(#${id}-glow)`}
      />
      <path
        d="M21.5 40.5c0 6.2 4.4 10.6 10 11.4"
        fill="none"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.95"
      />
      <path d="M51 4.5Q52.3 11.7 59.5 13 52.3 14.3 51 21.5 49.7 14.3 42.5 13 49.7 11.7 51 4.5Z" fill="#ff6b4a" />
    </svg>
  );
}

export function Logo({ className = "", tone = "ink" }: { className?: string; tone?: "ink" | "light" }) {
  const word = tone === "light" ? "text-white" : "text-teal-900";
  const sub = tone === "light" ? "text-white/80" : "text-teal-700";
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-9 w-9 shrink-0" />
      <span className="flex flex-col leading-none">
        <span className={`font-display text-[1.45rem] font-bold tracking-[-0.03em] ${word}`}>RIO</span>
        <span className={`mt-0.5 font-display text-[0.6rem] font-semibold uppercase tracking-[0.32em] ${sub}`}>
          Australia
        </span>
      </span>
    </span>
  );
}

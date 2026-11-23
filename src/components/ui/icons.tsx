/** Line icons (24px grid, 1.8 stroke), decorative: always aria-hidden. */
type P = { className?: string };
const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
};

export const IconOffice = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}>
    <path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M16 9h2a2 2 0 0 1 2 2v10M3 21h18M8 7h4M8 11h4M8 15h4" />
  </svg>
);
export const IconMedical = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);
export const IconAgency = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}>
    <path d="M3 10.5 12 4l9 6.5M5 9v11h14V9M10 20v-5h4v5" />
  </svg>
);
export const IconShield = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}>
    <path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.3 7.5 9.5 4.4-1.2 7.5-4.9 7.5-9.5V6L12 3Z" />
    <path d="m8.8 12 2.2 2.2 4.3-4.4" />
  </svg>
);
export const IconDoc = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </svg>
);
export const IconCalendar = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}>
    <rect x="3.5" y="5" width="17" height="15" rx="3" />
    <path d="M8 3v4M16 3v4M3.5 10h17M8 14h2M14 14h2M8 17h2" />
  </svg>
);
export const IconUsers = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c.6-3.4 3.2-5.5 6.5-5.5s5.9 2.1 6.5 5.5M16 4.8a3.5 3.5 0 0 1 0 6.4M18.5 14.8c1.6.8 2.7 2.6 3 5.2" />
  </svg>
);
export const IconChat = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}>
    <path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 20 12Z" />
  </svg>
);
export const IconSparkle = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}>
    <path d="M12 3c.6 4.4 2.6 6.4 7 7-4.4.6-6.4 2.6-7 7-.6-4.4-2.6-6.4-7-7 4.4-.6 6.4-2.6 7-7ZM19 16c.3 1.8 1.1 2.7 3 3-1.9.3-2.7 1.2-3 3-.3-1.8-1.1-2.7-3-3 1.9-.3 2.7-1.2 3-3Z" />
  </svg>
);
export const IconPin = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}>
    <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
);
export const IconSteam = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}>
    <path d="M8 4c-1.2 1.4-1.2 2.6 0 4s1.2 2.6 0 4M12 3c-1.2 1.4-1.2 2.6 0 4s1.2 2.6 0 4M16 4c-1.2 1.4-1.2 2.6 0 4s1.2 2.6 0 4M4 15h16v2a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-2Z" />
  </svg>
);
export const IconWindow = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}>
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M12 3v18M4 12h16M7 7l2.5-2.5M14.5 15l3-3" />
  </svg>
);
export const IconSpray = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}>
    <path d="M9 8h5l1 3v9a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-9l2-3ZM10 8V5h4l3 2M17 4h1M19 6h1M19 2h1" />
  </svg>
);
export const IconPlus = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

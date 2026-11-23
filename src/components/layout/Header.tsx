"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { Logo } from "@/components/brand/Logo";
import { PhoneIcon } from "@/components/ui/primitives";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on navigation (render-time state adjustment).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full px-4 py-2.5 transition-all duration-300 sm:px-5 ${
          scrolled || open
            ? "bg-white/85 shadow-[0_8px_30px_-12px_rgba(7,59,69,0.25)] ring-1 ring-line backdrop-blur-xl"
            : "bg-white/40 ring-1 ring-white/60 backdrop-blur-md"
        }`}
      >
        <Link href="/" aria-label={`${site.name} home`} className="rounded-full">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 font-display text-[0.95rem] font-medium text-ink-soft transition-colors hover:bg-aqua-100 hover:text-teal-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={site.contact.phoneHref}
            className="hidden min-h-11 items-center gap-2 rounded-full px-4 font-display text-[0.95rem] font-semibold text-teal-900 transition-colors hover:bg-aqua-100 md:inline-flex"
          >
            <PhoneIcon className="h-4 w-4 text-brand" />
            {site.contact.phone}
          </a>
          <Link
            href={site.navCta.href}
            className="hidden min-h-11 items-center rounded-full bg-brand px-5 font-display text-[0.95rem] font-semibold text-white transition-colors hover:bg-teal-900 sm:inline-flex"
          >
            {site.navCta.label}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-teal-900 transition-colors hover:bg-aqua-100 lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
              <path
                d={open ? "M6 6l12 12M18 6 6 18" : "M4 8h16M4 16h16"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        hidden={!open}
        className="mx-auto mt-2 max-w-7xl rounded-3xl bg-white/95 p-3 shadow-[0_20px_50px_-20px_rgba(7,59,69,0.35)] ring-1 ring-line backdrop-blur-xl lg:hidden"
      >
        <nav aria-label="Mobile" className="flex flex-col">
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-2xl px-4 py-3.5 font-display text-lg font-medium text-ink transition-colors hover:bg-aqua-100"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 grid gap-2 border-t border-line pt-3 sm:grid-cols-2">
            <a
              href={site.contact.phoneHref}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-aqua-100 font-display font-semibold text-teal-900"
            >
              <PhoneIcon className="h-4 w-4" /> {site.contact.phone}
            </a>
            <Link
              href={site.navCta.href}
              onClick={() => setOpen(false)}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand font-display font-semibold text-white"
            >
              {site.navCta.label}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

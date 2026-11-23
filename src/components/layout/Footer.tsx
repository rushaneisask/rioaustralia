import Link from "next/link";
import { site, divisions } from "@/content/site";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/primitives";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-auto overflow-hidden bg-teal-900 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(50% 60% at 85% 0%, rgba(25,184,196,0.35), transparent 70%), radial-gradient(40% 50% at 0% 100%, rgba(255,107,74,0.12), transparent 70%)",
        }}
      />
      <Container className="relative grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr] md:py-20">
        <div className="flex max-w-sm flex-col gap-5">
          <Logo tone="light" />
          <p className="leading-relaxed text-white/80">{site.footer.blurb}</p>
          <p className="font-display text-sm font-medium text-aqua-300">{site.foundedLabel}</p>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-aqua-300">Services</h2>
          <ul className="mt-4 flex flex-col gap-1">
            {divisions.map((d) => (
              <li key={d.slug}>
                <Link href={d.href} className="inline-flex min-h-11 items-center text-white/85 transition-colors hover:text-white">
                  {d.name}
                </Link>
              </li>
            ))}
            {site.nav.slice(1).map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="inline-flex min-h-11 items-center text-white/85 transition-colors hover:text-white">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-aqua-300">Contact</h2>
          <ul className="mt-4 flex flex-col gap-1">
            <li>
              <a href={site.contact.phoneHref} className="inline-flex min-h-11 items-center font-display text-lg font-semibold text-white hover:text-aqua-300">
                {site.contact.phone}
              </a>
            </li>
            {site.contact.email ? (
              <li>
                <a href={`mailto:${site.contact.email}`} className="inline-flex min-h-11 items-center text-white/85 hover:text-white">
                  {site.contact.email}
                </a>
              </li>
            ) : null}
            <li>
              <Link href="/contact/" className="inline-flex min-h-11 items-center text-white/85 hover:text-white">
                Request a free quote
              </Link>
            </li>
            <li className="pt-2 text-white/70">{site.region}</li>
          </ul>
        </div>
      </Container>
      <div className="relative border-t border-white/10">
        <Container className="flex flex-col gap-2 py-6 text-sm text-white/65 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. {site.footer.rights}
          </p>
          {site.contact.abn ? <p>ABN {site.contact.abn}</p> : null}
        </Container>
      </div>
    </footer>
  );
}

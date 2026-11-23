import type { Metadata } from "next";
import { site } from "@/content/site";
import { QuoteForm } from "@/components/contact/QuoteForm";
import { Container, Eyebrow, PhoneIcon, CheckIcon } from "@/components/ui/primitives";
import { LogoMark } from "@/components/brand/Logo";

const c = site.contactPage;

export const metadata: Metadata = {
  title: { absolute: c.seoTitle },
  description: c.seoDescription,
  alternates: { canonical: "/contact/" },
  openGraph: { title: c.seoTitle, description: c.seoDescription, url: `${site.url}/contact/` },
};

export default function ContactPage() {
  return (
    <section className="bg-caustic relative pb-24 pt-32 sm:pb-32 sm:pt-40" data-brand="cleaning">
      <Container className="grid gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:gap-14">
        <div className="flex flex-col gap-8">
          <div className="flex max-w-2xl flex-col gap-4">
            <Eyebrow>{c.eyebrow}</Eyebrow>
            <h1 className="font-display text-[2.6rem] font-semibold leading-[1.04] text-ink sm:text-6xl">{c.title}</h1>
            <p className="text-lg leading-relaxed text-ink-soft sm:text-xl">{c.lead}</p>
          </div>
          <QuoteForm />
        </div>

        <aside className="flex flex-col gap-5 lg:pt-44">
          <div className="sticky top-28 flex flex-col gap-5 rounded-[2rem] bg-teal-900 p-8 text-white">
            <LogoMark className="h-12 w-12" />
            <h2 className="font-display text-2xl font-semibold">{c.sideTitle}</h2>
            <p className="text-white/85">{c.sideBody}</p>
            <a
              href={site.contact.phoneHref}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 font-display text-lg font-semibold text-teal-900 transition-colors hover:bg-aqua-100"
            >
              <PhoneIcon /> {site.contact.phone}
            </a>
            <ul className="mt-2 flex flex-col gap-2.5 border-t border-white/15 pt-5">
              {site.home.trustPoints.map((p) => (
                <li key={p} className="flex items-center gap-2.5 text-white/90">
                  <CheckIcon className="h-4 w-4 text-aqua-300" /> {p}
                </li>
              ))}
            </ul>
            <p className="text-sm text-white/70">{site.region}</p>
          </div>
        </aside>
      </Container>
    </section>
  );
}

import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowIcon, Button, CheckIcon, Container, PhoneIcon, SectionHeading } from "@/components/ui/primitives";
import { IconPin, IconPlus } from "@/components/ui/icons";

/** Numbered process timeline. */
export function ProcessTimeline({
  eyebrow,
  title,
  steps,
}: {
  eyebrow: string;
  title: string;
  steps: readonly { title: string; body: string }[];
}) {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} />
        <ol className="relative mt-14 grid gap-5 md:grid-cols-5 md:gap-4">
          <span aria-hidden className="absolute left-[1.35rem] top-6 bottom-6 w-px bg-gradient-to-b from-aqua-300 via-aqua-500 to-transparent md:left-6 md:right-6 md:top-[1.35rem] md:bottom-auto md:h-px md:w-auto md:bg-gradient-to-r" />
          {steps.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 0.08} className="relative flex gap-5 md:flex-col md:gap-5">
              <span className="relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white font-display text-lg font-semibold text-teal-700 shadow-[0_8px_24px_-10px_rgba(11,122,133,0.6)] ring-1 ring-aqua-300">
                {i + 1}
              </span>
              <div className="pb-2">
                <h3 className="font-display text-xl font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-soft">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/** Icon card grid. */
export function CardGrid({
  items,
  icons,
  cols = 3,
}: {
  items: readonly { title: string; body: string }[];
  icons: ReactNode[];
  cols?: 3 | 2;
}) {
  return (
    <ul className={`mt-14 grid gap-5 sm:grid-cols-2 ${cols === 3 ? "lg:grid-cols-3" : ""}`}>
      {items.map((it, i) => (
        <Reveal as="li" key={it.title} delay={(i % 3) * 0.08}>
          <article className="group h-full rounded-[1.75rem] bg-white p-7 ring-1 ring-line transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-28px_rgba(7,59,69,0.35)] hover:ring-aqua-300">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-aqua-100 text-teal-700 transition-colors group-hover:bg-brand group-hover:text-white">
              {icons[i % icons.length]}
            </span>
            <h3 className="mt-5 font-display text-xl font-semibold text-ink">{it.title}</h3>
            <p className="mt-2 leading-relaxed text-ink-soft">{it.body}</p>
          </article>
        </Reveal>
      ))}
    </ul>
  );
}

/** Service areas as location chips. */
export function ServiceAreas({ eyebrow, title, lead, list }: { eyebrow: string; title: string; lead: string; list: readonly string[] }) {
  return (
    <section id="areas" className="scroll-mt-24 py-24 sm:py-32">
      <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <SectionHeading eyebrow={eyebrow} title={title} lead={lead} />
        <Reveal>
          <ul className="flex flex-wrap gap-2.5">
            {list.map((a) => (
              <li
                key={a}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 py-2 font-medium text-teal-900 ring-1 ring-line"
              >
                <IconPin className="h-4 w-4 text-aqua-500" />
                {a}
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}

/** Accessible FAQ accordion using native details/summary. */
export function Faq({ eyebrow, title, items }: { eyebrow: string; title: string; items: readonly { q: string; a: string }[] }) {
  return (
    <section id="faq" className="scroll-mt-24 py-24 sm:py-32">
      <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHeading eyebrow={eyebrow} title={title} />
        <div className="flex flex-col gap-3">
          {items.map((f) => (
            <details key={f.q} className="group rounded-3xl bg-white ring-1 ring-line transition-shadow open:shadow-[0_20px_40px_-28px_rgba(7,59,69,0.35)] open:ring-aqua-300">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 font-display text-lg font-semibold text-ink [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-aqua-100 text-teal-700 transition-transform duration-300 group-open:rotate-45">
                  <IconPlus className="h-4 w-4" />
                </span>
              </summary>
              <p className="px-6 pb-6 leading-relaxed text-ink-soft">{f.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}

/** Bright closing call to action. */
export function FinalCta({
  title,
  body,
  primary,
  secondary,
}: {
  title: string;
  body: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
}) {
  return (
    <section className="px-3 pb-24 sm:px-5 sm:pb-32">
      <Reveal>
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-teal-700 via-[#0e95a1] to-aqua-500 px-6 py-16 text-center text-white sm:px-12 sm:py-24">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {[
              ["8%", "20%", 120],
              ["85%", "15%", 80],
              ["75%", "75%", 160],
              ["15%", "80%", 60],
              ["50%", "8%", 40],
            ].map(([l, t, s], i) => (
              <span
                key={i}
                className="absolute rounded-full bg-white/10 ring-1 ring-white/25"
                style={{ left: l as string, top: t as string, width: s as number, height: s as number }}
              />
            ))}
            <span className="absolute right-[12%] top-[22%] h-3 w-3 rotate-45 bg-coral" />
          </div>
          <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-5">
            <h2 className="font-display text-4xl font-semibold leading-[1.05] sm:text-6xl">{title}</h2>
            <p className="text-lg text-white/90 sm:text-xl">{body}</p>
            <div className="mt-3 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button href={primary.href} variant="light">
                {primary.label} <ArrowIcon />
              </Button>
              <a
                href={secondary.href}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 font-display font-semibold text-white ring-1 ring-white/60 transition-colors hover:bg-white/10"
              >
                <PhoneIcon /> {secondary.label}
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export { CheckIcon };

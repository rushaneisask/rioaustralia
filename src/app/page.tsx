import Link from "next/link";
import { site, divisions } from "@/content/site";
import { Hero } from "@/components/sections/Hero";
import { CardGrid, FinalCta, ProcessTimeline } from "@/components/sections/Blocks";
import { HomeHeroCanvas, CleaningHeroCanvas } from "@/components/three/HeroCanvases";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowIcon, Container, Eyebrow, SectionHeading } from "@/components/ui/primitives";
import { IconAgency, IconCalendar, IconDoc, IconMedical, IconOffice, IconSparkle } from "@/components/ui/icons";

export default function HomePage() {
  const h = site.home;
  const division = divisions[0];
  return (
    <>
      <Hero
        eyebrow={h.eyebrow}
        title={h.title}
        accentIndex={h.titleAccentIndex}
        lead={h.lead}
        primary={h.primaryCta}
        secondary={h.secondaryCta}
        points={h.trustPoints}
        scene={<HomeHeroCanvas className="absolute inset-0" />}
      />

      {/* What RIO stands for */}
      <section className="py-24 sm:py-32">
        <Container>
          <SectionHeading eyebrow={h.standsFor.eyebrow} title={h.standsFor.title} lead={h.standsFor.lead} />
          <CardGrid items={h.standsFor.pillars} icons={[<IconCalendar key="c" />, <IconSparkle key="s" />, <IconDoc key="d" />]} />
        </Container>
      </section>

      {/* Division */}
      <section className="px-3 sm:px-5" data-brand={division.brand}>
        <Reveal>
          <Link
            href={division.href}
            className="group relative mx-auto grid max-w-7xl overflow-hidden rounded-[2.5rem] bg-white ring-1 ring-line transition-shadow duration-500 hover:shadow-[0_40px_80px_-40px_rgba(7,59,69,0.45)] lg:grid-cols-2"
          >
            <div className="flex flex-col items-start gap-5 p-8 sm:p-12 lg:p-16">
              <Eyebrow>{h.divisions.eyebrow}</Eyebrow>
              <h2 className="font-display text-4xl font-semibold leading-[1.05] text-ink sm:text-5xl">{h.divisions.title}</h2>
              <p className="max-w-md text-lg leading-relaxed text-ink-soft">{h.divisions.lead}</p>
              <p className="max-w-md leading-relaxed text-ink-soft">{division.summary}</p>
              <span className="mt-2 inline-flex min-h-12 items-center gap-2 rounded-full bg-brand px-6 font-display font-semibold text-white transition-colors group-hover:bg-teal-900">
                {h.divisions.cta} <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
            <div className="relative h-[340px] bg-gradient-to-br from-aqua-100 via-white to-aqua-100 sm:h-[420px] lg:h-auto lg:min-h-[520px]">
              <CleaningHeroCanvas className="absolute inset-0" />
            </div>
          </Link>
        </Reveal>
      </section>

      {/* Who we clean for */}
      <section className="py-24 sm:py-32">
        <Container>
          <SectionHeading eyebrow={h.who.eyebrow} title={h.who.title} />
          <CardGrid items={h.who.items} icons={[<IconOffice key="o" />, <IconMedical key="m" />, <IconAgency key="a" />]} />
          <Reveal>
            <p className="mt-10 max-w-3xl rounded-3xl bg-aqua-100/70 px-6 py-5 text-lg leading-relaxed text-teal-900 ring-1 ring-aqua-300/50">
              {h.who.note}
            </p>
          </Reveal>
        </Container>
      </section>

      <div className="bg-white/60">
        <ProcessTimeline eyebrow={h.how.eyebrow} title={h.how.title} steps={site.cleaning.process.steps} />
      </div>

      <div className="pt-24 sm:pt-32">
        <FinalCta {...h.finalCta} />
      </div>
    </>
  );
}

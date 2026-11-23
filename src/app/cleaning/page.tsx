import type { Metadata } from "next";
import { site } from "@/content/site";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { CardGrid, Faq, FinalCta, ProcessTimeline, ServiceAreas } from "@/components/sections/Blocks";
import { CleaningHeroCanvas } from "@/components/three/HeroCanvases";
import { MethodSection } from "@/components/method/MethodSection";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { IconCalendar, IconChat, IconDoc, IconShield, IconSparkle, IconUsers } from "@/components/ui/icons";

const c = site.cleaning;

export const metadata: Metadata = {
  title: { absolute: c.seoTitle },
  description: c.seoDescription,
  alternates: { canonical: "/cleaning/" },
  openGraph: { title: c.seoTitle, description: c.seoDescription, url: `${site.url}/cleaning/` },
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: c.faq.items.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function CleaningPage() {
  return (
    <div data-brand="cleaning">
      <Hero
        eyebrow={c.eyebrow}
        title={c.title}
        accentIndex={c.titleAccentIndex}
        lead={c.lead}
        primary={c.primaryCta}
        secondary={c.secondaryCta}
        points={site.home.trustPoints}
        scene={<CleaningHeroCanvas className="absolute inset-0" />}
      />

      <Services />

      <MethodSection />

      <ProcessTimeline eyebrow={c.process.eyebrow} title={c.process.title} steps={c.process.steps} />

      <section className="bg-white/60 py-24 sm:py-32">
        <Container>
          <SectionHeading eyebrow={c.assurances.eyebrow} title={c.assurances.title} />
          <CardGrid
            items={c.assurances.items}
            icons={[
              <IconUsers key="u" />,
              <IconShield key="s" />,
              <IconDoc key="d" />,
              <IconCalendar key="c" />,
              <IconSparkle key="k" />,
              <IconChat key="t" />,
            ]}
          />
        </Container>
      </section>

      <ServiceAreas {...c.areas} />

      <div className="bg-white/60">
        <Faq {...c.faq} />
      </div>

      <div className="pt-24 sm:pt-32">
        <FinalCta {...c.finalCta} />
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
    </div>
  );
}

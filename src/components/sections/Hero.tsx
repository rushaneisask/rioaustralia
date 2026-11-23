import type { ReactNode } from "react";
import { ArrowIcon, Button, CheckIcon, Eyebrow } from "@/components/ui/primitives";

/**
 * Shared hero layout.
 * Phones/tablets: copy first, then the page's 3D scene below it.
 * Desktop: the scene is full-bleed behind the copy (scenes shift their content right), so nothing is
 * ever clipped by a column edge.
 */
export function Hero({
  eyebrow,
  title,
  accentIndex,
  lead,
  primary,
  secondary,
  points,
  scene,
}: {
  eyebrow: string;
  title: readonly string[];
  accentIndex: number;
  lead: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  points?: readonly string[];
  scene: ReactNode;
}) {
  return (
    <section className="bg-caustic relative flex flex-col overflow-hidden pt-28 sm:pt-32 lg:min-h-[100svh] lg:flex-row lg:items-center lg:pt-24">
      <div className="relative h-[380px] w-full sm:h-[460px] lg:absolute lg:inset-0 lg:h-auto order-2">{scene}</div>
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8 order-1">
        <div className="flex max-w-xl flex-col items-start gap-6 lg:max-w-[40rem] lg:py-20 xl:max-w-[44rem]">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="font-display text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.035em] text-ink sm:text-6xl lg:text-[4.6rem]">
            {title.map((line, i) => (
              <span key={i} className={`block ${i === accentIndex ? "text-gradient" : ""}`}>
                {line}
              </span>
            ))}
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-ink-soft sm:text-xl">{lead}</p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button href={primary.href}>
              {primary.label} <ArrowIcon />
            </Button>
            <Button href={secondary.href} variant="secondary">
              {secondary.label}
            </Button>
          </div>
          {points ? (
            <ul className="mt-1 flex flex-wrap gap-x-5 gap-y-2">
              {points.map((p) => (
                <li key={p} className="inline-flex items-center gap-2 text-[0.95rem] font-medium text-teal-900">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-aqua-100 text-teal-700">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-mist" />
    </section>
  );
}

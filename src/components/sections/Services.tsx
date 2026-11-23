"use client";

import { useState } from "react";
import { site } from "@/content/site";
import { ServicesCanvas } from "@/components/three/HeroCanvases";
import { CheckIcon, Container, SectionHeading } from "@/components/ui/primitives";
import { IconSpray, IconSteam, IconWindow } from "@/components/ui/icons";

const icons = [<IconSpray key="s" />, <IconSteam key="t" />, <IconWindow key="w" />];

export function Services() {
  const s = site.cleaning.services;
  const [active, setActive] = useState(0);
  return (
    <section id="services" className="scroll-mt-24 py-24 sm:py-32">
      <Container>
        <SectionHeading eyebrow={s.eyebrow} title={s.title} />
        <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          <div className="order-2 flex flex-col gap-4 lg:order-1">
            {s.items.map((item, i) => {
              const on = i === active;
              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => setActive(i)}
                  className={`group relative cursor-pointer rounded-[1.75rem] p-6 text-left ring-1 transition-all duration-300 sm:p-7 ${
                    on
                      ? "bg-white shadow-[0_24px_50px_-28px_rgba(7,59,69,0.4)] ring-aqua-300"
                      : "bg-white/50 ring-line hover:bg-white"
                  }`}
                >
                  <div className="flex items-start gap-5">
                    <span
                      className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl transition-colors ${
                        on ? "bg-brand text-white" : "bg-aqua-100 text-teal-700"
                      }`}
                    >
                      {icons[i]}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-display text-xl font-semibold text-ink sm:text-2xl">
                        <button
                          type="button"
                          aria-expanded={on}
                          aria-controls={`service-panel-${item.id}`}
                          onClick={() => setActive(i)}
                          onFocus={() => setActive(i)}
                          className="cursor-pointer text-left after:absolute after:inset-0 after:rounded-[1.75rem] after:content-['']"
                        >
                          {item.title}
                        </button>
                      </h3>
                      <div
                        id={`service-panel-${item.id}`}
                        className={`grid transition-all duration-500 ease-out ${on ? "mt-2 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                      >
                        <div className="overflow-hidden">
                          <p className="leading-relaxed text-ink-soft">{item.body}</p>
                          <ul className="mt-4 flex flex-wrap gap-2">
                            {item.points.map((pt) => (
                              <li key={pt} className="inline-flex items-center gap-1.5 rounded-full bg-aqua-100 px-3 py-1.5 text-sm font-medium text-teal-900">
                                <CheckIcon className="h-3.5 w-3.5 text-teal-700" /> {pt}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="relative order-1 h-[340px] overflow-hidden rounded-[2rem] bg-gradient-to-b from-white to-aqua-100/70 ring-1 ring-line sm:h-[440px] lg:order-2 lg:h-[560px]">
            <ServicesCanvas className="absolute inset-0" active={active} label={`3D illustration of ${s.items[active].title.toLowerCase()} equipment.`} />
          </div>
        </div>
      </Container>
    </section>
  );
}

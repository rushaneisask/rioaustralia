"use client";

import { motion, useMotionTemplate, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import dynamic from "next/dynamic";
import { useRef } from "react";
import { site } from "@/content/site";
import { usePrefersReducedMotion } from "@/hooks/useReducedMotion";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { STEPS, copyState, introState, outroState, railFill, smoothstep } from "./timeline";

const Stage = dynamic(() => import("@/components/three/Stage").then((m) => m.Stage), { ssr: false });
const MethodScene = dynamic(() => import("./MethodScene").then((m) => m.MethodScene), { ssr: false });

const copy = site.cleaning.method;

export function MethodSection() {
  const reduced = usePrefersReducedMotion();
  return reduced ? <MethodStatic /> : <MethodScroll />;
}

/* ------------------------------------------------------------------ */

function MethodScroll() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 32, mass: 0.35, restDelta: 0.0001 });

  // the whole scene fades in as the section arrives and out as it leaves
  const { scrollYProgress: arrive } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const sceneOpacity = useTransform(arrive, [0, 0.07, 0.93, 1], [0, 1, 1, 0]);

  return (
    <section
      ref={ref}
      id="method"
      aria-labelledby="method-title"
      className="relative h-[720svh] scroll-mt-0 md:h-[800svh]"
      data-brand="cleaning"
    >
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        {/* soft backdrop that melts into the sections above and below */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 60% at 50% 40%, #ffffff 0%, #eaf8f9 55%, var(--mist) 100%)",
          }}
        />
        <motion.div
          className="absolute inset-0"
          style={{
            opacity: sceneOpacity,
            maskImage: "linear-gradient(to bottom, transparent 0%, black 9%, black 91%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 9%, black 91%, transparent 100%)",
          }}
        >
          <Stage
            className="absolute inset-0"
            alwaysOn={false}
            shadows
            label="A 3D office being cleaned in five steps: dusting, wiping desks, emptying bins, vacuuming the carpet and mopping the floor."
            camera={{ position: [6.4, 3.9, 7.4], fov: 36, near: 0.1, far: 60 }}
          >
            {(tier) => <MethodScene progress={progress} tier={tier} />}
          </Stage>
        </motion.div>

        {/* intro title */}
        <IntroCopy progress={progress} />

        {/* step copy: one block at a time, scrubbed by scroll */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[6.5rem] sm:bottom-28 md:bottom-auto md:top-1/2 md:-translate-y-1/2">
          <Container>
            <div className="relative h-[13.5rem] max-w-md sm:h-52">
              {STEPS.map((s, i) => (
                <StepCopy key={s.id} index={i} progress={progress} />
              ))}
            </div>
          </Container>
        </div>

        <OutroCopy progress={progress} />
        <Rail progress={progress} />
      </div>

      {/* screen readers get every step at once */}
      <ol className="sr-only">
        {copy.steps.map((s) => (
          <li key={s.id}>
            {s.title} {s.body}
          </li>
        ))}
      </ol>
    </section>
  );
}

function IntroCopy({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, (p) => introState(p).opacity);
  const y = useTransform(progress, (p) => introState(p).y);
  return (
    <motion.div style={{ opacity, y }} className="pointer-events-none absolute inset-x-0 top-24 sm:top-28">
      <div
        aria-hidden
        className="absolute -top-24 left-0 h-[150%] w-full max-w-3xl"
        style={{ background: "radial-gradient(60% 55% at 22% 40%, rgba(243,251,251,0.92) 0%, rgba(243,251,251,0.6) 50%, transparent 80%)" }}
      />
      <Container className="relative flex flex-col items-start gap-4">
        <Eyebrow>{copy.eyebrow}</Eyebrow>
        <h2 id="method-title" className="max-w-xl font-display text-[2.2rem] font-semibold leading-[1.05] text-ink sm:text-6xl">
          {copy.title}
        </h2>
        <p className="max-w-md text-lg leading-relaxed text-ink-soft">{copy.lead}</p>
      </Container>
    </motion.div>
  );
}

function StepCopy({ index, progress }: { index: number; progress: MotionValue<number> }) {
  const step = copy.steps[index];
  const opacity = useTransform(progress, (p) => copyState(p, index).opacity);
  const y = useTransform(progress, (p) => copyState(p, index).y);
  const blurPx = useTransform(progress, (p) => copyState(p, index).blur);
  const filter = useMotionTemplate`blur(${blurPx}px)`;
  const visibility = useTransform(opacity, (o) => (o < 0.01 ? "hidden" : "visible"));
  return (
    <motion.article
      style={{ opacity, y, filter, visibility }}
      className="absolute inset-x-0 bottom-0 rounded-3xl bg-white/80 p-6 shadow-[0_20px_50px_-24px_rgba(7,59,69,0.35)] ring-1 ring-white backdrop-blur-xl sm:p-7"
      aria-hidden
    >
      <p className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-brand">
        <span className="text-coral">0{index + 1}</span> · {step.label}
      </p>
      <h3 className="mt-2 font-display text-2xl font-semibold leading-tight text-ink sm:text-[1.75rem]">{step.title}</h3>
      <p className="mt-2.5 leading-relaxed text-ink-soft">{step.body}</p>
    </motion.article>
  );
}

function OutroCopy({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, (p) => outroState(p).opacity);
  const y = useTransform(progress, (p) => outroState(p).y);
  return (
    <motion.div style={{ opacity, y }} className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2">
      <Container className="flex flex-col items-center text-center">
        <p className="rounded-full bg-white/85 px-6 py-3 font-display text-2xl font-semibold text-teal-900 shadow-[0_20px_50px_-24px_rgba(7,59,69,0.4)] ring-1 ring-white backdrop-blur-xl sm:text-4xl">
          {copy.done}{" "}
          <span aria-hidden className="text-coral">
            ✦
          </span>
        </p>
      </Container>
    </motion.div>
  );
}

function Rail({ progress }: { progress: MotionValue<number> }) {
  const railOpacity = useTransform(progress, (p) => smoothstep(0.02, 0.07, p) * (1 - smoothstep(0.95, 0.99, p)));
  return (
    <motion.div style={{ opacity: railOpacity }} className="pointer-events-none absolute inset-x-0 bottom-6 sm:bottom-8">
      <Container>
        <ol className="mx-auto flex max-w-3xl items-start gap-2 rounded-full bg-white/75 px-4 py-3 ring-1 ring-white backdrop-blur-xl sm:gap-3 sm:px-6">
          {copy.steps.map((s, i) => (
            <RailItem key={s.id} index={i} label={s.label} progress={progress} />
          ))}
        </ol>
      </Container>
    </motion.div>
  );
}

function RailItem({ index, label, progress }: { index: number; label: string; progress: MotionValue<number> }) {
  const fill = useTransform(progress, (p) => railFill(p, index));
  const active = useTransform(progress, (p) => {
    const f = railFill(p, index);
    return f > 0 && f < 1 ? 1 : f >= 1 ? 0.75 : 0.45;
  });
  return (
    <li className="flex min-w-0 flex-1 flex-col gap-1.5">
      <motion.span style={{ opacity: active }} className="truncate text-center font-display text-[0.62rem] font-semibold uppercase tracking-[0.04em] text-teal-900 min-[400px]:text-[0.68rem] sm:text-xs sm:tracking-[0.12em]">
        {label}
      </motion.span>
      <span className="relative h-1 overflow-hidden rounded-full bg-aqua-100">
        <motion.span style={{ scaleX: fill }} className="absolute inset-0 origin-left rounded-full bg-gradient-to-r from-aqua-500 to-teal-700" />
      </span>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Reduced motion: no pinning, no scrubbing. The finished room and all  */
/* five steps are shown in their final state.                          */
/* ------------------------------------------------------------------ */

function MethodStatic() {
  return (
    <section id="method" aria-labelledby="method-title" className="relative py-24 sm:py-32" data-brand="cleaning">
      <Container className="flex flex-col gap-12">
        <div className="flex max-w-2xl flex-col gap-4">
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <h2 id="method-title" className="font-display text-[2.1rem] font-semibold leading-[1.08] text-ink sm:text-5xl">
            {copy.title}
          </h2>
          <p className="text-lg leading-relaxed text-ink-soft">{copy.lead}</p>
        </div>
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[2rem] bg-white ring-1 ring-line">
          <Stage
            className="absolute inset-0"
            shadows
            label="A spotless 3D office after a full clean."
            camera={{ position: [6.0, 3.6, 6.9], fov: 36, near: 0.1, far: 60 }}
          >
            {(tier) => <MethodScene tier={tier} staticProgress={1} />}
          </Stage>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {copy.steps.map((s, i) => (
            <li key={s.id} className="rounded-3xl bg-white p-6 ring-1 ring-line">
              <p className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-brand">
                <span className="text-coral">0{i + 1}</span> · {s.label}
              </p>
              <h3 className="mt-2 font-display text-xl font-semibold text-ink">{s.title}</h3>
              <p className="mt-2 text-ink-soft">{s.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

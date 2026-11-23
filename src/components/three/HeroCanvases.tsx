"use client";

import dynamic from "next/dynamic";
import { usePrefersReducedMotion } from "@/hooks/useReducedMotion";

const Stage = dynamic(() => import("./Stage").then((m) => m.Stage), { ssr: false });
const HomeHeroScene = dynamic(() => import("./HomeHeroScene").then((m) => m.HomeHeroScene), { ssr: false });
const CleaningHeroScene = dynamic(() => import("./CleaningHeroScene").then((m) => m.CleaningHeroScene), { ssr: false });
const ServicesScene = dynamic(() => import("./ServicesScene").then((m) => m.ServicesScene), { ssr: false });

export function HomeHeroCanvas({ className = "" }: { className?: string }) {
  const reduced = usePrefersReducedMotion();
  return (
    <Stage className={className} label="A glossy 3D water droplet with soap bubbles and cleaning products floating around it." camera={{ position: [0, 0.2, 7.2], fov: 32 }}>
      {(tier) => <HomeHeroScene tier={tier} reduced={reduced} />}
    </Stage>
  );
}

export function CleaningHeroCanvas({ className = "" }: { className?: string }) {
  const reduced = usePrefersReducedMotion();
  return (
    <Stage
      className={className}
      shadows
      label="A 3D set of commercial cleaning equipment: a mop bucket, flat mop, upright vacuum, spray bottle, microfibre cloths and a wet floor sign."
      camera={{ position: [0, 1.2, 6.4], fov: 32 }}
    >
      {(tier) => <CleaningHeroScene tier={tier} reduced={reduced} />}
    </Stage>
  );
}

export function ServicesCanvas({ className = "", active, label }: { className?: string; active: number; label: string }) {
  const reduced = usePrefersReducedMotion();
  return (
    <Stage className={className} shadows label={label} camera={{ position: [0, 1.1, 5.6], fov: 32 }}>
      {(tier) => <ServicesScene tier={tier} active={active} reduced={reduced} />}
    </Stage>
  );
}

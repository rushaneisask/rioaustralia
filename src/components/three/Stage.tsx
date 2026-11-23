"use client";

import { Canvas, type CanvasProps } from "@react-three/fiber";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import { useDeviceTier, type DeviceTier } from "@/hooks/useDeviceTier";

type StageProps = {
  children: (tier: DeviceTier) => ReactNode;
  className?: string;
  camera?: CanvasProps["camera"];
  shadows?: boolean;
  /** Keep rendering when offscreen (only for pinned scroll scenes that manage their own visibility). */
  alwaysOn?: boolean;
  /** Accessible description of what the scene shows. */
  label: string;
  /** Rendered instead of the canvas when WebGL is unavailable. */
  fallback?: ReactNode;
};

const DPR: Record<DeviceTier, [number, number]> = {
  high: [1, 2],
  mid: [1, 1.5],
  low: [1, 1],
};

/**
 * The one shared WebGL wrapper. Rules:
 * - Pauses rendering whenever the canvas is offscreen (IntersectionObserver).
 * - Caps pixel ratio per device tier.
 * - Hands the device tier to the scene so it can scale effects down.
 */
export function Stage({ children, className = "", camera, shadows = false, alwaysOn = false, label, fallback }: StageProps) {
  const tier = useDeviceTier();
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [webgl] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      return !!document.createElement("canvas").getContext("webgl2");
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "200px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className={className} role="img" aria-label={label}>
      {webgl ? (
        <Canvas
          frameloop={visible || alwaysOn ? "always" : "never"}
          dpr={DPR[tier]}
          shadows={shadows && tier !== "low" ? "soft" : false}
          camera={camera ?? { position: [0, 0, 6], fov: 35 }}
          gl={{
            antialias: tier !== "high", // high tier uses SMAA in post
            alpha: true,
            powerPreference: "high-performance",
            stencil: false,
          }}
          onCreated={({ gl }) => {
            gl.toneMapping = ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.05;
            gl.outputColorSpace = SRGBColorSpace;
          }}
          style={{ pointerEvents: "none" }}
        >
          {children(tier)}
        </Canvas>
      ) : (
        fallback ?? null
      )}
    </div>
  );
}

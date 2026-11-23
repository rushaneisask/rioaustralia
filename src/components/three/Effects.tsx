"use client";

import { EffectComposer, Bloom, Vignette, SMAA, N8AO, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import { Vector2 } from "three";
import type { DeviceTier } from "@/hooks/useDeviceTier";

/**
 * Post-processing scaled by device tier.
 * high: ambient occlusion + bloom + vignette + SMAA. mid: bloom + vignette. low: nothing.
 */
/**
 * Works around a bug in @react-three/postprocessing 3.2.x: EffectComposer reads the canvas size into a
 * single module-level Vector2 during render and applies it later in an effect. With several canvases on
 * one page, every composer applies whichever canvas rendered LAST, which resizes the other canvases'
 * renderers (they ended up stuck in a corner). This guard runs before the composer each frame and puts
 * the renderer back to its own canvas size, after which the composer resizes itself correctly.
 */
function RendererSizeGuard() {
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);
  const current = useMemo(() => new Vector2(), []);
  useFrame(() => {
    gl.getSize(current);
    if (current.x !== size.width || current.y !== size.height) gl.setSize(size.width, size.height);
  });
  return null;
}

export function Effects(props: { tier: DeviceTier; ao?: boolean }) {
  if (props.tier === "low") return null;
  return (
    <>
      <RendererSizeGuard />
      <Composer {...props} />
    </>
  );
}

function Composer({ tier, ao = true }: { tier: DeviceTier; ao?: boolean }) {
  if (tier === "mid") {
    return (
      <EffectComposer multisampling={0} enableNormalPass={false}>
        <Bloom mipmapBlur intensity={0.25} luminanceThreshold={0.92} luminanceSmoothing={0.2} />
        <Vignette eskil={false} offset={0.3} darkness={0.28} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    );
  }
  if (ao) {
    return (
      <EffectComposer multisampling={0} enableNormalPass={false}>
        <N8AO aoRadius={0.6} intensity={1.6} distanceFalloff={0.6} quality="medium" halfRes />
        <Bloom mipmapBlur intensity={0.3} luminanceThreshold={0.9} luminanceSmoothing={0.2} />
        <Vignette eskil={false} offset={0.28} darkness={0.3} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <SMAA />
      </EffectComposer>
    );
  }
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom mipmapBlur intensity={0.3} luminanceThreshold={0.9} luminanceSmoothing={0.2} />
      <Vignette eskil={false} offset={0.28} darkness={0.3} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <SMAA />
    </EffectComposer>
  );
}

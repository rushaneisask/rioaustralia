"use client";

import { EffectComposer, Bloom, Vignette, SMAA, N8AO, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import type { DeviceTier } from "@/hooks/useDeviceTier";

/**
 * Post-processing scaled by device tier.
 * high: ambient occlusion + bloom + vignette + SMAA. mid: bloom + vignette. low: nothing.
 */
export function Effects({ tier, ao = true }: { tier: DeviceTier; ao?: boolean }) {
  if (tier === "low") return null;
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

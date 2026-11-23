"use client";

import { Environment, Lightformer } from "@react-three/drei";

/**
 * Bright, airy studio lighting built only from Lightformers (no HDRI files, no CDN).
 * Rendered once into an environment map (frames = 1) so it costs nothing per frame.
 */
export function StudioLights({ intensity = 1 }: { intensity?: number }) {
  return (
    <>
      <ambientLight intensity={0.35 * intensity} color="#eafcfd" />
      <directionalLight position={[3, 5, 4]} intensity={1.6 * intensity} color="#fffaf2" />
      <directionalLight position={[-4, 2, -2]} intensity={0.5 * intensity} color="#bdeff2" />
      <Environment resolution={256} frames={1} environmentIntensity={0.9 * intensity}>
        <color attach="background" args={["#e8f7f8"]} />
        <Lightformer form="rect" intensity={3} color="#ffffff" position={[0, 5, 2]} rotation={[Math.PI / 2, 0, 0]} scale={[10, 4, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#d7f6f8" position={[-6, 1, 0]} rotation={[0, Math.PI / 2, 0]} scale={[6, 4, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#ffffff" position={[6, 1.5, 1]} rotation={[0, -Math.PI / 2, 0]} scale={[6, 3, 1]} />
        <Lightformer form="ring" intensity={1.2} color="#ffd9cf" position={[2, 2, -5]} scale={2.5} />
        <Lightformer form="rect" intensity={0.8} color="#7adde3" position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[10, 10, 1]} />
      </Environment>
    </>
  );
}

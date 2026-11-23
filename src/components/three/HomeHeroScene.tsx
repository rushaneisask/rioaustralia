"use client";

import { Float, MeshTransmissionMaterial, Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Color, MathUtils, type Group } from "three";

const DROP_BACKDROP = new Color("#eaf9fa");
import type { DeviceTier } from "@/hooks/useDeviceTier";
import { StudioLights } from "./StudioLights";
import { Effects } from "./Effects";
import { Bubbles, pointer, useDropletGeometry, useHeroLayout } from "./shared";
import { SprayBottle, ClothStack, PALETTE } from "./equipment";

/** Group hub hero: a large glass water droplet with the coral sparkle, bubbles and a few tools in orbit. */
export function HomeHeroScene({ tier, reduced }: { tier: DeviceTier; reduced: boolean }) {
  const rig = useRef<Group>(null);
  const drop = useRef<Group>(null);
  const geo = useDropletGeometry(tier === "low" ? 48 : 96);
  const layout = useHeroLayout();

  useFrame(({ clock }, dt) => {
    const t = reduced ? 0 : clock.elapsedTime;
    if (rig.current) {
      rig.current.rotation.y = MathUtils.damp(rig.current.rotation.y, pointer.x * 0.25, 3, dt);
      rig.current.rotation.x = MathUtils.damp(rig.current.rotation.x, -pointer.y * 0.12, 3, dt);
    }
    if (drop.current) drop.current.rotation.y = t * 0.25;
  });

  return (
    <>
      <StudioLights />
      <group position-x={layout.x} scale={layout.scale}>
      <group ref={rig}>
        <Float speed={reduced ? 0 : 1.4} rotationIntensity={0.25} floatIntensity={0.6}>
          <group ref={drop} position={[0, 0.1, 0]} scale={1.35}>
            <mesh geometry={geo}>
              {tier !== "low" ? (
                <MeshTransmissionMaterial
                  samples={tier === "high" ? 6 : 3}
                  resolution={tier === "high" ? 512 : 256}
                  thickness={0.7}
                  roughness={0.03}
                  ior={1.33}
                  chromaticAberration={0.05}
                  anisotropicBlur={0.1}
                  distortion={0.2}
                  distortionScale={0.35}
                  temporalDistortion={0.06}
                  color="#d6f7f8"
                  attenuationColor="#5fd8de"
                  attenuationDistance={2.2}
                  // the canvas is transparent, so give the refraction a bright backdrop to see through
                  background={DROP_BACKDROP}
                />
              ) : (
                <meshPhysicalMaterial
                  color="#6fd3db"
                  roughness={0.06}
                  metalness={0}
                  clearcoat={1}
                  clearcoatRoughness={0.05}
                  transparent
                  opacity={0.82}
                  envMapIntensity={1.2}
                />
              )}
            </mesh>
          </group>
        </Float>

        {/* coral sparkle, the brand splash */}
        <Float speed={reduced ? 0 : 2} floatIntensity={0.4} rotationIntensity={0.6}>
          <group position={[0.95, 1.3, 0.3]} rotation={[0, 0, 0.2]} scale={0.8}>
            <Sparkle />
          </group>
        </Float>

        <Float speed={reduced ? 0 : 1.1} floatIntensity={0.8} rotationIntensity={0.5}>
          <SprayBottle position={[-1.6, -1.55, 0.5]} rotation={[0.1, 0.6, -0.15]} scale={2.8} />
        </Float>
        <Float speed={reduced ? 0 : 0.9} floatIntensity={0.7} rotationIntensity={0.4}>
          <ClothStack position={[1.05, -1.3, 0.8]} rotation={[0.5, -0.5, 0.15]} scale={2.6} />
        </Float>
      </group>

      <Bubbles count={tier === "low" ? 10 : 22} spread={[6.5, 4.5, 2.5]} center={[0, 0, -0.4]} animate={!reduced} />
      </group>
      {tier !== "low" && !reduced ? (
        <Sparkles count={40} scale={[6, 4, 2]} size={2.2} speed={0.25} color="#ffffff" opacity={0.8} />
      ) : null}
      <Effects tier={tier} ao={false} />
    </>
  );
}

/** Four-point coral sparkle (extruded star). */
function Sparkle() {
  return (
    <group>
      {[0, Math.PI / 2].map((r) => (
        <mesh key={r} rotation={[0, 0, r]}>
          <octahedronGeometry args={[0.22, 0]} />
          <meshStandardMaterial color={PALETTE.coral} emissive={PALETTE.coral} emissiveIntensity={0.35} roughness={0.25} />
        </mesh>
      ))}
      <mesh scale={[0.06, 0.42, 0.06]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={PALETTE.coral} emissive={PALETTE.coral} emissiveIntensity={0.4} roughness={0.25} />
      </mesh>
      <mesh scale={[0.42, 0.06, 0.06]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={PALETTE.coral} emissive={PALETTE.coral} emissiveIntensity={0.4} roughness={0.25} />
      </mesh>
    </group>
  );
}

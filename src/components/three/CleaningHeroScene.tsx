"use client";

import { ContactShadows, Float, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { MathUtils, type Group } from "three";
import type { DeviceTier } from "@/hooks/useDeviceTier";
import { StudioLights } from "./StudioLights";
import { Effects } from "./Effects";
import { Bubbles, pointer, useHeroLayout } from "./shared";
import { Bucket, ClothStack, FlatMop, SprayBottle, UprightVacuum, WetFloorSign, PALETTE } from "./equipment";

/** Cleaning division hero: a tidy kit of commercial cleaning equipment on a soft podium. */
export function CleaningHeroScene({ tier, reduced }: { tier: DeviceTier; reduced: boolean }) {
  const rig = useRef<Group>(null);
  const layout = useHeroLayout();

  useFrame(({ clock }, dt) => {
    if (!rig.current) return;
    const idle = reduced ? 0 : Math.sin(clock.elapsedTime * 0.25) * 0.08;
    rig.current.rotation.y = MathUtils.damp(rig.current.rotation.y, -0.55 + pointer.x * 0.22 + idle, 2.5, dt);
    rig.current.rotation.x = MathUtils.damp(rig.current.rotation.x, 0.02 - pointer.y * 0.05, 2.5, dt);
  });

  return (
    <>
      <StudioLights />
      <group position-x={layout.x} scale={layout.scale}>
      <group ref={rig} position={[0, -1.05, 0]} scale={1.55}>
        {/* podium */}
        <mesh position={[0, -0.04, 0]} receiveShadow>
          <cylinderGeometry args={[1.25, 1.3, 0.08, 96]} />
          <meshStandardMaterial color="#ffffff" roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.12, 1.16, 96]} />
          <meshStandardMaterial color={PALETTE.aqua} emissive={PALETTE.aqua} emissiveIntensity={0.4} />
        </mesh>

        <Bucket position={[0.2, 0, 0.15]} rotation={[0, 0.4, 0]} />
        <FlatMop position={[0.55, 0, 0.45]} rotation={[0, -0.6, 0]} lean={0.12} />
        <UprightVacuum position={[-0.6, 0, -0.2]} rotation={[0, 0.5, 0]} lean={0.08} />
        <WetFloorSign position={[0.75, 0, -0.45]} rotation={[0, -0.9, 0]} />
        <Float speed={reduced ? 0 : 1.6} floatIntensity={0.25} rotationIntensity={0.3} floatingRange={[0.05, 0.18]}>
          <SprayBottle position={[-0.25, 0.25, 0.65]} rotation={[0, 0.8, 0.12]} scale={1.15} />
        </Float>
        <Float speed={reduced ? 0 : 1.2} floatIntensity={0.2} rotationIntensity={0.2} floatingRange={[0.04, 0.12]}>
          <ClothStack position={[-0.75, 0.2, 0.45]} rotation={[0.1, -0.3, 0.05]} scale={1.15} />
        </Float>
        <RoundedBox args={[0.16, 0.12, 0.16]} radius={0.03} position={[-0.95, 0.06, 0.05]} castShadow>
          <meshStandardMaterial color={PALETTE.coral} roughness={0.4} />
        </RoundedBox>
      </group>

      <ContactShadows
        position={[layout.x, -1.12 * layout.scale, 0]}
        scale={6}
        blur={2.6}
        far={2}
        opacity={0.35}
        color="#0b4f57"
        frames={tier === "high" && !reduced ? Infinity : 1}
        resolution={tier === "low" ? 256 : 512}
      />
      <Bubbles count={tier === "low" ? 8 : 18} spread={[6, 4, 2.5]} center={[0, 0.3, -0.6]} animate={!reduced} />
      </group>
      <Effects tier={tier} ao={false} />
    </>
  );
}

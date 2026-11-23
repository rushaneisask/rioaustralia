"use client";

import { ContactShadows, Float, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { AdditiveBlending, BufferAttribute, BufferGeometry, MathUtils, type Group, type Points, type ShaderMaterial } from "three";
import type { DeviceTier } from "@/hooks/useDeviceTier";
import { StudioLights } from "./StudioLights";
import { Effects } from "./Effects";
import { Bucket, ClothStack, SprayBottle, Squeegee, SteamCleaner, PALETTE } from "./equipment";
import { smudgeMask, softDotTexture } from "./textures";
import { createDirtMaterial } from "@/components/method/DirtMaterial";

/** One canvas for the services section. The equipment shown follows the selected service. */
export function ServicesScene({ tier, active, reduced }: { tier: DeviceTier; active: number; reduced: boolean }) {
  const groups = useRef<(Group | null)[]>([]);
  const turn = useRef<Group>(null);

  useFrame(({ clock }, dt) => {
    groups.current.forEach((g, i) => {
      if (!g) return;
      const target = i === active ? 1 : 0;
      const s = MathUtils.damp(g.scale.x, target, 7, dt);
      g.scale.setScalar(Math.max(0.0001, s));
      g.visible = s > 0.002;
      g.position.y = (1 - s) * -0.4;
    });
    if (turn.current) turn.current.rotation.y = reduced ? -0.5 : -0.5 + Math.sin(clock.elapsedTime * 0.3) * 0.25;
  });

  return (
    <>
      <StudioLights />
      <group ref={turn} position={[0, -0.95, 0]} scale={1.6}>
        <mesh position={[0, -0.03, 0]} receiveShadow>
          <cylinderGeometry args={[0.95, 1, 0.06, 96]} />
          <meshStandardMaterial color="#ffffff" roughness={0.35} />
        </mesh>
        <group ref={(el) => void (groups.current[0] = el)}>
          <Bucket position={[0.25, 0, -0.1]} rotation={[0, 0.3, 0]} />
          <Float speed={reduced ? 0 : 1.5} floatIntensity={0.3} floatingRange={[0.04, 0.14]}>
            <SprayBottle position={[-0.25, 0.08, 0.3]} rotation={[0, 0.7, 0.1]} scale={1.3} />
          </Float>
          <ClothStack position={[-0.45, 0, -0.25]} rotation={[0, 0.4, 0]} scale={1.2} />
        </group>
        <group ref={(el) => void (groups.current[1] = el)}>
          <SteamCleaner position={[-0.25, 0, 0]} rotation={[0, 0.4, 0]} />
          <Steam tier={tier} reduced={reduced} />
        </group>
        <group ref={(el) => void (groups.current[2] = el)}>
          <WindowPane reduced={reduced} />
        </group>
      </group>
      <ContactShadows position={[0, -1.0, 0]} scale={5} blur={2.4} far={2} opacity={0.3} color="#0b4f57" frames={1} />
      <Effects tier={tier} ao={false} />
    </>
  );
}

function Steam({ tier, reduced }: { tier: DeviceTier; reduced: boolean }) {
  const count = tier === "low" ? 24 : 60;
  const ref = useRef<Points>(null);
  const data = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(count * 3), 3));
    const seed = Array.from({ length: count }, (_, i) => (Math.sin(i * 77.7) * 9999) % 1);
    return { g, seed };
  }, [count]);
  const tex = softDotTexture();
  useFrame(({ clock }) => {
    const arr = data.g.attributes.position.array as Float32Array;
    const t = reduced ? 1 : clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const s = Math.abs(data.seed[i]);
      const life = (t * 0.35 + s) % 1;
      arr[i * 3] = 0.33 + Math.sin(s * 40 + t) * 0.03 + life * 0.18 * Math.sin(s * 9);
      arr[i * 3 + 1] = 1.08 + life * 0.7;
      arr[i * 3 + 2] = 0.04 + life * 0.12 * Math.cos(s * 7);
    }
    data.g.attributes.position.needsUpdate = true;
  });
  return (
    <points ref={ref} geometry={data.g} frustumCulled={false}>
      <pointsMaterial map={tex} size={0.16} transparent opacity={0.55} depthWrite={false} blending={AdditiveBlending} color="#ffffff" />
    </points>
  );
}

/** A window pane being squeegeed: the same "finished edge" motif as the method scene. */
function WindowPane({ reduced }: { reduced: boolean }) {
  const mat = useMemo(
    () => createDirtMaterial({ mask: smudgeMask(512), color: "#8a9aa0", opacity: 0.7, repeat: [1.2, 1.4], axis: 1, reverse: true }),
    [],
  );
  const squeegee = useRef<Group>(null);
  useFrame(({ clock }) => {
    const cycle = reduced ? 0.999 : (clock.elapsedTime * 0.18) % 1.25;
    const p = Math.min(1, cycle);
    (mat as ShaderMaterial).uniforms.uProgress.value = p;
    if (squeegee.current) {
      const y = 1.25 - MathUtils.lerp(-0.06, 1.06, p) * 1.0;
      squeegee.current.position.set(Math.sin(p * Math.PI * 6) * 0.1, Math.min(1.25, Math.max(0.25, y)), 0.06);
      squeegee.current.visible = cycle < 1.05;
    }
  });
  return (
    <group position={[0, 0, -0.1]}>
      {/* frame */}
      {[
        [0, 1.3, 1.0, 0.06],
        [0, 0.2, 1.0, 0.06],
      ].map(([x, y, w, h], i) => (
        <RoundedBox key={i} args={[w, h, 0.08]} radius={0.01} position={[x, y, 0]} castShadow>
          <meshStandardMaterial color={PALETTE.charcoal} metalness={0.5} roughness={0.35} />
        </RoundedBox>
      ))}
      {[-0.47, 0.47].map((x) => (
        <RoundedBox key={x} args={[0.06, 1.16, 0.08]} radius={0.01} position={[x, 0.75, 0]} castShadow>
          <meshStandardMaterial color={PALETTE.charcoal} metalness={0.5} roughness={0.35} />
        </RoundedBox>
      ))}
      <mesh position={[0, 0.75, 0]}>
        <planeGeometry args={[0.88, 1.04]} />
        <meshPhysicalMaterial color="#e6fafb" transparent opacity={0.35} roughness={0.02} clearcoat={1} />
      </mesh>
      <mesh position={[0, 0.75, 0.006]} material={mat}>
        <planeGeometry args={[0.88, 1.04]} />
      </mesh>
      <group ref={squeegee}>
        <Squeegee rotation={[0, 0, 0]} />
      </group>
    </group>
  );
}

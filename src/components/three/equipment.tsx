"use client";

/**
 * Cleaning equipment and office props, modelled in code at real-world scale (metres).
 * Every model's origin sits where it touches the floor (or its natural grip point for hand tools).
 */
import { RoundedBox } from "@react-three/drei";
import { useMemo, forwardRef, type ComponentProps } from "react";
import { CatmullRomCurve3, LatheGeometry, Vector2, Vector3, TubeGeometry, type Group } from "three";

type G = ComponentProps<"group">;

export const PALETTE = {
  teal: "#0b7a85",
  tealDeep: "#085e67",
  aqua: "#19b8c4",
  aquaLight: "#7adde3",
  coral: "#ff6b4a",
  white: "#f7fafa",
  grey: "#9aa7ab",
  charcoal: "#2b3a40",
  steel: "#c9d2d5",
};

/* --------------------------------- tools --------------------------------- */

/** Trigger spray bottle, ~27 cm tall. */
export function SprayBottle({ liquid = PALETTE.aqua, ...props }: G & { liquid?: string }) {
  const body = useMemo(() => {
    const pts = [
      [0, 0], [0.043, 0], [0.047, 0.006], [0.048, 0.03], [0.046, 0.12], [0.05, 0.15], [0.05, 0.168],
      [0.04, 0.19], [0.02, 0.205], [0.018, 0.22], [0, 0.22],
    ].map(([x, y]) => new Vector2(x, y));
    return new LatheGeometry(pts, 48);
  }, []);
  const fluid = useMemo(() => {
    const pts = [[0, 0.004], [0.042, 0.004], [0.044, 0.03], [0.042, 0.11], [0, 0.11]].map(([x, y]) => new Vector2(x, y));
    return new LatheGeometry(pts, 40);
  }, []);
  return (
    <group {...props}>
      <mesh geometry={body} castShadow>
        <meshPhysicalMaterial color="#e9fbfc" roughness={0.1} clearcoat={1} transparent opacity={0.5} depthWrite={false} envMapIntensity={1.6} />
      </mesh>
      <mesh geometry={fluid}>
        <meshStandardMaterial color={liquid} roughness={0.2} transparent opacity={0.85} />
      </mesh>
      {/* label */}
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.0475, 0.0475, 0.06, 48, 1, true]} />
        <meshStandardMaterial color="#e3eced" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.07, 0.0476]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.03, 0.012]} />
        <meshStandardMaterial color={PALETTE.coral} />
      </mesh>
      {/* collar */}
      <mesh position={[0, 0.226, 0]} castShadow>
        <cylinderGeometry args={[0.022, 0.022, 0.014, 32]} />
        <meshStandardMaterial color={PALETTE.teal} roughness={0.35} />
      </mesh>
      {/* trigger head */}
      <RoundedBox args={[0.034, 0.05, 0.085]} radius={0.012} position={[0, 0.258, 0.016]} castShadow>
        <meshStandardMaterial color={PALETTE.teal} roughness={0.35} />
      </RoundedBox>
      <mesh position={[0, 0.272, 0.066]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.007, 0.009, 0.022, 16]} />
        <meshStandardMaterial color={PALETTE.charcoal} roughness={0.5} />
      </mesh>
      {/* trigger */}
      <RoundedBox args={[0.016, 0.055, 0.012]} radius={0.005} position={[0, 0.215, 0.05]} rotation={[0.25, 0, 0]}>
        <meshStandardMaterial color={PALETTE.tealDeep} roughness={0.4} />
      </RoundedBox>
    </group>
  );
}

/** Commercial mop bucket with water, ~30 cm tall. */
export function Bucket(props: G) {
  const handle = useMemo(() => {
    const curve = new CatmullRomCurve3(
      Array.from({ length: 13 }, (_, i) => {
        const a = (i / 12) * Math.PI;
        return new Vector3(Math.cos(a) * 0.175, 0.3 + Math.sin(a) * 0.12, 0);
      }),
    );
    return new TubeGeometry(curve, 40, 0.005, 8, false);
  }, []);
  return (
    <group {...props}>
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.17, 0.14, 0.3, 48, 1, true]} />
        <meshStandardMaterial color={PALETTE.aqua} roughness={0.35} side={2} />
      </mesh>
      <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.17, 0.008, 12, 48]} />
        <meshStandardMaterial color={PALETTE.teal} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.14, 40]} />
        <meshStandardMaterial color={PALETTE.teal} />
      </mesh>
      <mesh position={[0, 0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.158, 40]} />
        <meshPhysicalMaterial color="#8fdfe5" roughness={0.05} transparent opacity={0.9} clearcoat={1} envMapIntensity={1.5} />
      </mesh>
      <mesh geometry={handle} castShadow>
        <meshStandardMaterial color={PALETTE.steel} metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

/** Flat microfibre mop. Origin at the centre of the pad on the floor. Handle leans back along -z. */
export const FlatMop = forwardRef<Group, G & { lean?: number }>(function FlatMop({ lean = 0.42, ...props }, ref) {
  return (
    <group ref={ref} {...props}>
      <RoundedBox args={[0.44, 0.022, 0.13]} radius={0.008} position={[0, 0.011, 0]} castShadow>
        <meshStandardMaterial color={PALETTE.aqua} roughness={0.95} />
      </RoundedBox>
      <RoundedBox args={[0.42, 0.018, 0.1]} radius={0.006} position={[0, 0.03, 0]} castShadow>
        <meshStandardMaterial color={PALETTE.charcoal} roughness={0.5} />
      </RoundedBox>
      <group position={[0, 0.045, 0]} rotation={[-lean, 0, 0]}>
        <mesh position={[0, 0.7, 0]} castShadow>
          <cylinderGeometry args={[0.013, 0.013, 1.4, 16]} />
          <meshStandardMaterial color={PALETTE.steel} metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0, 1.33, 0]}>
          <cylinderGeometry args={[0.017, 0.017, 0.14, 16]} />
          <meshStandardMaterial color={PALETTE.teal} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <sphereGeometry args={[0.022, 16, 12]} />
          <meshStandardMaterial color={PALETTE.charcoal} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
});

/** Upright commercial vacuum, ~1.15 m tall. Origin centre of the floor head. */
export const UprightVacuum = forwardRef<Group, G & { lean?: number }>(function UprightVacuum({ lean = 0.32, ...props }, ref) {
  return (
    <group ref={ref} {...props}>
      {/* floor head */}
      <RoundedBox args={[0.38, 0.075, 0.26]} radius={0.03} position={[0, 0.05, 0.02]} castShadow>
        <meshStandardMaterial color={PALETTE.teal} roughness={0.35} />
      </RoundedBox>
      <mesh position={[0, 0.09, 0.13]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 0.36, 12]} />
        <meshStandardMaterial color={PALETTE.coral} roughness={0.4} />
      </mesh>
      {[-0.16, 0.16].map((x) => (
        <mesh key={x} position={[x, 0.035, -0.09]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.03, 20]} />
          <meshStandardMaterial color={PALETTE.charcoal} roughness={0.7} />
        </mesh>
      ))}
      {/* body leaning back */}
      <group position={[0, 0.07, -0.08]} rotation={[-lean, 0, 0]}>
        <RoundedBox args={[0.24, 0.62, 0.16]} radius={0.06} position={[0, 0.38, 0]} castShadow>
          <meshStandardMaterial color={PALETTE.white} roughness={0.35} />
        </RoundedBox>
        <RoundedBox args={[0.2, 0.32, 0.03]} radius={0.012} position={[0, 0.42, 0.08]}>
          <meshStandardMaterial color={PALETTE.aqua} roughness={0.25} />
        </RoundedBox>
        <mesh position={[0, 0.9, -0.02]} castShadow>
          <cylinderGeometry args={[0.016, 0.016, 0.42, 14]} />
          <meshStandardMaterial color={PALETTE.steel} metalness={0.85} roughness={0.25} />
        </mesh>
        <RoundedBox args={[0.17, 0.05, 0.05]} radius={0.02} position={[0, 1.12, -0.02]} castShadow>
          <meshStandardMaterial color={PALETTE.charcoal} roughness={0.5} />
        </RoundedBox>
      </group>
    </group>
  );
});

/** Window squeegee, ~35 cm wide. Origin at the handle grip. */
export function Squeegee(props: G) {
  return (
    <group {...props}>
      <mesh position={[0, -0.12, 0]} castShadow>
        <cylinderGeometry args={[0.016, 0.018, 0.24, 20]} />
        <meshStandardMaterial color={PALETTE.teal} roughness={0.45} />
      </mesh>
      <RoundedBox args={[0.36, 0.035, 0.03]} radius={0.01} position={[0, 0.01, 0]} castShadow>
        <meshStandardMaterial color={PALETTE.steel} metalness={0.85} roughness={0.2} />
      </RoundedBox>
      <mesh position={[0, 0.034, 0]}>
        <boxGeometry args={[0.35, 0.016, 0.006]} />
        <meshStandardMaterial color={PALETTE.charcoal} roughness={0.8} />
      </mesh>
    </group>
  );
}

/** Stack of folded microfibre cloths. */
export function ClothStack(props: G) {
  const colors = [PALETTE.teal, PALETTE.aqua, PALETTE.coral, PALETTE.aquaLight];
  return (
    <group {...props}>
      {colors.map((c, i) => (
        <RoundedBox
          key={c}
          args={[0.2, 0.022, 0.16]}
          radius={0.009}
          position={[(i % 2) * 0.008 - 0.004, 0.011 + i * 0.022, (i % 2 ? -1 : 1) * 0.005]}
          rotation={[0, (i - 1.5) * 0.06, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={c} roughness={0.95} />
        </RoundedBox>
      ))}
    </group>
  );
}

/** A single wiping cloth, held flat. Origin at centre. */
export const WipeCloth = forwardRef<Group, G>(function WipeCloth(props, ref) {
  return (
    <group ref={ref} {...props}>
      <RoundedBox args={[0.2, 0.014, 0.15]} radius={0.006} castShadow>
        <meshStandardMaterial color={PALETTE.aqua} roughness={0.95} />
      </RoundedBox>
      <RoundedBox args={[0.14, 0.03, 0.1]} radius={0.012} position={[0.01, 0.02, 0]}>
        <meshStandardMaterial color={PALETTE.aquaLight} roughness={0.95} />
      </RoundedBox>
    </group>
  );
});

/** Microfibre duster on an extension handle. Origin at the duster head. */
export const Duster = forwardRef<Group, G>(function Duster(props, ref) {
  const tufts = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => {
        const a = i * 2.39996;
        const r = 0.03 + (i % 5) * 0.006;
        return [Math.cos(a) * r, (i / 26) * 0.2 - 0.1, Math.sin(a) * r] as [number, number, number];
      }),
    [],
  );
  return (
    <group ref={ref} {...props}>
      <group rotation={[0, 0, Math.PI / 2]}>
        {tufts.map((p, i) => (
          <mesh key={i} position={p} castShadow>
            <sphereGeometry args={[0.032, 10, 8]} />
            <meshStandardMaterial color={i % 4 === 0 ? PALETTE.aquaLight : PALETTE.aqua} roughness={1} />
          </mesh>
        ))}
      </group>
      <mesh position={[0.36, -0.1, 0.12]} rotation={[0.35, 0, 1.25]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.62, 12]} />
        <meshStandardMaterial color={PALETTE.steel} metalness={0.85} roughness={0.25} />
      </mesh>
    </group>
  );
});

/** Caution / wet floor A-frame sign, ~62 cm tall. */
export function WetFloorSign(props: G) {
  return (
    <group {...props}>
      {/* hinge at the top, legs spread at the floor */}
      <group position={[0, 0.63, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 0.3, 12]} />
          <meshStandardMaterial color="#e0a92e" roughness={0.5} />
        </mesh>
        {[1, -1].map((s) => (
          <group key={s} rotation={[-s * 0.21, 0, 0]}>
            <RoundedBox args={[0.3, 0.64, 0.016]} radius={0.012} position={[0, -0.32, s * 0.01]} castShadow>
              <meshStandardMaterial color="#ffc845" roughness={0.45} />
            </RoundedBox>
            <mesh position={[0, -0.24, s * 0.019]} rotation={[0, s > 0 ? 0 : Math.PI, 0]}>
              <circleGeometry args={[0.075, 3]} />
              <meshStandardMaterial color={PALETTE.charcoal} />
            </mesh>
            <mesh position={[0, -0.24, s * 0.0195]} rotation={[0, s > 0 ? 0 : Math.PI, 0]}>
              <circleGeometry args={[0.05, 3]} />
              <meshStandardMaterial color="#ffc845" />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

/** Canister steam cleaner with hose and wand. */
export function SteamCleaner(props: G) {
  const hose = useMemo(() => {
    const curve = new CatmullRomCurve3([
      new Vector3(0.16, 0.22, 0),
      new Vector3(0.32, 0.12, 0.06),
      new Vector3(0.48, 0.18, 0.1),
      new Vector3(0.56, 0.42, 0.08),
      new Vector3(0.58, 0.62, 0.05),
    ]);
    return new TubeGeometry(curve, 60, 0.018, 10, false);
  }, []);
  return (
    <group {...props}>
      <RoundedBox args={[0.34, 0.28, 0.26]} radius={0.09} position={[0, 0.19, 0]} castShadow>
        <meshStandardMaterial color={PALETTE.white} roughness={0.3} />
      </RoundedBox>
      <RoundedBox args={[0.3, 0.06, 0.24]} radius={0.025} position={[0, 0.04, 0]} castShadow>
        <meshStandardMaterial color={PALETTE.teal} roughness={0.4} />
      </RoundedBox>
      <mesh position={[0, 0.34, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.04, 0.03, 24]} />
        <meshStandardMaterial color={PALETTE.coral} roughness={0.4} />
      </mesh>
      <RoundedBox args={[0.05, 0.14, 0.2]} radius={0.02} position={[-0.17, 0.2, 0]}>
        <meshStandardMaterial color={PALETTE.aqua} roughness={0.25} transparent opacity={0.9} />
      </RoundedBox>
      <mesh geometry={hose} castShadow>
        <meshStandardMaterial color={PALETTE.charcoal} roughness={0.6} />
      </mesh>
      <mesh position={[0.58, 0.82, 0.04]} castShadow>
        <cylinderGeometry args={[0.016, 0.016, 0.42, 14]} />
        <meshStandardMaterial color={PALETTE.steel} metalness={0.85} roughness={0.25} />
      </mesh>
      <RoundedBox args={[0.07, 0.05, 0.05]} radius={0.015} position={[0.58, 1.05, 0.04]} castShadow>
        <meshStandardMaterial color={PALETTE.teal} roughness={0.4} />
      </RoundedBox>
    </group>
  );
}

/* ---------------------------- office furniture --------------------------- */

export function Desk({
  width = 1.4,
  depth = 0.7,
  height = 0.73,
  topMap,
  ...props
}: G & { width?: number; depth?: number; height?: number; topMap?: import("three").Texture }) {
  const legX = width / 2 - 0.05;
  const legZ = depth / 2 - 0.05;
  return (
    <group {...props}>
      <RoundedBox args={[width, 0.03, depth]} radius={0.008} position={[0, height - 0.015, 0]} castShadow receiveShadow>
        <meshStandardMaterial map={topMap ?? null} color={topMap ? "#ffffff" : "#e2c7a2"} roughness={0.55} />
      </RoundedBox>
      {[
        [legX, legZ],
        [-legX, legZ],
        [legX, -legZ],
        [-legX, -legZ],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, (height - 0.03) / 2, z]} castShadow>
          <boxGeometry args={[0.04, height - 0.03, 0.04]} />
          <meshStandardMaterial color="#e9eef0" metalness={0.3} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, height - 0.22, -legZ]} castShadow>
        <boxGeometry args={[width - 0.12, 0.34, 0.015]} />
        <meshStandardMaterial color="#e9eef0" roughness={0.5} />
      </mesh>
    </group>
  );
}

export function Monitor(props: G) {
  return (
    <group {...props}>
      <RoundedBox args={[0.6, 0.36, 0.03]} radius={0.01} position={[0, 0.3, 0]} castShadow>
        <meshStandardMaterial color={PALETTE.charcoal} roughness={0.4} />
      </RoundedBox>
      <mesh position={[0, 0.3, 0.0155]}>
        <planeGeometry args={[0.57, 0.33]} />
        <meshStandardMaterial color="#0f2b33" roughness={0.15} metalness={0.2} emissive="#123c46" emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0, 0.1, -0.03]} castShadow>
        <boxGeometry args={[0.05, 0.2, 0.025]} />
        <meshStandardMaterial color="#c9d2d5" metalness={0.6} roughness={0.3} />
      </mesh>
      <RoundedBox args={[0.22, 0.012, 0.16]} radius={0.005} position={[0, 0.006, -0.02]} castShadow>
        <meshStandardMaterial color="#c9d2d5" metalness={0.6} roughness={0.3} />
      </RoundedBox>
    </group>
  );
}

export function Keyboard(props: G) {
  return (
    <group {...props}>
      <RoundedBox args={[0.42, 0.016, 0.13]} radius={0.005} position={[0, 0.008, 0]} castShadow>
        <meshStandardMaterial color="#f1f4f5" roughness={0.5} />
      </RoundedBox>
      <RoundedBox args={[0.065, 0.02, 0.1]} radius={0.01} position={[0.3, 0.01, 0]} castShadow>
        <meshStandardMaterial color="#f1f4f5" roughness={0.5} />
      </RoundedBox>
    </group>
  );
}

export function Mug({ color = PALETTE.coral, ...props }: G & { color?: string }) {
  return (
    <group {...props}>
      <mesh position={[0, 0.045, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.036, 0.09, 24]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
      <mesh position={[0.045, 0.048, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.022, 0.006, 8, 16, Math.PI]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
    </group>
  );
}

export function OfficeChair(props: G) {
  return (
    <group {...props}>
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, a, 0]}>
            <mesh position={[0.15, 0.05, 0]} castShadow>
              <boxGeometry args={[0.3, 0.025, 0.035]} />
              <meshStandardMaterial color={PALETTE.charcoal} roughness={0.5} />
            </mesh>
            <mesh position={[0.29, 0.025, 0]}>
              <sphereGeometry args={[0.025, 10, 8]} />
              <meshStandardMaterial color="#1d272b" roughness={0.6} />
            </mesh>
          </group>
        );
      })}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.022, 0.026, 0.38, 14]} />
        <meshStandardMaterial color={PALETTE.steel} metalness={0.8} roughness={0.25} />
      </mesh>
      <RoundedBox args={[0.48, 0.07, 0.46]} radius={0.03} position={[0, 0.47, 0]} castShadow>
        <meshStandardMaterial color="#3d5a63" roughness={0.9} />
      </RoundedBox>
      <RoundedBox args={[0.46, 0.5, 0.06]} radius={0.03} position={[0, 0.8, -0.22]} rotation={[-0.08, 0, 0]} castShadow>
        <meshStandardMaterial color="#3d5a63" roughness={0.9} />
      </RoundedBox>
    </group>
  );
}

/** Office bin (open top). Origin floor centre. */
export function Bin({ color = "#dfe6e8", ...props }: G & { color?: string }) {
  return (
    <group {...props}>
      <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.135, 0.11, 0.32, 36, 1, true]} />
        <meshStandardMaterial color={color} roughness={0.45} side={2} />
      </mesh>
      <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.11, 32]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.32, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.135, 0.006, 8, 36]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
    </group>
  );
}

export function Plant(props: G) {
  const leaves = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        a: i * 2.39996,
        tilt: 0.45 + (i % 4) * 0.12,
        h: 0.55 + (i % 5) * 0.09,
        s: 0.9 + (i % 3) * 0.15,
      })),
    [],
  );
  return (
    <group {...props}>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.19, 0.15, 0.4, 32]} />
        <meshStandardMaterial color="#f3f1ec" roughness={0.6} />
      </mesh>
      {leaves.map((l, i) => (
        <group key={i} position={[0, 0.38, 0]} rotation={[0, l.a, 0]}>
          <group rotation={[l.tilt, 0, 0]}>
            <mesh position={[0, l.h * 0.5, 0]} scale={[0.09 * l.s, l.h * 0.5, 0.012]} castShadow>
              <sphereGeometry args={[1, 12, 10]} />
              <meshStandardMaterial color={i % 3 ? "#3f8f6b" : "#4fa67d"} roughness={0.7} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}

/** Wall shelf with binders and a few objects (a high surface for dusting). */
export function WallShelf({ topMap, ...props }: G & { topMap?: import("three").Texture }) {
  const binders = ["#0b7a85", "#19b8c4", "#e9eef0", "#0b7a85", "#3d5a63", "#ff6b4a", "#e9eef0"];
  return (
    <group {...props}>
      <RoundedBox args={[1.5, 0.03, 0.28]} radius={0.006} castShadow receiveShadow>
        <meshStandardMaterial map={topMap ?? null} color={topMap ? "#ffffff" : "#e2c7a2"} roughness={0.55} />
      </RoundedBox>
      {binders.map((c, i) => (
        <RoundedBox
          key={i}
          args={[0.06, 0.3, 0.22]}
          radius={0.006}
          position={[-0.62 + i * 0.066, 0.165, 0]}
          rotation={[0, 0, i === 6 ? -0.18 : 0]}
          castShadow
        >
          <meshStandardMaterial color={c} roughness={0.6} />
        </RoundedBox>
      ))}
      <mesh position={[0.45, 0.09, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.06, 0.15, 24]} />
        <meshStandardMaterial color="#f3f1ec" roughness={0.6} />
      </mesh>
      <mesh position={[0.45, 0.2, 0]} castShadow>
        <sphereGeometry args={[0.09, 14, 12]} />
        <meshStandardMaterial color="#4fa67d" roughness={0.8} />
      </mesh>
    </group>
  );
}

"use client";

/**
 * The office used in the #method sequence. Real-world scale in metres.
 * Floor y = 0. Room x ∈ [-4.2, 4.2], z ∈ [-3, 3]. Back wall at z = -3 with a window, left wall at x = -4.2.
 * Carpet (office) for x < 1, vinyl planks (kitchenette) for x > 1. The front and right are open, like a
 * cut-away model, so the camera can glide around it.
 */
import { MeshReflectorMaterial, RoundedBox } from "@react-three/drei";
import { useMemo } from "react";
import { BufferAttribute, BufferGeometry, CanvasTexture, SRGBColorSpace, Vector3 } from "three";
import type { DeviceTier } from "@/hooks/useDeviceTier";
import { carpetTexture, plankTexture, plasterTexture, roughnessTexture, woodTexture } from "@/components/three/textures";
import { Desk, Keyboard, Monitor, Mug, OfficeChair, Plant, WallShelf, PALETTE } from "@/components/three/equipment";

export const ROOM = {
  wallH: 2.8,
  minX: -4.2,
  maxX: 4.2,
  minZ: -3,
  maxZ: 3,
  split: 1,
  window: { x0: -2.8, x1: -0.6, y0: 0.9, y1: 2.3 },
  sun: { position: new Vector3(-3.5, 7, -10), target: new Vector3(-1.5, 0, -0.5) },
  desks: [-2.65, -0.85],
  bins: [
    { x: -3.55, z: -1.25, color: "#dfe6e8" },
    { x: -1.75, z: -1.6, color: "#dfe6e8" },
    { x: 0.05, z: -1.55, color: "#bfe8eb" },
  ],
  deskZ: -1.7,
  deskH: 0.73,
};

function useSkyTexture() {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = 4;
    c.height = 256;
    const ctx = c.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, "#9fdcec");
    g.addColorStop(0.55, "#d8f3f6");
    g.addColorStop(1, "#fff4e2");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 4, 256);
    const t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace;
    return t;
  }, []);
}

/** Fake volumetric light shaft from the window to the floor. */
function SunShaft() {
  const geo = useMemo(() => {
    const { x0, x1, y0, y1 } = ROOM.window;
    const d = ROOM.sun.target.clone().sub(ROOM.sun.position).normalize();
    const top = [
      new Vector3(x0, y1, -2.98),
      new Vector3(x1, y1, -2.98),
      new Vector3(x1, y0, -2.98),
      new Vector3(x0, y0, -2.98),
    ];
    const bottom = top.map((p) => p.clone().add(d.clone().multiplyScalar(p.y / -d.y)));
    const verts: number[] = [];
    const alpha: number[] = [];
    const quad = (a: Vector3, b: Vector3, c: Vector3, e: Vector3) => {
      for (const [p, al] of [
        [a, 1],
        [b, 1],
        [c, 0],
        [a, 1],
        [c, 0],
        [e, 0],
      ] as [Vector3, number][]) {
        verts.push(p.x, p.y, p.z);
        alpha.push(al);
      }
    };
    for (let i = 0; i < 4; i++) {
      const j = (i + 1) % 4;
      quad(top[i], top[j], bottom[j], bottom[i]);
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(verts), 3));
    g.setAttribute("alpha", new BufferAttribute(new Float32Array(alpha), 1));
    return g;
  }, []);

  return (
    <mesh geometry={geo} renderOrder={5}>
      <shaderMaterial
        transparent
        depthWrite={false}
        side={2}
        blending={2}
        vertexShader={`attribute float alpha; varying float vA; void main(){ vA = alpha; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);} `}
        fragmentShader={`varying float vA; void main(){ gl_FragColor = vec4(1.0, 0.95, 0.84, vA * 0.075); }`}
      />
    </mesh>
  );
}

export function Room({ tier }: { tier: DeviceTier }) {
  const carpet = carpetTexture(tier === "low" ? 256 : 512);
  const planks = plankTexture(tier === "low" ? 256 : 512);
  const plaster = plasterTexture();
  const wood = woodTexture(tier === "low" ? 256 : 512);
  const rough = roughnessTexture();
  const sky = useSkyTexture();
  const { wallH, minX, maxX, minZ, maxZ, split, window: w } = ROOM;
  const wallT = 0.12;
  const wallMat = <meshStandardMaterial map={plaster} color="#ffffff" roughness={0.9} />;

  const carpetW = split - minX;
  const planksW = maxX - split;
  const depth = maxZ - minZ;

  return (
    <group>
      {/* base slab (cut-away model edge) */}
      <mesh position={[(minX - wallT + maxX) / 2, -0.07, (minZ - wallT + maxZ) / 2]} receiveShadow>
        <boxGeometry args={[maxX - minX + wallT, 0.14, depth + wallT]} />
        <meshStandardMaterial color="#e4eef0" roughness={0.8} />
      </mesh>

      {/* carpet */}
      <mesh position={[(minX + split) / 2, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[carpetW, depth]} />
        <meshStandardMaterial map={carpet} color="#c9d3d8" roughness={1} roughnessMap={rough} />
      </mesh>

      {/* vinyl plank floor */}
      <mesh position={[(split + maxX) / 2, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[planksW, depth]} />
        {tier === "high" ? (
          <MeshReflectorMaterial
            map={planks}
            color="#ffffff"
            roughness={0.55}
            roughnessMap={rough}
            metalness={0}
            blur={[400, 120]}
            resolution={512}
            mixBlur={1}
            mixStrength={0.55}
            mixContrast={1}
            depthScale={0.6}
            minDepthThreshold={0.6}
            maxDepthThreshold={1.2}
            mirror={0}
          />
        ) : (
          <meshStandardMaterial map={planks} color="#ffffff" roughness={0.5} roughnessMap={rough} />
        )}
      </mesh>
      {/* transition strip */}
      <mesh position={[split, 0.006, 0]}>
        <boxGeometry args={[0.04, 0.012, depth]} />
        <meshStandardMaterial color={PALETTE.steel} metalness={0.8} roughness={0.3} />
      </mesh>

      {/* back wall with window opening */}
      <group position={[0, 0, minZ - wallT / 2]}>
        <mesh position={[(minX - wallT + w.x0) / 2, wallH / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[w.x0 - (minX - wallT), wallH, wallT]} />
          {wallMat}
        </mesh>
        <mesh position={[(w.x1 + maxX) / 2, wallH / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[maxX - w.x1, wallH, wallT]} />
          {wallMat}
        </mesh>
        <mesh position={[(w.x0 + w.x1) / 2, w.y0 / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[w.x1 - w.x0, w.y0, wallT]} />
          {wallMat}
        </mesh>
        <mesh position={[(w.x0 + w.x1) / 2, (w.y1 + wallH) / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[w.x1 - w.x0, wallH - w.y1, wallT]} />
          {wallMat}
        </mesh>
      </group>

      {/* left wall */}
      <mesh position={[minX - wallT / 2, wallH / 2, (minZ - wallT + maxZ) / 2]} castShadow receiveShadow>
        <boxGeometry args={[wallT, wallH, depth + wallT]} />
        {wallMat}
      </mesh>

      {/* skirting */}
      <mesh position={[(minX + maxX) / 2, 0.04, minZ + 0.006]}>
        <boxGeometry args={[maxX - minX, 0.08, 0.012]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>
      <mesh position={[minX + 0.006, 0.04, 0]}>
        <boxGeometry args={[0.012, 0.08, depth]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>

      {/* window frame, sill, glass and sky */}
      <group>
        {[
          [(w.x0 + w.x1) / 2, w.y1, w.x1 - w.x0 + 0.06, 0.05],
          [(w.x0 + w.x1) / 2, w.y0 + 0.02, w.x1 - w.x0 + 0.06, 0.04],
        ].map(([x, y, len, h], i) => (
          <mesh key={i} position={[x, y, minZ - 0.06]}>
            <boxGeometry args={[len, h, 0.08]} />
            <meshStandardMaterial color="#3a4a50" metalness={0.6} roughness={0.35} />
          </mesh>
        ))}
        {[w.x0, (w.x0 + w.x1) / 2, w.x1].map((x, i) => (
          <mesh key={i} position={[x, (w.y0 + w.y1) / 2, minZ - 0.06]}>
            <boxGeometry args={[0.05, w.y1 - w.y0, 0.08]} />
            <meshStandardMaterial color="#3a4a50" metalness={0.6} roughness={0.35} />
          </mesh>
        ))}
        <RoundedBox
          args={[w.x1 - w.x0 + 0.12, 0.04, 0.22]}
          radius={0.008}
          position={[(w.x0 + w.x1) / 2, w.y0 + 0.0, minZ + 0.08]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </RoundedBox>
        <mesh position={[(w.x0 + w.x1) / 2, (w.y0 + w.y1) / 2, minZ - 0.07]}>
          <planeGeometry args={[w.x1 - w.x0, w.y1 - w.y0]} />
          <meshPhysicalMaterial color="#dff6f8" transparent opacity={0.12} roughness={0.02} metalness={0} />
        </mesh>
        {sky ? (
          <mesh position={[(w.x0 + w.x1) / 2, (w.y0 + w.y1) / 2 + 0.1, minZ - 0.6]}>
            {/* only ever seen through the window: kept below the wall top so it never pokes out */}
            <planeGeometry args={[w.x1 - w.x0 + 1.6, 1.85]} />
            <meshBasicMaterial map={sky} toneMapped={false} />
          </mesh>
        ) : null}
      </group>
      <SunShaft />

      {/* wall shelf (left wall) */}
      <WallShelf position={[minX + 0.14, 1.7, -1.0]} rotation={[0, Math.PI / 2, 0]} topMap={wood} />

      {/* framed print (left wall) */}
      <group position={[minX + 0.02, 1.5, 1.3]} rotation={[0, Math.PI / 2, 0]}>
        <RoundedBox args={[1.0, 0.7, 0.03]} radius={0.01} castShadow>
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </RoundedBox>
        <mesh position={[0, 0, 0.017]}>
          <planeGeometry args={[0.86, 0.56]} />
          <meshStandardMaterial color="#dff5f6" roughness={0.8} />
        </mesh>
        <mesh position={[-0.12, -0.05, 0.019]}>
          <circleGeometry args={[0.18, 48]} />
          <meshStandardMaterial color={PALETTE.aqua} roughness={0.8} />
        </mesh>
        <mesh position={[0.16, 0.07, 0.02]}>
          <circleGeometry args={[0.1, 48]} />
          <meshStandardMaterial color={PALETTE.coral} roughness={0.8} />
        </mesh>
      </group>

      {/* desks */}
      {ROOM.desks.map((x, i) => (
        <group key={x}>
          <Desk position={[x, 0, ROOM.deskZ]} topMap={wood} />
          <Monitor position={[x, ROOM.deskH, ROOM.deskZ - 0.2]} />
          <Keyboard position={[x, ROOM.deskH, ROOM.deskZ + 0.12]} />
          {i === 0 ? <Mug position={[x + 0.5, ROOM.deskH, ROOM.deskZ + 0.1]} /> : <Mug color={PALETTE.teal} position={[x - 0.52, ROOM.deskH, ROOM.deskZ + 0.05]} />}
          <OfficeChair position={[x, 0, ROOM.deskZ + 0.68]} rotation={[0, Math.PI + (i ? 0.12 : -0.08), 0]} />
        </group>
      ))}

      {/* kitchenette */}
      <group position={[2.75, 0, minZ + 0.3]}>
        <mesh position={[0, 0.44, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.3, 0.88, 0.6]} />
          <meshStandardMaterial color="#f7f9f9" roughness={0.45} />
        </mesh>
        {[-0.77, 0, 0.77].map((x) => (
          <mesh key={x} position={[x, 0.5, 0.301]}>
            <planeGeometry args={[0.74, 0.72]} />
            <meshStandardMaterial color="#eef3f4" roughness={0.4} />
          </mesh>
        ))}
        {[-0.77, 0, 0.77].map((x) => (
          <mesh key={`h${x}`} position={[x, 0.8, 0.31]}>
            <boxGeometry args={[0.3, 0.015, 0.015]} />
            <meshStandardMaterial color={PALETTE.steel} metalness={0.8} roughness={0.25} />
          </mesh>
        ))}
        <RoundedBox args={[2.34, 0.03, 0.62]} radius={0.006} position={[0, 0.9, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#f4f3ef" roughness={0.22} />
        </RoundedBox>
        <mesh position={[0, 1.18, -0.296]}>
          <planeGeometry args={[2.3, 0.52]} />
          <meshStandardMaterial color="#d9f2f3" roughness={0.25} />
        </mesh>
        <mesh position={[0, 1.95, -0.12]} castShadow>
          <boxGeometry args={[2.3, 0.6, 0.36]} />
          <meshStandardMaterial color="#f7f9f9" roughness={0.45} />
        </mesh>
        {/* sink */}
        <mesh position={[-0.45, 0.912, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.5, 0.36]} />
          <meshStandardMaterial color={PALETTE.steel} metalness={0.85} roughness={0.2} />
        </mesh>
        <mesh position={[-0.45, 1.05, -0.22]} castShadow>
          <cylinderGeometry args={[0.014, 0.014, 0.26, 12]} />
          <meshStandardMaterial color={PALETTE.steel} metalness={0.9} roughness={0.15} />
        </mesh>
        {/* kettle */}
        <mesh position={[0.65, 1.01, -0.05]} castShadow>
          <cylinderGeometry args={[0.075, 0.09, 0.2, 28]} />
          <meshStandardMaterial color="#ffffff" roughness={0.25} />
        </mesh>
        <mesh position={[0.95, 0.96, 0.02]} castShadow>
          <cylinderGeometry args={[0.1, 0.07, 0.08, 28]} />
          <meshStandardMaterial color={PALETTE.aqua} roughness={0.35} />
        </mesh>
      </group>

      <Plant position={[0.55, 0, minZ + 0.45]} />
    </group>
  );
}

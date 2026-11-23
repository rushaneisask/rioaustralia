"use client";

/**
 * The scroll-scrubbed office clean. Everything here is a pure function of scroll progress `p`
 * (from the shared timeline), so it plays forwards and backwards identically.
 */
import { Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  DirectionalLight,
  Group,
  MathUtils,
  Mesh,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  ShaderMaterial,
  Vector3,
} from "three";
import type { DeviceTier } from "@/hooks/useDeviceTier";
import { Effects } from "@/components/three/Effects";
import { Bin, Duster, FlatMop, UprightVacuum, WetFloorSign, WipeCloth } from "@/components/three/equipment";
import { debrisMask, dustMask, scuffMask, smudgeMask, softDotTexture } from "@/components/three/textures";
import { createDirtMaterial, type DirtOptions } from "./DirtMaterial";
import { Room, ROOM } from "./Room";
import {
  CAMERA_KEYS,
  OUTRO_START,
  cameraT,
  clamp01,
  ease,
  smoothstep,
  stepById,
  toolPresence,
  workProgress,
} from "./timeline";

/* ------------------------------------------------------------------ */
/* Surfaces                                                             */
/* ------------------------------------------------------------------ */

type Surface = {
  key: string;
  c: Vector3;
  w: number;
  d: number;
  rotY: number;
  axis: 0 | 1;
  reverse?: boolean;
};

const deskTop = (x: number, key: string): Surface => ({
  key,
  c: new Vector3(x, ROOM.deskH + 0.002, ROOM.deskZ),
  w: 1.4,
  d: 0.7,
  rotY: 0,
  axis: 0,
});

const DUST_SURFACES: Surface[] = [
  { key: "shelf", c: new Vector3(ROOM.minX + 0.14, 1.717, -1.0), w: 1.5, d: 0.28, rotY: Math.PI / 2, axis: 0 },
  { key: "sill", c: new Vector3(-1.7, ROOM.window.y0 + 0.022, ROOM.minZ + 0.08), w: 2.32, d: 0.22, rotY: 0, axis: 0 },
  deskTop(ROOM.desks[0], "deskA"),
  deskTop(ROOM.desks[1], "deskB"),
];

const WIPE_SURFACES: Surface[] = [
  deskTop(ROOM.desks[0], "deskA-w"),
  deskTop(ROOM.desks[1], "deskB-w"),
  { key: "bench", c: new Vector3(2.75, 0.917, ROOM.minZ + 0.3), w: 2.34, d: 0.62, rotY: 0, axis: 0 },
];

const CARPET: Surface = {
  key: "carpet",
  c: new Vector3((ROOM.minX + ROOM.split) / 2, 0.004, 1.1),
  w: ROOM.split - ROOM.minX,
  d: 3.8,
  rotY: 0,
  axis: 0,
};

const HARD_FLOOR: Surface = {
  key: "planks",
  c: new Vector3((ROOM.split + ROOM.maxX) / 2, 0.004, 0.35),
  w: ROOM.maxX - ROOM.split,
  d: 5.3,
  rotY: 0,
  axis: 1,
  reverse: true,
};

function sweepDir(s: Surface) {
  const c = Math.cos(s.rotY);
  const n = Math.sin(s.rotY);
  const v = s.axis === 0 ? new Vector3(c, 0, -n) : new Vector3(-n, 0, -c);
  return s.reverse ? v.negate() : v;
}
function crossDir(s: Surface) {
  const c = Math.cos(s.rotY);
  const n = Math.sin(s.rotY);
  return s.axis === 0 ? new Vector3(-n, 0, -c) : new Vector3(c, 0, -n);
}
const sweepLen = (s: Surface) => (s.axis === 0 ? s.w : s.d);
const crossLen = (s: Surface) => (s.axis === 0 ? s.d : s.w);

/** World position of the finished edge on surface `s` at local progress q, offset across the surface by osc (-1..1). */
function edgePoint(s: Surface, q: number, osc = 0, out = new Vector3()) {
  const along = (clamp01(MathUtils.lerp(-0.06, 1.06, q)) - 0.5) * sweepLen(s);
  return out
    .copy(s.c)
    .addScaledVector(sweepDir(s), along)
    .addScaledVector(crossDir(s), osc * crossLen(s) * 0.36);
}

/** Split a step's work across surfaces: a short travel phase, then the sweep. */
function schedule(work: number, n: number, travel = 0.2) {
  const L = 1 / n;
  const i = Math.min(n - 1, Math.floor(work / L));
  const local = clamp01((work - i * L) / L);
  if (local < travel) return { i, travelT: local / travel, q: 0 };
  return { i, travelT: -1, q: (local - travel) / (1 - travel) };
}

function surfaceProgress(work: number, n: number, k: number) {
  const s = schedule(work, n);
  if (k < s.i) return 1;
  if (k > s.i) return 0;
  return s.q;
}

/** Hand-tool position along a schedule of surfaces (with arcing travel between them). */
function toolAlong(
  surfaces: Surface[],
  work: number,
  entry: Vector3,
  lift: number,
  oscFn: (q: number) => number,
  out: Vector3,
) {
  const { i, travelT, q } = schedule(work, surfaces.length);
  if (travelT >= 0) {
    const from = i === 0 ? entry : edgePoint(surfaces[i - 1], 1, oscFn(1), new Vector3());
    const to = edgePoint(surfaces[i], 0, oscFn(0), new Vector3());
    const t = ease(travelT);
    out.lerpVectors(from, to, t);
    out.y += Math.sin(t * Math.PI) * 0.35 + lift;
    return out;
  }
  edgePoint(surfaces[i], q, oscFn(q), out);
  out.y += lift;
  return out;
}

const dusterOsc = (q: number) => Math.sin(q * Math.PI * 2 * 3.5) * 0.85;
const clothOsc = (q: number) => Math.sin(q * Math.PI * 2 * 4) * 0.8;
const DUSTER_ENTRY = new Vector3(-1.2, 2.6, 0.6);
const CLOTH_ENTRY = new Vector3(-1.6, 1.6, -0.6);

function dusterPos(work: number, out = new Vector3()) {
  return toolAlong(DUST_SURFACES, work, DUSTER_ENTRY, 0.09, dusterOsc, out);
}

/* ------------------------------------------------------------------ */

function Overlay({ s, opts, onMat }: { s: Surface; opts: DirtOptions; onMat: (m: ShaderMaterial) => void }) {
  const len = sweepLen(s);
  const mat = useMemo(() => createDirtMaterial({ ...opts, sweepLength: len }), [opts, len]);
  useEffect(() => {
    onMat(mat);
  }, [mat, onMat]);
  return (
    <group position={s.c} rotation={[0, s.rotY, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={mat} renderOrder={2}>
        <planeGeometry args={[s.w, s.d]} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */

export function MethodScene({
  progress,
  tier: initialTier,
  staticProgress,
}: {
  progress?: MotionValue<number>;
  tier: DeviceTier;
  /** Render a fixed frame (reduced motion). */
  staticProgress?: number;
}) {
  const [tier, setTier] = useState(initialTier);
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const size = useThree((s) => s.size);
  const setDpr = useThree((s) => s.setDpr);
  const gl = useThree((s) => s.gl);

  /* --- dirt materials (keyed) --- */
  const mats = useRef(new Map<string, ShaderMaterial>());
  const reg = (key: string) => (m: ShaderMaterial) => mats.current.set(key, m);

  const maskSize = tier === "low" ? 256 : 512;
  const dustOpts = useMemo<DirtOptions>(() => ({ mask: dustMask(maskSize), color: "#77736b", opacity: 0.85, repeat: [2, 1] }), [maskSize]);
  const shelfDustOpts = useMemo<DirtOptions>(() => ({ mask: dustMask(maskSize), color: "#77736b", opacity: 0.85, repeat: [3, 0.6] }), [maskSize]);
  const smudgeOpts = useMemo<DirtOptions>(() => ({ mask: smudgeMask(maskSize), color: "#6d5a45", opacity: 0.6, repeat: [1, 0.5] }), [maskSize]);
  const benchOpts = useMemo<DirtOptions>(() => ({ mask: smudgeMask(maskSize), color: "#7a6a58", opacity: 0.55, repeat: [1.6, 0.45] }), [maskSize]);
  const carpetOpts = useMemo<DirtOptions>(
    () => ({ mask: debrisMask(maskSize), color: "#6f6557", opacity: 0.78, repeat: [5, 3.7], mode: 2, stripes: 9 }),
    [maskSize],
  );
  const floorOpts = useMemo<DirtOptions>(
    () => ({ mask: scuffMask(maskSize), color: "#80725f", opacity: 0.46, repeat: [1.4, 2.2], axis: 1, reverse: true, mode: 1 }),
    [maskSize],
  );

  /* --- tools --- */
  const duster = useRef<Group>(null);
  const cloth = useRef<Group>(null);
  const vacuum = useRef<Group>(null);
  const mop = useRef<Group>(null);
  const sign = useRef<Group>(null);
  const binBags = useRef<(Group | null)[]>([]);
  const binLiners = useRef<(Mesh | null)[]>([]);
  const binRings = useRef<(Mesh | null)[]>([]);
  const sun = useRef<DirectionalLight>(null);

  /* --- camera splines --- */
  const posCurve = useMemo(() => new CatmullRomCurve3(CAMERA_KEYS.positions.map((p) => new Vector3(...p)), false, "centripetal"), []);
  const tgtCurve = useMemo(() => new CatmullRomCurve3(CAMERA_KEYS.targets.map((p) => new Vector3(...p)), false, "centripetal"), []);

  /* --- airborne dust motes --- */
  const moteCount = tier === "high" ? 320 : tier === "mid" ? 160 : 60;
  const motes = useMemo(() => {
    const g = new BufferGeometry();
    const pos = new Float32Array(moteCount * 3);
    const seed = new Float32Array(moteCount);
    for (let i = 0; i < moteCount; i++) {
      const r = (k: number) => {
        const x = Math.sin(i * 91.7 + k * 13.1) * 43758.5453;
        return x - Math.floor(x);
      };
      pos[i * 3] = -3.4 + r(1) * 3.4;
      pos[i * 3 + 1] = 0.25 + r(2) * 2.2;
      pos[i * 3 + 2] = -2.9 + r(3) * 3.4;
      seed[i] = r(4);
    }
    g.setAttribute("position", new BufferAttribute(pos, 3));
    return { g, base: pos.slice(), seed };
  }, [moteCount]);
  const motePoints = useRef<Points>(null);

  /* --- dust puffs from the duster (deterministic, reversible) --- */
  const PUFFS = tier === "low" ? 40 : 110;
  const puffs = useMemo(() => {
    const g = new BufferGeometry();
    const birth = new Float32Array(PUFFS);
    const origin = new Float32Array(PUFFS * 3);
    const drift = new Float32Array(PUFFS * 3);
    const tmp = new Vector3();
    for (let k = 0; k < PUFFS; k++) {
      const wb = 0.03 + (k / PUFFS) * 0.95;
      birth[k] = wb;
      dusterPos(wb, tmp);
      origin.set([tmp.x, tmp.y - 0.06, tmp.z], k * 3);
      const r = (n: number) => {
        const x = Math.sin(k * 57.3 + n * 7.7) * 15731.743;
        return x - Math.floor(x) - 0.5;
      };
      drift.set([r(1) * 0.5, 0.25 + Math.abs(r(2)) * 0.45, r(3) * 0.5], k * 3);
    }
    g.setAttribute("position", new BufferAttribute(new Float32Array(PUFFS * 3), 3));
    g.setAttribute("color", new BufferAttribute(new Float32Array(PUFFS * 3), 3));
    return { g, birth, origin, drift };
  }, [PUFFS]);
  const dotTex = softDotTexture();

  /* --- shadows: baked once on mid, live on high --- */
  useEffect(() => {
    gl.shadowMap.autoUpdate = tier === "high";
    gl.shadowMap.needsUpdate = true;
  }, [gl, tier]);

  const tmp = useMemo(() => ({ a: new Vector3(), b: new Vector3(), t: new Vector3(), focus: new Vector3() }), []);
  const smoothed = useRef<number | null>(null);

  useFrame((_, dt) => {
    const raw = staticProgress ?? progress?.get() ?? 0;
    // extra smoothing so the scene never jumps, even on coarse touch scrolling
    if (smoothed.current === null || staticProgress !== undefined) smoothed.current = raw;
    else smoothed.current = MathUtils.damp(smoothed.current, raw, 9, Math.min(dt, 0.05));
    const p = smoothed.current;

    /* dirt progress */
    const wDust = workProgress(p, "dust");
    const wWipe = workProgress(p, "wipe");
    const wBins = workProgress(p, "bins");
    const wVac = workProgress(p, "vacuum");
    const wMop = workProgress(p, "mop");
    DUST_SURFACES.forEach((s, k) => {
      const m = mats.current.get(s.key);
      if (m) m.uniforms.uProgress.value = surfaceProgress(wDust, DUST_SURFACES.length, k);
    });
    WIPE_SURFACES.forEach((s, k) => {
      const m = mats.current.get(s.key);
      if (m) m.uniforms.uProgress.value = surfaceProgress(wWipe, WIPE_SURFACES.length, k);
    });
    const carpetMat = mats.current.get(CARPET.key);
    if (carpetMat) carpetMat.uniforms.uProgress.value = wVac;
    const floorMat = mats.current.get(HARD_FLOOR.key);
    if (floorMat) {
      floorMat.uniforms.uProgress.value = wMop;
      // the floor dries off once the outro begins
      floorMat.uniforms.uEdgeStrength.value = 1;
      floorMat.uniforms.uFade.value = 1 - smoothstep(OUTRO_START, OUTRO_START + 0.05, p) * 0.9;
    }

    /* duster */
    const dPres = toolPresence(p, "dust");
    if (duster.current) {
      dusterPos(wDust, tmp.a);
      duster.current.position.copy(tmp.a);
      duster.current.scale.setScalar(Math.max(0.0001, ease(dPres)));
      duster.current.rotation.set(0.2, Math.sin(wDust * 40) * 0.25, -0.15 + Math.sin(wDust * 30) * 0.1);
      duster.current.visible = dPres > 0.001;
    }

    /* cloth */
    const cPres = toolPresence(p, "wipe");
    if (cloth.current) {
      toolAlong(WIPE_SURFACES, wWipe, CLOTH_ENTRY, 0.012, clothOsc, tmp.b);
      const sch = schedule(wWipe, WIPE_SURFACES.length);
      if (sch.travelT < 0) {
        // little circular wiping motion
        const s = WIPE_SURFACES[sch.i];
        tmp.b.addScaledVector(sweepDir(s), Math.cos(sch.q * Math.PI * 2 * 4) * 0.05);
      }
      cloth.current.position.copy(tmp.b);
      cloth.current.rotation.set(0, Math.sin(wWipe * 25) * 0.4, 0);
      cloth.current.scale.setScalar(Math.max(0.0001, ease(cPres)));
      cloth.current.visible = cPres > 0.001;
    }

    /* bins */
    const nb = ROOM.bins.length;
    ROOM.bins.forEach((_, j) => {
      const q = surfaceProgress(wBins, nb, j);
      const bag = binBags.current[j];
      if (bag) {
        const rise = ease(smoothstep(0, 0.55, q));
        const away = smoothstep(0.4, 0.8, q);
        bag.position.set(0, 0.2 + rise * 0.55, away * 0.35);
        bag.rotation.set(away * 0.4, rise * 0.6, 0);
        bag.scale.setScalar(Math.max(0.0001, 1 - ease(away)));
        bag.visible = away < 0.999;
      }
      const liner = binLiners.current[j];
      if (liner) {
        const s = ease(smoothstep(0.6, 0.95, q));
        liner.scale.setScalar(Math.max(0.0001, s));
        liner.visible = s > 0.001;
      }
      const ring = binRings.current[j];
      if (ring) {
        const r = smoothstep(0.62, 1, q);
        ring.position.y = 0.33 - r * 0.32;
        const glow = Math.sin(r * Math.PI);
        (ring.material as ShaderMaterial & { opacity: number }).opacity = glow * 0.9;
        ring.visible = glow > 0.01;
      }
    });

    /* vacuum: rides the edge across the carpet, pushing and pulling along z */
    const vPres = toolPresence(p, "vacuum");
    if (vacuum.current) {
      const lanes = 9;
      const edgeX = CARPET.c.x - CARPET.w / 2 + clamp01(MathUtils.lerp(-0.06, 1.06, wVac)) * CARPET.w;
      const zMin = -0.55;
      const zMax = 2.75;
      const z = MathUtils.lerp(zMin, zMax, 0.5 - 0.5 * Math.cos(wVac * lanes * Math.PI));
      vacuum.current.position.set(Math.max(ROOM.minX + 0.3, edgeX - 0.12), 0, z);
      vacuum.current.scale.setScalar(Math.max(0.0001, ease(vPres)));
      vacuum.current.visible = vPres > 0.001;
    }

    /* mop: figure-of-eight along x, following the edge toward the front */
    const mPres = toolPresence(p, "mop");
    if (mop.current) {
      const edgeZ = HARD_FLOOR.c.z - HARD_FLOOR.d / 2 + clamp01(MathUtils.lerp(-0.06, 1.06, wMop)) * HARD_FLOOR.d;
      const swing = Math.sin(wMop * Math.PI * 2 * 5);
      mop.current.position.set(HARD_FLOOR.c.x + swing * (HARD_FLOOR.w * 0.36), 0, edgeZ - 0.1);
      mop.current.rotation.set(0, Math.cos(wMop * Math.PI * 2 * 5) * 0.45, 0);
      mop.current.scale.setScalar(Math.max(0.0001, ease(mPres)));
      mop.current.visible = mPres > 0.001;
    }
    if (sign.current) {
      const sIn = smoothstep(stepStart("mop"), stepStart("mop") + 0.03, p);
      const sOut = smoothstep(OUTRO_START + 0.02, OUTRO_START + 0.06, p);
      const s = Math.min(sIn, 1 - sOut);
      sign.current.scale.setScalar(Math.max(0.0001, ease(s)));
      sign.current.visible = s > 0.001;
    }

    /* dust motes: thin out as the room gets cleaner */
    const cleanAmount = clamp01(wDust * 0.55 + wVac * 0.3 + wMop * 0.15);
    if (motePoints.current) {
      const mat = motePoints.current.material as PointsMaterial;
      mat.opacity = 0.85 * (1 - cleanAmount * 0.88);
      const arr = motes.g.attributes.position.array as Float32Array;
      const t = performance.now() / 1000;
      for (let i = 0; i < moteCount; i++) {
        const s = motes.seed[i];
        arr[i * 3] = motes.base[i * 3] + Math.sin(t * 0.2 + s * 30) * 0.12;
        arr[i * 3 + 1] = motes.base[i * 3 + 1] + Math.sin(t * 0.15 + s * 50) * 0.1;
        arr[i * 3 + 2] = motes.base[i * 3 + 2] + Math.cos(t * 0.18 + s * 20) * 0.12;
      }
      motes.g.attributes.position.needsUpdate = true;
    }

    /* puffs */
    {
      const pos = puffs.g.attributes.position.array as Float32Array;
      const col = puffs.g.attributes.color.array as Float32Array;
      const life = 0.09;
      for (let k = 0; k < PUFFS; k++) {
        const age = (wDust - puffs.birth[k]) / life;
        const vis = age > 0 && age < 1 ? Math.sin(age * Math.PI) * dPres : 0;
        const a = clamp01(age);
        pos[k * 3] = puffs.origin[k * 3] + puffs.drift[k * 3] * a;
        pos[k * 3 + 1] = puffs.origin[k * 3 + 1] + puffs.drift[k * 3 + 1] * a;
        pos[k * 3 + 2] = puffs.origin[k * 3 + 2] + puffs.drift[k * 3 + 2] * a;
        col[k * 3] = vis * 0.8;
        col[k * 3 + 1] = vis * 0.77;
        col[k * 3 + 2] = vis * 0.72;
      }
      puffs.g.attributes.position.needsUpdate = true;
      puffs.g.attributes.color.needsUpdate = true;
    }

    /* camera: one continuous spline, gently drawn toward whichever tool is working */
    const t = cameraT(p);
    posCurve.getPoint(t, tmp.a);
    tgtCurve.getPoint(t, tmp.t);
    const activeTool =
      dPres > 0.01 ? duster.current : cPres > 0.01 ? cloth.current : vPres > 0.01 ? vacuum.current : mPres > 0.01 ? mop.current : null;
    const pres = Math.max(dPres, cPres, vPres, mPres);
    if (activeTool) {
      tmp.focus.copy(activeTool.position).sub(tmp.t).multiplyScalar(0.28 * pres);
      tmp.focus.y *= 0.3;
      tmp.t.add(tmp.focus);
      tmp.a.addScaledVector(tmp.focus, 0.45);
    }
    const binFocus = smoothstep(0, 0.1, wBins) * (1 - smoothstep(0.9, 1, wBins));
    if (binFocus > 0) {
      const j = Math.min(nb - 1, Math.floor(wBins * nb));
      const b = ROOM.bins[j];
      tmp.focus.set(b.x - tmp.t.x, 0, b.z - tmp.t.z).multiplyScalar(0.35 * binFocus);
      tmp.t.add(tmp.focus);
      tmp.a.addScaledVector(tmp.focus, 0.5);
    }
    // portrait screens: pull back and widen
    const aspect = size.width / size.height;
    const pull = aspect < 0.75 ? 1.5 : aspect < 1.1 ? 1.25 : 1;
    tmp.b.copy(tmp.a).sub(tmp.t).multiplyScalar(pull).add(tmp.t);
    camera.position.copy(tmp.b);
    camera.lookAt(tmp.t);
    const fov = aspect < 0.75 ? 48 : aspect < 1.1 ? 42 : 36;
    if (Math.abs(camera.fov - fov) > 0.01) camera.fov = fov;
    // frame the action beside the copy: to the right on wide screens, above it on tall ones.
    // The shift relaxes during the intro/outro so the finished room is centred.
    const framing = 1 - smoothstep(OUTRO_START, OUTRO_START + 0.05, p);
    const w = size.width;
    const h = size.height;
    if (aspect >= 1.1) camera.setViewOffset(w, h, -w * 0.15 * framing, 0, w, h);
    else camera.setViewOffset(w, h, 0, h * 0.13 * framing, w, h);
    camera.updateProjectionMatrix();
  });

  return (
    <>
      <PerformanceMonitor
        onDecline={() => {
          setDpr(1);
          setTier((t) => (t === "high" ? "mid" : "low"));
        }}
        flipflops={2}
      />

      {/* lighting: sun through the window, sky fill, soft environment reflections */}
      <hemisphereLight args={["#f2fbff", "#e6dccd", 1.15]} />
      <ambientLight intensity={0.35} />
      {/* soft fill from the open (camera) side so walls read white, not grey */}
      <directionalLight position={[8, 6, 9]} intensity={0.9} color="#ffffff" />
      <directionalLight
        ref={sun}
        position={ROOM.sun.position}
        intensity={2.7}
        color="#fff1dc"
        castShadow={tier !== "low"}
        shadow-mapSize={tier === "high" ? [2048, 2048] : [1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={6}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-camera-near={1}
        shadow-camera-far={30}
      >
        <object3D attach="target" position={ROOM.sun.target} />
      </directionalLight>
      <pointLight position={[2.6, 2.4, 0.5]} intensity={3} distance={7} decay={2} color="#fff6ea" />
      <pointLight position={[-2.2, 2.5, 1.2]} intensity={2.4} distance={7} decay={2} color="#f2fbff" />
      <Environment resolution={128} frames={1} environmentIntensity={0.55}>
        <Lightformer form="rect" intensity={2} color="#ffffff" position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[12, 8, 1]} />
        <Lightformer form="rect" intensity={1.5} color="#fff3e0" position={[-1.7, 1.6, -6]} scale={[3, 2, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#d9f4f6" position={[8, 2, 2]} rotation={[0, -Math.PI / 2, 0]} scale={[8, 4, 1]} />
      </Environment>

      <Room tier={tier} />

      {/* dirt overlays */}
      {DUST_SURFACES.map((s) => (
        <Overlay key={s.key} s={s} opts={s.key === "shelf" || s.key === "sill" ? shelfDustOpts : dustOpts} onMat={reg(s.key)} />
      ))}
      {WIPE_SURFACES.map((s) => (
        <Overlay key={s.key} s={{ ...s, c: s.c.clone().setY(s.c.y + 0.001) }} opts={s.key === "bench" ? benchOpts : smudgeOpts} onMat={reg(s.key)} />
      ))}
      <Overlay s={CARPET} opts={carpetOpts} onMat={reg(CARPET.key)} />
      <Overlay s={HARD_FLOOR} opts={floorOpts} onMat={reg(HARD_FLOOR.key)} />

      {/* bins with rubbish, collected bag, fresh liner and a finishing ring of light */}
      {ROOM.bins.map((b, j) => (
        <group key={j} position={[b.x, 0, b.z]}>
          <Bin color={b.color} />
          <group ref={(el) => void (binBags.current[j] = el)}>
            <mesh scale={[0.115, 0.13, 0.115]} position={[0, 0, 0]} castShadow>
              <sphereGeometry args={[1, 20, 16]} />
              <meshStandardMaterial color="#d7dcdd" roughness={0.55} />
            </mesh>
            {[
              [0.03, 0.12, 0.02, 0.05],
              [-0.04, 0.13, -0.02, 0.045],
              [0.0, 0.15, -0.04, 0.04],
              [-0.02, 0.11, 0.05, 0.038],
            ].map(([x, y, z, r], k) => (
              <mesh key={k} position={[x, y, z]} scale={r}>
                <icosahedronGeometry args={[1, 1]} />
                <meshStandardMaterial color={k === 2 ? "#ffd9cf" : "#f7f6f2"} roughness={0.9} flatShading />
              </mesh>
            ))}
          </group>
          <mesh ref={(el) => void (binLiners.current[j] = el)} position={[0, 0.322, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.138, 0.012, 8, 40]} />
            <meshStandardMaterial color="#eef2f3" roughness={0.6} />
          </mesh>
          <mesh ref={(el) => void (binRings.current[j] = el)} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.15, 0.006, 8, 48]} />
            <meshBasicMaterial color="#5fe3ea" transparent opacity={0} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* tools */}
      <Duster ref={duster} />
      <WipeCloth ref={cloth} />
      <UprightVacuum ref={vacuum} lean={0.38} />
      <FlatMop ref={mop} lean={0.5} />
      <group ref={sign} position={[3.75, 0, 2.55]} rotation={[0, -0.7, 0]}>
        <WetFloorSign />
      </group>

      {/* dust in the sunlight */}
      <points ref={motePoints} geometry={motes.g} frustumCulled={false}>
        <pointsMaterial
          map={dotTex}
          size={tier === "low" ? 0.03 : 0.022}
          sizeAttenuation
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          color={new Color("#fff4dc")}
          opacity={0.85}
        />
      </points>
      <points geometry={puffs.g} frustumCulled={false}>
        <pointsMaterial map={dotTex} size={0.07} sizeAttenuation transparent depthWrite={false} blending={AdditiveBlending} vertexColors />
      </points>

      <Effects tier={tier} ao={tier === "high"} />
    </>
  );
}

const stepStart = (id: "mop") => stepById(id).start;

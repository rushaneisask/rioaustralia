"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color, InstancedMesh, LatheGeometry, Object3D, ShaderMaterial, Vector2 } from "three";

/**
 * On desktop the hero canvas is full-bleed behind the copy, so scenes shift their content into the
 * right-hand side. Returns the x offset (world units at z = 0) and a scale that fits the free space.
 */
export function useHeroLayout() {
  const size = useThree((s) => s.size);
  const vw = useThree((s) => s.viewport.width);
  const vh = useThree((s) => s.viewport.height);
  const wide = size.width >= 1024;
  // in smaller canvases (phones, the division card) shrink the scene to fit the frame
  const fit = Math.min(1, vw / 5.4, vh / 4.3);
  return { x: wide ? vw * 0.22 : 0, scale: wide ? Math.min(1.1, Math.max(0.85, size.width / 1500)) : fit };
}

/** Soap-film shader: clear centre, bright iridescent rim (fresnel). Works with InstancedMesh. */
function makeBubbleMaterial() {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uTint: { value: new Color("#7adde3") } },
    vertexShader: /* glsl */ `
      varying vec3 vN;
      varying vec3 vV;
      void main() {
        vec4 wp = vec4(position, 1.0);
        vec3 n = normal;
        #ifdef USE_INSTANCING
          wp = instanceMatrix * wp;
          n = mat3(instanceMatrix) * n;
        #endif
        vec4 mv = modelViewMatrix * wp;
        vN = normalize(normalMatrix * n);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uTint;
      varying vec3 vN;
      varying vec3 vV;
      void main() {
        float f = 1.0 - abs(dot(normalize(vN), normalize(vV)));
        float rim = pow(f, 2.6);
        // thin-film colour shift around the rim
        vec3 film = 0.5 + 0.5 * cos(6.2831 * (f * 1.3 + vec3(0.0, 0.33, 0.67)));
        vec3 col = mix(vec3(1.0), mix(uTint, film, 0.45), 0.55);
        // a small specular glint up and to the left
        float glint = smoothstep(0.9, 0.98, dot(normalize(vN), normalize(vec3(-0.45, 0.6, 0.65))));
        float a = rim * 0.6 + glint * 0.7 + 0.02;
        // keep below the bloom threshold so bubbles stay crisp instead of glowing
        gl_FragColor = vec4(min(col * 0.86 + glint * 0.1, vec3(0.88)), a);
      }
    `,
  });
}

/** Window-level pointer (-1..1), so canvases can stay pointer-events: none. */
export const pointer = { x: 0, y: 0 };
if (typeof window !== "undefined") {
  window.addEventListener(
    "pointermove",
    (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    },
    { passive: true },
  );
}

/** Teardrop lathe geometry, height 2 (y from -1 to 1). */
export function useDropletGeometry(segments = 96) {
  return useMemo(() => {
    const pts: Vector2[] = [];
    const n = 64;
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * Math.PI;
      const r = Math.sin(t) * Math.pow(Math.sin(t / 2), 1.35) * 0.82;
      pts.push(new Vector2(Math.max(r, 0.0001), Math.cos(t)));
    }
    const g = new LatheGeometry(pts, segments);
    g.computeVertexNormals();
    return g;
  }, [segments]);
}

/** Floating soap bubbles (instanced). Deterministic layout, gentle drift. */
export function Bubbles({
  count = 24,
  spread = [6, 3.5, 3] as [number, number, number],
  center = [0, 0, 0] as [number, number, number],
  minSize = 0.04,
  maxSize = 0.16,
  animate = true,
}) {
  const ref = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const material = useMemo(() => makeBubbleMaterial(), []);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const r = (k: number) => {
          const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
          return x - Math.floor(x);
        };
        return {
          x: (r(1) - 0.5) * spread[0],
          y: (r(2) - 0.5) * spread[1],
          z: (r(3) - 0.5) * spread[2],
          s: minSize + r(4) * (maxSize - minSize),
          speed: 0.15 + r(5) * 0.35,
          phase: r(6) * Math.PI * 2,
        };
      }),
    [count, spread, minSize, maxSize],
  );

  useFrame(({ clock }) => {
    const m = ref.current;
    if (!m) return;
    const t = animate ? clock.elapsedTime : 0;
    seeds.forEach((b, i) => {
      const rise = ((b.y + spread[1] / 2 + t * b.speed * 0.25) % spread[1]) - spread[1] / 2;
      dummy.position.set(
        center[0] + b.x + Math.sin(t * b.speed + b.phase) * 0.12,
        center[1] + rise,
        center[2] + b.z + Math.cos(t * b.speed * 0.8 + b.phase) * 0.1,
      );
      // fade in/out at the ends of the rise by scaling
      const edge = Math.min(1, (spread[1] / 2 - Math.abs(rise)) / 0.4);
      dummy.scale.setScalar(b.s * Math.max(0, edge));
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false} material={material}>
      <sphereGeometry args={[1, 32, 24]} />
    </instancedMesh>
  );
}

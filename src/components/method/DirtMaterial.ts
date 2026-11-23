"use client";

import { Color, DoubleSide, ShaderMaterial, type Texture } from "three";

/**
 * Overlay material that shows dirt ahead of a moving "finished edge" and clean surface behind it.
 * The edge is the visual motif of the whole method sequence: a thin aqua line sweeps across each
 * surface and everything behind it is done.
 *
 * mode 0 = plain sweep, 1 = mop (wet sheen trailing the edge that dries off),
 * 2 = vacuum (fresh carpet stripes left behind the edge).
 */
export type DirtOptions = {
  mask: Texture;
  color: string;
  opacity: number;
  repeat?: [number, number];
  axis?: 0 | 1; // 0 = sweep along U, 1 = along V
  reverse?: boolean;
  mode?: 0 | 1 | 2;
  stripes?: number;
  edgeColor?: string;
  /** Length of the surface along the sweep, in metres, so the edge line has the same real width everywhere. */
  sweepLength?: number;
};

export function createDirtMaterial(o: DirtOptions) {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
    uniforms: {
      uMask: { value: o.mask },
      uColor: { value: new Color(o.color) },
      uEdgeColor: { value: new Color(o.edgeColor ?? "#5fe3ea") },
      uOpacity: { value: o.opacity },
      uRepeat: { value: o.repeat ?? [1, 1] },
      uProgress: { value: 0 },
      uAxis: { value: o.axis ?? 0 },
      uReverse: { value: o.reverse ? 1 : 0 },
      uMode: { value: o.mode ?? 0 },
      uStripes: { value: o.stripes ?? 8 },
      uFade: { value: 1 },
      uEdgeStrength: { value: 1 },
      // ~1.6 cm line regardless of surface size
      uEdgeW: { value: 0.016 / (o.sweepLength ?? 1.4) },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMask;
      uniform vec3 uColor;
      uniform vec3 uEdgeColor;
      uniform float uOpacity;
      uniform vec2 uRepeat;
      uniform float uProgress;
      uniform int uAxis;
      uniform int uReverse;
      uniform int uMode;
      uniform float uStripes;
      uniform float uFade;
      uniform float uEdgeStrength;
      uniform float uEdgeW;
      varying vec2 vUv;

      void main() {
        float s = uAxis == 0 ? vUv.x : vUv.y;
        float o = uAxis == 0 ? vUv.y : vUv.x;
        if (uReverse == 1) s = 1.0 - s;

        // progress runs a little past both ends so the edge enters and leaves cleanly
        float p = mix(-0.06, 1.06, uProgress);
        // gentle organic wave on the edge, ~4 cm in the real world on every surface
        float edge = p + (sin(o * 9.0 + p * 6.0) * 2.0 + sin(o * 23.0) * 0.6) * uEdgeW;
        float d = s - edge; // > 0: still dirty, < 0: done

        float dirty = smoothstep(-uEdgeW * 0.8, uEdgeW * 1.4, d);
        float mask = texture2D(uMask, vUv * uRepeat).a;
        float a = mask * uOpacity * dirty;
        vec3 col = uColor;

        // behind the edge
        float behind = 1.0 - dirty;
        if (uMode == 1) {
          // wet sheen that dries off with distance behind the mop
          float wet = behind * (1.0 - smoothstep(0.0, 0.28, -d)) * smoothstep(0.0, uEdgeW * 3.0, -d);
          col = mix(col, vec3(0.86, 0.97, 0.98), wet);
          a = max(a, wet * 0.3);
        } else if (uMode == 2) {
          // fresh vacuum stripes
          float band = step(0.5, fract(s * uStripes));
          float stripe = behind * (band * 0.07);
          col = mix(col, vec3(1.0), stripe > 0.0 ? 1.0 : 0.0);
          a = max(a, stripe);
        }

        // the finished edge: a thin aqua line riding the boundary
        float sweeping = step(0.0005, uProgress) * step(uProgress, 0.9995);
        float line = exp(-pow(d / uEdgeW, 2.0));
        float halo = exp(-pow(d / (uEdgeW * 5.0), 2.0)) * 0.22;
        float glow = (line + halo) * sweeping * uEdgeStrength;
        col = mix(col, uEdgeColor, clamp(line * 1.2 + halo * 2.0, 0.0, 1.0) * sweeping);
        a = max(a, glow * 0.7);

        gl_FragColor = vec4(col, a * uFade);
        if (gl_FragColor.a < 0.002) discard;
      }
    `,
  });
}

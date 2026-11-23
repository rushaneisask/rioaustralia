"use client";

import { useSyncExternalStore } from "react";

export type DeviceTier = "high" | "mid" | "low";

let cached: DeviceTier | null = null;

function detect(): DeviceTier {
  if (cached) return cached;
  if (typeof window === "undefined") return "mid";

  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const width = Math.min(window.screen.width, window.innerWidth);
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const saveData = (nav as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;

  let gpu = "";
  try {
    const gl = document.createElement("canvas").getContext("webgl2") as WebGL2RenderingContext | null;
    if (gl) {
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      gpu = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)).toLowerCase();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    } else {
      cached = "low";
      return cached;
    }
  } catch {
    /* ignore */
  }

  const weakGpu = /(swiftshader|llvmpipe|software|mali-4|mali-t|adreno \(tm\) [1-5]|powervr|intel\(r\) hd graphics [2-5])/.test(gpu);

  if (saveData || weakGpu || cores <= 2 || memory <= 2) cached = "low";
  else if (coarse || width < 900 || cores <= 4 || memory <= 4) cached = "mid";
  else cached = "high";
  return cached;
}

const noop = () => () => {};

/** high = desktop with a real GPU, mid = most phones/tablets/laptops, low = weak or data-saver devices. */
export function useDeviceTier(): DeviceTier {
  return useSyncExternalStore(noop, detect, () => "mid");
}

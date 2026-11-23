/**
 * The ONE timeline for the #method sequence. Both the 3D scene and the HTML copy read from here,
 * so they can never drift apart. All values are fractions of the section's scroll progress (0..1).
 */
import type { MethodStepId } from "@/content/site";

export const INTRO_END = 0.07;
export const OUTRO_START = 0.92;

export const STEP_IDS: MethodStepId[] = ["dust", "wipe", "bins", "vacuum", "mop"];

const span = (OUTRO_START - INTRO_END) / STEP_IDS.length;

export type StepWindow = {
  id: MethodStepId;
  index: number;
  start: number;
  end: number;
  /** Where the tool actually works (the edge sweeps) inside the step. */
  workStart: number;
  workEnd: number;
};

export const STEPS: StepWindow[] = STEP_IDS.map((id, index) => {
  const start = INTRO_END + span * index;
  const end = start + span;
  return {
    id,
    index,
    start,
    end,
    workStart: start + span * 0.16,
    workEnd: end - span * 0.14,
  };
});

export const stepById = (id: MethodStepId) => STEPS.find((s) => s.id === id)!;

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
/** Ease in-out used for every scripted motion. */
export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** 0..1 progress of a step's work phase. */
export function workProgress(p: number, id: MethodStepId) {
  const s = stepById(id);
  return clamp01((p - s.workStart) / (s.workEnd - s.workStart));
}

/** Split a step's work across N sub-surfaces in order; returns 0..1 for sub-surface i. */
export function subProgress(work: number, i: number, n: number, overlap = 0.08) {
  const len = 1 / n;
  const a = Math.max(0, i * len - overlap * 0.5);
  const b = Math.min(1, (i + 1) * len + overlap * 0.5);
  return clamp01((work - a) / (b - a));
}

/** Tool presence (0..1) so tools glide in before and out after their work. */
export function toolPresence(p: number, id: MethodStepId) {
  const s = stepById(id);
  const fadeIn = smoothstep(s.start + (s.workStart - s.start) * 0.2, s.workStart, p);
  const fadeOut = 1 - smoothstep(s.workEnd, s.end - (s.end - s.workEnd) * 0.15, p);
  return Math.min(fadeIn, fadeOut);
}

/**
 * Opacity / offset for the copy block of a step. Scrubbed by scroll (no thresholds),
 * only one block visible at a time, reverses cleanly.
 */
export function copyState(p: number, index: number) {
  const s = STEPS[index];
  const len = s.end - s.start;
  const inA = s.start + len * 0.02;
  const inB = s.start + len * 0.22;
  const outA = s.end - len * 0.22;
  const outB = s.end - len * 0.02;
  const appear = smoothstep(inA, inB, p);
  const leave = smoothstep(outA, outB, p);
  // first block is already visible at the end of the intro; last block hands over to the outro
  const visible = index === 0 ? Math.min(smoothstep(INTRO_END * 0.4, inB, p), 1 - leave) : Math.min(appear, 1 - leave);
  const y = (1 - appear) * 26 - leave * 26;
  const blur = (1 - visible) * 8;
  return { opacity: visible, y, blur };
}

export function introState(p: number) {
  const v = 1 - smoothstep(INTRO_END * 0.45, INTRO_END + 0.02, p);
  return { opacity: v, y: -(1 - v) * 20 };
}

export function outroState(p: number) {
  const v = smoothstep(OUTRO_START + 0.005, OUTRO_START + 0.04, p);
  return { opacity: v, y: (1 - v) * 24 };
}

/** Rail fill for a step (0..1). */
export function railFill(p: number, index: number) {
  const s = STEPS[index];
  return clamp01((p - s.start) / (s.end - s.start));
}

/** Camera key positions, evenly spaced along one spline: intro, 5 steps, outro. */
export const CAMERA_KEYS = {
  positions: [
    [6.4, 3.9, 7.4],
    [-0.4, 2.3, 2.4],
    [0.4, 2.05, 1.5],
    [-1.1, 2.55, 2.4],
    [1.8, 3.1, 3.4],
    [4.9, 2.4, 3.4],
    [6.0, 3.6, 6.9],
  ] as [number, number, number][],
  targets: [
    [-0.4, 0.9, -0.8],
    [-2.3, 1.1, -1.6],
    [-1.1, 0.73, -1.8],
    [-1.75, 0.2, -1.45],
    [-1.6, 0.0, 0.2],
    [2.6, 0.1, -0.2],
    [-0.2, 0.85, -0.8],
  ] as [number, number, number][],
};

/** Map scroll progress to the camera spline parameter so each step's key is centred in its window. */
export function cameraT(p: number) {
  const n = CAMERA_KEYS.positions.length - 1; // 6 segments
  const stops = [0, ...STEPS.map((s) => (s.start + s.end) / 2), 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (p <= stops[i + 1]) {
      const local = (p - stops[i]) / (stops[i + 1] - stops[i]);
      return (i + ease(clamp01(local))) / n;
    }
  }
  return 1;
}

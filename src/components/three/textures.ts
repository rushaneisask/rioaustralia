"use client";

/**
 * Procedural textures generated in code (no image files).
 * Every generator is deterministic (seeded) so the scene looks the same on every visit.
 */
import { CanvasTexture, RepeatWrapping, SRGBColorSpace, LinearSRGBColorSpace, type Texture } from "three";

/* ----------------------------- noise helpers ----------------------------- */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Tileable value noise on a size×size grid. */
function makeNoise(size: number, cells: number, seed: number) {
  const rand = mulberry32(seed);
  const grid = new Float32Array(cells * cells);
  for (let i = 0; i < grid.length; i++) grid[i] = rand();
  const at = (x: number, y: number) => grid[((y % cells) + cells) % cells * cells + (((x % cells) + cells) % cells)];
  const smooth = (t: number) => t * t * (3 - 2 * t);
  return (px: number, py: number) => {
    const x = (px / size) * cells;
    const y = (py / size) * cells;
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const tx = smooth(x - xi);
    const ty = smooth(y - yi);
    const a = at(xi, yi);
    const b = at(xi + 1, yi);
    const c = at(xi, yi + 1);
    const d = at(xi + 1, yi + 1);
    return a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty;
  };
}

function fbm(size: number, seed: number, octaves = 4, base = 4) {
  const layers = Array.from({ length: octaves }, (_, i) => makeNoise(size, base * 2 ** i, seed + i * 101));
  return (x: number, y: number) => {
    let v = 0;
    let amp = 0.5;
    let norm = 0;
    for (const n of layers) {
      v += n(x, y) * amp;
      norm += amp;
      amp *= 0.5;
    }
    return v / norm;
  };
}

function canvas(size: number) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  return { c, ctx, img: ctx.createImageData(size, size) };
}

function finish(c: HTMLCanvasElement, opts: { color?: boolean; repeat?: [number, number] } = {}): Texture {
  const t = new CanvasTexture(c);
  t.colorSpace = opts.color === false ? LinearSRGBColorSpace : SRGBColorSpace;
  t.wrapS = t.wrapT = RepeatWrapping;
  if (opts.repeat) t.repeat.set(opts.repeat[0], opts.repeat[1]);
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

const cache = new Map<string, Texture>();
function cached(key: string, make: () => Texture) {
  if (!cache.has(key)) cache.set(key, make());
  return cache.get(key)!;
}

/* ------------------------------- surfaces -------------------------------- */

/** Commercial carpet tiles: fine looped pile in cool grey-blue with a subtle tile grid. */
export function carpetTexture(size = 512) {
  return cached(`carpet${size}`, () => {
    const { c, ctx, img } = canvas(size);
    const n = fbm(size, 7, 3, 16);
    const rand = mulberry32(11);
    const tiles = 4;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        const tile = (Math.floor((x / size) * tiles) + Math.floor((y / size) * tiles)) % 2;
        const grain = n(x, y) * 0.5 + rand() * 0.5;
        const base = 118 + grain * 34 + (tile ? 4 : -4);
        img.data[i] = base * 0.86;
        img.data[i + 1] = base * 0.95;
        img.data[i + 2] = base * 1.04;
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return finish(c, { repeat: [3, 3] });
  });
}

/** Light oak for desk tops and benches. */
export function woodTexture(size = 512) {
  return cached(`wood${size}`, () => {
    const { c, ctx, img } = canvas(size);
    const n = fbm(size, 21, 4, 4);
    const fine = makeNoise(size, 64, 23);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        const warp = n(x, y) * 18;
        const ring = Math.sin((y + warp) * 0.18 + n(x * 0.2, y) * 6) * 0.5 + 0.5;
        const g = 0.82 + ring * 0.1 + fine(x, y * 4) * 0.06;
        img.data[i] = 226 * g;
        img.data[i + 1] = 196 * g;
        img.data[i + 2] = 158 * g;
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return finish(c);
  });
}

/** Light vinyl planks for the hard floor (kitchenette / reception). */
export function plankTexture(size = 512) {
  return cached(`plank${size}`, () => {
    const { c, ctx, img } = canvas(size);
    const n = fbm(size, 31, 4, 4);
    const rand = mulberry32(37);
    const rows = 6;
    const offsets = Array.from({ length: rows }, () => rand());
    const tones = Array.from({ length: rows * 3 }, () => 0.94 + rand() * 0.08);
    for (let y = 0; y < size; y++) {
      const row = Math.floor((y / size) * rows);
      const inRow = ((y / size) * rows) % 1;
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        const u = ((x / size) + offsets[row]) % 1;
        const plank = Math.floor(u * 2);
        const seam = inRow < 0.012 || inRow > 0.988 || Math.abs((u * 2) % 1) < 0.004;
        const grain = Math.sin((x * 0.06 + n(x, y) * 10)) * 0.5 + 0.5;
        const t = tones[row * 3 + plank] * (0.93 + grain * 0.05 + n(x * 2, y) * 0.04) * (seam ? 0.86 : 1);
        img.data[i] = 232 * t;
        img.data[i + 1] = 222 * t;
        img.data[i + 2] = 206 * t;
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return finish(c, { repeat: [2, 2] });
  });
}

/** Soft plaster for walls: near-white with gentle variation. */
export function plasterTexture(size = 256) {
  return cached(`plaster${size}`, () => {
    const { c, ctx, img } = canvas(size);
    const n = fbm(size, 41, 4, 6);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        const v = 0.95 + n(x, y) * 0.05;
        img.data[i] = 247 * v;
        img.data[i + 1] = 249 * v;
        img.data[i + 2] = 248 * v;
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return finish(c, { repeat: [3, 2] });
  });
}

/** Roughness variation map (linear) to keep surfaces from looking like plastic. */
export function roughnessTexture(seed = 51, size = 256) {
  return cached(`rough${seed}`, () => {
    const { c, ctx, img } = canvas(size);
    const n = fbm(size, seed, 4, 8);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        const v = 150 + n(x, y) * 90;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return finish(c, { color: false });
  });
}

/* --------------------------------- dirt ---------------------------------- */
/* Dirt maps are single-channel masks (stored in alpha) blended by DirtMaterial. */

function maskTexture(key: string, size: number, fn: (x: number, y: number) => number) {
  return cached(key, () => {
    const { c, ctx, img } = canvas(size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        const a = Math.max(0, Math.min(1, fn(x, y)));
        img.data[i] = img.data[i + 1] = img.data[i + 2] = 255;
        img.data[i + 3] = a * 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return finish(c, { color: false });
  });
}

/** Fuzzy settled dust: soft cloudy film plus fine specks. */
export function dustMask(size = 512) {
  const n = fbm(size, 61, 5, 5);
  const rand = mulberry32(67);
  return maskTexture(`dust${size}`, size, (x, y) => {
    const film = Math.pow(n(x, y), 1.4) * 1.2;
    const speck = rand() > 0.985 ? 0.9 : 0;
    return film * 0.75 + speck;
  });
}

/** Smudges, fingerprints and mug rings for desks and benches. */
export function smudgeMask(size = 512) {
  return cached(`smudge${size}`, () => {
    const { c, ctx } = canvas(size);
    const rand = mulberry32(71);
    ctx.clearRect(0, 0, size, size);
    // mug rings
    for (let i = 0; i < 6; i++) {
      const x = rand() * size;
      const y = rand() * size;
      const r = size * (0.035 + rand() * 0.02);
      ctx.strokeStyle = `rgba(255,255,255,${0.5 + rand() * 0.35})`;
      ctx.lineWidth = size * 0.006;
      ctx.beginPath();
      ctx.arc(x, y, r, rand() * 0.6, Math.PI * 2 - rand() * 0.5);
      ctx.stroke();
    }
    // smears
    for (let i = 0; i < 18; i++) {
      const x = rand() * size;
      const y = rand() * size;
      const g = ctx.createRadialGradient(x, y, 0, x, y, size * (0.03 + rand() * 0.06));
      g.addColorStop(0, `rgba(255,255,255,${0.25 + rand() * 0.3})`);
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(1.8, 0.7);
      ctx.translate(-x, -y);
      ctx.fillRect(0, 0, size, size);
      ctx.restore();
    }
    // crumbs
    for (let i = 0; i < 220; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.5 + rand() * 0.5})`;
      const s = size * (0.002 + rand() * 0.004);
      ctx.fillRect(rand() * size, rand() * size, s, s);
    }
    return finish(c, { color: false });
  });
}

/** Floor debris for carpet: crumbs, grit and lint. */
export function debrisMask(size = 512) {
  return cached(`debris${size}`, () => {
    const { c, ctx } = canvas(size);
    const rand = mulberry32(83);
    const n = fbm(size, 89, 3, 4);
    ctx.clearRect(0, 0, size, size);
    for (let i = 0; i < 2400; i++) {
      const x = rand() * size;
      const y = rand() * size;
      if (n(x, y) < 0.42) continue;
      const s = size * (0.0015 + rand() * 0.004);
      ctx.fillStyle = `rgba(255,255,255,${0.55 + rand() * 0.45})`;
      ctx.beginPath();
      ctx.ellipse(x, y, s, s * (0.5 + rand()), rand() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    // lint threads
    ctx.lineCap = "round";
    for (let i = 0; i < 40; i++) {
      ctx.strokeStyle = `rgba(255,255,255,${0.4 + rand() * 0.3})`;
      ctx.lineWidth = size * 0.0015;
      ctx.beginPath();
      const x = rand() * size;
      const y = rand() * size;
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + (rand() - 0.5) * 20, y + (rand() - 0.5) * 20, x + (rand() - 0.5) * 30, y + (rand() - 0.5) * 30);
      ctx.stroke();
    }
    return finish(c, { color: false });
  });
}

/** Scuffs and footprints on the hard floor. */
export function scuffMask(size = 512) {
  return cached(`scuff${size}`, () => {
    const { c, ctx } = canvas(size);
    const rand = mulberry32(97);
    ctx.clearRect(0, 0, size, size);
    // footprint trail
    for (let i = 0; i < 14; i++) {
      const t = i / 14;
      const x = size * (0.1 + t * 0.8);
      const y = size * (0.5 + Math.sin(t * 5) * 0.18) + (i % 2 ? 14 : -14);
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.beginPath();
      ctx.ellipse(x, y, size * 0.022, size * 0.009, 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x - size * 0.028, y, size * 0.01, size * 0.008, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // scuffs
    ctx.lineCap = "round";
    for (let i = 0; i < 26; i++) {
      ctx.strokeStyle = `rgba(255,255,255,${0.3 + rand() * 0.4})`;
      ctx.lineWidth = size * (0.002 + rand() * 0.004);
      const x = rand() * size;
      const y = rand() * size;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (rand() - 0.5) * size * 0.12, y + (rand() - 0.5) * size * 0.03);
      ctx.stroke();
    }
    // grime haze
    const n = fbm(size, 101, 4, 4);
    const img = ctx.getImageData(0, 0, size, size);
    for (let p = 0; p < size * size; p++) {
      const x = p % size;
      const y = (p / size) | 0;
      const a = img.data[p * 4 + 3] / 255;
      const haze = Math.max(0, n(x, y) - 0.5) * 0.55;
      img.data[p * 4] = img.data[p * 4 + 1] = img.data[p * 4 + 2] = 255;
      img.data[p * 4 + 3] = Math.min(1, a + haze) * 255;
    }
    ctx.putImageData(img, 0, 0);
    return finish(c, { color: false });
  });
}

/** Soft round sprite for particles (dust motes, steam). */
export function softDotTexture(size = 64) {
  return cached(`dot${size}`, () => {
    const { c, ctx } = canvas(size);
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.4, "rgba(255,255,255,0.55)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return finish(c);
  });
}

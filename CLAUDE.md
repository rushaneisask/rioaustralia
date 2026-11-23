# RIO Australia website

Read `AGENTS.md` too (Next.js 16 rules: check `node_modules/next/dist/docs/` before using Next APIs).

## The business
- **RIO Australia** is the user's dad's commercial cleaning business in south-east Melbourne. It was formerly "Rio Clean Group" (riocleangroup.com.au). The new domain is **rioaustralia.com.au** (not live yet).
- It has one division for now: **Cleaning** (`/cleaning`). Don't add future divisions until the owner asks.
- Target customers: offices (law, accounting, any office), medical and dental clinics, and real estate agencies. **Fixed recurring contracts only.** No Airbnb, residential or one-off homes.
- Service area: south-east Melbourne and the Mornington Peninsula, from Cranbourne (and surrounds) down to Mornington.
- Services: commercial cleaning 1 to 5 times a week, steam cleaning, and window cleaning up to 10 m.
- Pricing is quote-based after a free on-site walkthrough. Never publish prices.

## Honesty rules (this site is used by real professionals)
**Read `CLAUDE.local.md` before writing any copy.** It holds the owner-confirmed business facts (insurance status, team, registration details). It is deliberately kept out of git because this repo is public.
- Only state what the owner has confirmed. Commitments about the future are fine ("you'll have our certificate of currency before anyone starts on site"). Present-tense claims must be true today.
- Never claim insurance, cover amounts, team sizes, "crews", years beyond the founding date, statistics or ratings unless `CLAUDE.local.md` says they're confirmed.
- Trading since 2 July 2020 ("Since 2020").
- The business cleans bank branches across the Mornington Peninsula, plus medical centres and offices. Clients **cannot be named**.
- **No reviews, testimonials, ratings, statistics or "trusted by"** until real clients agree to be quoted.
- Unknown details (email, ABN, phone hours) are `null` with a `TODO` in `site.ts` and are hidden in the UI, never invented.
- Phone: 0421 799 458.
- Never commit private business details (insurance status, staff numbers, registration doubts) to this public repo. They belong in `CLAUDE.local.md`.

## Where things live
- **All copy is in `src/content/site.ts`.** Components never hard-code text.
- Pages: `src/app/page.tsx` (group hub), `src/app/cleaning/page.tsx` (division), `src/app/contact/page.tsx` (shared quote form).
- Brand colours are CSS variables in `src/app/globals.css`, switched with `[data-brand="group" | "cleaning"]`. Aqua/teal is the brand. **Coral (#ff6b4a) is the single "splash" accent**: use it sparingly (logo sparkle, numbers, small markers). It's under 4.5:1 on white, so never use it for body text.
- The site is bright and joyful (light aqua/white), deliberately **not dark** like donsilvagroup.com.
- Logo: `src/components/brand/Logo.tsx` (droplet, white swoosh, coral sparkle). Favicon: `src/app/icon.svg`.
- Fonts: Outfit (display) and DM Sans (body), via `next/font`.

## 3D rules
- `src/components/three/Stage.tsx` is the **only** WebGL wrapper. At most one canvas per section. It pauses rendering offscreen, caps DPR per device tier, and hands scenes the tier from `useDeviceTier` (high/mid/low).
- **No external 3D assets, HDRIs or image textures.** Models are built in code (`three/equipment.tsx`), textures are generated in code (`three/textures.ts`), and lighting uses Lightformer rigs (`three/StudioLights.tsx`).
- **Don't use `transmission` on transparent canvases.** It refracts the transparent background and renders black. Use `MeshTransmissionMaterial` with a `background` colour, or a transparent physical material.
- Post-processing (`three/Effects.tsx`): AO only on high, bloom and vignette on mid and high, none on low. Keep emissive and bright colours under the bloom threshold unless they should glow.
- Hero canvases are full-bleed behind the copy on desktop, and `useHeroLayout()` shifts the content right. On phones the scene sits under the copy and is scaled to fit.
- Respect `prefers-reduced-motion`: show content in its final state, with no pinning or scrubbing.
- R3F frame-loop mutation is intended. ESLint's React Compiler rules are scoped off for `three/` and `method/` only (see `eslint.config.mjs`).

## The method sequence (`/cleaning#method`)
- `src/components/method/timeline.ts` is the **single timeline** for both the 3D scene and the copy, so they can't drift apart. Steps: Dust → Wipe → Bins → Vacuum → Mop, then "Ready for the morning."
- Everything in `MethodScene.tsx` is a pure function of scroll progress, so it reverses cleanly. Don't add time-based state that breaks scrubbing backwards (ambient motes are the only exception).
- The motif is a thin aqua **finished edge** that sweeps across each surface, with everything behind it clean (`DirtMaterial.ts`). The edge width is in real metres via `sweepLength`.
- GLSL gotcha: `active` is a reserved word.
- The room is at real scale in metres (`Room.tsx`). The camera follows one Catmull-Rom spline, with a view offset that keeps the action beside the copy.

## Hosting
- Static export (`output: "export"`, `trailingSlash: true`) on **GitHub Pages**, deployed by `.github/workflows/deploy.yml` on every push to `main`. Nothing may need a server at runtime.
- `PAGES_BASE_PATH` comes from `actions/configure-pages`, so the site works both at `<user>.github.io/rioaustralia` and at the custom domain.
- Quote form: Web3Forms public key from the repo Actions **variable** `WEB3FORMS_KEY`. Without a key it falls back to a pre-filled SMS (or email, once `site.contact.email` exists), so it never dead-ends.
- The AI quote estimator (planned) needs a server. Put it on a Cloudflare Worker, never in client code.

## Adding a new division (only when the owner asks)
1. Add it to `divisions` in `site.ts` with its copy block.
2. Add a `[data-brand="<slug>"]` block in `globals.css`.
3. Create `src/app/<slug>/page.tsx` from the cleaning page's sections.
4. JSON-LD (`layout.tsx`) and `sitemap.ts` read from `divisions` automatically.
5. Update this file.

## Before finishing any change
Run `npm run build` and `npm run lint`, then look at every changed page in a browser **at desktop and phone width** (375 px).

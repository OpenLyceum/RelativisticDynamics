# Relativistic Dynamics

[![CI](../../actions/workflows/ci.yml/badge.svg)](../../actions/workflows/ci.yml)

Relativistic momentum and energy for a first course in modern physics: push a particle towards
the speed of light and watch Newton's prediction overtake light while the real particle never
does, read E² = (pc)² + (mc²)² off a live triangle and mass shell, collide two bodies and view the
collision from any frame, and find the threshold energy of particle reactions on a fixed target
and in a collider. It accompanies Chapter 3 of the
[Modern Physics](https://github.com/QuadriviumPress/modernPhysics) textbook. Built with
[SceneryStack](https://scenerystack.org/); runs offline as a Progressive Web App.

## Features

- **Accelerate.** An electron or proton pushed by a constant force along a 20 m track races a
  light pulse and its own Newtonian prediction. Speed or momentum against time (both theories
  share p = Ft; they disagree about what it means for speed), and speed² against kinetic energy
  with W. Bertozzi's 1964 electron runs, their speeds computed from his measured flight times.
  A button jumps to the chapter's worked example: an electron through 2.00 MV, β = 0.979.
- **Energy–Momentum.** Choose an electron, muon, pion, proton, photon or a custom mass and set
  β, p, K or E with one slider; the triangle E² = (pc)² + (mc²)², an energy bar beside Newton's
  ½mu², and the (pc, E) mass shell update together. An observer moving along the particle slides
  its point along the hyperbola while the invariant mass stays fixed; for a photon this is the
  relativistic Doppler shift.
- **Collisions.** Two bodies, each with a mass and a velocity set on a pad bounded by c, meet
  elastically (any centre-of-momentum scattering angle) or stick. View the collision from the lab,
  the centre-of-momentum frame or a frame moving at any speed; before-and-after bars show that
  Σγmu and ΣE are conserved in every frame while Newton's Σmu is not. Presets reproduce the
  chapter's derivation of p = γmu, the sub-90° opening angle of equal masses, and kinetic energy
  becoming rest mass.
- **Thresholds.** Nine reactions, from antiproton production at the Bevatron to e⁺e⁻
  annihilation, on a fixed target or a head-on collider. The reaction before and after in the lab
  and in the CM frame (at threshold the products sit still in the CM frame and move off together
  in the lab), a √s meter, and √s against the energy supplied for both kinds of accelerator.
- **Accessible:** every control works from the keyboard; live screen summaries; keyboard-help
  dialogs. English, French and Spanish; default and projector colour profiles; installable PWA.
  A preference (or `?hideNewton`) hides the Newtonian comparisons.

## Quick Start

```bash
npm install
npm start        # dev server → http://localhost:5173
```

## Scripts

| Command | Description |
|---|---|
| `npm start` / `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build → `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run Vitest unit tests (includes memory-leak suite) |
| `npm run test:fuzz` | Optional Playwright fuzz smoke: pointer (`?fuzz`) + keyboard (`?fuzzBoard`), with `?ea`, 30s each |
| `npm run test:fuzz -- 90` | Same fuzz for 90 seconds (`--duration 90` or `FUZZ_DURATION=90` also work) |
| `npm run test:fuzz:quick` | Shorter fuzz smoke (10s) |
| `npm run test:fuzz:long` | Longer fuzz smoke (300s) |
| `npm run check` | TypeScript type check |
| `npm run lint` | Biome lint check |
| `npm run format` | Auto-format all files |
| `npm run fix` | Lint + auto-fix |
| `npm run icons` | Regenerate PNG icons from `public/icons/icon.svg` |
| `npm run release` | `check && lint && build && test`, then version patch + push tags |
| `npm run clean` | Remove `dist/` |

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| [SceneryStack](https://scenerystack.org/) | ^3.0.0 | Simulation framework |
| [Vite](https://vitejs.dev/) | ^8 | Build tool + dev server |
| [TypeScript](https://www.typescriptlang.org/) | ^7 | Type-safe JavaScript |
| [Biome](https://biomejs.dev/) | ^2.5 | Linting + formatting |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | ^2 | PWA + service worker |

## License

GNU Affero General Public License v3.0 — see [OpenLyceum org license](https://github.com/OpenLyceum/.github/blob/main/LICENSE).

## Contributing

See [OpenLyceum contributing guidelines](https://github.com/OpenLyceum/.github/blob/main/CONTRIBUTING.md).
Report bugs via GitHub Issues; use org issue templates.

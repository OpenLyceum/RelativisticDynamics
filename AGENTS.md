# AGENTS.md — Relativistic Dynamics

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenLyceum/.github/AGENTS.md](https://github.com/OpenLyceum/.github/blob/main/AGENTS.md).

## Project

Relativistic momentum and energy, written to accompany Chapter 3 (*Relativistic Dynamics*) of the
QuadriviumPress [Modern Physics](https://github.com/QuadriviumPress/modernPhysics) textbook, which
otherwise embeds only PhET's classical Collision Lab. Original work, not a port. Forked from
`SceneryStackTemplate` on 2 Nov 2026. Four screens:

| Screen | Folder | Content |
|---|---|---|
| Accelerate | `src/accelerate/` | Constant force on an electron or proton: race against a light pulse and the Newtonian ghost; u or p against t; β² against K with Bertozzi's 1964 data; the 2.00 MV worked example |
| Energy–Momentum | `src/energy-momentum/` | E² = (pc)² + (mc²)² triangle, energy bar, (pc, E) mass shell with auto-zoom, one "Set" slider over β/p/K/E, a moving observer sliding the point along the hyperbola |
| Collisions | `src/collisions/` | Two bodies meeting at one event, elastic or sticking, viewed from lab/CM/moving frame; before/after bars for Σγmu, ΣE, Σmc², ΣK and Newton's Σmu; presets for the chapter's derivation, target at rest, head-on |
| Thresholds | `src/thresholds/` | Nine reactions on a fixed target or collider; before/after in lab and CM frames; √s meter; √s against energy supplied |

Physics, data and references: [`doc/model.md`](doc/model.md). Architecture and decisions:
[`doc/implementation-notes.md`](doc/implementation-notes.md).

### Things to know first

- **Natural units, c = 1, MeV.** Masses are rest energies, momenta are MeV/c, speeds are β. The
  Collisions screen uses arbitrary m₀. Nothing multiplies or divides by c.
- **Energy and momentum are canonical; β is derived.** Do not store β; it loses precision near 1.
- **All motion is closed-form.** No integrators anywhere: keep it that way so frame changes and
  scrubbing stay exact.
- **Numbers are pinned to the textbook.** `tests/kinematics.test.ts`, `tests/acceleration.test.ts`,
  `tests/collisions.test.ts` and `tests/reactions.test.ts` check the chapter's worked examples
  (2.00 MV electron, 0.6c, antiproton 6mc², pion thresholds, opening angle, the derivation). If a
  change breaks one, the change is wrong.
- **Bertozzi's data are raw.** `BERTOZZI` in the Constants file holds his Table I flight times and
  the 8.4 m path; β is computed from them. Do not replace them with derived values.
- **Node >=26** is required (`engines` / `devEngines`). If `node -v` is older, run
  `source ~/.nvm/nvm.sh && nvm use 26` before npm or git commit (the pre-commit hook runs npm).

## Key files

| File | Purpose |
|---|---|
| `src/common/model/kinematics.ts` | **The heart of the sim.** `FourMomentum` (boosts, invariant mass), single-particle relations, elastic/inelastic two-body collisions, fixed-target and collider thresholds, hyperbolic motion |
| `src/common/model/particles.ts` | Particle table (PDG 2024 rest energies, charge, symbol) |
| `src/accelerate/model/acceleration.ts` | Run timing, snapshots of both theories, β² curves, Bertozzi points |
| `src/collisions/model/collisionGeometry.ts` | Solve a collision, view it from a frame, totals, opening angle, the derivation's CM angle |
| `src/thresholds/model/reactions.ts` | Reaction catalog, √s, verdicts, symmetric final states |
| `src/common/view/ChartFrameNode.ts` | bamboo chart frame with re-rangeable grid/ticks (parks spacing while re-ranging) |
| `src/common/view/controlHelpers.ts` | Themed controls shared by every screen (adapted from SpecialRelativity) |
| `src/RelativisticDynamicsColors.ts` | Colours **and the colour language** (cyan relativity, orange Newton, yellow light, violet invariants): read its header before adding a colour |
| `src/RelativisticDynamicsConstants.ts` | Grouped `as const` blocks: `MASS_MEV`, `ACCELERATE`, `BERTOZZI`, `ENERGY_MOMENTUM`, `COLLISIONS`, `THRESHOLDS`, `FONTS` |
| `src/preferences/` | One preference, Show Newton's predictions (`?hideNewton`) |

## Accessibility

Standard fleet pattern. Per-screen a11y strings live under `a11y.<screenKey>` in each locale JSON,
reached via `StringManager.get<Screen>A11yStrings()`; visible strings via
`get<Screen>Strings()` and `getCommonStrings()`. Every screen has a live `*ScreenSummaryContent`, a
wrapper `Node` carrying `pdomOrder` (Reset All last), and a `*KeyboardHelpContent`. The velocity
pads on the Collisions screen are keyboard-draggable (`RichDragListener`) and announce the velocity
on drag end. Do not rewrite a focused node's PDOM content during a drag: it drops focus.
Full convention: [Baton/ACCESSIBILITY.md](https://github.com/OpenLyceum/Baton/blob/main/ACCESSIBILITY.md).

## Compliance carve-outs

- **Grouped constants.** `RelativisticDynamicsConstants.ts` uses topical `as const` objects rather
  than a flat list of exports, as SpecialRelativity does.

## Commands

```bash
npm run lint && npm run check && npm run build && npm test
```

Dev server for screenshots: `npx vite --port <free port>`; screen models are reachable from the
console as `phet.joist.sim.screens[i].model` (with `?screens=n`, index 0).

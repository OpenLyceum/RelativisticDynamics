/**
 * RelativisticDynamicsConstants.ts
 *
 * Every named numeric constant in the simulation, grouped into topical `as const`
 * blocks (the SpecialRelativity convention), so four screens' worth of names stay
 * legible.
 *
 * Units
 * ─────
 * The physics runs in **natural units, c = 1**: energies and masses in MeV (a
 * "mass" is a rest energy mc²), momenta in MeV/c, speeds as β = u/c. The few SI
 * values below exist only to convert a displayed time or length.
 *
 * Layout values are in screen pixels. Colours live in RelativisticDynamicsColors.ts.
 */

import RelativisticDynamicsNamespace from "./RelativisticDynamicsNamespace.js";

// ── Layout / chrome (screen pixels) ───────────────────────────────────────────

/** Margin between the screen edge and edge-anchored controls (e.g. Reset All). */
export const SCREEN_VIEW_MARGIN = 20;

/** Corner radius shared by control panels and dialogs. */
export const PANEL_CORNER_RADIUS = 6;

/** Width every control panel is laid out against, so panels line up down a column. */
export const CONTROL_WIDTH = 220;

export const FONTS = {
  TICK_LABEL: "11px sans-serif",
  CHART_TITLE: "bold 13px sans-serif",
  AXIS_LABEL: "12px sans-serif",
  READOUT: "13px sans-serif",
  READOUT_VALUE: "bold 13px sans-serif",
  CONTROL_TITLE: "13px sans-serif",
  SECTION_HEADER: "bold 14px sans-serif",
  BIG_LABEL: "bold 16px sans-serif",
  PARTICLE_LABEL: "bold 12px sans-serif",
} as const;

// ── Physical constants ────────────────────────────────────────────────────────

/** Speed of light in metres per nanosecond, to convert c·t (m) to t (ns). */
export const SPEED_OF_LIGHT_M_PER_NS = 0.299792458;

/**
 * Rest energies in MeV, from the Particle Data Group, *Review of Particle
 * Physics* (2024). The heavy nucleus is ²⁰⁸Pb: its atomic mass
 * (207.976 652 1 u × 931.494 102 42 MeV/u) less 82 electron masses; the
 * electrons' binding energy (≈ 0.8 MeV) is far below anything the sim resolves.
 */
export const MASS_MEV = {
  PHOTON: 0,
  ELECTRON: 0.51099895,
  MUON: 105.6583755,
  PION_CHARGED: 139.57039,
  PION_NEUTRAL: 134.9768,
  KAON_CHARGED: 493.677,
  KAON_NEUTRAL: 497.611,
  PROTON: 938.27208816,
  NEUTRON: 939.56542052,
  LAMBDA: 1115.683,
  LEAD_NUCLEUS: 193687.1,
} as const;

// ── Accelerate screen ─────────────────────────────────────────────────────────

export const ACCELERATE = {
  /** Accelerating field range, MV/m (equivalently MeV per metre for a unit charge). */
  FIELD_MIN_MV_PER_M: 0.1,
  FIELD_MAX_MV_PER_M: 5,
  FIELD_DEFAULT_MV_PER_M: 1,
  /** Length of the accelerator track in metres; the run ends when the particle reaches it. */
  TRACK_LENGTH_M: 20,
  /** Simulated nanoseconds per wall-clock second at normal speed. */
  NS_PER_SECOND: 25,
  /** The worked example of Chapter 3: an electron through 2.00 MV. */
  WORKED_EXAMPLE_POTENTIAL_MV: 2,
  /** Range of the kinetic-energy axis on the β² against K chart, MeV. */
  CHART_MAX_KINETIC_ENERGY_MEV: 16,
} as const;

// ── Energy–Momentum screen ────────────────────────────────────────────────────

export const ENERGY_MOMENTUM = {
  /** Custom-particle mass range, MeV. */
  CUSTOM_MASS_MIN_MEV: 0,
  CUSTOM_MASS_MAX_MEV: 2000,
  CUSTOM_MASS_DEFAULT_MEV: 500,
  /** Largest observer speed (fraction of c). */
  MAX_FRAME_BETA: 0.95,
  /** Largest x = pc/S the controls reach (γ ≈ 10.05, β ≈ 0.995 for a massive particle). */
  MAX_SCALED_MOMENTUM: 10,
  /** The scale energy S used for massless particles, MeV. */
  PHOTON_SCALE_MEV: 1,
  /** From this γ up the particle is labelled ultrarelativistic (E and pc then differ by under 2 %). */
  ULTRARELATIVISTIC_GAMMA: 5,
  /** Below this β (and m > 0), the particle is labelled at rest. */
  AT_REST_BETA: 1e-3,
  /**
   * The (pc, E) diagram: pc ∈ [−P, P], E ∈ [0, P] in units of mc² (or MeV for a
   * photon), drawn with equal pixel scales so the light line sits at 45°. P steps
   * through these zoom levels to keep the points on the chart.
   */
  DIAGRAM_ZOOM_LEVELS: [3, 6, 12, 24],
  DIAGRAM_VIEW_WIDTH: 420,
} as const;

// ── Collisions screen ─────────────────────────────────────────────────────────

export const COLLISIONS = {
  /** Masses offered for the two bodies, in arbitrary units (only ratios matter). */
  MASS_MIN: 0.5,
  MASS_MAX: 4,
  MASS_DEFAULT: 1,
  /** Largest speed a body may be given, as a fraction of c. */
  MAX_SPEED: 0.95,
  /** Range of the free frame-velocity slider. */
  MAX_FRAME_BETA: 0.95,
  /** Half-width of the play area in model units (light-seconds); bodies move this far before/after. */
  PLAY_AREA_HALF_WIDTH: 3,
  /** How long, in model seconds, each run lasts on either side of the collision. */
  RUN_HALF_DURATION: 4,
  /** Model seconds per wall-clock second. */
  TIME_SCALE: 1,
  /** Disk radius in pixels for a body of unit mass (scales as √mass). */
  BODY_RADIUS_PX: 14,
  /** Transverse speed w₀ used by the symmetric-derivation preset. */
  DERIVATION_TRANSVERSE_SPEED: 0.3,
  /** Frame speed v used by the symmetric-derivation preset. */
  DERIVATION_FRAME_SPEED: 0.8,
} as const;

// ── Thresholds screen ─────────────────────────────────────────────────────────

export const THRESHOLDS = {
  /** Beam kinetic-energy slider spans [0, this × threshold] (or a fixed range for exothermic reactions). */
  BEAM_RANGE_OVER_THRESHOLD: 3,
} as const;

RelativisticDynamicsNamespace.register("RelativisticDynamicsConstants", {
  SCREEN_VIEW_MARGIN,
  PANEL_CORNER_RADIUS,
  CONTROL_WIDTH,
  FONTS,
  SPEED_OF_LIGHT_M_PER_NS,
  MASS_MEV,
  ACCELERATE,
  ENERGY_MOMENTUM,
  COLLISIONS,
  THRESHOLDS,
});

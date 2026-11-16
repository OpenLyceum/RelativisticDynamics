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
  FIELD_DEFAULT_MV_PER_M: 0.25,
  /** Length of the accelerator track in metres; the run ends when the real particle reaches it. */
  TRACK_LENGTH_M: 20,
  /** Wall-clock seconds a full run takes at normal speed, whatever the particle and field. */
  RUN_DURATION_S: 6,
  /** Playback slow-down factor for the "slow" time speed. */
  SLOW_FACTOR: 0.25,
  /** Highest β the speed-against-time chart shows; Newton's line leaves the top of it. */
  CHART_MAX_BETA: 2,
  /** For an electron the K axis always reaches at least this far, so all of Bertozzi's runs (to 15 MeV) show. */
  ELECTRON_CHART_MIN_KINETIC_ENERGY_MEV: 16,
  /** Highest β² the β²-against-K chart shows. */
  CHART_MAX_BETA_SQUARED: 1.5,
  /** The worked example of Chapter 3: an electron through 2.00 MV, so K = 2.00 MeV. */
  WORKED_EXAMPLE_KINETIC_ENERGY_MEV: 2,
} as const;

/**
 * W. Bertozzi, "Speed and kinetic energy of relativistic electrons," Am. J. Phys.
 * 32, 551 (1964), Table I: electrons of kinetic energy E from a Van de Graaff and
 * a linac, timed over an 8.4 m flight path. The speed of each run is computed
 * from these raw numbers (β = L / ct) rather than copied from a secondary
 * summary. The 15 MeV run comes out at β slightly above 1, inside the
 * experiment's few-percent uncertainty; it is shown as measured.
 */
export const BERTOZZI = {
  FLIGHT_PATH_M: 8.4,
  RUNS: [
    { kineticEnergyMeV: 0.5, flightTimeNs: 32.3 },
    { kineticEnergyMeV: 1.0, flightTimeNs: 30.8 },
    { kineticEnergyMeV: 1.5, flightTimeNs: 29.2 },
    { kineticEnergyMeV: 4.5, flightTimeNs: 28.4 },
    { kineticEnergyMeV: 15, flightTimeNs: 28.0 },
  ],
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

  /** Default scaled momentum pc/S on the Set slider. */
  SCALED_MOMENTUM_DEFAULT: 2,
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

  /** Slow-motion rate relative to the normal clock (dimensionless). */
  SLOW_TIME_FACTOR: 0.3,
  /** Default CM scattering angle (degrees). */
  CM_ANGLE_DEFAULT: 90,
  CM_ANGLE_RANGE_MIN: -180,
  CM_ANGLE_RANGE_MAX: 180,
  /** Default free-frame β when the moving-frame radio is selected. */
  FRAME_BETA_DEFAULT: 0.5,
  /** Speed below which an outgoing direction is undefined (units of c). */
  MIN_DIRECTION_SPEED: 1e-9,
} as const;

// ── Thresholds screen ─────────────────────────────────────────────────────────

export const THRESHOLDS = {
  /** Beam kinetic-energy slider spans [0, this × threshold] (or a fixed range for exothermic reactions). */
  BEAM_RANGE_OVER_THRESHOLD: 3,

  /** Initial slider position as a fraction of the over-threshold span. */
  DEFAULT_FRACTION: 0.5,
  /** Beam range when the threshold is zero: this many beam rest energies (or MeV for a photon). */
  FALLBACK_RANGE_FACTOR: 10,
} as const;

/** Shared kinematic numerics (natural units, c = 1). */
export const KINEMATICS = {
  /** Speed margin below c used to avoid singular boosts (dimensionless). */
  BETA_MARGIN: 1e-8,
} as const;

/** Shared panel margins (px). */
export const PANEL = {
  X_MARGIN: 12,
  Y_MARGIN: 10,
} as const;
/** Shared bamboo chart chrome (px); DEFAULT_DIGITS is format precision. */
export const CHART = {
  AXIS_LABEL_TOP_OFFSET: 20,
  RIGHT_AXIS_INSET: -32,
  DEFAULT_DIGITS: 3,
} as const;
/** Shared control-helper layout (px); factors are dimensionless. */
export const CONTROLS = {
  WIDE_NUMBER_CONTROL_Y_SPACING: 10,
  NUMBER_CONTROL_TITLE_WIDTH_RESERVE: 110,
  CHECKBOX_LABEL_WIDTH_RESERVE: 30,
  PUSH_BUTTON_LABEL_WIDTH_RESERVE: 24,
  RADIO_LABEL_WIDTH_RESERVE: 40,
  LABEL_MAX_WIDTH_FACTOR: 0.62,
  VALUE_MAX_WIDTH_FACTOR: 0.38,
  NARROW_CONTROL_WIDTH: 170,
  NARROW_NUMBER_CONTROL_Y_SPACING: 6,
  NUMBER_CONTROL_TRACK_HEIGHT: 4,
  RADIO_BUTTON_SPACING: 7,
} as const;
/** Preferences panel typography and spacing. */
export const PREFERENCES = {
  HEADER_FONT_SIZE: 18,
  CHECKBOX_FONT_SIZE: 14,
  CHECKBOX_SPACING: 8,
  SPACING: 12,
} as const;
/** Home-screen icon geometry (px); ratios are dimensionless. */
export const SCREEN_ICONS = {
  ARROW_HEAD_WIDTH: 40,
  ARROW_HEAD_HEIGHT: 34,
  ARROW_TAIL_WIDTH: 14,
  LANES_START_X: 50,
  LANES_END_X: 500,
  LANES_LINE_WIDTH: 6,
  ACCELERATE_FINISH_X: 500,
  ACCELERATE_FINISH_TOP_Y: 50,
  ACCELERATE_FINISH_BOTTOM_Y: 320,
  ACCELERATE_FINISH_LINE_WIDTH: 6,
  ACCELERATE_LIGHT_X: 330,
  ACCELERATE_LIGHT_WIDTH: 80,
  ACCELERATE_LIGHT_HEIGHT: 24,
  ACCELERATE_LIGHT_CORNER_RADIUS: 12,
  ACCELERATE_MARKER_RADIUS: 34,
  ACCELERATE_NEWTON_X: 450,
  ACCELERATE_NEWTON_LINE_WIDTH: 9,
  ACCELERATE_NEWTON_DASH: 16,
  ACCELERATE_RELATIVITY_X: 290,
  TRIANGLE_LINE_WIDTH: 16,
  ENERGY_LIGHT_LINE_WIDTH: 6,
  ENERGY_LIGHT_DASH: 14,
  ENERGY_SHELL_LINE_WIDTH: 10,
  ENERGY_POINT_RADIUS: 18,
  ENERGY_POINT_X_FACTOR: 0.9,
  ENERGY_POINT_P: 0.9,
  COLLISIONS_INCOMING_START_X: 40,
  COLLISIONS_TRAIL_LINE_WIDTH: 8,
  COLLISIONS_BODY_RADIUS: 42,
  COLLISIONS_BODY_X_OFFSET: 120,
  COLLISIONS_BODY_Y_OFFSET: 85,
  COLLISIONS_COMPOSITE_RADIUS: 40,
  COLLISIONS_COMPOSITE_X: 110,
  COLLISIONS_COMPOSITE_OPACITY: 0.35,
  THRESHOLDS_PRODUCT_RADIUS: 24,
  THRESHOLDS_PRODUCT_X_OFFSET: 120,
  THRESHOLDS_PRODUCT_Y_PITCH: 62,
  THRESHOLDS_BEAM_RADIUS: 30,
  THRESHOLDS_BEAM_X: 70,
  THRESHOLDS_TARGET_X_OFFSET: 40,
} as const;

// ── Per-screen view layout ─────────────────────────────────────────────────

/** Accelerate screen layout, chart chrome, track geometry, and readout precision. */
export const ACCELERATE_VIEW = {
  T_LIGHT_DASH: 6,
  T_LIGHT_GAP: 4,
  T_NEWTON_DASH: 6,
  T_NEWTON_GAP: 3,
  MOMENTUM_NOTE_WIDTH_INSET: 12,
  K_LIGHT_DASH: 6,
  K_LIGHT_GAP: 4,
  K_NEWTON_DASH: 6,
  K_NEWTON_GAP: 3,
  CHARTS_GAP: 75,
  C_LABEL_RIGHT_INSET: 4,
  CHART_WIDTH: 245,
  CHART_HEIGHT: 200,
  CHART_SAMPLES: 120,
  CHART_MARKER_RADIUS: 5,
  T_LIGHT_LINE_WIDTH: 1.5,
  T_NEWTON_LINE_WIDTH: 2.5,
  T_RELATIVITY_LINE_WIDTH: 2.5,
  MOMENTUM_NOTE_LEFT: 6,
  MOMENTUM_NOTE_TOP: 6,
  ENERGY_CHART_RANGE_MAX: 20,
  K_LIGHT_LINE_WIDTH: 1.5,
  K_NEWTON_LINE_WIDTH: 2,
  K_RELATIVITY_LINE_WIDTH: 2,
  BERTOZZI_RADIUS: 4.5,
  NEWTON_MARKER_LINE_WIDTH: 2,
  TITLED_CHART_SPACING: 6,
  READOUT_DIGITS: 3,
  POSITION_DIGITS: 3,
  GAMMA_DIGITS: 4,
  MOMENTUM_DIGITS: 4,
  KINETIC_ENERGY_DIGITS: 4,
  TRACK_TOP_INSET: 6,
  CHARTS_LEFT_INSET: 55,
  CONTROL_PANEL_WIDTH_PAD: 24,
  READOUT_PANEL_WIDTH_PAD: 24,
  PLAY_AREA_WIDTH: 720,
  FIELD_DECIMAL_PLACES: 2,
  FIELD_DELTA: 0.05,
  CONTROL_PANEL_SPACING: 8,
  READOUT_PANEL_SPACING: 3,
  TIME_ROW_SPACING: 18,
  TRACK_READOUT_DIGITS: 3,
  TRACK_LABEL_WIDTH_INSET: 10,
  TRACK_LABEL_RIGHT_GAP: 10,
  TRACK_READOUT_WIDTH_INSET: 14,
  TRACK_READOUT_LEFT_GAP: 14,
  TRACK_NEWTON_DASH: 4,
  TRACK_NEWTON_GAP: 3,
  TRACK_LANE_LABEL_TOP_GAP: 6,
  LANE_HEIGHT: 34,
  LABEL_COLUMN: 90,
  READOUT_COLUMN: 150,
  TRACK_MARKER_RADIUS: 9,
  TICK_SPACING_M: 2,
  LANE_LINE_WIDTH: 2,
  LIGHT_PULSE_X: -12,
  LIGHT_PULSE_Y: -3,
  LIGHT_PULSE_WIDTH: 24,
  LIGHT_PULSE_HEIGHT: 6,
  LIGHT_PULSE_CORNER_RADIUS: 3,
  TRACK_NEWTON_LINE_WIDTH: 2.5,
  TRACK_RELATIVITY_LINE_WIDTH: 2,
  SUMMARY_TIME_DIGITS: 3,
  SUMMARY_POSITION_DIGITS: 3,
  SUMMARY_KINETIC_DIGITS: 3,
  SUMMARY_NEWTON_BETA_DIGITS: 3,
} as const;
/** Collisions screen layout: play area, pads, conservation bars, momentum diagram. */
export const COLLISIONS_VIEW = {
  FRAME_NAME_DIGITS: 2,
  LIGHT_CIRCLE_DASH: 4,
  VIEWING_TEXT_WIDTH_INSET: 16,
  ARROW_SCALE: 55,
  LIGHT_CIRCLE_OPACITY: 0.6,
  TRAILS_LINE_WIDTH: 2,
  SPRITE_LINE_WIDTH: 1.5,
  SPRITE_HEAD_WIDTH: 9,
  SPRITE_HEAD_HEIGHT: 8,
  SPRITE_TAIL_WIDTH: 3,
  VIEWING_TEXT_LEFT: 8,
  VIEWING_TEXT_TOP: 6,
  SQRT_S_DIGITS: 4,
  OPENING_ANGLE_DIGITS: 3,
  COMPOSITE_MASS_DIGITS: 4,
  REST_MASS_SUM_DIGITS: 3,
  PLAY_AREA_LEFT_INSET: 42,
  DIAGRAM_TOP_GAP: 22,
  BODIES_INNER_SPACING: 14,
  PRESET_PANEL_WIDTH_PAD: 24,
  COLLISION_PANEL_WIDTH_PAD: 24,
  FRAME_PANEL_WIDTH_PAD: 24,
  PLAY_WIDTH: 340,
  PLAY_HEIGHT: 245,
  DIAGRAM_SIZE: 150,
  READOUT_WIDTH: 215,
  MASS_CONTROL_WIDTH: 125,
  READOUTS_SPACING: 6,
  MASS_CONTROL_DELTA: 0.1,
  BODIES_PANEL_SPACING: 8,
  PRESET_PANEL_SPACING: 6,
  ANGLE_CONTROL_MIN: -180,
  ANGLE_CONTROL_MAX: 180,
  COLLISION_PANEL_SPACING: 8,
  FRAME_SPEED_DECIMAL_PLACES: 2,
  FRAME_SPEED_DELTA: 0.01,
  FRAME_PANEL_SPACING: 8,
  RIGHT_COLUMN_SPACING: 10,
  TIME_ROW_SPACING: 16,
  CONSERVATION_DIGITS: 3,
  CONSERVATION_VALUE_SPACING: 2,
  CONSERVATION_VALUE_LEFT_GAP: 14,
  CONSERVATION_LEGEND_LEFT: 108,
  CONSERVATION_LABEL_WIDTH: 52,
  CONSERVATION_BAR_REGION: 100,
  CONSERVATION_BAR_HEIGHT: 7,
  CONSERVATION_VALUE_WIDTH: 70,
  CONSERVATION_TOLERANCE: 1e-7,
  BEFORE_BAR_Y: 4,
  AFTER_BAR_LINE_WIDTH: 1.5,
  LEGEND_SWATCH_WIDTH: 14,
  LEGEND_SWATCH_LEFT: 18,
  LEGEND_LABEL_MAX_WIDTH: 60,
  LEGEND_COLUMN_X: 90,
  CONSERVATION_ROW_SPACING: 6,
  MOMENTUM_ARROW_HEAD_WIDTH: 10,
  MOMENTUM_ARROW_HEAD_HEIGHT: 9,
  MOMENTUM_ARROW_TAIL_WIDTH: 3,
  MOMENTUM_TITLE_BOTTOM: -4,
  MOMENTUM_OUTLINE_LINE_WIDTH: 1.5,
  MOMENTUM_TOTAL_OPACITY: 0.8,
  MOMENTUM_ORIGIN_RADIUS: 3,
  PAD_SPEED_DIGITS: 2,
  PAD_LIGHT_DASH: 3,
  PAD_C_LABEL_LEFT_FACTOR: 0.72,
  PAD_C_LABEL_BOTTOM_FACTOR: 0.72,
  PAD_TITLE_WIDTH_INSET: 20,
  PAD_TITLE_BOTTOM_GAP: 6,
  PAD_VALUE_WIDTH_INSET: 30,
  PAD_VALUE_TOP_GAP: 4,
  PAD_RADIUS: 52,
  PAD_HANDLE_RADIUS: 8,
  PAD_KEYBOARD_STEP: 0.05,
  PAD_LIGHT_LINE_WIDTH: 2,
  PAD_SPOKE_LINE_WIDTH: 2,
  SUMMARY_DIGITS: 3,
} as const;
/** Energy–Momentum screen layout: diagram, triangle, readout, and controls. */
export const ENERGY_MOMENTUM_VIEW = {
  MOMENTUM_DIGITS: 4,
  KINETIC_DIGITS: 4,
  ENERGY_DIGITS: 4,
  SLIDER_THUMB_HEIGHT: 26,
  PANEL_WIDTH_PAD: 24,
  SLIDER_STEP: 0.01,
  CUSTOM_MASS_DELTA: 10,
  PARTICLE_PANEL_SPACING: 8,
  SLIDER_TRACK_HEIGHT: 4,
  SLIDER_THUMB_WIDTH: 14,
  SET_PANEL_SPACING: 8,
  OBSERVER_DECIMAL_PLACES: 2,
  OBSERVER_DELTA: 0.01,
  OBSERVER_PANEL_SPACING: 8,
  LIGHT_LINE_DASH: 6,
  LIGHT_LINE_GAP: 4,
  DROP_LINE_DASH: 3,
  DROP_LINE_WIDTH: 3,
  ZOOM_BUTTON_TOP_FACTOR: 0.55,
  ZOOM_BUTTON_TOP_GAP: 6,
  ZOOM_BUTTON_LEFT_GAP: 8,
  ZOOM_BUTTON_BOTTOM_GAP: 4,
  HYPERBOLA_SAMPLES: 120,
  POINT_RADIUS: 6,
  DIAGRAM_TITLE_BOTTOM: -8,
  LIGHT_LINE_WIDTH: 2,
  LIGHT_LABEL_MAX_WIDTH: 80,
  MASS_SHELL_LINE_WIDTH: 2.5,
  MASS_SHELL_LABEL_MAX_WIDTH: 80,
  LAB_LABEL_MAX_WIDTH: 70,
  FRAME_LABEL_MAX_WIDTH: 80,
  READOUT_GAMMA_DIGITS: 4,
  READOUT_MOMENTUM_DIGITS: 4,
  READOUT_KINETIC_DIGITS: 4,
  READOUT_ENERGY_DIGITS: 4,
  READOUT_MASS_DIGITS: 4,
  READOUT_LABEL_WIDTH: 150,
  READOUT_VALUE_WIDTH: 105,
  READOUT_GRID_X_SPACING: 14,
  READOUT_GRID_Y_SPACING: 4,
  READOUT_CENTER_X_NUDGE: 20,
  READOUT_TOP_GAP: 14,
  DIAGRAM_LEFT: 305,
  TRIANGLE_MOMENTUM_DIGITS: 3,
  TRIANGLE_MASS_DIGITS: 3,
  TRIANGLE_ENERGY_DIGITS: 3,
  TRIANGLE_TITLE_WIDTH_INSET: 20,
  TRIANGLE_BADGE_WIDTH_INSET: 20,
  TRIANGLE_BADGE_SPACING: 4,
  NEWTON_LABEL_LEFT_GAP: 6,
  TRIANGLE_BOX: 170,
  ENERGY_BAR_WIDTH: 210,
  ENERGY_BAR_HEIGHT: 14,
  MOMENTUM_LEG_LINE_WIDTH: 4,
  MASS_LEG_LINE_WIDTH: 4,
  HYPOTENUSE_LINE_WIDTH: 4,
  TRIANGLE_LABEL_MAX_WIDTH: 150,
  TRIANGLE_LEGEND_SPACING: 2,
  TRIANGLE_CHILDREN_SPACING: 10,
  TRIANGLE_LEFT_INSET: 2,
  SUMMARY_MOMENTUM_DIGITS: 3,
  SUMMARY_KINETIC_DIGITS: 3,
  SUMMARY_ENERGY_DIGITS: 3,
  SUMMARY_MASS_DIGITS: 3,
  SUMMARY_PX_DIGITS: 3,
} as const;
/** Thresholds screen layout: reaction frames, √s meter, and available-energy chart. */
export const THRESHOLDS_VIEW = {
  THRESHOLD_LINE_DASH: 6,
  THRESHOLD_LINE_GAP: 4,
  FIXED_LABEL_RIGHT_INSET: 4,
  FIXED_LABEL_BOTTOM_GAP: 3,
  COLLIDER_LABEL_X_FACTOR: 0.72,
  COLLIDER_LABEL_LEFT_GAP: 8,
  COLLIDER_LABEL_TOP_MIN: 4,
  COLLIDER_LABEL_Y_FACTOR: 0.72,
  COLLIDER_LABEL_TOP_GAP: 4,
  CHART_TITLE_WIDTH_PAD: 40,
  CHART_WIDTH: 270,
  CHART_HEIGHT: 160,
  CHART_SAMPLES: 100,
  FIXED_CURVE_LINE_WIDTH: 2.5,
  COLLIDER_CURVE_LINE_WIDTH: 2.5,
  THRESHOLD_LINE_WIDTH: 1.5,
  CHART_MARKER_RADIUS: 5,
  CURVE_LABEL_MAX_WIDTH: 90,
  CHART_LEFT_INSET: 4,
  CHART_CHILDREN_SPACING: 6,
  METER_FORMAT_DIGITS: 4,
  METER_VALUE_DIGITS: 4,
  SQRT_S_LABEL_DIGITS: 4,
  MARKER_LABEL_DIGITS: 4,
  SQRT_S_LABEL_TOP_GAP: 6,
  METER_WIDTH: 300,
  METER_HEIGHT: 18,
  METER_READOUT_WIDTH: 300,
  MARKER_START_Y: -6,
  MARKER_LINE_WIDTH: 3,
  SQRT_S_LABEL_MAX_WIDTH: 150,
  MARKER_LABEL_MAX_WIDTH: 150,
  METER_READOUTS_SPACING: 3,
  METER_CHILDREN_SPACING: 14,
  METER_LEFT_INSET: 2,
  MARKER_LABEL_BOTTOM: -8,
  FRAME_TITLE_WIDTH_INSET: 16,
  FRAME_DIVIDER_DASH: 4,
  FRAME_MESSAGE_WIDTH_INSET: 80,
  PRODUCT_DISK_RADIUS: 12,
  REACTANT_DISK_RADIUS: 5,
  FRAME_WIDTH: 330,
  FRAME_HEIGHT: 196,
  BEFORE_Y: 62,
  AFTER_Y: 150,
  ARROW_LENGTH: 62,
  CLUSTER_RADIUS: 26,
  MAX_PRODUCTS: 4,
  FRAME_CORNER_X: 6,
  FRAME_CORNER_Y: 6,
  FRAME_TITLE_LEFT: 8,
  FRAME_TITLE_TOP: 6,
  SECTION_LABEL_MAX_WIDTH: 60,
  SECTION_LABEL_LEFT: 8,
  DIVIDER_START_X: 8,
  SPRITE_RADIUS: 8,
  SPRITE_HEAD_WIDTH: 9,
  SPRITE_HEAD_HEIGHT: 8,
  SPRITE_TAIL_WIDTH: 3,
  SPRITE_MAX_WIDTH: 40,
  BEAM_VALUE_DIGITS: 4,
  BEAM_SLIDER_THUMB_HEIGHT: 26,
  TITLE_WIDTH_PAD: 16,
  FRAMES_TOP_GAP: 10,
  FRAMES_GAP: 16,
  REACTION_PANEL_WIDTH_PAD: 24,
  CONFIGURATION_PANEL_WIDTH_PAD: 24,
  BEAM_PANEL_WIDTH_PAD: 24,
  REACTION_PANEL_SPACING: 8,
  CONFIGURATION_PANEL_SPACING: 8,
  BEAM_SLIDER_TRACK_HEIGHT: 4,
  BEAM_SLIDER_THUMB_WIDTH: 14,
  BEAM_PANEL_SPACING: 8,
  RIGHT_COLUMN_SPACING: 10,
  SUMMARY_ENERGY_DIGITS: 3,
  SUMMARY_THRESHOLD_DIGITS: 3,
} as const;

RelativisticDynamicsNamespace.register("RelativisticDynamicsConstants", {
  SCREEN_VIEW_MARGIN,
  PANEL_CORNER_RADIUS,
  CONTROL_WIDTH,
  FONTS,
  SPEED_OF_LIGHT_M_PER_NS,
  MASS_MEV,
  ACCELERATE,
  BERTOZZI,
  ENERGY_MOMENTUM,
  COLLISIONS,
  THRESHOLDS,
  KINEMATICS,
  PANEL,
  CHART,
  CONTROLS,
  PREFERENCES,
  SCREEN_ICONS,
  ACCELERATE_VIEW,
  COLLISIONS_VIEW,
  ENERGY_MOMENTUM_VIEW,
  THRESHOLDS_VIEW,
});

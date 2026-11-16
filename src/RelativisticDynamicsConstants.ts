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

/** Settings for accelerate/view/AccelerateChartsNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const ACCELERATE_CHARTS_NODE_SETTINGS = {
  T_LIGHT_LINE_DASH_DASH: 6, // px
  CONSTRUCTOR_T_LIGHT_LINE_DASH_DASH: 4, // px
  T_NEWTON_LINE_DASH_DASH: 6, // px
  CONSTRUCTOR_T_NEWTON_LINE_DASH_DASH: 3, // px
  MOMENTUM_NOTE_MAX_WIDTH_OFFSET: 12, // px
  K_LIGHT_LINE_DASH_DASH: 6, // px
  CONSTRUCTOR_K_LIGHT_LINE_DASH_DASH: 4, // px
  K_NEWTON_LINE_DASH_DASH: 6, // px
  CONSTRUCTOR_K_NEWTON_LINE_DASH_DASH: 3, // px
  CONSTRUCTOR_LEFT_OFFSET: 75, // px
  CONSTRUCTOR_RIGHT_OFFSET: 4, // px

  CHART_WIDTH: 245,
  CHART_HEIGHT: 200,
  SAMPLES: 120,
  MARKER_RADIUS: 5,
  T_LIGHT_LINE_WIDTH: 1.5,
  T_NEWTON_LINE_WIDTH: 2.5,
  T_RELATIVITY_LINE_WIDTH: 2.5,
  MOMENTUM_NOTE_LEFT: 6,
  MOMENTUM_NOTE_TOP: 6,
  /** Energy chart range max (in the source module’s documented units). */
  ENERGY_CHART_RANGE_MAX: 20,
  K_LIGHT_LINE_WIDTH: 1.5,
  K_NEWTON_LINE_WIDTH: 2,
  K_RELATIVITY_LINE_WIDTH: 2,
  BERTOZZI_RADIUS: 4.5,
  NEWTON_MARKER_LINE_WIDTH: 2,
  TITLED_SPACING: 6,
} as const;

/** Settings for accelerate/view/AccelerateScreenView.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const ACCELERATE_SCREEN_VIEW_SETTINGS = {
  READOUT_VALUES_DIGITS: 3, // digits
  POSITION_FORMAT_SIGNIFICANT_DIGITS: 3, // digits
  READOUT_VALUES_DIGITS_SEGMENT_2: 4, // digits
  MOMENTUM_FORMAT_ENERGY_DIGITS: 4, // digits
  KINETIC_ENERGY_FORMAT_ENERGY_DIGITS: 4, // digits

  CONSTRUCTOR_TOP_OFFSET: 6, // px
  CONSTRUCTOR_LEFT_OFFSET: 55, // px
  CONTROL_PANEL_MIN_WIDTH_OFFSET: 24, // px
  READOUT_PANEL_MIN_WIDTH_OFFSET: 24, // px

  /** Width of the play area to the left of the control column. */
  PLAY_AREA_WIDTH: 720,
  /** Field control decimal places (dimensionless). */
  FIELD_CONTROL_DECIMAL_PLACES: 2,
  /** Field control delta (dimensionless). */
  FIELD_CONTROL_DELTA: 0.05,
  CONTROL_PANEL_SPACING: 8,
  READOUT_PANEL_SPACING: 3,
  TIME_ROW_SPACING: 18,
} as const;

/** Settings for accelerate/view/AccelerateTrackNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const ACCELERATE_TRACK_NODE_SETTINGS = {
  FORMAT_SIGNIFICANT_DIGITS: 3, // digits

  LABEL_MAX_WIDTH_OFFSET: 10, // px
  LABEL_RIGHT_OFFSET: 10, // px
  READOUT_MAX_WIDTH_OFFSET: 14, // px
  READOUT_LEFT_OFFSET: 14, // px
  NEWTON_LINE_DASH_DASH: 4, // px
  CONSTRUCTOR_NEWTON_LINE_DASH_DASH: 3, // px
  CONSTRUCTOR_TOP_OFFSET: 6, // px

  LANE_HEIGHT: 34,
  LABEL_COLUMN: 90,
  READOUT_COLUMN: 150,
  MARKER_RADIUS: 9,
  TICK_SPACING_M: 2,
  LANE_LINE_WIDTH: 2,
  LIGHT_X: -12,
  LIGHT_Y: -3,
  LIGHT_WIDTH: 24,
  LIGHT_HEIGHT: 6,
  LIGHT_CORNER_RADIUS: 3,
  NEWTON_LINE_WIDTH: 2.5,
  CONSTRUCTOR_LINE_WIDTH: 2,
} as const;

/** Settings for collisions/model/CollisionsModel.ts. */
export const COLLISIONS_MODEL_SETTINGS = {
  /** Slow-motion rate relative to the normal clock (dimensionless). */
  SLOW_TIME_FACTOR: 0.3,
  /** Cm angle default (degrees). */
  CM_ANGLE_DEFAULT: 90,
  /** Cm angle range min (degrees). */
  CM_ANGLE_RANGE_MIN: -180,
  /** Cm angle range max (degrees). */
  CM_ANGLE_RANGE_MAX: 180,
  /** Frame beta default (dimensionless). */
  FRAME_BETA_DEFAULT: 0.5,
} as const;

/** Settings for collisions/view/CollisionPlayAreaNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const COLLISION_PLAY_AREA_NODE_SETTINGS = {
  FRAME_NAME_DIGITS: 2, // digits

  LIGHT_CIRCLE_LINE_DASH_DASH: 4, // px
  VIEWING_TEXT_MAX_WIDTH_OFFSET: 16, // px

  /** Pixels per unit of velocity for the arrows (an arrow of this length is a speed of c). */
  ARROW_SCALE: 55,
  /** Light circle opacity (dimensionless). */
  LIGHT_CIRCLE_OPACITY: 0.6,
  TRAILS_LINE_WIDTH: 2,
  MAKE_SPRITE_LINE_WIDTH: 1.5,
  MAKE_SPRITE_HEAD_WIDTH: 9,
  MAKE_SPRITE_HEAD_HEIGHT: 8,
  MAKE_SPRITE_TAIL_WIDTH: 3,
  VIEWING_TEXT_LEFT: 8,
  VIEWING_TEXT_TOP: 6,
} as const;

/** Settings for collisions/view/CollisionsScreenView.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const COLLISIONS_SCREEN_VIEW_SETTINGS = {
  SQRT_S_TEXT_DIGITS: 4, // digits
  OPENING_TEXT_DIGITS: 3, // digits
  COMPOSITE_TEXT_DIGITS: 4, // digits
  COMPOSITE_TEXT_DIGITS_SEGMENT_2: 3, // digits

  CONSTRUCTOR_LEFT_OFFSET: 42, // px
  CONSTRUCTOR_TOP_OFFSET: 22, // px
  CONSTRUCTOR_BODIES_PANEL_SPACING: 14, // px
  PRESET_PANEL_MIN_WIDTH_OFFSET: 24, // px
  COLLISION_PANEL_MIN_WIDTH_OFFSET: 24, // px
  FRAME_PANEL_MIN_WIDTH_OFFSET: 24, // px

  PLAY_WIDTH: 340,
  PLAY_HEIGHT: 245,
  DIAGRAM_SIZE: 150,
  /** Width of the narrow readout column under the play area. */
  READOUT_WIDTH: 215,
  /** Width of each body's mass control, so the two sit side by side under their pads. */
  MASS_CONTROL_WIDTH: 125,
  READOUTS_SPACING: 6,
  /** Mass control delta (dimensionless). */
  MASS_CONTROL_DELTA: 0.1,
  BODIES_PANEL_SPACING: 8,
  PRESET_PANEL_SPACING: 6,
  /** Angle control range min (in the source module’s documented units). */
  ANGLE_CONTROL_RANGE_MIN: -180,
  /** Angle control range max (in the source module’s documented units). */
  ANGLE_CONTROL_RANGE_MAX: 180,
  COLLISION_PANEL_SPACING: 8,
  /** Frame speed control decimal places (dimensionless). */
  FRAME_SPEED_CONTROL_DECIMAL_PLACES: 2,
  /** Frame speed control delta (dimensionless). */
  FRAME_SPEED_CONTROL_DELTA: 0.01,
  FRAME_PANEL_SPACING: 8,
  RIGHT_COLUMN_SPACING: 10,
  TIME_ROW_SPACING: 16,
} as const;

/** Settings for collisions/view/ConservationPanel.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const CONSERVATION_PANEL_SETTINGS = {
  FORMAT_SIGNIFICANT_DIGITS: 3, // digits
  ITEM_3_SPACING: 2, // px

  CONSTRUCTOR_LEFT_OFFSET: 14, // px
  CONSTRUCTOR_LEGEND_LEFT: 108, // px

  LABEL_WIDTH: 52,
  BAR_REGION: 100,
  BAR_HEIGHT: 7,
  VALUE_WIDTH: 70,
  /** Relative tolerance below which before and after count as equal. */
  TOLERANCE: 1e-7,
  BEFORE_BAR_Y: 4,
  AFTER_BAR_LINE_WIDTH: 1.5,
  LEGEND_WIDTH: 14,
  LEGEND_LEFT: 18,
  LEGEND_MAX_WIDTH: 60,
  LEGEND_X: 90,
  CONSTRUCTOR_SPACING: 6,
} as const;

/** Settings for collisions/view/MomentumDiagramNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const MOMENTUM_DIAGRAM_NODE_SETTINGS = {
  ARROW_OPTIONS_HEAD_WIDTH: 10,
  ARROW_OPTIONS_HEAD_HEIGHT: 9,
  ARROW_OPTIONS_TAIL_WIDTH: 3,
  TITLE_BOTTOM: -4,
  OUTLINE_LINE_WIDTH: 1.5,
  /** Total opacity (dimensionless). */
  TOTAL_OPACITY: 0.8,
  ORIGIN_RADIUS: 3,
} as const;

/** Settings for collisions/view/VelocityPadNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const VELOCITY_PAD_NODE_SETTINGS = {
  SPEED_DIGITS: 2, // digits

  MAX_CIRCLE_LINE_DASH_DASH: 3, // px
  C_LABEL_LEFT_FACTOR: 0.72, // dimensionless
  C_LABEL_BOTTOM_FACTOR: 0.72, // dimensionless
  TITLE_MAX_WIDTH_OFFSET: 20, // px
  TITLE_BOTTOM_OFFSET: 6, // px
  VALUE_TEXT_MAX_WIDTH_OFFSET: 30, // px
  VALUE_TEXT_TOP_OFFSET: 4, // px

  /** Radius of the c circle, px. */
  RADIUS: 52,
  /** Radius of the c circle, px. */
  HANDLE_RADIUS: 8,
  /** Keyboard step, as a fraction of c. */
  KEYBOARD_STEP: 0.05,
  LIGHT_CIRCLE_LINE_WIDTH: 2,
  SPOKE_LINE_WIDTH: 2,
} as const;

/** Settings for common/RelativisticDynamicsPanel.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const RELATIVISTIC_DYNAMICS_PANEL_SETTINGS = {
  OPTIONS_X_MARGIN: 12,
  OPTIONS_Y_MARGIN: 10,
} as const;

/** Settings for common/RelativisticDynamicsScreenIcons.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS = {
  CREATE_ACCELERATE_ICON_X_VARIANT_2: 450, // px
  CREATE_ACCELERATE_ICON_LINE_WIDTH_VARIANT_2: 9, // px
  CREATE_ACCELERATE_ICON_X_VARIANT_3: 290, // px
  CREATE_ENERGY_MOMENTUM_ICON_LINE_WIDTH_VARIANT_2: 10, // px
  CREATE_COLLISIONS_ICON_RADIUS_SEGMENT_2: 40, // px

  CREATE_ACCELERATE_ICON_LINE_DASH_DASH: 16, // px
  CREATE_ENERGY_MOMENTUM_ICON_LINE_DASH_DASH: 14, // px
  CREATE_ENERGY_MOMENTUM_ICON_X_FACTOR: 0.9, // dimensionless
  /** Momentum coordinate on the mass-shell icon (dimensionless; paired with rest mass = 1). */
  CREATE_ENERGY_MOMENTUM_ICON_Y: 0.9, // dimensionless
  CREATE_COLLISIONS_ICON_X_OFFSET: 120, // px
  CREATE_COLLISIONS_ICON_Y_OFFSET: 85, // px
  PRODUCTS_X_OFFSET: 120, // px
  /** Vertical pitch between threshold-product markers (px). */
  PRODUCTS_Y_PITCH: 62, // px
  CREATE_THRESHOLDS_ICON_X_OFFSET: 40, // px

  ARROW_HEAD_WIDTH: 40,
  ARROW_HEAD_HEIGHT: 34,
  ARROW_TAIL_WIDTH: 14,
  LANES_START_X: 50,
  LANES_END_X: 500,
  LANES_LINE_WIDTH: 6,
  CREATE_ACCELERATE_ICON_START_X: 500,
  CREATE_ACCELERATE_ICON_START_Y: 50,
  CREATE_ACCELERATE_ICON_END_X: 500,
  CREATE_ACCELERATE_ICON_END_Y: 320,
  CREATE_ACCELERATE_ICON_LINE_WIDTH: 6,
  CREATE_ACCELERATE_ICON_X: 330,
  CREATE_ACCELERATE_ICON_WIDTH: 80,
  CREATE_ACCELERATE_ICON_HEIGHT: 24,
  CREATE_ACCELERATE_ICON_CORNER_RADIUS: 12,
  CREATE_ACCELERATE_ICON_RADIUS: 34,
  TRIANGLE_LINE_WIDTH: 16,
  CREATE_ENERGY_MOMENTUM_ICON_LINE_WIDTH: 6,
  CREATE_ENERGY_MOMENTUM_ICON_RADIUS: 18,
  CREATE_COLLISIONS_ICON_START_X: 40,
  CREATE_COLLISIONS_ICON_LINE_WIDTH: 8,
  CREATE_COLLISIONS_ICON_RADIUS: 42,
  CREATE_COLLISIONS_ICON_X: 110,
  /** Create collisions icon opacity (dimensionless). */
  CREATE_COLLISIONS_ICON_OPACITY: 0.35,
  PRODUCTS_RADIUS: 24,
  CREATE_THRESHOLDS_ICON_RADIUS: 30,
  CREATE_THRESHOLDS_ICON_X: 70,
} as const;

/** Settings for common/view/ChartFrameNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const CHART_FRAME_NODE_SETTINGS = {
  PLACE_AXIS_LABELS_TOP_OFFSET: 20, // px

  RIGHT_RIGHT: -32,
} as const;

/** Settings for common/view/chartUtils.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const CHART_UTILS_SETTINGS = {
  DEFAULT_DIGITS: 3,
} as const;

/** Settings for common/view/controlHelpers.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const CONTROL_HELPERS_SETTINGS = {
  CREATE_NUMBER_CONTROL_Y_SPACING_VARIANT_2: 10, // px

  CREATE_NUMBER_CONTROL_MAX_WIDTH_OFFSET: 110, // px
  CREATE_CHECKBOX_MAX_WIDTH_OFFSET: 30, // px
  CREATE_PUSH_BUTTON_MAX_WIDTH_OFFSET: 24, // px
  CREATE_RADIO_BUTTON_GROUP_MAX_WIDTH_OFFSET: 40, // px
  LABEL_MAX_WIDTH_FACTOR: 0.62, // dimensionless
  VALUE_MAX_WIDTH_FACTOR: 0.38, // dimensionless

  /** Below this width the title gets its own row. */
  NARROW_CONTROL_WIDTH: 170,
  CREATE_NUMBER_CONTROL_Y_SPACING: 6,
  CREATE_NUMBER_CONTROL_HEIGHT: 4,
  CREATE_RADIO_BUTTON_GROUP_SPACING: 7,
} as const;

/** Settings for energy-momentum/model/EnergyMomentumModel.ts. */
export const ENERGY_MOMENTUM_MODEL_SETTINGS = {
  /** Scaled momentum default (dimensionless). */
  SCALED_MOMENTUM_DEFAULT: 2,
} as const;

/** Settings for energy-momentum/view/EnergyMomentumControls.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const ENERGY_MOMENTUM_CONTROLS_SETTINGS = {
  MOMENTUM_FORMAT_ENERGY_DIGITS: 4, // digits
  KINETIC_ENERGY_FORMAT_ENERGY_DIGITS: 4, // digits
  ENERGY_FORMAT_ENERGY_DIGITS: 4, // digits
  SLIDER_WIDTH_DIMENSION2_HEIGHT: 26, // px

  CONSTRUCTOR_MIN_WIDTH_OFFSET: 24, // px

  /** Keyboard step of the "Set" slider, as a fraction of its range. */
  SLIDER_STEP: 0.01,
  /** Custom mass control delta (dimensionless). */
  CUSTOM_MASS_CONTROL_DELTA: 10,
  PARTICLE_PANEL_SPACING: 8,
  SLIDER_HEIGHT: 4,
  SLIDER_WIDTH: 14,
  SET_PANEL_SPACING: 8,
  /** Observer control decimal places (dimensionless). */
  OBSERVER_CONTROL_DECIMAL_PLACES: 2,
  /** Observer control delta (dimensionless). */
  OBSERVER_CONTROL_DELTA: 0.01,
  OBSERVER_PANEL_SPACING: 8,
} as const;

/** Settings for energy-momentum/view/EnergyMomentumDiagramNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const ENERGY_MOMENTUM_DIAGRAM_NODE_SETTINGS = {
  LIGHT_LINE_LINE_DASH_DASH: 6, // px
  CONSTRUCTOR_LIGHT_LINE_LINE_DASH_DASH: 4, // px
  DROP_LINES_LINE_DASH_DASH: 3, // px
  PLACE_LINE_WIDTH: 3, // px
  SET_ZOOM_TOP_FACTOR: 0.55, // dimensionless
  SET_ZOOM_TOP_OFFSET: 6, // px
  SET_ZOOM_LEFT_OFFSET: 8, // px
  SET_ZOOM_BOTTOM_OFFSET: 4, // px

  /** Equal scales: the E range is half the pc range, so the height is half the width. */
  HYPERBOLA_SAMPLES: 120,
  /** Equal scales: the E range is half the pc range, so the height is half the width. */
  POINT_RADIUS: 6,
  TITLE_BOTTOM: -8,
  LIGHT_LINE_LINE_WIDTH: 2,
  LIGHT_LABEL_MAX_WIDTH: 80,
  MASS_SHELL_LINE_WIDTH: 2.5,
  MASS_SHELL_LABEL_MAX_WIDTH: 80,
  LAB_LABEL_MAX_WIDTH: 70,
  FRAME_LABEL_MAX_WIDTH: 80,
} as const;

/** Settings for energy-momentum/view/EnergyMomentumReadoutNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const ENERGY_MOMENTUM_READOUT_NODE_SETTINGS = {
  GAMMA_FORMAT_SIGNIFICANT_DIGITS: 4, // digits
  ROWS_DIGITS: 4, // digits
  KINETIC_ENERGY_FORMAT_ENERGY_DIGITS: 4, // digits
  ENERGY_FORMAT_ENERGY_DIGITS: 4, // digits
  MASS_FORMAT_ENERGY_DIGITS: 4, // digits

  LABEL_WIDTH: 150,
  VALUE_WIDTH: 105,
  GRID_X_SPACING: 14,
  GRID_Y_SPACING: 4,
} as const;

/** Settings for energy-momentum/view/EnergyMomentumScreenView.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const ENERGY_MOMENTUM_SCREEN_VIEW_SETTINGS = {
  CONSTRUCTOR_CENTER_X_OFFSET: 20, // px
  CONSTRUCTOR_TOP_OFFSET: 14, // px

  /** Left edge of the diagram's plotting area; its axis labels hang to the left of it. */
  DIAGRAM_LEFT: 305,
} as const;

/** Settings for energy-momentum/view/EnergyTriangleNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const ENERGY_TRIANGLE_NODE_SETTINGS = {
  MOMENTUM_LABEL_DIGITS: 3, // digits
  MASS_LABEL_DIGITS: 3, // digits
  ENERGY_FORMAT_ENERGY_DIGITS: 3, // digits

  TITLE_MAX_WIDTH_OFFSET: 20, // px
  BADGE_MAX_WIDTH_OFFSET: 20, // px
  CONSTRUCTOR_SPACING: 4, // px
  CONSTRUCTOR_LEFT_OFFSET: 6, // px

  /** Side of the square box the triangle is fitted into, px. */
  BOX: 170,
  /** Full length of the energy bar, px. */
  BAR_WIDTH: 210,
  /** Full length of the energy bar, px. */
  BAR_HEIGHT: 14,
  MOMENTUM_LEG_LINE_WIDTH: 4,
  MASS_LEG_LINE_WIDTH: 4,
  HYPOTENUSE_LINE_WIDTH: 4,
  LABEL_OPTIONS_MAX_WIDTH: 150,
  LEGEND_SPACING: 2,
  CHILDREN_SPACING: 10,
  LEFT_LEFT: 2,
} as const;

/** Settings for preferences/RelativisticDynamicsPreferencesNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const RELATIVISTIC_DYNAMICS_PREFERENCES_NODE_SETTINGS = {
  HEADER_FONT_SIZE: 18,
  SHOW_NEWTON_CHECKBOX_FONT_SIZE: 14,
  SHOW_NEWTON_CHECKBOX_SPACING: 8,
  CONSTRUCTOR_SPACING: 12,
} as const;

/** Settings for thresholds/model/ThresholdsModel.ts. */
export const THRESHOLDS_MODEL_SETTINGS = {
  /** Initial slider position: one and a half times threshold. */
  DEFAULT_FRACTION: 0.5,
  /** Beam range used when the threshold is zero or does not exist: this many beam rest energies (or MeV for a photon). */
  FALLBACK_RANGE_FACTOR: 10,
} as const;

/** Settings for thresholds/view/AvailableEnergyChartNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const AVAILABLE_ENERGY_CHART_NODE_SETTINGS = {
  THRESHOLD_LINE_LINE_DASH_DASH: 6, // px
  CONSTRUCTOR_THRESHOLD_LINE_LINE_DASH_DASH: 4, // px
  CONSTRUCTOR_RIGHT_OFFSET: 4, // px
  CONSTRUCTOR_BOTTOM_OFFSET: 3, // px
  CONSTRUCTOR_LEFT_FACTOR: 0.72, // dimensionless
  CONSTRUCTOR_LEFT_OFFSET: 8, // px
  CONSTRUCTOR_TOP: 4, // px
  CONSTRUCTOR_TOP_FACTOR: 0.72, // dimensionless
  CONSTRUCTOR_TOP_OFFSET: 4, // px
  CONSTRUCTOR_MAX_WIDTH_OFFSET: 40, // px

  WIDTH: 270,
  HEIGHT: 160,
  SAMPLES: 100,
  FIXED_CURVE_LINE_WIDTH: 2.5,
  COLLIDER_CURVE_LINE_WIDTH: 2.5,
  THRESHOLD_LINE_LINE_WIDTH: 1.5,
  MARKER_RADIUS: 5,
  LABEL_MAX_WIDTH: 90,
  LEFT_LEFT: 4,
  CHILDREN_SPACING: 6,
} as const;

/** Settings for thresholds/view/AvailableEnergyNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const AVAILABLE_ENERGY_NODE_SETTINGS = {
  FORMAT_DIGITS: 4, // digits
  VALUES_DIGITS: 4, // digits
  SQRT_S_LABEL_DIGITS: 4, // digits
  MARKER_LABEL_DIGITS: 4, // digits

  CONSTRUCTOR_TOP_OFFSET: 6, // px

  METER_WIDTH: 300,
  METER_HEIGHT: 18,
  READOUT_WIDTH: 300,
  MARKER_START_Y: -6,
  MARKER_LINE_WIDTH: 3,
  SQRT_S_LABEL_MAX_WIDTH: 150,
  MARKER_LABEL_MAX_WIDTH: 150,
  READOUTS_SPACING: 3,
  CHILDREN_SPACING: 14,
  LEFT_LEFT: 2,
  BOTTOM_BOTTOM: -8,
} as const;

/** Settings for thresholds/view/ReactionFrameNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const REACTION_FRAME_NODE_SETTINGS = {
  TITLE_MAX_WIDTH_OFFSET: 16, // px
  DIVIDER_LINE_DASH_DASH: 4, // px
  MESSAGE_MAX_WIDTH_OFFSET: 80, // px
  PLACE_RADIUS: 12, // px
  CONSTRUCTOR_PLACE_RADIUS: 5, // px

  REACTION_FRAME_WIDTH: 330,
  HEIGHT: 196,
  BEFORE_Y: 62,
  AFTER_Y: 150,
  /** Arrow length for a speed of c, px. */
  ARROW_LENGTH: 62,
  /** Distance of a product from the centre of its cluster, px. */
  CLUSTER_RADIUS: 26,
  /** The most product sprites any reaction needs. */
  MAX_PRODUCTS: 4,
  BACKGROUND_CORNER_X: 6,
  BACKGROUND_CORNER_Y: 6,
  TITLE_LEFT: 8,
  TITLE_TOP: 6,
  SECTION_LABEL_MAX_WIDTH: 60,
  SECTION_LABEL_LEFT: 8,
  DIVIDER_START_X: 8,
  MAKE_SPRITE_RADIUS: 8,
  MAKE_SPRITE_HEAD_WIDTH: 9,
  MAKE_SPRITE_HEAD_HEIGHT: 8,
  MAKE_SPRITE_TAIL_WIDTH: 3,
  MAKE_SPRITE_MAX_WIDTH: 40,
} as const;

/** Settings for thresholds/view/ThresholdsScreenView.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const THRESHOLDS_SCREEN_VIEW_SETTINGS = {
  BEAM_VALUE_PROPERTY_DIGITS: 4, // digits
  BEAM_SLIDER_WIDTH_DIMENSION2_HEIGHT: 26, // px

  TITLE_MAX_WIDTH_OFFSET: 16, // px
  CONSTRUCTOR_TOP_OFFSET: 10, // px
  CONSTRUCTOR_LEFT_OFFSET: 16, // px
  REACTION_PANEL_MIN_WIDTH_OFFSET: 24, // px
  CONFIGURATION_PANEL_MIN_WIDTH_OFFSET: 24, // px
  BEAM_PANEL_MIN_WIDTH_OFFSET: 24, // px

  REACTION_PANEL_SPACING: 8,
  CONFIGURATION_PANEL_SPACING: 8,
  BEAM_SLIDER_HEIGHT: 4,
  BEAM_SLIDER_WIDTH: 14,
  BEAM_PANEL_SPACING: 8,
  RIGHT_COLUMN_SPACING: 10,
} as const;

/** Numerical thresholds for the corresponding model. */
export const COLLISION_NUMERICS = {
  /** Speed below which an outgoing direction is undefined (units of c). */
  MIN_DIRECTION_SPEED: 1e-9,
} as const;

/** Numerical settings; units are specified per value. */
export const KINEMATIC_NUMERICS = {
  /** Speed margin below c used to avoid singular boosts (dimensionless). */
  BETA_MARGIN: 1e-8,
} as const;

/** Component dimensions in px; ratios and control steps are dimensionless; precision counts digits. */
export const THRESHOLDS_SCREEN_SUMMARY_CONTENT_SETTINGS = {
  VALUE_FORMAT_ENERGY_DIGITS: 3, // digits
  CURRENT_DETAILS_PROPERTY_DIGITS: 3, // digits
} as const;

/** Component dimensions in px; ratios and control steps are dimensionless; precision counts digits. */
export const ENERGY_MOMENTUM_SCREEN_SUMMARY_CONTENT_SETTINGS = {
  MOMENTUM_FORMAT_ENERGY_DIGITS: 3, // digits
  KINETIC_ENERGY_FORMAT_ENERGY_DIGITS: 3, // digits
  ENERGY_FORMAT_ENERGY_DIGITS: 3, // digits
  MASS_FORMAT_ENERGY_DIGITS: 3, // digits
  PX_FORMAT_ENERGY_DIGITS: 3, // digits
} as const;

/** Component dimensions in px; ratios and control steps are dimensionless; precision counts digits. */
export const COLLISIONS_SCREEN_SUMMARY_CONTENT_SETTINGS = {
  F_DIGITS: 3, // digits
} as const;

/** Component dimensions in px; ratios and control steps are dimensionless; precision counts digits. */
export const ACCELERATE_SCREEN_SUMMARY_CONTENT_SETTINGS = {
  CURRENT_DETAILS_PROPERTY_DIGITS: 3, // digits
  POSITION_FORMAT_SIGNIFICANT_DIGITS: 3, // digits
  KINETIC_ENERGY_FORMAT_ENERGY_DIGITS: 3, // digits
  NEWTONIAN_BETA_FORMAT_SIGNIFICANT_DIGITS: 3, // digits
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
});

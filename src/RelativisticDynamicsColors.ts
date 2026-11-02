/**
 * RelativisticDynamicsColors.ts
 *
 * Every colour in the simulation, as ProfileColorProperty with a "default"
 * (dark) and a "projector" (light) value. SceneryStack switches profiles
 * automatically.
 *
 * ── The sim's colour language ─────────────────────────────────────────────────
 * One idea, one hue, on every screen it appears:
 *
 *   cyan           relativity: the real particle, γmu, every relativistic curve
 *   orange         Newton: the ghost particle, mu, ½mu², every Newtonian curve
 *   yellow         light: photons, the light line E = pc, the speed c
 *   violet         invariants: the mass shell, √s, the CM frame
 *   green          rest energy mc² (and "kinematically allowed")
 *   blue           momentum pc
 *   pink           total energy E
 *   coral / teal   body 1 / body 2 in a collision (the beam / the target)
 *   red            "forbidden" and "below threshold"
 *
 * The cyan–orange pair is the sim's central contrast: wherever a Newtonian and a
 * relativistic quantity are shown together, those are their colours.
 */
import { ProfileColorProperty } from "scenerystack/scenery";
import RelativisticDynamicsNamespace from "./RelativisticDynamicsNamespace.js";

const RelativisticDynamicsColors = {
  /** Screen background: deep navy in default mode, white in projector mode. */
  backgroundColorProperty: new ProfileColorProperty(RelativisticDynamicsNamespace, "background", {
    default: "#1a1a2e",
    projector: "#ffffff",
  }),

  /** Accent for highlights, selected radio buttons and slider thumbs. */
  accentColorProperty: new ProfileColorProperty(RelativisticDynamicsNamespace, "accent", {
    default: "#4fc3f7",
    projector: "#1a1a2e",
  }),

  /** Background fill for control panels and dialogs. */
  panelBackgroundColorProperty: new ProfileColorProperty(RelativisticDynamicsNamespace, "panelBackground", {
    default: "#16213e",
    projector: "#f5f5f5",
  }),

  /** Border/stroke colour for control panels and dialogs. */
  panelBorderColorProperty: new ProfileColorProperty(RelativisticDynamicsNamespace, "panelBorder", {
    default: "#0f3460",
    projector: "#999999",
  }),

  /** Labels, readouts, general UI text. */
  textColorProperty: new ProfileColorProperty(RelativisticDynamicsNamespace, "text", {
    default: "#e0e0e0",
    projector: "#1a1a1a",
  }),

  /** Quieter text: readout labels, sub-headers, captions. */
  secondaryTextColorProperty: new ProfileColorProperty(RelativisticDynamicsNamespace, "secondaryText", {
    default: "#9aa5c4",
    projector: "#5a5a5a",
  }),

  // ── Charts and diagrams ───────────────────────────────────────────────────────

  /** Fill inside a chart's plotting rectangle. */
  chartBackgroundColorProperty: new ProfileColorProperty(RelativisticDynamicsNamespace, "chartBackground", {
    default: "#10182c",
    projector: "#fafafa",
  }),

  /** Axes, chart border, tick marks. */
  chartAxisColorProperty: new ProfileColorProperty(RelativisticDynamicsNamespace, "chartAxis", {
    default: "#c5cbe0",
    projector: "#37474f",
  }),

  /** Gridlines: present, never competing with the physics. */
  chartGridColorProperty: new ProfileColorProperty(RelativisticDynamicsNamespace, "chartGrid", {
    default: "#2c3a5c",
    projector: "#dcdcdc",
  }),

  // ── Relativity (cyan) and Newton (orange) ─────────────────────────────────────

  relativisticColorProperty: new ProfileColorProperty(RelativisticDynamicsNamespace, "relativistic", {
    default: "#4dd0e1",
    projector: "#00838f",
  }),

  newtonianColorProperty: new ProfileColorProperty(RelativisticDynamicsNamespace, "newtonian", {
    default: "#ffb74d",
    projector: "#e65100",
  }),

  // ── Light (yellow) ────────────────────────────────────────────────────────────

  /** Photons, the light line, the speed-of-light limit line. */
  lightColorProperty: new ProfileColorProperty(RelativisticDynamicsNamespace, "light", {
    default: "#ffee58",
    projector: "#f9a825",
  }),

  // ── Invariants (violet) ───────────────────────────────────────────────────────

  /** Mass-shell hyperbolas, √s, the centre-of-momentum marker. */
  invariantColorProperty: new ProfileColorProperty(RelativisticDynamicsNamespace, "invariant", {
    default: "#b39ddb",
    projector: "#5e35b1",
  }),

  // ── The energy–momentum triangle ──────────────────────────────────────────────

  restEnergyColorProperty: new ProfileColorProperty(RelativisticDynamicsNamespace, "restEnergy", {
    default: "#81c784",
    projector: "#2e7d32",
  }),

  momentumColorProperty: new ProfileColorProperty(RelativisticDynamicsNamespace, "momentum", {
    default: "#64b5f6",
    projector: "#1565c0",
  }),

  totalEnergyColorProperty: new ProfileColorProperty(RelativisticDynamicsNamespace, "totalEnergy", {
    default: "#f48fb1",
    projector: "#ad1457",
  }),

  kineticEnergyColorProperty: new ProfileColorProperty(RelativisticDynamicsNamespace, "kineticEnergy", {
    default: "#4dd0e1",
    projector: "#00838f",
  }),

  // ── Collisions ────────────────────────────────────────────────────────────────

  body1ColorProperty: new ProfileColorProperty(RelativisticDynamicsNamespace, "body1", {
    default: "#ff8a65",
    projector: "#d84315",
  }),

  body2ColorProperty: new ProfileColorProperty(RelativisticDynamicsNamespace, "body2", {
    default: "#4db6ac",
    projector: "#00695c",
  }),

  /** The composite body after a perfectly inelastic collision, and the products of a reaction. */
  compositeColorProperty: new ProfileColorProperty(RelativisticDynamicsNamespace, "composite", {
    default: "#ce93d8",
    projector: "#7b1fa2",
  }),

  /** Track lines left behind by moving bodies. */
  trailColorProperty: new ProfileColorProperty(RelativisticDynamicsNamespace, "trail", {
    default: "rgba(197,203,224,0.35)",
    projector: "rgba(55,71,79,0.35)",
  }),

  // ── Verdicts ──────────────────────────────────────────────────────────────────

  allowedColorProperty: new ProfileColorProperty(RelativisticDynamicsNamespace, "allowed", {
    default: "#81c784",
    projector: "#2e7d32",
  }),

  forbiddenColorProperty: new ProfileColorProperty(RelativisticDynamicsNamespace, "forbidden", {
    default: "#ef5350",
    projector: "#c62828",
  }),

  // ── Light control surfaces ───────────────────────────────────────────────────
  // White chrome (combo boxes, flat push buttons, editable input fields) stays light
  // in both profiles; its text stays dark.

  /** Fill of light control surfaces: combo-box button/list, editable input fields. */
  controlSurfaceColorProperty: new ProfileColorProperty(RelativisticDynamicsNamespace, "controlSurface", {
    default: "#ffffff",
    projector: "#ffffff",
  }),

  /** Fill of a disabled control surface (grayed-out editable input field). */
  controlSurfaceDisabledColorProperty: new ProfileColorProperty(
    RelativisticDynamicsNamespace,
    "controlSurfaceDisabled",
    {
      default: "#cccccc",
      projector: "#cccccc",
    },
  ),

  /** Text on light control surfaces: combo items, flat-button labels, field values, preferences. */
  controlSurfaceTextColorProperty: new ProfileColorProperty(RelativisticDynamicsNamespace, "controlSurfaceText", {
    default: "#1a1a1a",
    projector: "#1a1a1a",
  }),
};

export default RelativisticDynamicsColors;

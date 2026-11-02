/**
 * EnergyMomentumModel.ts
 *
 * State for the Energy–Momentum screen: which particle, how fast it is moving,
 * and how fast an observer is moving past it.
 *
 * ── The canonical state ──────────────────────────────────────────────────────
 * The particle's motion is stored as one dimensionless number, the momentum in
 * units of a *scale* energy: x = pc / S, where S = mc² for a massive particle and
 * S = 1 MeV for a photon. In those units the mass shell is the same curve,
 * E/S = √(x² + 1), for every massive particle, so switching from an electron to a
 * proton keeps γ and β fixed and only rescales the MeV readouts. All four
 * "Set" sliders (β, p, K, E) are views onto x.
 *
 * The observer's motion is a frame velocity along the particle's direction of
 * motion; the moving-frame four-momentum is the lab one boosted by it.
 */

import { DerivedProperty, NumberProperty, StringUnionProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import { FourMomentum, type ParticleState, particleStateFromMomentum } from "../../common/model/kinematics.js";
import { ENERGY_MOMENTUM, MASS_MEV } from "../../RelativisticDynamicsConstants.js";

export const ParticleChoiceValues = ["electron", "muon", "pion", "proton", "photon", "custom"] as const;
export type ParticleChoice = (typeof ParticleChoiceValues)[number];

export const DrivingQuantityValues = ["speed", "momentum", "kineticEnergy", "totalEnergy"] as const;
export type DrivingQuantity = (typeof DrivingQuantityValues)[number];

const PRESET_MASS: Readonly<Record<Exclude<ParticleChoice, "custom">, number>> = {
  electron: MASS_MEV.ELECTRON,
  muon: MASS_MEV.MUON,
  pion: MASS_MEV.PION_CHARGED,
  proton: MASS_MEV.PROTON,
  photon: 0,
};

const { MAX_SCALED_MOMENTUM, PHOTON_SCALE_MEV, MAX_FRAME_BETA } = ENERGY_MOMENTUM;

/** Speed corresponding to {@link MAX_SCALED_MOMENTUM} for a massive particle. */
const MAX_BETA = MAX_SCALED_MOMENTUM / Math.hypot(MAX_SCALED_MOMENTUM, 1);

export class EnergyMomentumModel implements TModel {
  public readonly particleProperty: StringUnionProperty<ParticleChoice>;

  /** Rest energy of the "custom" particle, MeV. */
  public readonly customMassProperty: NumberProperty;

  /** Rest energy of the selected particle, MeV. */
  public readonly massProperty: TReadOnlyProperty<number>;

  /** Whether the selected particle is massless (a photon, or a custom particle of zero mass). */
  public readonly isMasslessProperty: TReadOnlyProperty<boolean>;

  /** S: mc² for a massive particle, 1 MeV for a massless one. */
  public readonly scaleProperty: TReadOnlyProperty<number>;

  /** x = pc / S, the canonical state. */
  public readonly scaledMomentumProperty: NumberProperty;

  /** Which quantity the "Set" slider controls. */
  public readonly drivingQuantityProperty: StringUnionProperty<DrivingQuantity>;

  /** Velocity of the moving observer along +x, as a fraction of c. */
  public readonly frameBetaProperty: NumberProperty;

  /** Lab-frame four-momentum, MeV. */
  public readonly labMomentumProperty: TReadOnlyProperty<FourMomentum>;

  /** The same four-momentum measured by the moving observer. */
  public readonly frameMomentumProperty: TReadOnlyProperty<FourMomentum>;

  /** Every scalar quantity in the lab. */
  public readonly labStateProperty: TReadOnlyProperty<ParticleState>;

  /** Every scalar quantity for the moving observer (momentum magnitude; see frameMomentumProperty for its sign). */
  public readonly frameStateProperty: TReadOnlyProperty<ParticleState>;

  public constructor() {
    this.particleProperty = new StringUnionProperty<ParticleChoice>("electron", {
      validValues: ParticleChoiceValues,
    });
    this.customMassProperty = new NumberProperty(ENERGY_MOMENTUM.CUSTOM_MASS_DEFAULT_MEV, {
      range: new Range(ENERGY_MOMENTUM.CUSTOM_MASS_MIN_MEV, ENERGY_MOMENTUM.CUSTOM_MASS_MAX_MEV),
    });
    this.massProperty = new DerivedProperty([this.particleProperty, this.customMassProperty], (particle, customMass) =>
      particle === "custom" ? customMass : PRESET_MASS[particle],
    );
    this.isMasslessProperty = new DerivedProperty([this.massProperty], (mass) => mass === 0);
    this.scaleProperty = new DerivedProperty([this.massProperty], (mass) => (mass > 0 ? mass : PHOTON_SCALE_MEV));

    this.scaledMomentumProperty = new NumberProperty(2, { range: new Range(0, MAX_SCALED_MOMENTUM) });
    this.drivingQuantityProperty = new StringUnionProperty<DrivingQuantity>("momentum", {
      validValues: DrivingQuantityValues,
    });
    this.frameBetaProperty = new NumberProperty(0, { range: new Range(-MAX_FRAME_BETA, MAX_FRAME_BETA) });

    this.labMomentumProperty = new DerivedProperty(
      [this.massProperty, this.scaleProperty, this.scaledMomentumProperty],
      (mass, scale, x) => FourMomentum.fromMassAndMomentum(mass, x * scale, 0),
    );
    this.frameMomentumProperty = new DerivedProperty([this.labMomentumProperty, this.frameBetaProperty], (p, beta) =>
      p.boosted(beta, 0),
    );
    this.labStateProperty = new DerivedProperty([this.massProperty, this.labMomentumProperty], (mass, p) =>
      particleStateFromMomentum(mass, p.px),
    );
    this.frameStateProperty = new DerivedProperty([this.massProperty, this.frameMomentumProperty], (mass, p) =>
      particleStateFromMomentum(mass, p.px),
    );

    // A massless particle has no adjustable speed: fall back to setting its energy.
    this.isMasslessProperty.link((massless) => {
      if (massless && this.drivingQuantityProperty.value === "speed") {
        this.drivingQuantityProperty.value = "totalEnergy";
      }
    });
  }

  /**
   * The driving quantity as a fraction u ∈ [0, 1] of its slider range. The map is
   * linear in the quantity itself, so dragging β towards 1 makes p and E run away,
   * which is the chapter's point.
   */
  public static sliderFractionOf(quantity: DrivingQuantity, x: number, massless: boolean): number {
    if (massless) {
      return x / MAX_SCALED_MOMENTUM;
    }
    switch (quantity) {
      case "speed":
        return x / Math.hypot(x, 1) / MAX_BETA;
      case "momentum":
        return x / MAX_SCALED_MOMENTUM;
      case "kineticEnergy":
      case "totalEnergy":
        return (Math.hypot(x, 1) - 1) / (Math.hypot(MAX_SCALED_MOMENTUM, 1) - 1);
    }
  }

  /** Inverse of {@link sliderFractionOf}: the scaled momentum x for a slider fraction u. */
  public static scaledMomentumOf(quantity: DrivingQuantity, u: number, massless: boolean): number {
    const f = Math.max(0, Math.min(1, u));
    if (massless) {
      return f * MAX_SCALED_MOMENTUM;
    }
    switch (quantity) {
      case "speed": {
        const beta = f * MAX_BETA;
        return beta / Math.sqrt(1 - beta * beta);
      }
      case "momentum":
        return f * MAX_SCALED_MOMENTUM;
      case "kineticEnergy":
      case "totalEnergy": {
        const e = 1 + f * (Math.hypot(MAX_SCALED_MOMENTUM, 1) - 1);
        return Math.sqrt(Math.max(0, e * e - 1));
      }
    }
  }

  public reset(): void {
    this.particleProperty.reset();
    this.customMassProperty.reset();
    this.scaledMomentumProperty.reset();
    this.drivingQuantityProperty.reset();
    this.frameBetaProperty.reset();
  }

  public step(_dt: number): void {
    // Nothing evolves in time on this screen.
  }
}

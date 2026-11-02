/**
 * ThresholdsModel.ts
 *
 * State for the Thresholds screen: which reaction, fixed target or collider, and
 * how much kinetic energy the beam carries.
 *
 * The beam energy is stored as a fraction u ∈ [0, 1] of a range that depends on
 * the reaction and configuration (three times the threshold), so switching
 * reactions keeps the slider's *meaning* ("one and a half times threshold")
 * while the MeV value changes by orders of magnitude, from 1 MeV for pair
 * production to 17 GeV for antiprotons.
 */

import { DerivedProperty, NumberProperty, StringUnionProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { Range, type Vector2 } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import type { FourMomentum } from "../../common/model/kinematics.js";
import { THRESHOLDS } from "../../RelativisticDynamicsConstants.js";
import {
  availableEnergy,
  BeamConfiguration,
  finalMass,
  initialState,
  isForbidden,
  labFinalState,
  REACTIONS,
  type Reaction,
  type ReactionId,
  reactionById,
  symmetricFinalState,
  thresholdKineticEnergy,
  Verdict,
  verdictFor,
} from "./reactions.js";

export const ReactionIdValues = REACTIONS.map((r) => r.id);
export const BeamConfigurationValues = [BeamConfiguration.FIXED_TARGET, BeamConfiguration.COLLIDER] as const;

/** Initial slider position: one and a half times threshold. */
const DEFAULT_FRACTION = 0.5;

/** Beam range used when the threshold is zero or does not exist: this many beam rest energies (or MeV for a photon). */
const FALLBACK_RANGE_FACTOR = 10;

export class ThresholdsModel implements TModel {
  public readonly reactionIdProperty: StringUnionProperty<ReactionId>;
  public readonly configurationProperty: StringUnionProperty<BeamConfiguration>;

  /** Beam kinetic energy as a fraction of {@link beamRangeProperty}. */
  public readonly energyFractionProperty: NumberProperty;

  public readonly reactionProperty: TReadOnlyProperty<Reaction>;

  /** Whether a collider version of the current reaction is offered. */
  public readonly colliderAvailableProperty: TReadOnlyProperty<boolean>;

  /** Threshold kinetic energy of the beam (per beam in a collider), MeV; ∞ if forbidden. */
  public readonly thresholdProperty: TReadOnlyProperty<number>;

  /** Top of the beam slider, MeV. */
  public readonly beamRangeProperty: TReadOnlyProperty<number>;

  /** Beam kinetic energy (per beam in a collider), MeV. */
  public readonly beamKineticEnergyProperty: TReadOnlyProperty<number>;

  /** The two incoming four-momenta in the lab. */
  public readonly initialStateProperty: TReadOnlyProperty<[FourMomentum, FourMomentum]>;

  /** √s, MeV. */
  public readonly sqrtSProperty: TReadOnlyProperty<number>;

  /** Σm_f, MeV. */
  public readonly finalMassProperty: TReadOnlyProperty<number>;

  public readonly verdictProperty: TReadOnlyProperty<Verdict>;

  /** Velocity of the CM frame in the lab. */
  public readonly cmVelocityProperty: TReadOnlyProperty<Vector2>;

  /** Product four-momenta (empty unless the reaction proceeds), in the lab and in the CM frame. */
  public readonly labProductsProperty: TReadOnlyProperty<FourMomentum[]>;
  public readonly cmProductsProperty: TReadOnlyProperty<FourMomentum[]>;

  public constructor() {
    this.reactionIdProperty = new StringUnionProperty<ReactionId>("antiproton", { validValues: ReactionIdValues });
    this.configurationProperty = new StringUnionProperty<BeamConfiguration>(BeamConfiguration.FIXED_TARGET, {
      validValues: BeamConfigurationValues,
    });
    this.energyFractionProperty = new NumberProperty(DEFAULT_FRACTION, { range: new Range(0, 1) });

    this.reactionProperty = new DerivedProperty([this.reactionIdProperty], (id) => reactionById(id));
    this.colliderAvailableProperty = new DerivedProperty([this.reactionProperty], (r) => r.colliderAvailable);

    // A reaction with no collider version forces the fixed-target configuration.
    this.reactionProperty.link((r) => {
      if (!r.colliderAvailable) {
        this.configurationProperty.value = BeamConfiguration.FIXED_TARGET;
      }
    });

    this.thresholdProperty = new DerivedProperty([this.reactionProperty, this.configurationProperty], (r, c) =>
      thresholdKineticEnergy(r, c),
    );
    this.beamRangeProperty = new DerivedProperty([this.reactionProperty, this.thresholdProperty], (r, threshold) =>
      Number.isFinite(threshold) && threshold > 0
        ? THRESHOLDS.BEAM_RANGE_OVER_THRESHOLD * threshold
        : FALLBACK_RANGE_FACTOR * (r.beam.mass > 0 ? r.beam.mass : 1),
    );
    this.beamKineticEnergyProperty = new DerivedProperty(
      [this.energyFractionProperty, this.beamRangeProperty],
      (u, range) => u * range,
    );
    this.initialStateProperty = new DerivedProperty(
      [this.reactionProperty, this.configurationProperty, this.beamKineticEnergyProperty],
      (r, c, k) => initialState(r, c, k),
    );
    this.sqrtSProperty = new DerivedProperty(
      [this.reactionProperty, this.configurationProperty, this.beamKineticEnergyProperty],
      (r, c, k) => availableEnergy(r, c, k),
    );
    this.finalMassProperty = new DerivedProperty([this.reactionProperty], (r) => finalMass(r));
    this.verdictProperty = new DerivedProperty([this.reactionProperty, this.sqrtSProperty], (r, sqrtS) =>
      verdictFor(r, sqrtS),
    );
    this.cmVelocityProperty = new DerivedProperty([this.initialStateProperty], ([p1, p2]) => p1.plus(p2).velocity);
    this.labProductsProperty = new DerivedProperty(
      [this.reactionProperty, this.configurationProperty, this.beamKineticEnergyProperty, this.verdictProperty],
      (r, c, k, verdict) => (verdict === Verdict.ALLOWED ? labFinalState(r, c, k) : []),
    );
    this.cmProductsProperty = new DerivedProperty(
      [this.reactionProperty, this.sqrtSProperty, this.verdictProperty],
      (r, sqrtS, verdict) =>
        verdict === Verdict.ALLOWED && !isForbidden(r)
          ? symmetricFinalState(
              r.products.map((p) => p.mass),
              sqrtS,
              Math.PI / 2,
            )
          : [],
    );
  }

  /** Sets the beam exactly to threshold (where one exists). */
  public goToThreshold(): void {
    const threshold = this.thresholdProperty.value;
    const range = this.beamRangeProperty.value;
    if (Number.isFinite(threshold) && range > 0) {
      this.energyFractionProperty.value = Math.min(1, threshold / range);
    }
  }

  public reset(): void {
    this.reactionIdProperty.reset();
    this.configurationProperty.reset();
    this.energyFractionProperty.reset();
  }

  public step(_dt: number): void {
    // Nothing evolves in time on this screen.
  }
}

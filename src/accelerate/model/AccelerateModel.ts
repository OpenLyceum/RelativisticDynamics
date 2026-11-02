/**
 * AccelerateModel.ts
 *
 * State for the Accelerate screen: an electron or proton released from rest on a
 * 20 m track in a uniform accelerating field, raced by its Newtonian "ghost" and
 * by a light pulse fired at the same instant.
 *
 * Time is stored in nanoseconds. Playback speed adapts to the run, so every run
 * (a 70 ns electron or a 700 ns proton) takes the same few seconds of wall-clock
 * time and ends when the real particle reaches the end of the track.
 */

import {
  BooleanProperty,
  DerivedProperty,
  EnumerationProperty,
  NumberProperty,
  StringUnionProperty,
  type TReadOnlyProperty,
} from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import { TimeSpeed } from "scenerystack/scenery-phet";
import { ACCELERATE, MASS_MEV } from "../../RelativisticDynamicsConstants.js";
import {
  type AccelerationSnapshot,
  accelerationSnapshot,
  metresToNanoseconds,
  nanosecondsToMetres,
  relativisticTimeToTravel,
  timeToReachKineticEnergy,
} from "./acceleration.js";

export const AccelerateParticleValues = ["electron", "proton"] as const;
export type AccelerateParticle = (typeof AccelerateParticleValues)[number];

export const ChartQuantityValues = ["speed", "momentum"] as const;
export type ChartQuantity = (typeof ChartQuantityValues)[number];

const MASSES: Readonly<Record<AccelerateParticle, number>> = {
  electron: MASS_MEV.ELECTRON,
  proton: MASS_MEV.PROTON,
};

export class AccelerateModel implements TModel {
  public readonly particleProperty: StringUnionProperty<AccelerateParticle>;

  /** Accelerating field, MV/m; for unit charge this is the force in MeV/m. */
  public readonly fieldProperty: NumberProperty;

  /** Elapsed time since release, ns. */
  public readonly timeProperty: NumberProperty;

  public readonly isPlayingProperty: BooleanProperty;
  public readonly timeSpeedProperty: EnumerationProperty<TimeSpeed>;

  /** Which quantity the left chart plots against time. */
  public readonly chartQuantityProperty: StringUnionProperty<ChartQuantity>;

  /** Whether Bertozzi's 1964 data are drawn on the β²-against-K chart. */
  public readonly showBertozziProperty: BooleanProperty;

  /** Rest energy of the chosen particle, MeV. */
  public readonly massProperty: TReadOnlyProperty<number>;

  /** Time at which the real particle reaches the end of the track, ns. */
  public readonly runDurationProperty: TReadOnlyProperty<number>;

  /** Kinetic energy at the end of the track, F·L, MeV. */
  public readonly finalKineticEnergyProperty: TReadOnlyProperty<number>;

  /** Both particles and the light pulse at the current time. */
  public readonly snapshotProperty: TReadOnlyProperty<AccelerationSnapshot>;

  public constructor() {
    this.particleProperty = new StringUnionProperty<AccelerateParticle>("electron", {
      validValues: AccelerateParticleValues,
    });
    this.fieldProperty = new NumberProperty(ACCELERATE.FIELD_DEFAULT_MV_PER_M, {
      range: new Range(ACCELERATE.FIELD_MIN_MV_PER_M, ACCELERATE.FIELD_MAX_MV_PER_M),
    });
    this.timeProperty = new NumberProperty(0);
    this.isPlayingProperty = new BooleanProperty(false);
    this.timeSpeedProperty = new EnumerationProperty(TimeSpeed.NORMAL, {
      validValues: [TimeSpeed.NORMAL, TimeSpeed.SLOW],
    });
    this.chartQuantityProperty = new StringUnionProperty<ChartQuantity>("speed", { validValues: ChartQuantityValues });
    this.showBertozziProperty = new BooleanProperty(true);

    this.massProperty = new DerivedProperty([this.particleProperty], (particle) => MASSES[particle]);
    this.runDurationProperty = new DerivedProperty([this.massProperty, this.fieldProperty], (mass, field) =>
      metresToNanoseconds(relativisticTimeToTravel(mass, field, ACCELERATE.TRACK_LENGTH_M)),
    );
    this.finalKineticEnergyProperty = new DerivedProperty(
      [this.fieldProperty],
      (field) => field * ACCELERATE.TRACK_LENGTH_M,
    );
    this.snapshotProperty = new DerivedProperty(
      [this.massProperty, this.fieldProperty, this.timeProperty],
      (mass, field, time) => accelerationSnapshot(mass, field, nanosecondsToMetres(time)),
    );

    // Pressing play on a finished run starts it again.
    this.isPlayingProperty.lazyLink((playing) => {
      if (playing && this.timeProperty.value >= this.runDurationProperty.value) {
        this.timeProperty.value = 0;
      }
    });

    // A new particle or field is a new run: start it from rest.
    this.particleProperty.lazyLink(() => this.restart());
    this.fieldProperty.lazyLink(() => this.restart());
  }

  /** Back to the start line, paused. */
  public restart(): void {
    this.isPlayingProperty.value = false;
    this.timeProperty.value = 0;
  }

  /**
   * The chapter's worked example: an electron accelerated through 2.00 MV. Jumps
   * to the instant its kinetic energy reaches 2.00 MeV and pauses there.
   */
  public showWorkedExample(): void {
    this.particleProperty.value = "electron";
    const ct = timeToReachKineticEnergy(
      this.massProperty.value,
      this.fieldProperty.value,
      ACCELERATE.WORKED_EXAMPLE_KINETIC_ENERGY_MEV,
    );
    // The field may be too weak to reach 2 MeV on the track; the end of the run is then the closest we can get.
    this.timeProperty.value = Math.min(metresToNanoseconds(ct), this.runDurationProperty.value);
    this.isPlayingProperty.value = false;
  }

  /** Advances the clock by one wall-clock dt, scaled so a whole run lasts RUN_DURATION_S. */
  public stepTime(dt: number): void {
    const end = this.runDurationProperty.value;
    const rate = end / ACCELERATE.RUN_DURATION_S;
    const factor = this.timeSpeedProperty.value === TimeSpeed.SLOW ? ACCELERATE.SLOW_FACTOR : 1;
    const next = this.timeProperty.value + dt * rate * factor;
    if (next >= end) {
      this.timeProperty.value = end;
      this.isPlayingProperty.value = false;
    } else {
      this.timeProperty.value = next;
    }
  }

  public reset(): void {
    this.particleProperty.reset();
    this.fieldProperty.reset();
    this.timeSpeedProperty.reset();
    this.chartQuantityProperty.reset();
    this.showBertozziProperty.reset();
    this.restart();
  }

  public step(dt: number): void {
    if (this.isPlayingProperty.value) {
      this.stepTime(dt);
    }
  }
}

/**
 * CollisionsModel.ts
 *
 * State for the Collisions screen: two bodies (mass and lab velocity each), the
 * kind of collision, the frame the student views it from, and an animation clock
 * running from before the collision to after it.
 *
 * Everything shown is derived: the lab-frame solution from the inputs, then the
 * same collision viewed from the selected frame. The clock is the *viewing
 * frame's* time, so changing frame mid-run keeps the collision at the centre of
 * the run.
 */

import {
  BooleanProperty,
  DerivedProperty,
  EnumerationProperty,
  NumberProperty,
  StringUnionProperty,
  type TReadOnlyProperty,
} from "scenerystack/axon";
import { Range, Vector2, Vector2Property } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import { TimeSpeed } from "scenerystack/scenery-phet";
import { gammaOfBeta } from "../../common/model/kinematics.js";
import { COLLISIONS } from "../../RelativisticDynamicsConstants.js";
import {
  type CollisionMode,
  type CollisionState,
  centerOfMomentumVelocity,
  invariantMass,
  solveCollision,
  type Totals,
  totalsOf,
  transverseReversalAngle,
  viewFromFrame,
} from "./collisionGeometry.js";

export const FrameChoiceValues = ["lab", "centerOfMomentum", "moving"] as const;
export type FrameChoice = (typeof FrameChoiceValues)[number];

export const CollisionModeValues = ["elastic", "inelastic"] as const satisfies readonly CollisionMode[];

const T = COLLISIONS.RUN_HALF_DURATION;

export class CollisionsModel implements TModel {
  public readonly mass1Property: NumberProperty;
  public readonly mass2Property: NumberProperty;

  /** Lab-frame velocities, as fractions of c; magnitude kept below COLLISIONS.MAX_SPEED. */
  public readonly velocity1Property: Vector2Property;
  public readonly velocity2Property: Vector2Property;

  public readonly modeProperty: StringUnionProperty<CollisionMode>;

  /** Scattering angle in the centre-of-momentum frame, degrees (elastic only). */
  public readonly cmAngleProperty: NumberProperty;

  public readonly frameProperty: StringUnionProperty<FrameChoice>;

  /** Velocity of the "moving" frame along +x, fraction of c. */
  public readonly frameBetaProperty: NumberProperty;

  /** Whether Newton's Σmu is shown beside the relativistic totals. */
  public readonly showNewtonProperty: BooleanProperty;

  /** Viewing-frame time, model seconds; the collision is at t = 0. */
  public readonly timeProperty: NumberProperty;
  public readonly isPlayingProperty: BooleanProperty;
  public readonly timeSpeedProperty: EnumerationProperty<TimeSpeed>;

  /** The collision solved in the lab frame. */
  public readonly labStateProperty: TReadOnlyProperty<CollisionState>;

  /** Velocity of the viewing frame relative to the lab. */
  public readonly frameVelocityProperty: TReadOnlyProperty<Vector2>;

  /** The collision as seen from the viewing frame. */
  public readonly viewStateProperty: TReadOnlyProperty<CollisionState>;

  /** Totals before and after, in the viewing frame. */
  public readonly totalsBeforeProperty: TReadOnlyProperty<Totals>;
  public readonly totalsAfterProperty: TReadOnlyProperty<Totals>;

  /** √s, the same in every frame. */
  public readonly invariantMassProperty: TReadOnlyProperty<number>;

  public constructor() {
    const massRange = new Range(COLLISIONS.MASS_MIN, COLLISIONS.MASS_MAX);
    this.mass1Property = new NumberProperty(COLLISIONS.MASS_DEFAULT, { range: massRange });
    this.mass2Property = new NumberProperty(COLLISIONS.MASS_DEFAULT, { range: massRange });
    this.velocity1Property = new Vector2Property(new Vector2(0.8, 0));
    this.velocity2Property = new Vector2Property(Vector2.ZERO);
    this.modeProperty = new StringUnionProperty<CollisionMode>("elastic", { validValues: CollisionModeValues });
    this.cmAngleProperty = new NumberProperty(90, { range: new Range(-180, 180) });
    this.frameProperty = new StringUnionProperty<FrameChoice>("lab", { validValues: FrameChoiceValues });
    this.frameBetaProperty = new NumberProperty(0.5, {
      range: new Range(-COLLISIONS.MAX_FRAME_BETA, COLLISIONS.MAX_FRAME_BETA),
    });
    this.showNewtonProperty = new BooleanProperty(false);
    this.timeProperty = new NumberProperty(-T, { range: new Range(-T, T) });
    this.isPlayingProperty = new BooleanProperty(false);
    this.timeSpeedProperty = new EnumerationProperty(TimeSpeed.NORMAL, {
      validValues: [TimeSpeed.NORMAL, TimeSpeed.SLOW],
    });

    this.labStateProperty = new DerivedProperty(
      [
        this.mass1Property,
        this.mass2Property,
        this.velocity1Property,
        this.velocity2Property,
        this.modeProperty,
        this.cmAngleProperty,
      ],
      (m1, m2, u1, u2, mode, angle) =>
        solveCollision({ mass: m1, velocity: u1 }, { mass: m2, velocity: u2 }, mode, (angle * Math.PI) / 180),
    );
    this.frameVelocityProperty = new DerivedProperty(
      [this.frameProperty, this.frameBetaProperty, this.labStateProperty],
      (frame, beta, lab) => {
        if (frame === "lab") {
          return Vector2.ZERO;
        }
        return frame === "moving" ? new Vector2(beta, 0) : centerOfMomentumVelocity(lab.incoming);
      },
    );
    this.viewStateProperty = new DerivedProperty([this.labStateProperty, this.frameVelocityProperty], (lab, v) =>
      viewFromFrame(lab, v),
    );
    this.totalsBeforeProperty = new DerivedProperty([this.viewStateProperty], (s) => totalsOf(s.incoming));
    this.totalsAfterProperty = new DerivedProperty([this.viewStateProperty], (s) => totalsOf(s.outgoing));
    this.invariantMassProperty = new DerivedProperty([this.labStateProperty], (s) => invariantMass(s.incoming));

    // Pressing play on a finished run starts it again.
    this.isPlayingProperty.lazyLink((playing) => {
      if (playing && this.timeProperty.value >= T) {
        this.timeProperty.value = -T;
      }
    });
  }

  /** Back to the start of the run, paused. */
  public restart(): void {
    this.isPlayingProperty.value = false;
    this.timeProperty.value = -T;
  }

  /**
   * The symmetric collision of the chapter's derivation of p = γmu. In frame S
   * (the lab), B moves straight up at w₀; A moves along x at v with the
   * transverse speed w₀/γ(v) that it has *because* in its own frame S′ it moves
   * straight down at w₀. The two bounce, reversing their transverse motion. In S′
   * (the "moving" frame at v) the picture is the mirror image. Newton's Σmu_y is
   * not conserved in either frame; Σγmu_y is conserved in both.
   */
  public applyDerivationPreset(): void {
    const v = COLLISIONS.DERIVATION_FRAME_SPEED;
    const w0 = COLLISIONS.DERIVATION_TRANSVERSE_SPEED;
    const body1 = { mass: 1, velocity: new Vector2(v, -w0 / gammaOfBeta(v)) };
    const body2 = { mass: 1, velocity: new Vector2(0, w0) };
    this.setUp(body1, body2, "elastic", transverseReversalAngle(body1, body2));
    this.frameProperty.value = "lab";
    this.frameBetaProperty.value = v;
    this.showNewtonProperty.value = true;
  }

  /** Equal masses, the second at rest: the relativistic opening angle is less than 90°. */
  public applyTargetAtRestPreset(): void {
    this.setUp({ mass: 1, velocity: new Vector2(0.8, 0) }, { mass: 1, velocity: Vector2.ZERO }, "elastic", Math.PI / 2);
    this.frameProperty.value = "lab";
    this.showNewtonProperty.value = false;
  }

  /** Equal masses head-on, sticking: kinetic energy becomes rest energy, M = 2γm. */
  public applyHeadOnPreset(): void {
    this.setUp(
      { mass: 1, velocity: new Vector2(0.6, 0) },
      { mass: 1, velocity: new Vector2(-0.6, 0) },
      "inelastic",
      Math.PI / 2,
    );
    this.frameProperty.value = "lab";
    this.showNewtonProperty.value = false;
  }

  private setUp(
    body1: { mass: number; velocity: Vector2 },
    body2: { mass: number; velocity: Vector2 },
    mode: CollisionMode,
    cmAngle: number,
  ): void {
    this.mass1Property.value = body1.mass;
    this.mass2Property.value = body2.mass;
    this.velocity1Property.value = body1.velocity;
    this.velocity2Property.value = body2.velocity;
    this.modeProperty.value = mode;
    // Wrap into (−180°, 180°] for the slider.
    const degrees = (cmAngle * 180) / Math.PI;
    this.cmAngleProperty.value = ((((degrees + 180) % 360) + 360) % 360) - 180;
    this.restart();
  }

  /** Advances the clock by one wall-clock dt. */
  public stepTime(dt: number): void {
    const factor = this.timeSpeedProperty.value === TimeSpeed.SLOW ? 0.3 : 1;
    const next = this.timeProperty.value + dt * COLLISIONS.TIME_SCALE * factor;
    if (next >= T) {
      this.timeProperty.value = T;
      this.isPlayingProperty.value = false;
    } else {
      this.timeProperty.value = next;
    }
  }

  public reset(): void {
    this.mass1Property.reset();
    this.mass2Property.reset();
    this.velocity1Property.reset();
    this.velocity2Property.reset();
    this.modeProperty.reset();
    this.cmAngleProperty.reset();
    this.frameProperty.reset();
    this.frameBetaProperty.reset();
    this.showNewtonProperty.reset();
    this.timeSpeedProperty.reset();
    this.restart();
  }

  public step(dt: number): void {
    if (this.isPlayingProperty.value) {
      this.stepTime(dt);
    }
  }
}

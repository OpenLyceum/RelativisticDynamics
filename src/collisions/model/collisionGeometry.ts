/**
 * collisionGeometry.ts
 *
 * Pure geometry for the Collisions screen.
 *
 * A collision here is defined by what goes in (two bodies, each a mass and a
 * lab-frame velocity) and how they interact (elastic, with a chosen scattering
 * angle in the centre-of-momentum frame; or perfectly inelastic). Four-momentum
 * conservation then fixes what comes out. There is no force law and no
 * integration: the bodies meet at a single event, placed at the origin of space
 * and time, and every worldline is a straight line through it.
 *
 * Because a Lorentz boost maps the origin to itself, viewing the collision from
 * another frame only changes the velocities: in any frame, a body is at v′t′
 * at time t′ (t′ < 0 before the collision, t′ > 0 after). This is what lets the
 * screen switch frames mid-animation without anything jumping.
 *
 * Masses are in arbitrary units m₀ and energies in m₀c² (c = 1); only ratios
 * matter for the physics the screen shows.
 */

import { Vector2 } from "scenerystack/dot";
import {
  elasticCollision,
  FourMomentum,
  perfectlyInelasticCollision,
  totalFourMomentum,
  transformVelocity,
} from "../../common/model/kinematics.js";

export const CollisionMode = {
  ELASTIC: "elastic",
  INELASTIC: "inelastic",
} as const;
export type CollisionMode = (typeof CollisionMode)[keyof typeof CollisionMode];

export type Body = {
  readonly mass: number;
  /** Velocity as a fraction of c, in whichever frame the context says. */
  readonly velocity: Vector2;
};

/** The incoming and outgoing bodies, all in one frame. Outgoing has two bodies (elastic) or one (inelastic). */
export type CollisionState = {
  readonly incoming: readonly Body[];
  readonly outgoing: readonly Body[];
};

const bodyOf = (p: FourMomentum): Body => ({ mass: p.mass, velocity: p.velocity });
const momentumOf = (b: Body): FourMomentum => FourMomentum.fromMassAndVelocity(b.mass, b.velocity.x, b.velocity.y);

/** Solves the collision in the lab frame. `cmAngle` (radians) is used only for elastic collisions. */
export const solveCollision = (body1: Body, body2: Body, mode: CollisionMode, cmAngle: number): CollisionState => {
  const p1 = momentumOf(body1);
  const p2 = momentumOf(body2);
  if (mode === CollisionMode.INELASTIC) {
    return { incoming: [body1, body2], outgoing: [bodyOf(perfectlyInelasticCollision(p1, p2))] };
  }
  const [q1, q2] = elasticCollision(p1, p2, cmAngle);
  // Keep the masses exact rather than recomputing them through √(E² − p²).
  return {
    incoming: [body1, body2],
    outgoing: [
      { mass: body1.mass, velocity: q1.velocity },
      { mass: body2.mass, velocity: q2.velocity },
    ],
  };
};

/** Velocity of the centre-of-momentum frame of the incoming bodies, in the lab. */
export const centerOfMomentumVelocity = (incoming: readonly Body[]): Vector2 =>
  totalFourMomentum(incoming.map(momentumOf)).velocity;

/** √s, the invariant mass of the incoming system. Every frame agrees on it. */
export const invariantMass = (incoming: readonly Body[]): number => totalFourMomentum(incoming.map(momentumOf)).mass;

/** The whole collision as seen from a frame moving at `frameVelocity` relative to the lab. */
export const viewFromFrame = (state: CollisionState, frameVelocity: Vector2): CollisionState => {
  const view = (b: Body): Body => ({ mass: b.mass, velocity: transformVelocity(b.velocity, frameVelocity) });
  return { incoming: state.incoming.map(view), outgoing: state.outgoing.map(view) };
};

/** Totals the screen compares before and after: relativistic and Newtonian momentum, energies. */
export type Totals = {
  /** Σγmu. */
  readonly momentum: Vector2;
  /** Σmu, Newton's momentum. */
  readonly newtonianMomentum: Vector2;
  /** ΣE = Σγm. */
  readonly energy: number;
  /** Σm, total rest energy. */
  readonly restEnergy: number;
  /** ΣK = Σ(γ − 1)m. */
  readonly kineticEnergy: number;
};

export const totalsOf = (bodies: readonly Body[]): Totals => {
  let momentum = Vector2.ZERO;
  let newtonianMomentum = Vector2.ZERO;
  let energy = 0;
  let restEnergy = 0;
  for (const body of bodies) {
    const p = momentumOf(body);
    momentum = momentum.plus(p.momentum);
    newtonianMomentum = newtonianMomentum.plus(body.velocity.timesScalar(body.mass));
    energy += p.energy;
    restEnergy += body.mass;
  }
  return { momentum, newtonianMomentum, energy, restEnergy, kineticEnergy: energy - restEnergy };
};

/** A body's position at time t in the frame its velocity is given in (the collision is at the origin). */
export const positionAt = (body: Body, time: number): Vector2 => body.velocity.timesScalar(time);

/** Angle between the two outgoing velocities (radians), or null if there are not two moving bodies. */
export const openingAngle = (outgoing: readonly Body[]): number | null => {
  const [a, b] = outgoing;
  if (!(a && b) || a.velocity.magnitude < 1e-9 || b.velocity.magnitude < 1e-9) {
    return null;
  }
  const cos = a.velocity.dot(b.velocity) / (a.velocity.magnitude * b.velocity.magnitude);
  return Math.acos(Math.max(-1, Math.min(1, cos)));
};

/**
 * The CM scattering angle that reverses both bodies' transverse (y) momenta while
 * leaving their x momenta alone, the outcome of the chapter's symmetric
 * derivation. Valid when the total y momentum is zero, so the CM frame moves
 * along x: reflecting the CM momentum across the x axis is a rotation by −2φ.
 */
export const transverseReversalAngle = (body1: Body, body2: Body): number => {
  const cm = centerOfMomentumVelocity([body1, body2]);
  const p1Star = momentumOf(body1).boostedBy(cm);
  return -2 * Math.atan2(p1Star.py, p1Star.px);
};

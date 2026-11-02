/**
 * acceleration.ts
 *
 * Pure helpers for the Accelerate screen: a particle starting from rest, pushed
 * by a constant force F = qℰ along a straight track. Newton and Einstein agree on
 * the momentum, p = Ft; they disagree on what that momentum means for the speed.
 * Newton: u = p/m, without limit. Einstein: u = p/√(p² + m²), always below c.
 *
 * Units follow the rest of the sim (c = 1, MeV): with the field in MV/m and unit
 * charge, F is in MeV per metre, so times come out as c·t in metres. Nanoseconds
 * are only for display.
 */

import { energyOfMomentum, hyperbolicMotion, momentumOfEnergy } from "../../common/model/kinematics.js";
import { BERTOZZI, SPEED_OF_LIGHT_M_PER_NS } from "../../RelativisticDynamicsConstants.js";

/** Converts c·t in metres to t in nanoseconds. */
export const metresToNanoseconds = (ct: number): number => ct / SPEED_OF_LIGHT_M_PER_NS;

/** Converts t in nanoseconds to c·t in metres. */
export const nanosecondsToMetres = (t: number): number => t * SPEED_OF_LIGHT_M_PER_NS;

/**
 * Time (as c·t, metres) for the real particle to cover a track of length L from
 * rest under force F: the work–energy theorem gives E = m + FL, hence p, hence
 * t = p/F.
 */
export const relativisticTimeToTravel = (mass: number, force: number, length: number): number =>
  force <= 0 ? Number.POSITIVE_INFINITY : momentumOfEnergy(mass, mass + force * length) / force;

/** Time (as c·t, metres) for the Newtonian particle to cover the track: L = Ft²/(2m). */
export const newtonianTimeToTravel = (mass: number, force: number, length: number): number =>
  force <= 0 ? Number.POSITIVE_INFINITY : Math.sqrt((2 * mass * length) / force);

/** Time (as c·t, metres) at which the particle's kinetic energy reaches K. */
export const timeToReachKineticEnergy = (mass: number, force: number, kineticEnergy: number): number =>
  force <= 0 ? 0 : momentumOfEnergy(mass, mass + kineticEnergy) / force;

/** Everything the screen shows at one instant, for both theories, plus a light pulse fired at t = 0. */
export type AccelerationSnapshot = {
  readonly momentum: number;
  readonly beta: number;
  readonly kineticEnergy: number;
  readonly position: number;
  readonly newtonianBeta: number;
  /** Newton's kinetic energy p²/2m, which equals F·x_Newton. */
  readonly newtonianKineticEnergy: number;
  readonly newtonianPosition: number;
  /** Position of a light pulse that left the start line with the particle. */
  readonly lightPosition: number;
};

export const accelerationSnapshot = (mass: number, force: number, ct: number): AccelerationSnapshot => {
  const motion = hyperbolicMotion(mass, force, ct);
  return {
    momentum: motion.momentum,
    beta: motion.beta,
    kineticEnergy: energyOfMomentum(mass, motion.momentum) - mass,
    position: motion.position,
    newtonianBeta: motion.newtonianBeta,
    newtonianKineticEnergy: mass > 0 ? (motion.momentum * motion.momentum) / (2 * mass) : 0,
    newtonianPosition: motion.newtonianPosition,
    lightPosition: ct,
  };
};

/** β² predicted by relativity for kinetic energy K: 1 − (m/(K + m))². */
export const relativisticBetaSquared = (mass: number, kineticEnergy: number): number => {
  const gammaInverse = mass / (mass + kineticEnergy);
  return 1 - gammaInverse * gammaInverse;
};

/** β² predicted by Newton for kinetic energy K: 2K/m. */
export const newtonianBetaSquared = (mass: number, kineticEnergy: number): number => (2 * kineticEnergy) / mass;

/** Bertozzi's five runs, with β computed from the measured flight time over the 8.4 m path. */
export const bertozziPoints = (): { kineticEnergy: number; beta: number; betaSquared: number }[] =>
  BERTOZZI.RUNS.map((run) => {
    const beta = BERTOZZI.FLIGHT_PATH_M / nanosecondsToMetres(run.flightTimeNs);
    return { kineticEnergy: run.kineticEnergyMeV, beta, betaSquared: beta * beta };
  });

/**
 * kinematics.ts
 *
 * Pure, SceneryStack-free relativistic dynamics: four-momenta, boosts, the
 * single-particle relations between β, γ, p, K and E, two-body collisions, and
 * reaction thresholds. Every screen builds its geometry from these functions;
 * the screen models only wrap them in Properties. Unit tests pin them to the
 * worked examples of Modern Physics, Chapter 3.
 *
 * ── Conventions ───────────────────────────────────────────────────────────────
 *
 *  - **Natural units, c = 1.** Energies and masses are in MeV (mass means rest
 *    energy mc²), momenta in MeV/c, speeds as β = u/c. Nothing here multiplies or
 *    divides by c. This matches the SpecialRelativity sim, where the same choice
 *    makes light rays 45° lines; here it makes a photon's four-momentum a 45° line
 *    on the (pc, E) plane.
 *
 *  - **Two spatial dimensions.** A four-momentum here is (E, px, py); pz is always
 *    zero because every collision the sim draws is planar. Boosts may be along any
 *    direction in that plane.
 *
 *  - **Energy–momentum first, velocity second.** Wherever possible the functions
 *    take and return (E, p) rather than β, because β → 1 loses precision long
 *    before E and p do: a 5.6 GeV proton has β = 0.9939… but γ = 7 exactly. β is
 *    always derived (β = p/E), never stored.
 *
 * Provenance: the boost and γ conventions follow
 * `SpecialRelativity/src/common/model/lorentz.ts` (an event there is (x, ct);
 * a four-momentum here is (E, p) in the same roles), but that module clamps β to
 * 0.99 for diagram legibility, which is far too low for dynamics, so this module
 * is written separately rather than copied.
 */

import { Vector2 } from "scenerystack/dot";

/**
 * Largest speed any velocity-driven input is allowed to reach. γ here is ≈ 7 071,
 * well beyond anything the sim draws, while 1 − β² is still far above
 * double-precision roundoff.
 */
export const MAX_BETA = 1 - 1e-8;

/** Clamps |β| below {@link MAX_BETA} and maps non-finite input to 0. */
export const sanitizeBeta = (beta: number): number => {
  if (!Number.isFinite(beta)) {
    return 0;
  }
  return Math.max(-MAX_BETA, Math.min(MAX_BETA, beta));
};

/** The Lorentz factor γ = 1/√(1 − β²) for a speed β (sign ignored). */
export const gammaOfBeta = (beta: number): number => {
  const b = sanitizeBeta(beta);
  return 1 / Math.sqrt(1 - b * b);
};

/** The speed β = √(1 − 1/γ²) for a Lorentz factor γ ≥ 1. */
export const betaOfGamma = (gamma: number): number => (gamma <= 1 ? 0 : Math.sqrt(1 - 1 / (gamma * gamma)));

// ── Single-particle relations (all scalar, mass m ≥ 0) ─────────────────────────

/** Total energy from momentum: E = √(p² + m²). */
export const energyOfMomentum = (mass: number, momentum: number): number => Math.hypot(momentum, mass);

/** Momentum magnitude from total energy: p = √(E² − m²) (0 below the rest energy). */
export const momentumOfEnergy = (mass: number, energy: number): number =>
  energy <= mass ? 0 : Math.sqrt((energy - mass) * (energy + mass));

/** Momentum magnitude from speed: p = γmβ. Undefined for a photon (returns 0). */
export const momentumOfBeta = (mass: number, beta: number): number => {
  const b = sanitizeBeta(beta);
  return gammaOfBeta(b) * mass * Math.abs(b);
};

/** Speed from momentum: β = p/E. A photon (m = 0, p > 0) gives exactly 1. */
export const betaOfMomentum = (mass: number, momentum: number): number => {
  const energy = energyOfMomentum(mass, momentum);
  return energy === 0 ? 0 : Math.abs(momentum) / energy;
};

/** Newtonian momentum mu for the same speed (what Newton would call the momentum). */
export const newtonianMomentum = (mass: number, beta: number): number => mass * beta;

/** Newtonian kinetic energy ½mu² for the same speed. */
export const newtonianKineticEnergy = (mass: number, beta: number): number => 0.5 * mass * beta * beta;

/** Newtonian speed a particle would have for the given kinetic energy: u = √(2K/m). */
export const newtonianBetaOfKineticEnergy = (mass: number, kineticEnergy: number): number =>
  mass <= 0 ? Number.POSITIVE_INFINITY : Math.sqrt((2 * Math.max(0, kineticEnergy)) / mass);

/**
 * Every quantity of a free particle, computed from one of them. This is what the
 * Energy–Momentum screen shows as a readout table and what the tests pin.
 */
export type ParticleState = {
  readonly mass: number;
  readonly energy: number;
  readonly momentum: number;
  readonly kineticEnergy: number;
  readonly beta: number;
  /** E/m; +∞ for a photon. */
  readonly gamma: number;
};

/** The full state of a particle of mass m carrying momentum p (p ≥ 0). */
export const particleStateFromMomentum = (mass: number, momentum: number): ParticleState => {
  const p = Math.abs(momentum);
  const energy = energyOfMomentum(mass, p);
  return {
    mass,
    energy,
    momentum: p,
    kineticEnergy: energy - mass,
    beta: energy === 0 ? 0 : p / energy,
    gamma: mass > 0 ? energy / mass : Number.POSITIVE_INFINITY,
  };
};

/** The full state of a particle of mass m with kinetic energy K. */
export const particleStateFromKineticEnergy = (mass: number, kineticEnergy: number): ParticleState =>
  particleStateFromMomentum(mass, momentumOfEnergy(mass, mass + Math.max(0, kineticEnergy)));

/** The full state of a massive particle moving at speed β. */
export const particleStateFromBeta = (mass: number, beta: number): ParticleState =>
  particleStateFromMomentum(mass, momentumOfBeta(mass, beta));

// ── Four-momentum ──────────────────────────────────────────────────────────────

/**
 * An immutable planar four-momentum (E, px, py) in MeV and MeV/c. The invariant
 * mass is m² = E² − p², which every inertial frame agrees on; summing
 * four-momenta and taking the invariant mass of the total gives √s, the energy
 * available in the centre-of-momentum frame.
 */
export class FourMomentum {
  public static readonly ZERO = new FourMomentum(0, 0, 0);

  /** Total energy E, MeV. */
  public readonly energy: number;
  /** Momentum x component, MeV/c. */
  public readonly px: number;
  /** Momentum y component, MeV/c. */
  public readonly py: number;

  public constructor(energy: number, px: number, py: number) {
    this.energy = energy;
    this.px = px;
    this.py = py;
  }

  /** A particle of mass m moving with velocity (βx, βy). */
  public static fromMassAndVelocity(mass: number, betaX: number, betaY: number): FourMomentum {
    const speed = Math.hypot(betaX, betaY);
    const gamma = gammaOfBeta(speed);
    const scale = speed > MAX_BETA ? MAX_BETA / speed : 1;
    return new FourMomentum(gamma * mass, gamma * mass * betaX * scale, gamma * mass * betaY * scale);
  }

  /** A particle of mass m carrying momentum (px, py). Works for photons (m = 0). */
  public static fromMassAndMomentum(mass: number, px: number, py: number): FourMomentum {
    return new FourMomentum(Math.hypot(mass, px, py), px, py);
  }

  /** A particle of mass m with kinetic energy K travelling at angle θ (radians) from +x. */
  public static fromMassAndKineticEnergy(mass: number, kineticEnergy: number, angle = 0): FourMomentum {
    const p = momentumOfEnergy(mass, mass + Math.max(0, kineticEnergy));
    return new FourMomentum(mass + Math.max(0, kineticEnergy), p * Math.cos(angle), p * Math.sin(angle));
  }

  /** A photon of energy E travelling at angle θ (radians) from +x. */
  public static photon(energy: number, angle = 0): FourMomentum {
    return new FourMomentum(energy, energy * Math.cos(angle), energy * Math.sin(angle));
  }

  /** The three-momentum as a vector. */
  public get momentum(): Vector2 {
    return new Vector2(this.px, this.py);
  }

  /** |p|. */
  public get momentumMagnitude(): number {
    return Math.hypot(this.px, this.py);
  }

  /** m² = E² − p². Negative only through roundoff (or for a spacelike sum, which never arises physically). */
  public get massSquared(): number {
    return (this.energy - this.momentumMagnitude) * (this.energy + this.momentumMagnitude);
  }

  /** The invariant mass √(E² − p²), with roundoff below zero clamped away. */
  public get mass(): number {
    return Math.sqrt(Math.max(0, this.massSquared));
  }

  /** Kinetic energy E − m. For a sum of particles this is *not* the sum of their kinetic energies. */
  public get kineticEnergy(): number {
    return this.energy - this.mass;
  }

  /** The velocity p/E of the particle (or of the CM frame of a system). */
  public get velocity(): Vector2 {
    return this.energy === 0 ? Vector2.ZERO : new Vector2(this.px / this.energy, this.py / this.energy);
  }

  /** Speed |p|/E. */
  public get beta(): number {
    return this.energy === 0 ? 0 : this.momentumMagnitude / this.energy;
  }

  /** Direction of the momentum (radians from +x). */
  public get angle(): number {
    return Math.atan2(this.py, this.px);
  }

  public plus(other: FourMomentum): FourMomentum {
    return new FourMomentum(this.energy + other.energy, this.px + other.px, this.py + other.py);
  }

  public minus(other: FourMomentum): FourMomentum {
    return new FourMomentum(this.energy - other.energy, this.px - other.px, this.py - other.py);
  }

  public negatedMomentum(): FourMomentum {
    return new FourMomentum(this.energy, -this.px, -this.py);
  }

  /** The same four-momentum with its three-momentum rotated by θ radians. */
  public rotated(angle: number): FourMomentum {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new FourMomentum(this.energy, cos * this.px - sin * this.py, sin * this.px + cos * this.py);
  }

  /**
   * This four-momentum as measured in a frame moving with velocity (βx, βy)
   * relative to the current one — the general pure boost
   *
   *     E′ = γ(E − β·p),    p′ = p + [(γ − 1)(β̂·p) − γβE] β̂.
   *
   * For a boost along x this reduces to E′ = γ(E − βpx), px′ = γ(px − βE), the
   * same matrix that maps (ct, x) in Chapter 2.
   */
  public boosted(betaX: number, betaY: number): FourMomentum {
    const speed = Math.hypot(betaX, betaY);
    if (speed === 0) {
      return this;
    }
    const b = sanitizeBeta(speed);
    const nx = betaX / speed;
    const ny = betaY / speed;
    const gamma = gammaOfBeta(b);
    const pParallel = this.px * nx + this.py * ny;
    const energy = gamma * (this.energy - b * pParallel);
    const pParallelPrime = gamma * (pParallel - b * this.energy);
    const delta = pParallelPrime - pParallel;
    return new FourMomentum(energy, this.px + delta * nx, this.py + delta * ny);
  }

  /** {@link boosted} with a Vector2 velocity. */
  public boostedBy(velocity: Vector2): FourMomentum {
    return this.boosted(velocity.x, velocity.y);
  }

  public equalsEpsilon(other: FourMomentum, epsilon: number): boolean {
    return (
      Math.abs(this.energy - other.energy) <= epsilon &&
      Math.abs(this.px - other.px) <= epsilon &&
      Math.abs(this.py - other.py) <= epsilon
    );
  }
}

/** The sum of a list of four-momenta. */
export const totalFourMomentum = (momenta: readonly FourMomentum[]): FourMomentum =>
  momenta.reduce((sum, p) => sum.plus(p), FourMomentum.ZERO);

/** Velocity of the centre-of-momentum frame of a system: β_cm = p_total / E_total. */
export const centerOfMomentumVelocity = (momenta: readonly FourMomentum[]): Vector2 =>
  totalFourMomentum(momenta).velocity;

/**
 * Velocity transformation for a particle with velocity u, viewed from a frame
 * moving at v (both as fractions of c). Computed through the four-momentum of a
 * unit-mass particle so the formula is exactly consistent with {@link
 * FourMomentum.boosted}.
 */
export const transformVelocity = (u: Vector2, frameVelocity: Vector2): Vector2 =>
  FourMomentum.fromMassAndVelocity(1, u.x, u.y).boostedBy(frameVelocity).velocity;

/** Σ(γ m u) and Σ(m u): relativistic and Newtonian total momentum of a list of massive bodies. */
export const momentumTotals = (
  bodies: readonly { readonly mass: number; readonly velocity: Vector2 }[],
): { relativistic: Vector2; newtonian: Vector2; energy: number } => {
  let rx = 0;
  let ry = 0;
  let nx = 0;
  let ny = 0;
  let energy = 0;
  for (const body of bodies) {
    const p = FourMomentum.fromMassAndVelocity(body.mass, body.velocity.x, body.velocity.y);
    rx += p.px;
    ry += p.py;
    energy += p.energy;
    nx += body.mass * body.velocity.x;
    ny += body.mass * body.velocity.y;
  }
  return { relativistic: new Vector2(rx, ry), newtonian: new Vector2(nx, ny), energy };
};

// ── Two-body collisions ────────────────────────────────────────────────────────

/** Magnitude of each particle's momentum in the CM frame of a two-body state of invariant mass √s. */
export const twoBodyMomentum = (sqrtS: number, m1: number, m2: number): number => {
  const s = sqrtS * sqrtS;
  const lambda = (s - (m1 + m2) ** 2) * (s - (m1 - m2) ** 2);
  return lambda <= 0 ? 0 : Math.sqrt(lambda) / (2 * sqrtS);
};

/**
 * Elastic scattering of two bodies (masses unchanged). The collision is solved
 * where it is simplest: boost to the CM frame, where the two momenta are equal
 * and opposite and an elastic collision can only rotate them; rotate both by the
 * CM scattering angle θ*; boost back. Returns the outgoing four-momenta in the
 * original frame, body 1 first.
 */
export const elasticCollision = (
  p1: FourMomentum,
  p2: FourMomentum,
  cmScatteringAngle: number,
): [FourMomentum, FourMomentum] => {
  const total = p1.plus(p2);
  const cmVelocity = total.velocity;
  const p1Star = p1.boostedBy(cmVelocity).rotated(cmScatteringAngle);
  const p2Star = p2.boostedBy(cmVelocity).rotated(cmScatteringAngle);
  const back = cmVelocity.negated();
  return [p1Star.boostedBy(back), p2Star.boostedBy(back)];
};

/**
 * A perfectly inelastic collision: the two bodies stick and move off as one
 * composite. Four-momentum conservation fixes everything: the composite carries
 * the total four-momentum, so its rest mass is √s, which exceeds m₁ + m₂
 * whenever the bodies were in relative motion. Kinetic energy has become rest
 * energy.
 */
export const perfectlyInelasticCollision = (p1: FourMomentum, p2: FourMomentum): FourMomentum => p1.plus(p2);

/**
 * For two equal masses, the second at rest, the product tan θ₁ · tan θ₂ of the
 * lab scattering angles for any elastic collision is 2/(γ + 1), with γ the
 * incident particle's Lorentz factor. Newtonian mechanics gives 1 (the famous
 * 90° opening angle); relativity closes the angle.
 */
export const equalMassOpeningAngleProduct = (incidentGamma: number): number => 2 / (incidentGamma + 1);

// ── Thresholds ─────────────────────────────────────────────────────────────────

/** √s for a beam of mass m₁ and total energy E₁ on a target of mass m₂ at rest: s = m₁² + m₂² + 2E₁m₂. */
export const sqrtSFixedTarget = (beamMass: number, beamEnergy: number, targetMass: number): number =>
  Math.sqrt(beamMass * beamMass + targetMass * targetMass + 2 * beamEnergy * targetMass);

/**
 * Threshold *kinetic* energy of a beam on a fixed target for a reaction whose
 * final state has total rest mass M: E₁ = (M² − m₁² − m₂²)/(2m₂), K = E₁ − m₁.
 * Zero when the reaction is exothermic (M ≤ m₁ + m₂). Infinite when the target
 * is massless, which never happens in the catalog.
 */
export const thresholdKineticEnergyFixedTarget = (beamMass: number, targetMass: number, finalMass: number): number => {
  if (finalMass <= beamMass + targetMass) {
    return 0;
  }
  if (targetMass <= 0) {
    return Number.POSITIVE_INFINITY;
  }
  const beamEnergy = (finalMass * finalMass - beamMass * beamMass - targetMass * targetMass) / (2 * targetMass);
  return beamEnergy - beamMass;
};

/**
 * Beam energies for a head-on collider whose two beams have equal and opposite
 * momenta, so the lab *is* the CM frame and √s = E₁ + E₂. Given the momentum p
 * of each beam.
 */
export const sqrtSCollider = (mass1: number, mass2: number, momentum: number): number =>
  energyOfMomentum(mass1, momentum) + energyOfMomentum(mass2, momentum);

/**
 * Threshold kinetic energies of the two beams of a head-on collider (equal and
 * opposite momenta). Solving E₁ + E₂ = M with E₁² − E₂² = m₁² − m₂² gives
 * E₁ = (M + (m₁² − m₂²)/M)/2. Returns [K₁, K₂]; both zero for an exothermic
 * reaction.
 */
export const thresholdKineticEnergiesCollider = (mass1: number, mass2: number, finalMass: number): [number, number] => {
  if (finalMass <= mass1 + mass2) {
    return [0, 0];
  }
  const e1 = (finalMass + (mass1 * mass1 - mass2 * mass2) / finalMass) / 2;
  const e2 = finalMass - e1;
  return [e1 - mass1, e2 - mass2];
};

/** Momentum of each collider beam for which beam 1 carries kinetic energy K₁. */
export const colliderMomentumForBeamKineticEnergy = (mass1: number, kineticEnergy1: number): number =>
  momentumOfEnergy(mass1, mass1 + Math.max(0, kineticEnergy1));

// ── Constant force (the Accelerate screen) ─────────────────────────────────────

/**
 * Motion from rest under a constant force F along x, with momentum p(t) = Ft in
 * both theories. Relativity: β = p/√(p² + m²), position x = (√(m² + (Ft)²) − m)/F
 * (hyperbolic motion). Newton: β = Ft/m, x = Ft²/(2m). Time in units where c = 1,
 * so with F in MeV per metre, t is in metres of light-travel time and x in
 * metres; the screen model converts.
 */
export const hyperbolicMotion = (
  mass: number,
  force: number,
  time: number,
): { momentum: number; beta: number; position: number; newtonianBeta: number; newtonianPosition: number } => {
  const momentum = force * time;
  const energy = energyOfMomentum(mass, momentum);
  return {
    momentum,
    beta: energy === 0 ? 0 : momentum / energy,
    position: force === 0 ? 0 : (energy - mass) / force,
    newtonianBeta: mass === 0 ? 0 : momentum / mass,
    newtonianPosition: mass === 0 ? 0 : (force * time * time) / (2 * mass),
  };
};

/**
 * reactions.ts
 *
 * The Thresholds screen's reaction catalog, and the kinematics that decide
 * whether a reaction can happen at a given beam energy.
 *
 * A reaction is a beam particle hitting a target particle and producing a list
 * of final-state particles. Kinematically, the reaction is possible exactly when
 * the invariant mass of the initial state, √s, is at least the total rest
 * energy of the products, Σm_f. The one exception is a single product: then
 * four-momentum conservation demands √s = m_f *exactly*, so e⁺e⁻ → γ (m_f = 0,
 * √s ≥ 2mₑ) is impossible at every energy, the chapter's annihilation argument.
 */

import type { Vector2 } from "scenerystack/dot";
import {
  colliderMomentumForBeamKineticEnergy,
  energyOfMomentum,
  FourMomentum,
  sqrtSCollider,
  sqrtSFixedTarget,
  thresholdKineticEnergiesCollider,
  thresholdKineticEnergyFixedTarget,
} from "../../common/model/kinematics.js";
import { PARTICLES, type Particle, totalMass } from "../../common/model/particles.js";

export type ReactionId =
  | "antiproton"
  | "pionProduction"
  | "photopion"
  | "associatedProduction"
  | "pairProductionNucleus"
  | "tripletProduction"
  | "muonPair"
  | "annihilationOnePhoton"
  | "annihilationTwoPhotons";

export type Reaction = {
  readonly id: ReactionId;
  readonly beam: Particle;
  readonly target: Particle;
  readonly products: readonly Particle[];
  /** Whether a head-on collider version is offered (not for photon beams or nuclear targets). */
  readonly colliderAvailable: boolean;
};

const reaction = (
  id: ReactionId,
  beam: Particle,
  target: Particle,
  products: readonly Particle[],
  colliderAvailable: boolean,
): Reaction => ({ id, beam, target, products, colliderAvailable });

const P = PARTICLES;

/** The catalog, in the order the combo box lists it. */
export const REACTIONS: readonly Reaction[] = [
  reaction("antiproton", P.proton, P.proton, [P.proton, P.proton, P.proton, P.antiproton], true),
  reaction("pionProduction", P.proton, P.proton, [P.proton, P.proton, P.pionZero], true),
  reaction("photopion", P.photon, P.proton, [P.proton, P.pionZero], false),
  reaction("associatedProduction", P.pionMinus, P.proton, [P.kaonZero, P.lambda], false),
  reaction("pairProductionNucleus", P.photon, P.leadNucleus, [P.leadNucleus, P.electron, P.positron], false),
  reaction("tripletProduction", P.photon, P.electron, [P.electron, P.electron, P.positron], false),
  reaction("muonPair", P.positron, P.electron, [P.antimuon, P.muon], true),
  reaction("annihilationOnePhoton", P.positron, P.electron, [P.photon], true),
  reaction("annihilationTwoPhotons", P.positron, P.electron, [P.photon, P.photon], true),
];

export const reactionById = (id: ReactionId): Reaction => {
  const found = REACTIONS.find((r) => r.id === id);
  if (!found) {
    throw new Error(`unknown reaction ${id}`);
  }
  return found;
};

/** Fixed target (target at rest in the lab) or head-on collider (equal and opposite momenta). */
export const BeamConfiguration = {
  FIXED_TARGET: "fixedTarget",
  COLLIDER: "collider",
} as const;
export type BeamConfiguration = (typeof BeamConfiguration)[keyof typeof BeamConfiguration];

/** Whether the reaction can happen. */
export const Verdict = {
  ALLOWED: "allowed",
  BELOW_THRESHOLD: "belowThreshold",
  /** A single massless product: no energy is ever enough. */
  FORBIDDEN: "forbidden",
} as const;
export type Verdict = (typeof Verdict)[keyof typeof Verdict];

/** Σm_f. */
export const finalMass = (r: Reaction): number => totalMass(r.products);

/** Threshold kinetic energy of the beam (in a collider, of beam 1) for the configuration. ∞ if forbidden. */
export const thresholdKineticEnergy = (r: Reaction, configuration: BeamConfiguration): number => {
  if (isForbidden(r)) {
    return Number.POSITIVE_INFINITY;
  }
  return configuration === BeamConfiguration.FIXED_TARGET
    ? thresholdKineticEnergyFixedTarget(r.beam.mass, r.target.mass, finalMass(r))
    : thresholdKineticEnergiesCollider(r.beam.mass, r.target.mass, finalMass(r))[0];
};

/** A single product of mass below the minimum possible √s can never be made. */
export const isForbidden = (r: Reaction): boolean =>
  r.products.length === 1 && (r.products[0]?.mass ?? 0) < r.beam.mass + r.target.mass;

/** Lab-frame initial four-momenta: beam along +x, target at rest or moving along −x. */
export const initialState = (
  r: Reaction,
  configuration: BeamConfiguration,
  beamKineticEnergy: number,
): [FourMomentum, FourMomentum] => {
  const K = Math.max(0, beamKineticEnergy);
  if (configuration === BeamConfiguration.FIXED_TARGET) {
    return [FourMomentum.fromMassAndKineticEnergy(r.beam.mass, K), new FourMomentum(r.target.mass, 0, 0)];
  }
  const p = colliderMomentumForBeamKineticEnergy(r.beam.mass, K);
  return [FourMomentum.fromMassAndMomentum(r.beam.mass, p, 0), FourMomentum.fromMassAndMomentum(r.target.mass, -p, 0)];
};

/** √s, the energy available in the CM frame. */
export const availableEnergy = (r: Reaction, configuration: BeamConfiguration, beamKineticEnergy: number): number => {
  const K = Math.max(0, beamKineticEnergy);
  if (configuration === BeamConfiguration.FIXED_TARGET) {
    return sqrtSFixedTarget(r.beam.mass, r.beam.mass + K, r.target.mass);
  }
  return sqrtSCollider(r.beam.mass, r.target.mass, colliderMomentumForBeamKineticEnergy(r.beam.mass, K));
};

/**
 * Total lab energy the experimenter supplies: the beam's kinetic energy for a
 * fixed target, both beams' kinetic energies for a collider. The "wasted energy"
 * comparison plots √s against this.
 */
export const suppliedKineticEnergy = (
  r: Reaction,
  configuration: BeamConfiguration,
  beamKineticEnergy: number,
): number => {
  const [p1, p2] = initialState(r, configuration, beamKineticEnergy);
  return p1.kineticEnergy + p2.kineticEnergy;
};

/** Whether the reaction proceeds at this √s. A tiny tolerance absorbs roundoff exactly at threshold. */
export const verdictFor = (r: Reaction, sqrtS: number): Verdict => {
  if (isForbidden(r)) {
    return Verdict.FORBIDDEN;
  }
  return sqrtS >= finalMass(r) * (1 - 1e-12) ? Verdict.ALLOWED : Verdict.BELOW_THRESHOLD;
};

/**
 * A representative final state in the CM frame: every product with the same
 * momentum magnitude p*, directions equally spaced around the circle starting at
 * `orientation`, so the momenta sum to zero for any N ≥ 2. p* is fixed by energy
 * conservation, Σ√(p*² + mᵢ²) = √s, solved by bisection. At threshold p* = 0 and
 * every product is at rest in the CM frame, which is the chapter's threshold
 * picture. Real final states are spread over all of phase space; this one is
 * chosen to be readable, not typical.
 *
 * Returns an empty list below threshold (or for a forbidden reaction).
 */
export const symmetricFinalState = (masses: readonly number[], sqrtS: number, orientation = 0): FourMomentum[] => {
  const n = masses.length;
  const sumMass = masses.reduce((s, m) => s + m, 0);
  if (n < 2 || sqrtS < sumMass * (1 - 1e-12)) {
    return [];
  }
  const energyAt = (p: number): number => masses.reduce((s, m) => s + energyOfMomentum(m, p), 0);
  let lo = 0;
  let hi = sqrtS;
  for (let i = 0; i < 100; i++) {
    const mid = 0.5 * (lo + hi);
    if (energyAt(mid) > sqrtS) {
      hi = mid;
    } else {
      lo = mid;
    }
  }
  const pStar = 0.5 * (lo + hi);
  return masses.map((m, i) => {
    const angle = orientation + (2 * Math.PI * i) / n;
    return FourMomentum.fromMassAndMomentum(m, pStar * Math.cos(angle), pStar * Math.sin(angle));
  });
};

/** The final state of {@link symmetricFinalState} boosted from the CM frame into the lab. */
export const labFinalState = (
  r: Reaction,
  configuration: BeamConfiguration,
  beamKineticEnergy: number,
  orientation = Math.PI / 2,
): FourMomentum[] => {
  const [p1, p2] = initialState(r, configuration, beamKineticEnergy);
  const total = p1.plus(p2);
  const cmStates = symmetricFinalState(
    r.products.map((p) => p.mass),
    total.mass,
    orientation,
  );
  const back: Vector2 = total.velocity.negated();
  return cmStates.map((p) => p.boostedBy(back));
};

/**
 * particles.ts
 *
 * The particles the sim knows about. A particle is just a rest energy, a charge,
 * and a symbol; its translated name lives in the string files, keyed by `id`.
 * Symbols such as "p̄" and "π⁰" are notation, so they are not translated.
 */

import { MASS_MEV } from "../../RelativisticDynamicsConstants.js";

export type ParticleId =
  | "photon"
  | "electron"
  | "positron"
  | "muon"
  | "antimuon"
  | "pionPlus"
  | "pionMinus"
  | "pionZero"
  | "kaonZero"
  | "proton"
  | "antiproton"
  | "neutron"
  | "lambda"
  | "leadNucleus";

export type Particle = {
  readonly id: ParticleId;
  /** Rest energy mc² in MeV. */
  readonly mass: number;
  /** Electric charge in units of e. */
  readonly charge: number;
  /** Notation shown in reaction equations, e.g. "p̄". */
  readonly symbol: string;
};

const particle = (id: ParticleId, mass: number, charge: number, symbol: string): Particle => ({
  id,
  mass,
  charge,
  symbol,
});

export const PARTICLES: Readonly<Record<ParticleId, Particle>> = {
  photon: particle("photon", MASS_MEV.PHOTON, 0, "γ"),
  electron: particle("electron", MASS_MEV.ELECTRON, -1, "e⁻"),
  positron: particle("positron", MASS_MEV.ELECTRON, 1, "e⁺"),
  muon: particle("muon", MASS_MEV.MUON, -1, "μ⁻"),
  antimuon: particle("antimuon", MASS_MEV.MUON, 1, "μ⁺"),
  pionPlus: particle("pionPlus", MASS_MEV.PION_CHARGED, 1, "π⁺"),
  pionMinus: particle("pionMinus", MASS_MEV.PION_CHARGED, -1, "π⁻"),
  pionZero: particle("pionZero", MASS_MEV.PION_NEUTRAL, 0, "π⁰"),
  kaonZero: particle("kaonZero", MASS_MEV.KAON_NEUTRAL, 0, "K⁰"),
  proton: particle("proton", MASS_MEV.PROTON, 1, "p"),
  antiproton: particle("antiproton", MASS_MEV.PROTON, -1, "p̄"),
  neutron: particle("neutron", MASS_MEV.NEUTRON, 0, "n"),
  lambda: particle("lambda", MASS_MEV.LAMBDA, 0, "Λ⁰"),
  leadNucleus: particle("leadNucleus", MASS_MEV.LEAD_NUCLEUS, 82, "Pb"),
};

/** Total rest energy of a list of particles. */
export const totalMass = (particles: readonly Particle[]): number => particles.reduce((sum, p) => sum + p.mass, 0);

/** Total charge of a list of particles. */
export const totalCharge = (particles: readonly Particle[]): number => particles.reduce((sum, p) => sum + p.charge, 0);

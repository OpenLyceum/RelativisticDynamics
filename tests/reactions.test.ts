/**
 * reactions.test.ts
 *
 * The Thresholds screen's catalog: every reaction conserves charge, the
 * threshold energies match textbook values, and the single-photon annihilation
 * is forbidden at every energy while the two-photon one is always allowed.
 */

import { describe, expect, it } from "vitest";
import { totalFourMomentum } from "../src/common/model/kinematics.js";
import { totalCharge } from "../src/common/model/particles.js";
import { MASS_MEV } from "../src/RelativisticDynamicsConstants.js";
import {
  availableEnergy,
  BeamConfiguration,
  finalMass,
  initialState,
  labFinalState,
  REACTIONS,
  reactionById,
  symmetricFinalState,
  thresholdKineticEnergy,
  Verdict,
  verdictFor,
} from "../src/thresholds/model/reactions.js";
import { ThresholdsModel } from "../src/thresholds/model/ThresholdsModel.js";

const FIXED = BeamConfiguration.FIXED_TARGET;
const COLLIDER = BeamConfiguration.COLLIDER;

describe("reaction catalog", () => {
  it("conserves charge in every reaction", () => {
    for (const r of REACTIONS) {
      expect(totalCharge(r.products)).toBe(r.beam.charge + r.target.charge);
    }
  });

  it("reproduces the textbook thresholds", () => {
    expect(thresholdKineticEnergy(reactionById("antiproton"), FIXED)).toBeCloseTo(6 * MASS_MEV.PROTON, 6);
    expect(thresholdKineticEnergy(reactionById("pionProduction"), FIXED)).toBeCloseTo(279.65, 1);
    expect(thresholdKineticEnergy(reactionById("photopion"), FIXED)).toBeCloseTo(144.68, 1);
    expect(thresholdKineticEnergy(reactionById("associatedProduction"), FIXED)).toBeCloseTo(767.9, 0);
    // Pair production on a heavy nucleus: 2mₑ(1 + mₑ/M) ≈ 1.022 MeV.
    expect(thresholdKineticEnergy(reactionById("pairProductionNucleus"), FIXED)).toBeCloseTo(1.022, 3);
    // On a free electron the recoil is not negligible: 4mₑ.
    expect(thresholdKineticEnergy(reactionById("tripletProduction"), FIXED)).toBeCloseTo(4 * MASS_MEV.ELECTRON, 9);
  });

  it("shows the collider advantage for e⁺e⁻ → μ⁺μ⁻", () => {
    const r = reactionById("muonPair");
    const fixed = thresholdKineticEnergy(r, FIXED);
    const collider = thresholdKineticEnergy(r, COLLIDER);
    expect(collider).toBeCloseTo(MASS_MEV.MUON - MASS_MEV.ELECTRON, 9);
    expect(fixed / 1000).toBeCloseTo(43.7, 1);
  });

  it("forbids e⁺e⁻ → γ at every energy but always allows e⁺e⁻ → γγ", () => {
    const one = reactionById("annihilationOnePhoton");
    const two = reactionById("annihilationTwoPhotons");
    for (const K of [0, 1, 1000]) {
      expect(verdictFor(one, availableEnergy(one, FIXED, K))).toBe(Verdict.FORBIDDEN);
      expect(verdictFor(two, availableEnergy(two, FIXED, K))).toBe(Verdict.ALLOWED);
    }
    expect(thresholdKineticEnergy(one, FIXED)).toBe(Number.POSITIVE_INFINITY);
  });

  it("switches from below threshold to allowed exactly at threshold", () => {
    const r = reactionById("antiproton");
    const Kth = thresholdKineticEnergy(r, FIXED);
    expect(verdictFor(r, availableEnergy(r, FIXED, Kth * 0.999))).toBe(Verdict.BELOW_THRESHOLD);
    expect(verdictFor(r, availableEnergy(r, FIXED, Kth))).toBe(Verdict.ALLOWED);
  });
});

describe("final states", () => {
  it("puts every product at rest in the CM frame exactly at threshold", () => {
    const masses = [1, 1, 2];
    const state = symmetricFinalState(masses, 4);
    for (const p of state) {
      expect(p.momentumMagnitude).toBeCloseTo(0, 6);
    }
  });

  it("conserves four-momentum from the lab initial state to the lab final state", () => {
    for (const r of REACTIONS) {
      if (r.products.length < 2) {
        continue;
      }
      const K = Math.max(thresholdKineticEnergy(r, FIXED), 10) * 1.7;
      const initial = totalFourMomentum(initialState(r, FIXED, K));
      const final = totalFourMomentum(labFinalState(r, FIXED, K));
      expect(final.energy).toBeCloseTo(initial.energy, 4);
      expect(final.px).toBeCloseTo(initial.px, 4);
      expect(final.py).toBeCloseTo(initial.py, 4);
      expect(final.mass).toBeGreaterThanOrEqual(finalMass(r) - 1e-6);
    }
  });

  it("returns no final state below threshold", () => {
    expect(symmetricFinalState([1, 1], 1.5)).toEqual([]);
  });
});

describe("ThresholdsModel", () => {
  it("is allowed exactly at threshold and below threshold just under it", () => {
    const model = new ThresholdsModel();
    model.goToThreshold();
    expect(model.verdictProperty.value).toBe(Verdict.ALLOWED);
    expect(model.beamKineticEnergyProperty.value).toBeCloseTo(6 * MASS_MEV.PROTON, 6);
    // At threshold every product is at rest in the CM frame...
    for (const p of model.cmProductsProperty.value) {
      expect(p.momentumMagnitude).toBeLessThan(1e-3);
    }
    // ...so in the lab they all move with the CM velocity.
    const cm = model.cmVelocityProperty.value;
    for (const p of model.labProductsProperty.value) {
      expect(p.velocity.x).toBeCloseTo(cm.x, 4);
    }
    model.energyFractionProperty.value *= 0.99;
    expect(model.verdictProperty.value).toBe(Verdict.BELOW_THRESHOLD);
    expect(model.labProductsProperty.value).toEqual([]);
  });

  it("falls back to a fixed target when the reaction has no collider version", () => {
    const model = new ThresholdsModel();
    model.configurationProperty.value = COLLIDER;
    model.reactionIdProperty.value = "photopion";
    expect(model.configurationProperty.value).toBe(FIXED);
  });
});

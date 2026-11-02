/**
 * acceleration.test.ts
 *
 * The Accelerate screen's helpers: run timing, the worked example, and
 * Bertozzi's data computed from his raw flight times.
 */

import { describe, expect, it } from "vitest";
import { AccelerateModel } from "../src/accelerate/model/AccelerateModel.js";
import {
  accelerationSnapshot,
  bertozziPoints,
  newtonianTimeToTravel,
  relativisticBetaSquared,
  relativisticTimeToTravel,
  timeToReachKineticEnergy,
} from "../src/accelerate/model/acceleration.js";
import { MASS_MEV } from "../src/RelativisticDynamicsConstants.js";

const ME = MASS_MEV.ELECTRON;

describe("acceleration helpers", () => {
  it("lands at the end of the track exactly at the run duration", () => {
    const ct = relativisticTimeToTravel(ME, 1, 20);
    const s = accelerationSnapshot(ME, 1, ct);
    expect(s.position).toBeCloseTo(20, 9);
    expect(s.kineticEnergy).toBeCloseTo(20, 9);
  });

  it("has the Newtonian ghost arrive first, faster than light", () => {
    expect(newtonianTimeToTravel(ME, 1, 20)).toBeLessThan(relativisticTimeToTravel(ME, 1, 20));
    // A light pulse needs 20 m of c·t: the real electron arrives after it, Newton's before.
    expect(relativisticTimeToTravel(ME, 1, 20)).toBeGreaterThan(20);
    expect(newtonianTimeToTravel(ME, 1, 20)).toBeLessThan(20);
  });

  it("reaches the chapter's worked example at K = 2 MeV", () => {
    const s = accelerationSnapshot(ME, 1, timeToReachKineticEnergy(ME, 1, 2));
    expect(s.kineticEnergy).toBeCloseTo(2, 9);
    expect(s.momentum).toBeCloseTo(2.458, 3);
    expect(s.beta).toBeCloseTo(0.979, 3);
  });

  it("turns Bertozzi's flight times into speeds", () => {
    const points = bertozziPoints();
    expect(points.map((p) => Number(p.betaSquared.toFixed(3)))).toEqual([0.753, 0.828, 0.921, 0.973, 1.001]);
    // The highest-energy runs agree with relativity to within the experiment's few percent.
    for (const p of points) {
      expect(Math.abs(p.betaSquared - relativisticBetaSquared(ME, p.kineticEnergy))).toBeLessThan(0.07);
    }
  });
});

describe("AccelerateModel", () => {
  it("stops at the end of the track and restarts on play", () => {
    const model = new AccelerateModel();
    model.isPlayingProperty.value = true;
    for (let i = 0; i < 1000; i++) {
      model.step(0.05);
    }
    expect(model.isPlayingProperty.value).toBe(false);
    expect(model.timeProperty.value).toBeCloseTo(model.runDurationProperty.value, 9);
    model.isPlayingProperty.value = true;
    expect(model.timeProperty.value).toBe(0);
  });

  it("jumps to the worked example", () => {
    const model = new AccelerateModel();
    model.particleProperty.value = "proton";
    model.showWorkedExample();
    expect(model.particleProperty.value).toBe("electron");
    expect(model.snapshotProperty.value.kineticEnergy).toBeCloseTo(2, 6);
  });
});

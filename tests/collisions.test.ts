/**
 * collisions.test.ts
 *
 * The Collisions screen: the derivation preset reproduces the chapter's
 * symmetric collision; totals are frame-consistent; the inelastic composite
 * carries √s; viewing from the CM frame zeroes the total momentum.
 */

import { Vector2 } from "scenerystack/dot";
import { describe, expect, it } from "vitest";
import { CollisionsModel } from "../src/collisions/model/CollisionsModel.js";
import { openingAngle, positionAt, solveCollision, totalsOf } from "../src/collisions/model/collisionGeometry.js";
import { gammaOfBeta } from "../src/common/model/kinematics.js";

describe("collision geometry", () => {
  it("returns the derivation's outcome: transverse velocities reverse, x velocities unchanged", () => {
    const model = new CollisionsModel();
    model.applyDerivationPreset();
    const { incoming, outgoing } = model.labStateProperty.value;
    const [a, b] = incoming;
    const [a2, b2] = outgoing;
    expect(a2?.velocity.x).toBeCloseTo(a?.velocity.x ?? Number.NaN, 9);
    expect(a2?.velocity.y).toBeCloseTo(-(a?.velocity.y ?? Number.NaN), 9);
    expect(b2?.velocity.x).toBeCloseTo(0, 9);
    expect(b2?.velocity.y).toBeCloseTo(-(b?.velocity.y ?? Number.NaN), 9);
    expect(a?.velocity.y).toBeCloseTo(-0.3 / gammaOfBeta(0.8), 12);
  });

  it("shows the derivation's mirror image in S′: there A moves straight down", () => {
    const model = new CollisionsModel();
    model.applyDerivationPreset();
    model.frameProperty.value = "moving";
    const [a] = model.viewStateProperty.value.incoming;
    expect(a?.velocity.x).toBeCloseTo(0, 9);
    expect(a?.velocity.y).toBeCloseTo(-0.3, 9);
  });

  it("conserves relativistic totals but not Newton's in the derivation, in both frames", () => {
    const model = new CollisionsModel();
    model.applyDerivationPreset();
    for (const frame of ["lab", "moving", "centerOfMomentum"] as const) {
      model.frameProperty.value = frame;
      const before = model.totalsBeforeProperty.value;
      const after = model.totalsAfterProperty.value;
      expect(after.momentum.x).toBeCloseTo(before.momentum.x, 9);
      expect(after.momentum.y).toBeCloseTo(before.momentum.y, 9);
      expect(after.energy).toBeCloseTo(before.energy, 9);
      if (frame !== "centerOfMomentum") {
        expect(Math.abs(after.newtonianMomentum.y - before.newtonianMomentum.y)).toBeGreaterThan(0.01);
      }
    }
  });

  it("gives zero total momentum in the CM frame", () => {
    const model = new CollisionsModel();
    model.velocity1Property.value = new Vector2(0.7, 0.2);
    model.velocity2Property.value = new Vector2(-0.1, -0.4);
    model.mass2Property.value = 2.5;
    model.frameProperty.value = "centerOfMomentum";
    expect(model.totalsBeforeProperty.value.momentum.magnitude).toBeCloseTo(0, 9);
  });

  it("makes the inelastic composite as heavy as √s, at rest in the head-on preset", () => {
    const model = new CollisionsModel();
    model.applyHeadOnPreset();
    const [composite] = model.labStateProperty.value.outgoing;
    expect(composite?.mass).toBeCloseTo(2.5, 9);
    expect(composite?.velocity.magnitude).toBeCloseTo(0, 9);
    expect(model.invariantMassProperty.value).toBeCloseTo(2.5, 9);
    const before = model.totalsBeforeProperty.value;
    const after = model.totalsAfterProperty.value;
    expect(after.energy).toBeCloseTo(before.energy, 9);
    expect(after.kineticEnergy).toBeCloseTo(0, 9);
    expect(after.restEnergy - before.restEnergy).toBeCloseTo(before.kineticEnergy, 9);
  });

  it("closes the opening angle below 90° for equal masses, target at rest", () => {
    const state = solveCollision(
      { mass: 1, velocity: new Vector2(0.8, 0) },
      { mass: 1, velocity: Vector2.ZERO },
      "elastic",
      Math.PI / 2,
    );
    const angle = openingAngle(state.outgoing) ?? Number.NaN;
    expect(angle).toBeLessThan(Math.PI / 2);
    expect(totalsOf(state.outgoing).energy).toBeCloseTo(totalsOf(state.incoming).energy, 9);
  });

  it("places every body on a straight worldline through the collision event", () => {
    expect(
      positionAt({ mass: 1, velocity: new Vector2(0.5, -0.25) }, -2).equalsEpsilon(new Vector2(-1, 0.5), 1e-12),
    ).toBe(true);
  });
});

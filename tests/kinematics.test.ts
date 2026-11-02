/**
 * kinematics.test.ts
 *
 * Pins the physics core to the worked examples of Modern Physics, Chapter 3
 * (QuadriviumPress/modernPhysics, ch-03-relativistic-dynamics.md), and checks
 * the invariances every screen relies on.
 */

import { Vector2 } from "scenerystack/dot";
import { describe, expect, it } from "vitest";
import {
  betaOfGamma,
  elasticCollision,
  equalMassOpeningAngleProduct,
  FourMomentum,
  gammaOfBeta,
  hyperbolicMotion,
  momentumTotals,
  newtonianBetaOfKineticEnergy,
  particleStateFromBeta,
  particleStateFromKineticEnergy,
  particleStateFromMomentum,
  perfectlyInelasticCollision,
  sqrtSFixedTarget,
  thresholdKineticEnergiesCollider,
  thresholdKineticEnergyFixedTarget,
  totalFourMomentum,
  transformVelocity,
  twoBodyMomentum,
} from "../src/common/model/kinematics.js";
import { MASS_MEV } from "../src/RelativisticDynamicsConstants.js";

const ME = MASS_MEV.ELECTRON;
const MP = MASS_MEV.PROTON;

describe("single-particle relations", () => {
  it("reproduces the electron through 2.00 MV (Ch 3 worked example)", () => {
    const s = particleStateFromKineticEnergy(ME, 2);
    expect(s.energy).toBeCloseTo(2.511, 3);
    expect(s.momentum).toBeCloseTo(2.458, 3);
    expect(s.gamma).toBeCloseTo(4.914, 3);
    expect(s.beta).toBeCloseTo(0.979, 3);
    // The Newtonian answer is the unphysical 2.8c.
    expect(newtonianBetaOfKineticEnergy(ME, 2)).toBeCloseTo(2.8, 1);
  });

  it("gives γ = 1.25 and K = 0.25 mc² at 0.6c (Check Your Understanding 4)", () => {
    const s = particleStateFromBeta(1, 0.6);
    expect(s.gamma).toBeCloseTo(1.25, 12);
    expect(s.kineticEnergy).toBeCloseTo(0.25, 12);
    expect(s.momentum).toBeCloseTo(0.75, 12);
  });

  it("treats a photon as massless: E = pc, β = 1, γ infinite", () => {
    const s = particleStateFromMomentum(0, 3);
    expect(s.energy).toBe(3);
    expect(s.beta).toBe(1);
    expect(s.gamma).toBe(Number.POSITIVE_INFINITY);
  });

  it("round-trips γ and β", () => {
    for (const beta of [0, 0.1, 0.5, 0.9, 0.999]) {
      expect(betaOfGamma(gammaOfBeta(beta))).toBeCloseTo(beta, 10);
    }
  });

  it("satisfies E² = (pc)² + (mc²)² from every starting quantity", () => {
    for (const s of [
      particleStateFromBeta(MP, 0.7),
      particleStateFromKineticEnergy(ME, 13),
      particleStateFromMomentum(105, 40),
    ]) {
      expect(s.energy ** 2).toBeCloseTo(s.momentum ** 2 + s.mass ** 2, 6);
    }
  });
});

describe("four-momentum boosts", () => {
  it("leaves the invariant mass unchanged under any boost", () => {
    const p = FourMomentum.fromMassAndVelocity(MP, 0.6, -0.3);
    for (const [bx, by] of [
      [0.5, 0],
      [-0.9, 0.2],
      [0.1, 0.95],
    ] as const) {
      expect(p.boosted(bx, by).mass).toBeCloseTo(MP, 6);
    }
  });

  it("brings a particle to rest when boosted by its own velocity", () => {
    const p = FourMomentum.fromMassAndVelocity(2, 0.4, 0.5);
    const rest = p.boostedBy(p.velocity);
    expect(rest.energy).toBeCloseTo(2, 10);
    expect(rest.momentumMagnitude).toBeCloseTo(0, 10);
  });

  it("matches the 1D Lorentz transformation E′ = γ(E − βp)", () => {
    const p = FourMomentum.fromMassAndMomentum(1, 2, 0);
    const beta = 0.6;
    const gamma = 1.25;
    const q = p.boosted(beta, 0);
    expect(q.energy).toBeCloseTo(gamma * (p.energy - beta * p.px), 12);
    expect(q.px).toBeCloseTo(gamma * (p.px - beta * p.energy), 12);
  });

  it("composes collinear velocities by the relativistic addition law", () => {
    const u = transformVelocity(new Vector2(0.5, 0), new Vector2(-0.5, 0));
    expect(u.x).toBeCloseTo(0.8, 12);
  });

  it("divides transverse velocity by γ(1 − v uₓ)", () => {
    // A particle moving straight up at w₀ in S, seen from S′ moving at v along x.
    const w0 = 0.3;
    const v = 0.8;
    const u = transformVelocity(new Vector2(0, w0), new Vector2(v, 0));
    expect(u.x).toBeCloseTo(-v, 12);
    expect(u.y).toBeCloseTo(w0 / gammaOfBeta(v), 12);
  });

  it("keeps a photon on the light cone", () => {
    const g = FourMomentum.photon(5, 0.3).boosted(0.7, -0.2);
    expect(g.massSquared).toBeCloseTo(0, 9);
  });
});

describe("collisions", () => {
  it("conserves four-momentum in elastic scattering and keeps the masses", () => {
    const p1 = FourMomentum.fromMassAndVelocity(1, 0.8, 0);
    const p2 = FourMomentum.fromMassAndVelocity(3, -0.2, 0.1);
    const [q1, q2] = elasticCollision(p1, p2, 1.1);
    expect(q1.plus(q2).equalsEpsilon(p1.plus(p2), 1e-10)).toBe(true);
    expect(q1.mass).toBeCloseTo(1, 10);
    expect(q2.mass).toBeCloseTo(3, 10);
  });

  it("closes the equal-mass opening angle: tan θ₁ tan θ₂ = 2/(γ + 1)", () => {
    const beta = 0.9;
    const p1 = FourMomentum.fromMassAndVelocity(1, beta, 0);
    const p2 = new FourMomentum(1, 0, 0);
    for (const angle of [0.4, 1.2, 2.0]) {
      const [q1, q2] = elasticCollision(p1, p2, angle);
      const product = Math.tan(Math.abs(q1.angle)) * Math.tan(Math.abs(q2.angle));
      expect(product).toBeCloseTo(equalMassOpeningAngleProduct(gammaOfBeta(beta)), 9);
      // ...so the opening angle is less than 90°.
      expect(Math.abs(q1.angle) + Math.abs(q2.angle)).toBeLessThan(Math.PI / 2);
    }
  });

  it("recovers the Newtonian 90° opening angle at low speed", () => {
    const [q1, q2] = elasticCollision(FourMomentum.fromMassAndVelocity(1, 0.001, 0), new FourMomentum(1, 0, 0), 1);
    expect(Math.abs(q1.angle) + Math.abs(q2.angle)).toBeCloseTo(Math.PI / 2, 5);
  });

  it("turns kinetic energy into rest mass in a perfectly inelastic collision", () => {
    const p1 = FourMomentum.fromMassAndVelocity(1, 0.6, 0);
    const p2 = FourMomentum.fromMassAndVelocity(1, -0.6, 0);
    const composite = perfectlyInelasticCollision(p1, p2);
    expect(composite.mass).toBeCloseTo(2.5, 12); // 2γm with γ = 1.25
    expect(composite.momentumMagnitude).toBeCloseTo(0, 12);
  });

  it("conserves Σγmu in every frame while Newtonian Σmu fails in boosted frames", () => {
    // The chapter's symmetric collision: B moves straight up at w₀ in S; A moves
    // along x at v with transverse speed w₀/γ(v); both transverse components reverse.
    const w0 = 0.3;
    const v = 0.8;
    const gv = gammaOfBeta(v);
    const before = [
      { mass: 1, velocity: new Vector2(v, -w0 / gv) },
      { mass: 1, velocity: new Vector2(0, w0) },
    ];
    const after = [
      { mass: 1, velocity: new Vector2(v, w0 / gv) },
      { mass: 1, velocity: new Vector2(0, -w0) },
    ];
    for (const frame of [new Vector2(0, 0), new Vector2(v, 0), new Vector2(0.4, 0)]) {
      const view = (bodies: typeof before) =>
        bodies.map((b) => ({ mass: b.mass, velocity: transformVelocity(b.velocity, frame) }));
      const tb = momentumTotals(view(before));
      const ta = momentumTotals(view(after));
      expect(ta.relativistic.y).toBeCloseTo(tb.relativistic.y, 12);
      expect(ta.relativistic.x).toBeCloseTo(tb.relativistic.x, 12);
      expect(ta.energy).toBeCloseTo(tb.energy, 12);
      // In S the Newtonian y-momentum is w₀/γ − w₀ before and its negative after: not conserved.
      expect(Math.abs(ta.newtonian.y - tb.newtonian.y)).toBeGreaterThan(0.01);
    }
  });

  it("computes the CM momentum of a two-body state", () => {
    // Two protons at 0.6c head-on: each has p = γmβ = 0.75 m.
    const sqrtS = totalFourMomentum([
      FourMomentum.fromMassAndVelocity(MP, 0.6, 0),
      FourMomentum.fromMassAndVelocity(MP, -0.6, 0),
    ]).mass;
    expect(twoBodyMomentum(sqrtS, MP, MP)).toBeCloseTo(0.75 * MP, 8);
  });
});

describe("thresholds", () => {
  it("gives K = 6mc² ≈ 5.6 GeV for antiproton production on a fixed target", () => {
    const K = thresholdKineticEnergyFixedTarget(MP, MP, 4 * MP);
    expect(K).toBeCloseTo(6 * MP, 9);
    expect(K / 1000).toBeCloseTo(5.63, 2);
  });

  it("needs only K = mc² per beam in a head-on collider", () => {
    const [k1, k2] = thresholdKineticEnergiesCollider(MP, MP, 4 * MP);
    expect(k1).toBeCloseTo(MP, 9);
    expect(k2).toBeCloseTo(MP, 9);
  });

  it("puts √s exactly at Σm_f at the threshold energy", () => {
    const K = thresholdKineticEnergyFixedTarget(MP, MP, 4 * MP);
    expect(sqrtSFixedTarget(MP, MP + K, MP)).toBeCloseTo(4 * MP, 8);
  });

  it("is zero for an exothermic reaction", () => {
    expect(thresholdKineticEnergyFixedTarget(ME, ME, 0)).toBe(0);
  });
});

describe("constant force", () => {
  it("never lets the relativistic particle reach c, while Newton's passes it", () => {
    const m = ME;
    const F = 1; // MeV per metre
    const late = hyperbolicMotion(m, F, 20);
    expect(late.beta).toBeLessThan(1);
    expect(late.beta).toBeGreaterThan(0.99);
    expect(late.newtonianBeta).toBeGreaterThan(1);
  });

  it("gains kinetic energy F·x in both theories (work–energy theorem)", () => {
    const m = MP;
    const F = 3;
    const t = 500;
    const state = hyperbolicMotion(m, F, t);
    const K = particleStateFromMomentum(m, state.momentum).kineticEnergy;
    expect(K).toBeCloseTo(F * state.position, 8);
    expect(0.5 * m * state.newtonianBeta ** 2).toBeCloseTo(F * state.newtonianPosition, 8);
  });
});

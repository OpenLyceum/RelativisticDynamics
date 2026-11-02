# Model — Relativistic Dynamics

The physics behind each screen, the units, the simplifications, and where the numbers come from.
Every result named here is pinned by a unit test in `tests/`.

## Units and conventions

- **Natural units, c = 1.** Energies and masses in MeV (a "mass" is a rest energy mc²), momenta
  in MeV/c, speeds as β = u/c. The Collisions screen uses arbitrary masses m₀ and energies in
  m₀c², because only ratios matter there.
- **Energy–momentum first.** The core (`src/common/model/kinematics.ts`) stores (E, p) and derives
  β = p/E, because β loses precision near 1 long before E and p do. Speeds from velocity inputs
  are clamped below 1 − 10⁻⁸.
- **A four-momentum is planar,** (E, pₓ, p_y). Boosts may point in any direction in the plane.
- The boost convention matches the SpecialRelativity sim: an event there is (x, ct), a
  four-momentum here is (p, E) in the same roles. SpecialRelativity's `lorentz.ts` clamps β to
  0.99 for diagram legibility, too low for dynamics, so this sim has its own module.

## Core relations (`kinematics.ts`)

| Quantity | Relation |
|---|---|
| Lorentz factor | γ = 1/√(1 − β²) = E/m |
| Momentum, energy | p = γmβ, E = γm, K = E − m = (γ − 1)m |
| Invariant | E² = p² + m² |
| Boost by β along n̂ | E′ = γ(E − β n̂·p), p′∥ = γ(p∥ − βE), p′⊥ = p⊥ |
| Velocity of a system's CM frame | β_cm = Σp / ΣE |
| Invariant mass of a system | √s = √((ΣE)² − (Σp)²) |
| Fixed target (m₂ at rest) | s = m₁² + m₂² + 2E₁m₂ |
| Fixed-target threshold | E₁ = (M² − m₁² − m₂²)/(2m₂), M = Σm_f |
| Head-on collider (equal, opposite p) | √s = E₁ + E₂; threshold E₁ = (M + (m₁² − m₂²)/M)/2 |
| Constant force F from rest | p = Ft; x = (√(m² + (Ft)²) − m)/F (hyperbolic motion) |

## Screens

### Accelerate

A particle of charge e starts from rest in a uniform field ℰ (MV/m), so F = eℰ in MeV per metre
and times come out as c·t in metres (displayed in ns). Both theories agree that p = Ft. Newton
then says u = p/m, which passes c within nanoseconds for an electron; relativity says
u = p/√(p² + m²), which never does. The run ends when the real particle reaches the 20 m mark,
where K = F·L; playback is scaled so every run takes about six seconds.

**Bertozzi's data.** W. Bertozzi, "Speed and kinetic energy of relativistic electrons,"
*Am. J. Phys.* **32**, 551 (1964), Table I: electrons of kinetic energy 0.5, 1.0, 1.5, 4.5 and
15 MeV timed over an 8.4 m flight path at 32.3, 30.8, 29.2, 28.4 and 28.0 ns. The sim stores
these raw values and computes β = L/(c·t), giving v²/c² = 0.753, 0.828, 0.921, 0.973 and 1.001.
The last exceeds 1 within the experiment's few-percent uncertainty and is plotted as measured.

**Worked example** (Ch 3): an electron through 2.00 MV has K = 2.00 MeV, E = 2.511 MeV,
pc = 2.458 MeV, γ = 4.914, β = 0.979, against Newton's unphysical 2.8c.

### Energy–Momentum

One canonical state, x = pc/S, where S = mc² for a massive particle and 1 MeV for a massless
one. In those units every massive particle has the same mass shell E/S = √(x² + 1), so switching
particles keeps β and γ. The "Set" slider is linear in whichever of β, p, K or E is selected; the
others are derived from x. The (pc, E) diagram uses equal axis scales, so the light line sits at
45°, and zooms out in steps (±3, ±6, ±12, ±24) to keep the points on the chart.

The observer moves along the particle's direction at β_obs ∈ [−0.95, 0.95]; the observed
four-momentum is the lab one boosted by β_obs and so stays on the same hyperbola. For a photon the
boost is the relativistic Doppler factor, E′ = E√((1 − β)/(1 + β)).

Limit badges: at rest when β < 10⁻³; ultrarelativistic from γ = 5 (E and pc then differ by under
2 %); massless when m = 0.

### Collisions

Each body has a mass and a lab-frame velocity (|u| ≤ 0.95). The bodies meet at a single event,
placed at the origin of space and time, so every worldline is straight and passes through it, and
a boost (which fixes the origin) only changes velocities. In any frame a body is at v′t′.

- **Elastic:** boost both four-momenta to the CM frame, rotate both by the CM scattering angle
  θ* (they stay equal and opposite), boost back. Masses are unchanged.
- **Perfectly inelastic:** the composite carries the total four-momentum; its mass is √s, which
  exceeds m₁ + m₂ whenever the bodies moved relative to each other.

Before-and-after totals are computed in the viewing frame: Σγmu (x and y), ΣE, Σmc², ΣK, and
Newton's Σmu. The relativistic momentum and energy rows are conserved in every frame; rest and
kinetic energy trade off in a sticking collision; Newton's rows fail in general.

**Presets.**
- *The chapter's derivation:* B moves straight up at w₀ = 0.3 in S; A moves at v = 0.8 along x
  with transverse speed w₀/γ(v); both reverse their transverse motion. The CM angle that does
  this is θ* = −2·atan2(p*_y, p*_x) of A's CM momentum (`transverseReversalAngle`). In S′ (frame
  moving at v) A moves straight down at w₀. Newton's Σmu_y is not conserved in either frame.
- *Target at rest:* equal masses, u₁ = 0.8; lab angles satisfy tan θ₁ tan θ₂ = 2/(γ + 1), so the
  opening angle is 81.8° at θ* = 90°, against Newton's 90°.
- *Head-on, sticking:* equal masses at ±0.6 make one body of mass 2γm = 2.5 at rest.

### Thresholds

| Reaction | Fixed-target threshold | Collider, per beam |
|---|---|---|
| p p → p p p p̄ | K = 6mₚc² = 5.63 GeV | K = mₚc² = 938 MeV |
| p p → p p π⁰ | 279.7 MeV | 67.5 MeV |
| γ p → p π⁰ | 144.7 MeV | (no collider) |
| π⁻ p → K⁰ Λ | 767.9 MeV | (no collider) |
| γ ²⁰⁸Pb → ²⁰⁸Pb e⁺e⁻ | 2mₑ(1 + mₑ/M) ≈ 1.022 MeV | (no collider) |
| γ e⁻ → e⁻ e⁻ e⁺ | 4mₑc² = 2.044 MeV | (no collider) |
| e⁺ e⁻ → μ⁺ μ⁻ | 43.7 GeV | 105.1 MeV |
| e⁺ e⁻ → γ | impossible | impossible |
| e⁺ e⁻ → γ γ | 0 (exothermic) | 0 |

A reaction proceeds when √s ≥ Σm_f c². A single product must have m_f = √s exactly, so
e⁺e⁻ → γ (m = 0 < √s) never happens, which is the chapter's annihilation argument.

The drawn final state is chosen to be readable, not typical: every product gets the same CM
momentum p*, directions equally spaced, with p* fixed by Σ√(p*² + mᵢ²) = √s (bisection). At
threshold p* = 0: all products at rest in the CM frame, moving together at β_cm in the lab. The
"kinetic energy of the CM motion" readout is E_lab − √s, the part of the supplied energy that
cannot make particles.

The beam slider spans 0 to 3 × threshold (10 beam rest energies, or 10 MeV for a photon beam, when
there is no positive threshold), stored as a fraction so the slider keeps its meaning across
reactions.

## Data

Rest energies from the Particle Data Group, *Review of Particle Physics* (2024): e, μ, π±, π⁰,
K⁰, p, Λ. The ²⁰⁸Pb nucleus is its atomic mass (207.976 652 1 u × 931.494 102 42 MeV/u) less 82
electron masses; electron binding (≈ 0.8 MeV) is far below anything the sim resolves.

## Simplifications

- Point particles meeting at one event; no force law, no impact parameter, no cross sections.
- One spatial dimension for the Accelerate and Energy–Momentum screens, two for collisions;
  observers and the moving frame boost along x only (the CM frame may move in any direction).
- Threshold final states are symmetric representatives, not samples of phase space.
- Radiation by the accelerated charge is ignored.

## References

- Modern Physics (QuadriviumPress), Chapter 3, *Relativistic Dynamics*: worked examples on
  p = γmu, the 2.00 MV electron, the antiproton threshold, and the derivation of relativistic
  momentum from a symmetric collision.
- W. Bertozzi, *Am. J. Phys.* **32**, 551 (1964).
- R. Hagedorn, *Relativistic Kinematics* (Benjamin, 1963): two-body kinematics and thresholds.
- Particle Data Group, *Review of Particle Physics*, Phys. Rev. D **110**, 030001 (2024).

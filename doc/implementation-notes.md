# Implementation notes — Relativistic Dynamics

How the code is put together and why. Physics and data: [`model.md`](model.md).

## Layout

```
src/
  common/
    model/kinematics.ts        pure relativistic dynamics (no SceneryStack except Vector2)
    model/particles.ts         particle table: rest energy, charge, symbol
    view/ChartFrameNode.ts     bamboo chart frame shared by every chart
    view/chartUtils.ts         nice tick steps, energy/β/significant-figure formatting
    view/controlHelpers.ts     themed NumberControl, radio group, checkbox, push button, readout row
    RelativisticDynamicsScreenIcons.ts
  accelerate/       model/acceleration.ts (pure), AccelerateModel; Track, Charts, ScreenView
  energy-momentum/  EnergyMomentumModel; Triangle, Diagram, Readout, Controls, ScreenView
  collisions/       model/collisionGeometry.ts (pure), CollisionsModel; PlayArea, ConservationPanel,
                    MomentumDiagram, VelocityPad, ScreenView
  thresholds/       model/reactions.ts (pure catalog + kinematics), ThresholdsModel; ReactionFrame,
                    AvailableEnergy (meter + readouts), AvailableEnergyChart, ScreenView
  preferences/      showNewton preference (?hideNewton)
```

## Principles

- **Pure physics, thin models.** Every formula lives in a pure module (`kinematics.ts`,
  `acceleration.ts`, `collisionGeometry.ts`, `reactions.ts`) that the tests exercise directly.
  Screen models hold only the user's inputs as Properties and derive everything else with
  DerivedProperty, so there is no state to fall out of sync.
- **No integrators.** Every motion is closed-form: hyperbolic motion on the Accelerate screen,
  straight worldlines through one collision event on the Collisions screen. Changing a parameter
  or a frame mid-run therefore never accumulates error and never jumps.
- **Energy–momentum, not velocity, is canonical.** β is derived (p/E). The Energy–Momentum screen
  stores x = pc/S; the Thresholds screen stores the beam energy as a fraction of its slider range.
- **Views live as long as their screen.** Nothing is created at runtime, so most nodes never
  dispose. The two that do implement `dispose()` (`EnergyMomentumDiagramNode`,
  `EnergyMomentumReadoutNode`) dispose their whole subtree, because child Texts listen to
  localized strings; the memory-leak suite builds them against one shared model to prove it.

## Things that bit

- **Bamboo tick sets and big range changes.** `ChartFrameNode.setRanges` parks every grid, tick and
  label spacing at a huge value before changing the chart ranges, then sets the new spacing. Without
  that, a range jumping from 1 MeV to 17 GeV is briefly drawn with the old spacing, creating tens
  of thousands of tick labels, which tripped scenery's RendererSummary audit.
- **Updating a focused node's PDOM content drops focus.** The velocity pads first rewrote the
  handle's `accessibleParagraph` on every drag step; keyboard focus was lost after one arrow
  press. The value is now announced with `addAccessibleObjectResponse` when the drag ends.
- **DerivedProperty takes at most 15 dependencies.** The Thresholds summary and title, which
  depend on every reaction name, use `DerivedProperty.deriveAny` and read `.value`s.
- **`erasableSyntaxOnly`** forbids constructor parameter properties; declare fields explicitly.

## Layout decisions

- Every screen keeps its controls in a right-hand column of `CONTROL_WIDTH + 24` panels with
  Reset All beneath; the play area and charts fill the left.
- The (pc, E) diagram and the Collisions play area use equal model-to-pixel scales on both axes,
  so light lines are at 45° and velocity directions are true.
- Narrow NumberControls (mass controls under the velocity pads) switch to layout function 3,
  title on its own row, via the `width` option of `createNumberControl`.

## Accessibility

Standard fleet pattern: every screen has a live `*ScreenSummaryContent` (values rounded to three
significant figures so it changes in readable steps), an explicit `pdomOrder` ending in Reset All,
and a `*KeyboardHelpContent` listing the sections the screen uses (basic actions, sliders, time
controls, and draggable items on Collisions). The Set and beam sliders run over a fraction and
report the physical value through `pdomCreateAriaValueText`.

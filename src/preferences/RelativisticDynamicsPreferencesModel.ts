/**
 * RelativisticDynamicsPreferencesModel.ts
 *
 * Simulation-wide preferences, shown in Preferences → Simulation and shared by
 * every screen.
 */

import { BooleanProperty } from "scenerystack/axon";
import type { Tandem } from "scenerystack/tandem";
import RelativisticDynamicsNamespace from "../RelativisticDynamicsNamespace.js";
import relativisticDynamicsQueryParameters from "./relativisticDynamicsQueryParameters.js";

export class RelativisticDynamicsPreferencesModel {
  /**
   * Whether Newton's predictions are drawn beside relativity's on the Accelerate and
   * Energy–Momentum screens. (The Collisions screen has its own Σmu toggle, because
   * there the comparison is the lesson rather than a backdrop.)
   */
  public readonly showNewtonProperty: BooleanProperty;

  public constructor(tandem?: Tandem) {
    this.showNewtonProperty = new BooleanProperty(
      !relativisticDynamicsQueryParameters.hideNewton,
      tandem ? { tandem: tandem.createTandem("showNewtonProperty") } : undefined,
    );
  }

  public reset(): void {
    this.showNewtonProperty.reset();
  }
}

RelativisticDynamicsNamespace.register("RelativisticDynamicsPreferencesModel", RelativisticDynamicsPreferencesModel);

/**
 * EnergyMomentumScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createEnergyMomentumIcon() in src/common/RelativisticDynamicsScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createEnergyMomentumIcon } from "../common/RelativisticDynamicsScreenIcons.js";
import RelativisticDynamicsColors from "../RelativisticDynamicsColors.js";
import { EnergyMomentumModel } from "./model/EnergyMomentumModel.js";
import { EnergyMomentumKeyboardHelpContent } from "./view/EnergyMomentumKeyboardHelpContent.js";
import { EnergyMomentumScreenView } from "./view/EnergyMomentumScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type EnergyMomentumScreenOptions = ScreenOptions & { tandem: Tandem };

export class EnergyMomentumScreen extends Screen<EnergyMomentumModel, EnergyMomentumScreenView> {
  public constructor(options: EnergyMomentumScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new EnergyMomentumModel(),
      // View factory — receives the model instance
      (model) =>
        new EnergyMomentumScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<EnergyMomentumScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: RelativisticDynamicsColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new EnergyMomentumKeyboardHelpContent(),
          homeScreenIcon: createEnergyMomentumIcon(),
          navigationBarIcon: createEnergyMomentumIcon(),
        },
        options,
      ),
    );
  }
}

/**
 * ThresholdsScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createThresholdsIcon() in src/common/RelativisticDynamicsScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createThresholdsIcon } from "../common/RelativisticDynamicsScreenIcons.js";
import RelativisticDynamicsColors from "../RelativisticDynamicsColors.js";
import { ThresholdsModel } from "./model/ThresholdsModel.js";
import { ThresholdsKeyboardHelpContent } from "./view/ThresholdsKeyboardHelpContent.js";
import { ThresholdsScreenView } from "./view/ThresholdsScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type ThresholdsScreenOptions = ScreenOptions & { tandem: Tandem };

export class ThresholdsScreen extends Screen<ThresholdsModel, ThresholdsScreenView> {
  public constructor(options: ThresholdsScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new ThresholdsModel(),
      // View factory — receives the model instance
      (model) =>
        new ThresholdsScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<ThresholdsScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: RelativisticDynamicsColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new ThresholdsKeyboardHelpContent(),
          homeScreenIcon: createThresholdsIcon(),
          navigationBarIcon: createThresholdsIcon(),
        },
        options,
      ),
    );
  }
}

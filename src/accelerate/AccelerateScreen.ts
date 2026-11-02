/**
 * AccelerateScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createAccelerateIcon() in src/common/RelativisticDynamicsScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createAccelerateIcon } from "../common/RelativisticDynamicsScreenIcons.js";
import type { RelativisticDynamicsPreferencesModel } from "../preferences/RelativisticDynamicsPreferencesModel.js";
import RelativisticDynamicsColors from "../RelativisticDynamicsColors.js";
import { AccelerateModel } from "./model/AccelerateModel.js";
import { AccelerateKeyboardHelpContent } from "./view/AccelerateKeyboardHelpContent.js";
import { AccelerateScreenView } from "./view/AccelerateScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type AccelerateScreenOptions = ScreenOptions & { tandem: Tandem };

export class AccelerateScreen extends Screen<AccelerateModel, AccelerateScreenView> {
  public constructor(preferences: RelativisticDynamicsPreferencesModel, options: AccelerateScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new AccelerateModel(),
      // View factory — receives the model instance
      (model) =>
        new AccelerateScreenView(model, preferences, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<AccelerateScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: RelativisticDynamicsColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new AccelerateKeyboardHelpContent(),
          homeScreenIcon: createAccelerateIcon(),
          navigationBarIcon: createAccelerateIcon(),
        },
        options,
      ),
    );
  }
}

/**
 * CollisionsScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createCollisionsIcon() in src/common/RelativisticDynamicsScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createCollisionsIcon } from "../common/RelativisticDynamicsScreenIcons.js";
import RelativisticDynamicsColors from "../RelativisticDynamicsColors.js";
import { CollisionsModel } from "./model/CollisionsModel.js";
import { CollisionsKeyboardHelpContent } from "./view/CollisionsKeyboardHelpContent.js";
import { CollisionsScreenView } from "./view/CollisionsScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type CollisionsScreenOptions = ScreenOptions & { tandem: Tandem };

export class CollisionsScreen extends Screen<CollisionsModel, CollisionsScreenView> {
  public constructor(options: CollisionsScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new CollisionsModel(),
      // View factory — receives the model instance
      (model) =>
        new CollisionsScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<CollisionsScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: RelativisticDynamicsColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new CollisionsKeyboardHelpContent(),
          homeScreenIcon: createCollisionsIcon(),
          navigationBarIcon: createCollisionsIcon(),
        },
        options,
      ),
    );
  }
}

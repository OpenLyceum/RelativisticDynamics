/**
 * EnergyMomentumKeyboardHelpContent.ts
 *
 * Keyboard-help dialog for the Energy–Momentum screen: radio-button groups and
 * buttons (basic actions) on the left, the "Set" slider and the observer and
 * custom-mass number controls (slider controls) on the right.
 */

import {
  BasicActionsKeyboardHelpSection,
  SliderControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";

export class EnergyMomentumKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    super(
      [new BasicActionsKeyboardHelpSection({ withCheckboxContent: true })],
      [new SliderControlsKeyboardHelpSection()],
    );
  }
}

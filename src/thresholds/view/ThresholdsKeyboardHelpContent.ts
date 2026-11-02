/**
 * ThresholdsKeyboardHelpContent.ts
 *
 * Keyboard-help dialog for the Thresholds screen: radio groups and buttons
 * (basic actions) on the left, the beam-energy slider on the right.
 */

import {
  BasicActionsKeyboardHelpSection,
  SliderControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";

export class ThresholdsKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    super([new BasicActionsKeyboardHelpSection()], [new SliderControlsKeyboardHelpSection()]);
  }
}

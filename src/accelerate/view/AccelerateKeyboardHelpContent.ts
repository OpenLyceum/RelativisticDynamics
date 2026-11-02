/**
 * AccelerateKeyboardHelpContent.ts
 *
 * Keyboard-help dialog for the Accelerate screen: buttons, radio groups and the
 * Bertozzi checkbox (basic actions) on the left; the field control (slider
 * controls) and play/pause (time controls) on the right.
 */

import {
  BasicActionsKeyboardHelpSection,
  SliderControlsKeyboardHelpSection,
  TimeControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";

export class AccelerateKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    super(
      [new BasicActionsKeyboardHelpSection({ withCheckboxContent: true })],
      [new SliderControlsKeyboardHelpSection(), new TimeControlsKeyboardHelpSection()],
    );
  }
}

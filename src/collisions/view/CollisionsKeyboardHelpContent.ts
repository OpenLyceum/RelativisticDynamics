/**
 * CollisionsKeyboardHelpContent.ts
 *
 * Keyboard-help dialog for the Collisions screen: moving the velocity handles
 * and the basic actions on the left; sliders and time controls on the right.
 */

import {
  BasicActionsKeyboardHelpSection,
  MoveDraggableItemsKeyboardHelpSection,
  SliderControlsKeyboardHelpSection,
  TimeControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";

export class CollisionsKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    super(
      [new MoveDraggableItemsKeyboardHelpSection(), new BasicActionsKeyboardHelpSection({ withCheckboxContent: true })],
      [new SliderControlsKeyboardHelpSection(), new TimeControlsKeyboardHelpSection()],
    );
  }
}

/**
 * RelativisticDynamicsPanel.ts
 *
 * A pre-themed Panel that automatically uses RelativisticDynamicsColors for background and
 * border. Use this for all control panels and info boxes in the sim so that
 * default / projector mode switching is handled automatically.
 *
 * ── Basic usage ───────────────────────────────────────────────────────────────
 *
 *   import { RelativisticDynamicsPanel } from "../../common/RelativisticDynamicsPanel.js";
 *   import { VBox, Text } from "scenerystack/scenery";
 *
 *   const content = new VBox({
 *     children: [ new Text("label"), slider ],
 *     spacing: 8,
 *   });
 *   const panel = new RelativisticDynamicsPanel(content);
 *
 * ── Overriding defaults ───────────────────────────────────────────────────────
 *
 *   // Wider margins, sharper corners, custom stroke
 *   const panel = new RelativisticDynamicsPanel(content, { xMargin: 20, cornerRadius: 0 });
 *
 *   // Transparent background (decorative border only)
 *   const panel = new RelativisticDynamicsPanel(content, { fill: "transparent" });
 */

import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { Node } from "scenerystack/scenery";
import { Panel, type PanelOptions } from "scenerystack/sun";
import RelativisticDynamicsColors from "../RelativisticDynamicsColors.js";
import { PANEL_CORNER_RADIUS } from "../RelativisticDynamicsConstants.js";

export type RelativisticDynamicsPanelOptions = PanelOptions;

export class RelativisticDynamicsPanel extends Panel {
  public constructor(content: Node, providedOptions?: RelativisticDynamicsPanelOptions) {
    const options = optionize<RelativisticDynamicsPanelOptions, EmptySelfOptions, PanelOptions>()(
      {
        fill: RelativisticDynamicsColors.panelBackgroundColorProperty,
        stroke: RelativisticDynamicsColors.panelBorderColorProperty,
        cornerRadius: PANEL_CORNER_RADIUS,
        xMargin: 12,
        yMargin: 10,
      },
      providedOptions,
    );
    super(content, options);
  }
}

/**
 * EnergyMomentumScreenView.ts
 *
 * Layout for the Energy–Momentum screen:
 *
 *   left    the energy–momentum triangle, the energy bar, the limit badges, the observer
 *   centre  the (pc, E) diagram and the readout table
 *   right   particle and "Set" panels, Reset All
 */

import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { Node } from "scenerystack/scenery";
import { ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { FLAT_RESET_ALL_BUTTON_OPTIONS } from "../../common/RelativisticDynamicsButtonOptions.js";
import { SCREEN_VIEW_MARGIN } from "../../RelativisticDynamicsConstants.js";
import type { EnergyMomentumModel } from "../model/EnergyMomentumModel.js";
import { EnergyMomentumControls } from "./EnergyMomentumControls.js";
import { EnergyMomentumDiagramNode } from "./EnergyMomentumDiagramNode.js";
import { EnergyMomentumReadoutNode } from "./EnergyMomentumReadoutNode.js";
import { EnergyMomentumScreenSummaryContent } from "./EnergyMomentumScreenSummaryContent.js";
import { EnergyTriangleNode } from "./EnergyTriangleNode.js";

export type EnergyMomentumScreenViewOptions = ScreenViewOptions;

/** Left edge of the diagram's plotting area; its axis labels hang to the left of it. */
const DIAGRAM_LEFT = 305;

export class EnergyMomentumScreenView extends ScreenView {
  public constructor(model: EnergyMomentumModel, providedOptions?: EnergyMomentumScreenViewOptions) {
    const options = optionize<EnergyMomentumScreenViewOptions, EmptySelfOptions, ScreenViewOptions>()(
      {
        screenSummaryContent: new EnergyMomentumScreenSummaryContent(model),
      },
      providedOptions,
    );
    super(options);

    const bounds = this.layoutBounds;

    const triangle = new EnergyTriangleNode(model);
    triangle.left = bounds.minX + SCREEN_VIEW_MARGIN;
    triangle.top = bounds.minY + SCREEN_VIEW_MARGIN;

    const diagram = new EnergyMomentumDiagramNode(model);
    diagram.x = DIAGRAM_LEFT;
    diagram.top = bounds.minY + SCREEN_VIEW_MARGIN;

    const readout = new EnergyMomentumReadoutNode(model);
    readout.centerX = DIAGRAM_LEFT + diagram.width / 2 - 20;
    readout.top = diagram.bottom + 14;

    const controls = new EnergyMomentumControls(model);
    controls.particlePanel.right = bounds.maxX - SCREEN_VIEW_MARGIN;
    controls.particlePanel.top = bounds.minY + SCREEN_VIEW_MARGIN;
    controls.setPanel.right = controls.particlePanel.right;
    controls.particlePanel.boundsProperty.link((b) => {
      controls.setPanel.top = b.bottom + 10;
    });
    controls.observerPanel.left = triangle.left;
    controls.observerPanel.bottom = bounds.maxY - SCREEN_VIEW_MARGIN;

    const resetAllButton = new ResetAllButton({
      ...FLAT_RESET_ALL_BUTTON_OPTIONS,
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
      },
      right: bounds.maxX - SCREEN_VIEW_MARGIN,
      bottom: bounds.maxY - SCREEN_VIEW_MARGIN,
    });

    this.children = [
      triangle,
      diagram,
      readout,
      controls.particlePanel,
      controls.setPanel,
      controls.observerPanel,
      resetAllButton,
      new Node({ pdomOrder: [...controls.traversalOrder, resetAllButton] }),
    ];
  }
}

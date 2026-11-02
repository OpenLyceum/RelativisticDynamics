/**
 * AccelerateScreenSummaryContent.ts
 *
 * Screen summary for the Accelerate screen. "Current details" is live but coarse
 * (three significant figures), so it changes in readable steps while a run plays.
 */

import { DerivedProperty } from "scenerystack/axon";
import { StringUtils } from "scenerystack/phetcommon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { formatBeta, formatEnergy, formatSignificant } from "../../common/view/chartUtils.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { AccelerateModel } from "../model/AccelerateModel.js";

export class AccelerateScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: AccelerateModel) {
    const sm = StringManager.getInstance();
    const a11y = sm.getAccelerateA11yStrings();
    const particles = sm.getCommonStrings().particles;

    const currentDetailsProperty = new DerivedProperty(
      [
        model.particleProperty,
        model.timeProperty,
        model.snapshotProperty,
        a11y.currentDetailsPatternStringProperty,
        a11y.currentDetailsAtStartStringProperty,
        particles.electronStringProperty,
        particles.protonStringProperty,
      ],
      (particle, time, snapshot, pattern, atStart, electron, proton) => {
        const name = (particle === "electron" ? electron : proton).toLowerCase();
        if (time === 0) {
          return StringUtils.fillIn(atStart, { particle: name });
        }
        return StringUtils.fillIn(pattern, {
          time: `${formatSignificant(time, 3)} ns`,
          particle: name,
          distance: `${formatSignificant(snapshot.position, 3)} m`,
          kinetic: formatEnergy(snapshot.kineticEnergy, 3),
          speed: `${formatBeta(snapshot.beta)} c`,
          newtonSpeed: `${formatSignificant(snapshot.newtonianBeta, 3)} c`,
        });
      },
    );

    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: currentDetailsProperty,
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}

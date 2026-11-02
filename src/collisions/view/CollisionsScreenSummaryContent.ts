/**
 * CollisionsScreenSummaryContent.ts
 *
 * Screen summary for the Collisions screen. "Current details" states the viewing
 * frame, the relativistic totals before and after, and the invariant mass, plus
 * Newton's momentum when it is shown, so a screen-reader user can make the same
 * before/after comparison the bars make.
 */

import { DerivedProperty } from "scenerystack/axon";
import { StringUtils } from "scenerystack/phetcommon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { formatSignificant } from "../../common/view/chartUtils.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { CollisionsModel } from "../model/CollisionsModel.js";

const f = (value: number): string => formatSignificant(Math.abs(value) < 1e-9 ? 0 : value, 3);

export class CollisionsScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: CollisionsModel) {
    const sm = StringManager.getInstance();
    const a11y = sm.getCollisionsA11yStrings();
    const frames = sm.getCollisionsStrings().frames;

    const currentDetailsProperty = new DerivedProperty(
      [
        model.frameProperty,
        model.totalsBeforeProperty,
        model.totalsAfterProperty,
        model.invariantMassProperty,
        model.showNewtonProperty,
        a11y.currentDetailsPatternStringProperty,
        a11y.newtonDetailsPatternStringProperty,
        frames.labStringProperty,
        frames.centerOfMomentumStringProperty,
        frames.movingStringProperty,
      ],
      (frame, before, after, sqrtS, showNewton, pattern, newtonPattern, lab, cm, moving) => {
        const frameName = (frame === "lab" ? lab : frame === "centerOfMomentum" ? cm : moving).toLowerCase();
        const text = StringUtils.fillIn(pattern, {
          frame: frameName,
          px: f(before.momentum.x),
          py: f(before.momentum.y),
          energy: f(before.energy),
          pxAfter: f(after.momentum.x),
          pyAfter: f(after.momentum.y),
          energyAfter: f(after.energy),
          sqrtS: f(sqrtS),
        });
        if (!showNewton) {
          return text;
        }
        return `${text} ${StringUtils.fillIn(newtonPattern, {
          nx: f(before.newtonianMomentum.x),
          ny: f(before.newtonianMomentum.y),
          nxAfter: f(after.newtonianMomentum.x),
          nyAfter: f(after.newtonianMomentum.y),
        })}`;
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

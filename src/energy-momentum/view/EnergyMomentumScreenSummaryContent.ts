/**
 * EnergyMomentumScreenSummaryContent.ts
 *
 * The screen summary for screen readers. "Current details" is live: it states
 * the particle's momentum, kinetic and total energy, speed and invariant mass,
 * and, when the observer is moving, what the observer measures. Values are
 * rounded to three significant figures so the paragraph does not churn on every
 * slider step.
 */

import { DerivedProperty } from "scenerystack/axon";
import { StringUtils } from "scenerystack/phetcommon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { formatBeta, formatEnergy } from "../../common/view/chartUtils.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { EnergyMomentumModel, ParticleChoice } from "../model/EnergyMomentumModel.js";

export class EnergyMomentumScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: EnergyMomentumModel) {
    const sm = StringManager.getInstance();
    const a11y = sm.getEnergyMomentumA11yStrings();
    const particles = sm.getCommonStrings().particles;
    const names: Record<ParticleChoice, typeof particles.electronStringProperty> = {
      electron: particles.electronStringProperty,
      muon: particles.muonStringProperty,
      pion: particles.pionStringProperty,
      proton: particles.protonStringProperty,
      photon: particles.photonStringProperty,
      custom: particles.customStringProperty,
    };

    const currentDetailsProperty = new DerivedProperty(
      [
        model.particleProperty,
        model.labStateProperty,
        model.frameStateProperty,
        model.frameMomentumProperty,
        model.frameBetaProperty,
        a11y.currentDetailsPatternStringProperty,
        a11y.frameDetailsPatternStringProperty,
        particles.electronStringProperty,
        particles.muonStringProperty,
        particles.pionStringProperty,
        particles.protonStringProperty,
        particles.photonStringProperty,
        particles.customStringProperty,
      ],
      (particle, lab, frame, frameMomentum, frameBeta, pattern, framePattern) => {
        const labText = StringUtils.fillIn(pattern, {
          particle: names[particle].value,
          momentum: formatEnergy(lab.momentum, 3, "/c"),
          kinetic: formatEnergy(lab.kineticEnergy, 3),
          energy: formatEnergy(lab.energy, 3),
          speed: `${formatBeta(lab.beta)} c`,
          mass: formatEnergy(lab.mass, 3, "/c²"),
        });
        if (frameBeta === 0) {
          return labText;
        }
        const frameText = StringUtils.fillIn(framePattern, {
          frameSpeed: `${formatBeta(Math.abs(frameBeta))} c`,
          energy: formatEnergy(frame.energy, 3),
          momentum: formatEnergy(frameMomentum.px, 3, "/c"),
        });
        return `${labText} ${frameText}`;
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

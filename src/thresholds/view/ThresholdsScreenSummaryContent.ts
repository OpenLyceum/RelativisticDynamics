/**
 * ThresholdsScreenSummaryContent.ts
 *
 * Screen summary for the Thresholds screen. "Current details" names the reaction
 * and the accelerator type, gives the beam energy against the threshold and √s
 * against the products' rest energy, and states the verdict.
 */

import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { StringUtils } from "scenerystack/phetcommon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { formatEnergy } from "../../common/view/chartUtils.js";
import { StringManager } from "../../i18n/StringManager.js";
import { BeamConfiguration, type ReactionId, Verdict } from "../model/reactions.js";
import type { ThresholdsModel } from "../model/ThresholdsModel.js";

export class ThresholdsScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: ThresholdsModel) {
    const sm = StringManager.getInstance();
    const a11y = sm.getThresholdsA11yStrings();
    const strings = sm.getThresholdsStrings();
    const names = strings.reactionNames;

    const reactionNames: Record<ReactionId, TReadOnlyProperty<string>> = {
      antiproton: names.antiprotonStringProperty,
      pionProduction: names.pionProductionStringProperty,
      photopion: names.photopionStringProperty,
      associatedProduction: names.associatedProductionStringProperty,
      pairProductionNucleus: names.pairProductionNucleusStringProperty,
      tripletProduction: names.tripletProductionStringProperty,
      muonPair: names.muonPairStringProperty,
      annihilationOnePhoton: names.annihilationOnePhotonStringProperty,
      annihilationTwoPhotons: names.annihilationTwoPhotonsStringProperty,
    };
    const verdicts = a11y.verdicts;
    const configurations = strings.configurations;

    // More dependencies than DerivedProperty's typed form allows, so derive from `.value`s.
    const currentDetailsProperty = DerivedProperty.deriveAny(
      [
        model.reactionProperty,
        model.configurationProperty,
        model.beamKineticEnergyProperty,
        model.thresholdProperty,
        model.sqrtSProperty,
        model.finalMassProperty,
        model.verdictProperty,
        a11y.currentDetailsPatternStringProperty,
        verdicts.allowedStringProperty,
        verdicts.belowThresholdStringProperty,
        verdicts.forbiddenStringProperty,
        configurations.fixedTargetStringProperty,
        configurations.colliderStringProperty,
        strings.infinityStringProperty,
        ...Object.values(reactionNames),
      ],
      () => {
        const verdict = model.verdictProperty.value;
        const threshold = model.thresholdProperty.value;
        const verdictText = (
          verdict === Verdict.ALLOWED
            ? verdicts.allowedStringProperty
            : verdict === Verdict.FORBIDDEN
              ? verdicts.forbiddenStringProperty
              : verdicts.belowThresholdStringProperty
        ).value;
        const configuration =
          model.configurationProperty.value === BeamConfiguration.COLLIDER
            ? configurations.colliderStringProperty.value
            : configurations.fixedTargetStringProperty.value;
        return StringUtils.fillIn(a11y.currentDetailsPatternStringProperty.value, {
          reaction: reactionNames[model.reactionProperty.value.id].value,
          configuration: configuration.toLowerCase(),
          beam: formatEnergy(model.beamKineticEnergyProperty.value, 3),
          threshold: Number.isFinite(threshold) ? formatEnergy(threshold, 3) : strings.infinityStringProperty.value,
          sqrtS: formatEnergy(model.sqrtSProperty.value, 3),
          finalMass: formatEnergy(model.finalMassProperty.value, 3),
          verdict: verdictText,
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

/**
 * ThresholdsScreenView.ts
 *
 * Layout for the Thresholds screen:
 *
 *   top     the reaction's name; the reaction before and after in the lab and CM frames
 *   bottom  the √s meter and readouts; √s against energy supplied
 *   right   reaction, fixed target or collider, beam energy; Reset All
 */

import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { Dimension2, Range, Vector2 } from "scenerystack/dot";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { Node, Text, VBox } from "scenerystack/scenery";
import { ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { HSlider } from "scenerystack/sun";
import { FLAT_RESET_ALL_BUTTON_OPTIONS } from "../../common/RelativisticDynamicsButtonOptions.js";
import { RelativisticDynamicsPanel } from "../../common/RelativisticDynamicsPanel.js";
import { formatEnergy } from "../../common/view/chartUtils.js";
import { createPushButton, createRadioButtonGroup, createSectionHeader } from "../../common/view/controlHelpers.js";
import { StringManager } from "../../i18n/StringManager.js";
import RelativisticDynamicsColors from "../../RelativisticDynamicsColors.js";
import { CONTROL_WIDTH, FONTS, SCREEN_VIEW_MARGIN } from "../../RelativisticDynamicsConstants.js";
import { BeamConfiguration, REACTIONS, type Reaction, type ReactionId } from "../model/reactions.js";
import type { ThresholdsModel } from "../model/ThresholdsModel.js";
import { AvailableEnergyChartNode } from "./AvailableEnergyChartNode.js";
import { AvailableEnergyNode } from "./AvailableEnergyNode.js";
import { REACTION_FRAME_WIDTH, ReactionFrameNode } from "./ReactionFrameNode.js";
import { ThresholdsScreenSummaryContent } from "./ThresholdsScreenSummaryContent.js";

export type ThresholdsScreenViewOptions = ScreenViewOptions;

/** The reaction written out in particle symbols, e.g. "p + p → p + p + p + p̄". Notation, not translated. */
export const reactionEquation = (r: Reaction): string =>
  `${r.beam.symbol} + ${r.target.symbol} → ${r.products.map((p) => p.symbol).join(" + ")}`;

export class ThresholdsScreenView extends ScreenView {
  public constructor(model: ThresholdsModel, providedOptions?: ThresholdsScreenViewOptions) {
    const options = optionize<ThresholdsScreenViewOptions, EmptySelfOptions, ScreenViewOptions>()(
      { screenSummaryContent: new ThresholdsScreenSummaryContent(model) },
      providedOptions,
    );
    super(options);

    const bounds = this.layoutBounds;
    const sm = StringManager.getInstance();
    const strings = sm.getThresholdsStrings();
    const a11y = sm.getThresholdsA11yStrings().controls;
    const names = strings.reactionNames;
    const nameOf: Record<ReactionId, TReadOnlyProperty<string>> = {
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

    // ── Title: name and equation of the current reaction ────────────────────────
    const titleProperty = DerivedProperty.deriveAny(
      [model.reactionProperty, ...Object.values(nameOf)],
      () => `${nameOf[model.reactionProperty.value.id].value}:   ${reactionEquation(model.reactionProperty.value)}`,
    );
    const title = new Text(titleProperty, {
      font: FONTS.BIG_LABEL,
      fill: RelativisticDynamicsColors.textColorProperty,
      maxWidth: 2 * REACTION_FRAME_WIDTH + 16,
      left: bounds.minX + SCREEN_VIEW_MARGIN,
      top: bounds.minY + SCREEN_VIEW_MARGIN,
    });

    // ── The reaction in the lab and in the CM frame ────────────────────────────
    const labFrame = new ReactionFrameNode(
      model,
      strings.labFrameStringProperty,
      new DerivedProperty([model.reactionProperty], () => Vector2.ZERO),
      model.labProductsProperty,
    );
    const cmFrame = new ReactionFrameNode(
      model,
      strings.cmFrameStringProperty,
      model.cmVelocityProperty,
      model.cmProductsProperty,
    );
    labFrame.left = title.left;
    labFrame.top = title.bottom + 10;
    cmFrame.left = labFrame.right + 16;
    cmFrame.top = labFrame.top;

    // ── Meter and chart ────────────────────────────────────────────────────────
    const meter = new AvailableEnergyNode(model);
    meter.left = labFrame.left;
    meter.top = labFrame.bottom + 18;
    const chart = new AvailableEnergyChartNode(model);
    chart.left = cmFrame.left + 42;
    chart.top = labFrame.bottom + 18;

    // ── Controls ───────────────────────────────────────────────────────────────
    const reactionRadio = createRadioButtonGroup(
      model.reactionIdProperty,
      REACTIONS.map((r) => ({
        value: r.id,
        labelProperty: new DerivedProperty([nameOf[r.id]], () => reactionEquation(r)),
        accessibleName: nameOf[r.id],
      })),
      { accessibleName: a11y.reactionStringProperty, accessibleHelpText: a11y.reactionHelpStringProperty },
    );
    const reactionPanel = new RelativisticDynamicsPanel(
      new VBox({
        align: "left",
        spacing: 8,
        children: [createSectionHeader(strings.reactionHeadingStringProperty), reactionRadio],
      }),
      { minWidth: CONTROL_WIDTH + 24 },
    );

    const configurationRadio = createRadioButtonGroup(
      model.configurationProperty,
      [
        {
          value: BeamConfiguration.FIXED_TARGET,
          labelProperty: strings.configurations.fixedTargetStringProperty,
          accessibleName: strings.configurations.fixedTargetStringProperty,
        },
        {
          value: BeamConfiguration.COLLIDER,
          labelProperty: strings.configurations.colliderStringProperty,
          accessibleName: strings.configurations.colliderStringProperty,
          enabledProperty: model.colliderAvailableProperty,
        },
      ],
      { accessibleName: a11y.configurationStringProperty, accessibleHelpText: a11y.configurationHelpStringProperty },
    );
    const configurationPanel = new RelativisticDynamicsPanel(
      new VBox({
        align: "left",
        spacing: 8,
        children: [createSectionHeader(strings.configurationHeadingStringProperty), configurationRadio],
      }),
      { minWidth: CONTROL_WIDTH + 24 },
    );

    const beamTitleProperty = new DerivedProperty(
      [model.configurationProperty, strings.beamEnergyStringProperty, strings.beamEnergyEachStringProperty],
      (configuration, single, each) => (configuration === BeamConfiguration.COLLIDER ? each : single),
    );
    const beamValueProperty = new DerivedProperty([model.beamKineticEnergyProperty], (k) => formatEnergy(k, 4));
    const beamSlider = new HSlider(model.energyFractionProperty, new Range(0, 1), {
      trackSize: new Dimension2(CONTROL_WIDTH - 20, 4),
      thumbSize: new Dimension2(14, 26),
      thumbFill: RelativisticDynamicsColors.accentColorProperty,
      trackFillEnabled: RelativisticDynamicsColors.textColorProperty,
      keyboardStep: 1 / 60,
      shiftKeyboardStep: 1 / 600,
      pageKeyboardStep: 1 / 6,
      accessibleName: a11y.beamEnergyStringProperty,
      accessibleHelpText: a11y.beamEnergyHelpStringProperty,
      pdomCreateAriaValueText: () => beamValueProperty.value,
      pdomDependencies: [beamValueProperty],
    });
    // Tick at threshold (one third of the way along, by construction).
    beamSlider.addMajorTick(1 / 3);
    const thresholdButton = createPushButton(strings.goToThresholdStringProperty, {
      accessibleName: a11y.goToThresholdStringProperty,
      accessibleHelpText: a11y.goToThresholdHelpStringProperty,
      listener: () => model.goToThreshold(),
    });
    const beamPanel = new RelativisticDynamicsPanel(
      new VBox({
        align: "left",
        spacing: 8,
        children: [
          createSectionHeader(strings.beamHeadingStringProperty),
          new Text(beamTitleProperty, {
            font: FONTS.CONTROL_TITLE,
            fill: RelativisticDynamicsColors.secondaryTextColorProperty,
            maxWidth: CONTROL_WIDTH,
          }),
          new Text(beamValueProperty, {
            font: FONTS.BIG_LABEL,
            fill: RelativisticDynamicsColors.body1ColorProperty,
            maxWidth: CONTROL_WIDTH,
          }),
          beamSlider,
          thresholdButton,
        ],
      }),
      { minWidth: CONTROL_WIDTH + 24 },
    );

    const rightColumn = new VBox({
      spacing: 10,
      align: "right",
      children: [reactionPanel, configurationPanel, beamPanel],
    });
    rightColumn.right = bounds.maxX - SCREEN_VIEW_MARGIN;
    rightColumn.top = bounds.minY + SCREEN_VIEW_MARGIN;

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
      title,
      labFrame,
      cmFrame,
      meter,
      chart,
      rightColumn,
      resetAllButton,
      new Node({
        pdomOrder: [reactionRadio, configurationRadio, beamSlider, thresholdButton, resetAllButton],
      }),
    ];
  }
}

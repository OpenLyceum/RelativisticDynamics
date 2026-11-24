/**
 * EnergyMomentumControls.ts
 *
 * The Energy–Momentum screen's controls, as three panels the screen view places
 * independently: the particle, which quantity to set and a slider for it, and the
 * observer's speed.
 *
 * The "Set" slider is a single HSlider over a fraction u ∈ [0, 1] that maps
 * linearly onto whichever quantity is selected (see
 * EnergyMomentumModel.sliderFractionOf). One slider rather than four keeps the
 * point of the screen in view: β, p, K and E are not four settings but four
 * readings of one state.
 */

import { DerivedProperty, NumberProperty } from "scenerystack/axon";
import { Dimension2, Range } from "scenerystack/dot";
import { type Node, Text, VBox } from "scenerystack/scenery";
import { HSlider } from "scenerystack/sun";
import { RelativisticDynamicsPanel } from "../../common/RelativisticDynamicsPanel.js";
import { formatBeta, formatEnergy } from "../../common/view/chartUtils.js";
import { createNumberControl, createRadioButtonGroup, createSectionHeader } from "../../common/view/controlHelpers.js";
import { StringManager } from "../../i18n/StringManager.js";
import RelativisticDynamicsColors from "../../RelativisticDynamicsColors.js";
import { CONTROL_WIDTH, ENERGY_MOMENTUM, ENERGY_MOMENTUM_VIEW, FONTS } from "../../RelativisticDynamicsConstants.js";

import {
  type DrivingQuantity,
  EnergyMomentumModel,
  type ParticleChoice,
  ParticleChoiceValues,
} from "../model/EnergyMomentumModel.js";

/** Keyboard step of the "Set" slider, as a fraction of its range. */
const SLIDER_STEP: number = ENERGY_MOMENTUM_VIEW.SLIDER_STEP;

export class EnergyMomentumControls {
  public readonly particlePanel: Node;
  public readonly setPanel: Node;
  public readonly observerPanel: Node;

  /** Interactive children in traversal order, for the screen's pdomOrder. */
  public readonly traversalOrder: Node[];

  public constructor(model: EnergyMomentumModel) {
    const sm = StringManager.getInstance();
    const common = sm.getCommonStrings();
    const strings = sm.getEnergyMomentumStrings();
    const a11y = sm.getEnergyMomentumA11yStrings().controls;
    const q = common.quantities;

    // ── Particle ──────────────────────────────────────────────────────────────
    const particleLabels: Record<ParticleChoice, typeof common.particles.electronStringProperty> = {
      electron: common.particles.electronStringProperty,
      muon: common.particles.muonStringProperty,
      pion: common.particles.pionStringProperty,
      proton: common.particles.protonStringProperty,
      photon: common.particles.photonStringProperty,
      custom: common.particles.customStringProperty,
    };
    const particleRadio = createRadioButtonGroup(
      model.particleProperty,
      ParticleChoiceValues.map((value) => ({
        value,
        labelProperty: particleLabels[value],
        accessibleName: particleLabels[value],
      })),
      { accessibleName: a11y.particleStringProperty, accessibleHelpText: a11y.particleHelpStringProperty },
    );

    const customMassControl = createNumberControl(
      model.customMassProperty,
      new Range(ENERGY_MOMENTUM.CUSTOM_MASS_MIN_MEV, ENERGY_MOMENTUM.CUSTOM_MASS_MAX_MEV),
      {
        titleProperty: strings.customMassStringProperty,
        valuePatternProperty: common.massValuePatternStringProperty,
        accessibleName: a11y.customMassStringProperty,
        accessibleHelpText: a11y.customMassHelpStringProperty,
        decimalPlaces: 0,
        delta: ENERGY_MOMENTUM_VIEW.CUSTOM_MASS_DELTA,
      },
    );
    customMassControl.visibleProperty = new DerivedProperty([model.particleProperty], (p) => p === "custom");

    this.particlePanel = new RelativisticDynamicsPanel(
      new VBox({
        align: "left",
        spacing: ENERGY_MOMENTUM_VIEW.PARTICLE_PANEL_SPACING,
        children: [createSectionHeader(strings.particleHeadingStringProperty), particleRadio, customMassControl],
      }),
      { minWidth: CONTROL_WIDTH + ENERGY_MOMENTUM_VIEW.PANEL_WIDTH_PAD },
    );

    // ── Set ───────────────────────────────────────────────────────────────────
    const quantityLabels: Record<DrivingQuantity, typeof q.speedStringProperty> = {
      speed: q.speedStringProperty,
      momentum: q.momentumStringProperty,
      kineticEnergy: q.kineticEnergyStringProperty,
      totalEnergy: q.totalEnergyStringProperty,
    };
    const notMasslessProperty = new DerivedProperty([model.isMasslessProperty], (massless) => !massless);
    const quantityRadio = createRadioButtonGroup(
      model.drivingQuantityProperty,
      (["speed", "momentum", "kineticEnergy", "totalEnergy"] as const).map((value) => ({
        value,
        labelProperty: quantityLabels[value],
        accessibleName: quantityLabels[value],
        ...(value === "speed" ? { enabledProperty: notMasslessProperty } : {}),
      })),
      { accessibleName: a11y.setQuantityStringProperty, accessibleHelpText: a11y.setQuantityHelpStringProperty },
    );

    // The slider's own state; kept in step with the model's scaled momentum both ways.
    const fractionProperty = new NumberProperty(0, { range: new Range(0, 1) });
    let updating = false;
    const pushToSlider = (): void => {
      if (updating) {
        return;
      }
      updating = true;
      fractionProperty.value = Math.max(
        0,
        Math.min(
          1,
          EnergyMomentumModel.sliderFractionOf(
            model.drivingQuantityProperty.value,
            model.scaledMomentumProperty.value,
            model.isMasslessProperty.value,
          ),
        ),
      );
      updating = false;
    };
    fractionProperty.lazyLink((u) => {
      if (updating) {
        return;
      }
      updating = true;
      model.scaledMomentumProperty.value = EnergyMomentumModel.scaledMomentumOf(
        model.drivingQuantityProperty.value,
        u,
        model.isMasslessProperty.value,
      );
      updating = false;
    });
    model.scaledMomentumProperty.link(pushToSlider);
    model.drivingQuantityProperty.link(pushToSlider);
    model.isMasslessProperty.link(pushToSlider);

    /** The selected quantity's value, formatted, for the label above the slider and for aria-valuetext. */
    const selectedValueProperty = new DerivedProperty(
      [model.drivingQuantityProperty, model.labStateProperty],
      (quantity, state) => {
        switch (quantity) {
          case "speed":
            return `${formatBeta(state.beta)} c`;
          case "momentum":
            return formatEnergy(state.momentum, ENERGY_MOMENTUM_VIEW.MOMENTUM_DIGITS, "/c");
          case "kineticEnergy":
            return formatEnergy(state.kineticEnergy, ENERGY_MOMENTUM_VIEW.KINETIC_DIGITS);
          case "totalEnergy":
            return formatEnergy(state.energy, ENERGY_MOMENTUM_VIEW.ENERGY_DIGITS);
        }
      },
    );
    const selectedValueText = new Text(selectedValueProperty, {
      font: FONTS.BIG_LABEL,
      fill: RelativisticDynamicsColors.relativisticColorProperty,
      maxWidth: CONTROL_WIDTH,
    });

    const slider = new HSlider(fractionProperty, new Range(0, 1), {
      trackSize: new Dimension2(CONTROL_WIDTH - 20, ENERGY_MOMENTUM_VIEW.SLIDER_TRACK_HEIGHT),
      thumbSize: new Dimension2(ENERGY_MOMENTUM_VIEW.SLIDER_THUMB_WIDTH, ENERGY_MOMENTUM_VIEW.SLIDER_THUMB_HEIGHT),
      thumbFill: RelativisticDynamicsColors.accentColorProperty,
      trackFillEnabled: RelativisticDynamicsColors.textColorProperty,
      keyboardStep: SLIDER_STEP,
      shiftKeyboardStep: SLIDER_STEP / 10,
      pageKeyboardStep: SLIDER_STEP * 10,
      accessibleName: a11y.quantitySliderStringProperty,
      accessibleHelpText: a11y.quantitySliderHelpStringProperty,
      pdomCreateAriaValueText: () => selectedValueProperty.value,
      pdomDependencies: [selectedValueProperty],
    });

    this.setPanel = new RelativisticDynamicsPanel(
      new VBox({
        align: "left",
        spacing: ENERGY_MOMENTUM_VIEW.SET_PANEL_SPACING,
        children: [createSectionHeader(strings.setHeadingStringProperty), quantityRadio, selectedValueText, slider],
      }),
      { minWidth: CONTROL_WIDTH + ENERGY_MOMENTUM_VIEW.PANEL_WIDTH_PAD },
    );

    // ── Observer ──────────────────────────────────────────────────────────────
    const observerControl = createNumberControl(
      model.frameBetaProperty,
      new Range(-ENERGY_MOMENTUM.MAX_FRAME_BETA, ENERGY_MOMENTUM.MAX_FRAME_BETA),
      {
        titleProperty: strings.observerSpeedStringProperty,
        valuePatternProperty: common.speedValuePatternStringProperty,
        accessibleName: a11y.observerSpeedStringProperty,
        accessibleHelpText: a11y.observerSpeedHelpStringProperty,
        decimalPlaces: ENERGY_MOMENTUM_VIEW.OBSERVER_DECIMAL_PLACES,
        delta: ENERGY_MOMENTUM_VIEW.OBSERVER_DELTA,
      },
    );
    this.observerPanel = new RelativisticDynamicsPanel(
      new VBox({
        align: "left",
        spacing: ENERGY_MOMENTUM_VIEW.OBSERVER_PANEL_SPACING,
        children: [createSectionHeader(strings.observerHeadingStringProperty), observerControl],
      }),
      { minWidth: CONTROL_WIDTH + ENERGY_MOMENTUM_VIEW.PANEL_WIDTH_PAD },
    );

    this.traversalOrder = [particleRadio, customMassControl, quantityRadio, slider, observerControl];
  }
}

/**
 * AccelerateScreenView.ts
 *
 * Layout for the Accelerate screen:
 *
 *   top     the three-lane race along the track
 *   bottom  speed (or momentum) against time; speed² against kinetic energy
 *   right   particle, field, chart and data options, the worked example, readouts
 *   foot    time controls and restart; Reset All
 */

import { DerivedProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { HBox, Node, VBox } from "scenerystack/scenery";
import { ResetAllButton, RestartButton, TimeControlNode } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import {
  FLAT_PLAY_PAUSE_STEP_BUTTON_OPTIONS,
  FLAT_RECTANGULAR_BUTTON_OPTIONS,
  FLAT_RESET_ALL_BUTTON_OPTIONS,
  TIME_CONTROL_SPEED_RADIO_OPTIONS,
} from "../../common/RelativisticDynamicsButtonOptions.js";
import { RelativisticDynamicsPanel } from "../../common/RelativisticDynamicsPanel.js";
import { formatBeta, formatEnergy, formatSignificant } from "../../common/view/chartUtils.js";
import {
  createCheckbox,
  createNumberControl,
  createPushButton,
  createRadioButtonGroup,
  createReadoutRow,
  createSectionHeader,
} from "../../common/view/controlHelpers.js";
import { StringManager } from "../../i18n/StringManager.js";
import RelativisticDynamicsColors from "../../RelativisticDynamicsColors.js";
import { ACCELERATE, CONTROL_WIDTH, SCREEN_VIEW_MARGIN } from "../../RelativisticDynamicsConstants.js";
import type { AccelerateModel } from "../model/AccelerateModel.js";
import { AccelerateChartsNode } from "./AccelerateChartsNode.js";
import { AccelerateScreenSummaryContent } from "./AccelerateScreenSummaryContent.js";
import { AccelerateTrackNode } from "./AccelerateTrackNode.js";

export type AccelerateScreenViewOptions = ScreenViewOptions;

/** Width of the play area to the left of the control column. */
const PLAY_AREA_WIDTH = 720;

export class AccelerateScreenView extends ScreenView {
  public constructor(model: AccelerateModel, providedOptions?: AccelerateScreenViewOptions) {
    const options = optionize<AccelerateScreenViewOptions, EmptySelfOptions, ScreenViewOptions>()(
      { screenSummaryContent: new AccelerateScreenSummaryContent(model) },
      providedOptions,
    );
    super(options);

    const bounds = this.layoutBounds;
    const sm = StringManager.getInstance();
    const common = sm.getCommonStrings();
    const strings = sm.getAccelerateStrings();
    const a11y = sm.getAccelerateA11yStrings().controls;

    // ── Play area ──────────────────────────────────────────────────────────────
    const track = new AccelerateTrackNode(model, PLAY_AREA_WIDTH);
    track.left = bounds.minX + SCREEN_VIEW_MARGIN;
    track.top = bounds.minY + SCREEN_VIEW_MARGIN + 6;

    const charts = new AccelerateChartsNode(model);
    charts.left = bounds.minX + SCREEN_VIEW_MARGIN + 55;
    charts.top = track.bottom + 24;

    // ── Controls ───────────────────────────────────────────────────────────────
    const particleRadio = createRadioButtonGroup(
      model.particleProperty,
      [
        {
          value: "electron" as const,
          labelProperty: common.particles.electronStringProperty,
          accessibleName: common.particles.electronStringProperty,
        },
        {
          value: "proton" as const,
          labelProperty: common.particles.protonStringProperty,
          accessibleName: common.particles.protonStringProperty,
        },
      ],
      { accessibleName: a11y.particleStringProperty, accessibleHelpText: a11y.particleHelpStringProperty },
    );
    const fieldControl = createNumberControl(
      model.fieldProperty,
      new Range(ACCELERATE.FIELD_MIN_MV_PER_M, ACCELERATE.FIELD_MAX_MV_PER_M),
      {
        titleProperty: strings.fieldStringProperty,
        valuePatternProperty: strings.fieldValuePatternStringProperty,
        accessibleName: a11y.fieldStringProperty,
        accessibleHelpText: a11y.fieldHelpStringProperty,
        decimalPlaces: 2,
        delta: 0.05,
      },
    );
    const chartRadio = createRadioButtonGroup(
      model.chartQuantityProperty,
      [
        {
          value: "speed" as const,
          labelProperty: strings.chartSpeedStringProperty,
          accessibleName: strings.chartSpeedStringProperty,
        },
        {
          value: "momentum" as const,
          labelProperty: strings.chartMomentumStringProperty,
          accessibleName: strings.chartMomentumStringProperty,
        },
      ],
      { accessibleName: a11y.chartQuantityStringProperty, accessibleHelpText: a11y.chartQuantityHelpStringProperty },
    );
    const bertozziCheckbox = createCheckbox(
      model.showBertozziProperty,
      strings.showBertozziStringProperty,
      a11y.showBertozziStringProperty,
    );
    bertozziCheckbox.enabledProperty = new DerivedProperty([model.particleProperty], (p) => p === "electron");
    const workedExampleButton = createPushButton(strings.workedExampleStringProperty, {
      accessibleName: a11y.workedExampleStringProperty,
      accessibleHelpText: a11y.workedExampleHelpStringProperty,
      listener: () => model.showWorkedExample(),
    });

    const controlPanel = new RelativisticDynamicsPanel(
      new VBox({
        align: "left",
        spacing: 8,
        children: [
          createSectionHeader(strings.particleHeadingStringProperty),
          particleRadio,
          fieldControl,
          createSectionHeader(strings.chartHeadingStringProperty),
          chartRadio,
          bertozziCheckbox,
          workedExampleButton,
        ],
      }),
      { minWidth: CONTROL_WIDTH + 24 },
    );
    controlPanel.right = bounds.maxX - SCREEN_VIEW_MARGIN;
    controlPanel.top = bounds.minY + SCREEN_VIEW_MARGIN;

    // ── Readouts for the real particle ─────────────────────────────────────────
    const q = common.quantities;
    const snapshot = model.snapshotProperty;
    const readoutValues = {
      time: new DerivedProperty([model.timeProperty], (t) => `${formatSignificant(t, 3)} ns`),
      distance: new DerivedProperty([snapshot], (s) => `${formatSignificant(s.position, 3)} m`),
      speed: new DerivedProperty([snapshot], (s) => `${formatBeta(s.beta)} c`),
      gamma: new DerivedProperty([snapshot, model.massProperty], (s, m) =>
        formatSignificant(1 + s.kineticEnergy / m, 4),
      ),
      momentum: new DerivedProperty([snapshot], (s) => formatEnergy(s.momentum, 4, "/c")),
      kinetic: new DerivedProperty([snapshot], (s) => formatEnergy(s.kineticEnergy, 4)),
    };
    const readoutPanel = new RelativisticDynamicsPanel(
      new VBox({
        align: "left",
        spacing: 3,
        children: [
          createSectionHeader(strings.readoutsHeadingStringProperty),
          createReadoutRow(strings.timeStringProperty, readoutValues.time),
          createReadoutRow(strings.distanceStringProperty, readoutValues.distance),
          createReadoutRow(
            q.speedStringProperty,
            readoutValues.speed,
            RelativisticDynamicsColors.relativisticColorProperty,
          ),
          createReadoutRow(q.gammaStringProperty, readoutValues.gamma),
          createReadoutRow(
            q.momentumStringProperty,
            readoutValues.momentum,
            RelativisticDynamicsColors.momentumColorProperty,
          ),
          createReadoutRow(
            q.kineticEnergyStringProperty,
            readoutValues.kinetic,
            RelativisticDynamicsColors.kineticEnergyColorProperty,
          ),
        ],
      }),
      { minWidth: CONTROL_WIDTH + 24 },
    );
    readoutPanel.right = controlPanel.right;
    readoutPanel.top = controlPanel.bottom + 10;

    // ── Time controls ──────────────────────────────────────────────────────────
    const timeControlNode = new TimeControlNode(model.isPlayingProperty, {
      timeSpeedProperty: model.timeSpeedProperty,
      ...TIME_CONTROL_SPEED_RADIO_OPTIONS,
      playPauseStepButtonOptions: {
        ...FLAT_PLAY_PAUSE_STEP_BUTTON_OPTIONS,
        stepForwardButtonOptions: {
          ...FLAT_PLAY_PAUSE_STEP_BUTTON_OPTIONS.stepForwardButtonOptions,
          listener: () => model.stepTime(1 / 30),
        },
      },
    });
    const restartButton = new RestartButton({
      ...FLAT_RECTANGULAR_BUTTON_OPTIONS,
      baseColor: RelativisticDynamicsColors.controlSurfaceColorProperty,
      listener: () => model.restart(),
      accessibleName: a11y.restartStringProperty,
      accessibleHelpText: a11y.restartHelpStringProperty,
    });
    const timeRow = new HBox({ spacing: 18, children: [restartButton, timeControlNode] });
    timeRow.centerX = bounds.minX + SCREEN_VIEW_MARGIN + PLAY_AREA_WIDTH / 2;
    timeRow.bottom = bounds.maxY - SCREEN_VIEW_MARGIN;

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
      track,
      charts,
      controlPanel,
      readoutPanel,
      timeRow,
      resetAllButton,
      new Node({
        pdomOrder: [
          timeControlNode,
          restartButton,
          particleRadio,
          fieldControl,
          chartRadio,
          bertozziCheckbox,
          workedExampleButton,
          resetAllButton,
        ],
      }),
    ];
  }
}

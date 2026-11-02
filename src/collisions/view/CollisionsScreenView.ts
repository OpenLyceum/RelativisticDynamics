/**
 * CollisionsScreenView.ts
 *
 * Layout for the Collisions screen:
 *
 *   left    the collision in the viewing frame; momentum diagram and invariants below it
 *   middle  before/after totals; the two bodies' masses and velocity pads
 *   right   presets; collision type and angle; viewing frame
 *   foot    time controls and restart; Reset All
 */

import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { StringUtils } from "scenerystack/phetcommon";
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
import { formatSignificant } from "../../common/view/chartUtils.js";
import {
  createNumberControl,
  createPushButton,
  createRadioButtonGroup,
  createReadoutRow,
  createSectionHeader,
} from "../../common/view/controlHelpers.js";
import { StringManager } from "../../i18n/StringManager.js";
import RelativisticDynamicsColors from "../../RelativisticDynamicsColors.js";
import { COLLISIONS, CONTROL_WIDTH, SCREEN_VIEW_MARGIN } from "../../RelativisticDynamicsConstants.js";
import type { CollisionsModel } from "../model/CollisionsModel.js";
import { openingAngle } from "../model/collisionGeometry.js";
import { CollisionPlayAreaNode } from "./CollisionPlayAreaNode.js";
import { CollisionsScreenSummaryContent } from "./CollisionsScreenSummaryContent.js";
import { ConservationPanel } from "./ConservationPanel.js";
import { MomentumDiagramNode } from "./MomentumDiagramNode.js";
import { VelocityPadNode } from "./VelocityPadNode.js";

export type CollisionsScreenViewOptions = ScreenViewOptions;

const PLAY_WIDTH = 340;
const PLAY_HEIGHT = 245;
const DIAGRAM_SIZE = 150;
/** Width of the narrow readout column under the play area. */
const READOUT_WIDTH = 215;
/** Width of each body's mass control, so the two sit side by side under their pads. */
const MASS_CONTROL_WIDTH = 125;

export class CollisionsScreenView extends ScreenView {
  public constructor(model: CollisionsModel, providedOptions?: CollisionsScreenViewOptions) {
    const options = optionize<CollisionsScreenViewOptions, EmptySelfOptions, ScreenViewOptions>()(
      { screenSummaryContent: new CollisionsScreenSummaryContent(model) },
      providedOptions,
    );
    super(options);

    const bounds = this.layoutBounds;
    const sm = StringManager.getInstance();
    const strings = sm.getCollisionsStrings();
    const a11y = sm.getCollisionsA11yStrings().controls;

    // ── Left column: play area, momentum diagram, invariants ─────────────────
    const playArea = new CollisionPlayAreaNode(model, PLAY_WIDTH, PLAY_HEIGHT);
    playArea.left = bounds.minX + SCREEN_VIEW_MARGIN + 42;
    playArea.top = bounds.minY + SCREEN_VIEW_MARGIN;

    const momentumDiagram = new MomentumDiagramNode(model, DIAGRAM_SIZE);
    momentumDiagram.left = bounds.minX + SCREEN_VIEW_MARGIN;
    momentumDiagram.top = playArea.bottom + 22;

    const sqrtSText = new DerivedProperty([model.invariantMassProperty], (m) => formatSignificant(m, 4));
    const openingText = new DerivedProperty([model.viewStateProperty], (state) => {
      const angle = openingAngle(state.outgoing);
      return angle === null ? "—" : `${formatSignificant((angle * 180) / Math.PI, 3)}°`;
    });
    const compositeText = new DerivedProperty(
      [model.labStateProperty, model.mass1Property, model.mass2Property],
      (s, m1, m2) => `${formatSignificant(s.outgoing[0]?.mass ?? 0, 4)} (${formatSignificant(m1 + m2, 3)})`,
    );
    const newtonReferenceVisible = new DerivedProperty(
      [model.modeProperty, model.mass1Property, model.mass2Property, model.velocity2Property, model.frameProperty],
      (mode, m1, m2, u2, frame) => mode === "elastic" && m1 === m2 && u2.magnitude === 0 && frame === "lab",
    );
    const openingRow = createReadoutRow(strings.openingAngleStringProperty, openingText, undefined, READOUT_WIDTH);
    openingRow.visibleProperty = new DerivedProperty([model.modeProperty], (mode) => mode === "elastic");
    const newtonRow = createReadoutRow(
      strings.newtonOpeningAngleStringProperty,
      new DerivedProperty([strings.degreesPatternStringProperty], (p) => StringUtils.fillIn(p, { value: 90 })),
      RelativisticDynamicsColors.newtonianColorProperty,
      READOUT_WIDTH,
    );
    newtonRow.visibleProperty = newtonReferenceVisible;
    const compositeRow = createReadoutRow(strings.compositeMassStringProperty, compositeText, undefined, READOUT_WIDTH);
    compositeRow.visibleProperty = new DerivedProperty([model.modeProperty], (mode) => mode === "inelastic");

    const readouts = new VBox({
      align: "left",
      spacing: 6,
      children: [
        createSectionHeader(strings.readoutsHeadingStringProperty),
        createReadoutRow(
          strings.invariantMassStringProperty,
          sqrtSText,
          RelativisticDynamicsColors.invariantColorProperty,
          READOUT_WIDTH,
        ),
        openingRow,
        newtonRow,
        compositeRow,
      ],
    });
    readouts.left = momentumDiagram.right + 22;
    readouts.top = momentumDiagram.top - 18;

    // ── Middle column: conservation, bodies ──────────────────────────────────
    const conservation = new ConservationPanel(model);
    conservation.left = playArea.right + 16;
    conservation.top = bounds.minY + SCREEN_VIEW_MARGIN;

    const massControl = (
      property: typeof model.mass1Property,
      title: TReadOnlyProperty<string>,
      body: TReadOnlyProperty<string>,
    ) =>
      createNumberControl(property, new Range(COLLISIONS.MASS_MIN, COLLISIONS.MASS_MAX), {
        titleProperty: title,
        valuePatternProperty: strings.massValuePatternStringProperty,
        accessibleName: new DerivedProperty([a11y.massStringProperty, body], (pattern, name) =>
          StringUtils.fillIn(pattern, { body: name }),
        ),
        accessibleHelpText: a11y.massHelpStringProperty,
        decimalPlaces: 1,
        delta: 0.1,
        width: MASS_CONTROL_WIDTH,
      });
    const mass1Control = massControl(model.mass1Property, strings.mass1StringProperty, strings.body1StringProperty);
    const mass2Control = massControl(model.mass2Property, strings.mass2StringProperty, strings.body2StringProperty);
    const velocityName = (body: TReadOnlyProperty<string>) =>
      new DerivedProperty([a11y.velocityStringProperty, body], (pattern, name) =>
        StringUtils.fillIn(pattern, { body: name }),
      );
    const pad1 = new VelocityPadNode(
      model.velocity1Property,
      RelativisticDynamicsColors.body1ColorProperty,
      strings.body1StringProperty,
      velocityName(strings.body1StringProperty),
    );
    const pad2 = new VelocityPadNode(
      model.velocity2Property,
      RelativisticDynamicsColors.body2ColorProperty,
      strings.body2StringProperty,
      velocityName(strings.body2StringProperty),
    );
    const bodiesPanel = new RelativisticDynamicsPanel(
      new VBox({
        align: "left",
        spacing: 8,
        children: [
          createSectionHeader(strings.bodiesHeadingStringProperty),
          new HBox({
            spacing: 14,
            align: "top",
            children: [
              new VBox({ spacing: 8, children: [pad1, mass1Control] }),
              new VBox({ spacing: 8, children: [pad2, mass2Control] }),
            ],
          }),
        ],
      }),
    );
    bodiesPanel.left = conservation.left;
    bodiesPanel.top = conservation.bottom + 10;

    // ── Right column: presets, collision, frame ──────────────────────────────
    const presetButtons = [
      createPushButton(strings.presets.derivationStringProperty, {
        accessibleName: strings.presets.derivationStringProperty,
        accessibleHelpText: a11y.presetHelpStringProperty,
        listener: () => model.applyDerivationPreset(),
      }),
      createPushButton(strings.presets.targetAtRestStringProperty, {
        accessibleName: strings.presets.targetAtRestStringProperty,
        accessibleHelpText: a11y.presetHelpStringProperty,
        listener: () => model.applyTargetAtRestPreset(),
      }),
      createPushButton(strings.presets.headOnStringProperty, {
        accessibleName: strings.presets.headOnStringProperty,
        accessibleHelpText: a11y.presetHelpStringProperty,
        listener: () => model.applyHeadOnPreset(),
      }),
    ];
    const presetPanel = new RelativisticDynamicsPanel(
      new VBox({
        align: "left",
        spacing: 6,
        children: [createSectionHeader(strings.presetsHeadingStringProperty), ...presetButtons],
      }),
      { minWidth: CONTROL_WIDTH + 24 },
    );

    const modeRadio = createRadioButtonGroup(
      model.modeProperty,
      [
        {
          value: "elastic" as const,
          labelProperty: strings.modes.elasticStringProperty,
          accessibleName: strings.modes.elasticStringProperty,
        },
        {
          value: "inelastic" as const,
          labelProperty: strings.modes.inelasticStringProperty,
          accessibleName: strings.modes.inelasticStringProperty,
        },
      ],
      { accessibleName: a11y.modeStringProperty, accessibleHelpText: a11y.modeHelpStringProperty },
    );
    const angleControl = createNumberControl(model.cmAngleProperty, new Range(-180, 180), {
      titleProperty: strings.cmAngleStringProperty,
      valuePatternProperty: strings.degreesPatternStringProperty,
      accessibleName: a11y.cmAngleStringProperty,
      accessibleHelpText: a11y.cmAngleHelpStringProperty,
      decimalPlaces: 0,
      delta: 1,
    });
    angleControl.enabledProperty = new DerivedProperty([model.modeProperty], (mode) => mode === "elastic");
    const collisionPanel = new RelativisticDynamicsPanel(
      new VBox({
        align: "left",
        spacing: 8,
        children: [createSectionHeader(strings.collisionHeadingStringProperty), modeRadio, angleControl],
      }),
      { minWidth: CONTROL_WIDTH + 24 },
    );

    const frameRadio = createRadioButtonGroup(
      model.frameProperty,
      [
        {
          value: "lab" as const,
          labelProperty: strings.frames.labStringProperty,
          accessibleName: strings.frames.labStringProperty,
        },
        {
          value: "centerOfMomentum" as const,
          labelProperty: strings.frames.centerOfMomentumStringProperty,
          accessibleName: strings.frames.centerOfMomentumStringProperty,
        },
        {
          value: "moving" as const,
          labelProperty: strings.frames.movingStringProperty,
          accessibleName: strings.frames.movingStringProperty,
        },
      ],
      { accessibleName: a11y.frameStringProperty, accessibleHelpText: a11y.frameHelpStringProperty },
    );
    const frameSpeedControl = createNumberControl(
      model.frameBetaProperty,
      new Range(-COLLISIONS.MAX_FRAME_BETA, COLLISIONS.MAX_FRAME_BETA),
      {
        titleProperty: strings.frameSpeedStringProperty,
        valuePatternProperty: sm.getCommonStrings().speedValuePatternStringProperty,
        accessibleName: a11y.frameSpeedStringProperty,
        accessibleHelpText: a11y.frameSpeedHelpStringProperty,
        decimalPlaces: 2,
        delta: 0.01,
      },
    );
    frameSpeedControl.enabledProperty = new DerivedProperty([model.frameProperty], (frame) => frame === "moving");
    const framePanel = new RelativisticDynamicsPanel(
      new VBox({
        align: "left",
        spacing: 8,
        children: [createSectionHeader(strings.frameHeadingStringProperty), frameRadio, frameSpeedControl],
      }),
      { minWidth: CONTROL_WIDTH + 24 },
    );

    const rightColumn = new VBox({ spacing: 10, align: "right", children: [presetPanel, collisionPanel, framePanel] });
    rightColumn.right = bounds.maxX - SCREEN_VIEW_MARGIN;
    rightColumn.top = bounds.minY + SCREEN_VIEW_MARGIN;

    // ── Time controls ──────────────────────────────────────────────────────────
    const timeControlNode = new TimeControlNode(model.isPlayingProperty, {
      timeSpeedProperty: model.timeSpeedProperty,
      ...TIME_CONTROL_SPEED_RADIO_OPTIONS,
      playPauseStepButtonOptions: {
        ...FLAT_PLAY_PAUSE_STEP_BUTTON_OPTIONS,
        stepForwardButtonOptions: {
          ...FLAT_PLAY_PAUSE_STEP_BUTTON_OPTIONS.stepForwardButtonOptions,
          listener: () => model.stepTime(1 / 15),
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
    const timeRow = new HBox({ spacing: 16, children: [restartButton, timeControlNode] });
    timeRow.centerX = playArea.centerX;
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
      playArea,
      momentumDiagram,
      readouts,
      conservation,
      bodiesPanel,
      rightColumn,
      timeRow,
      resetAllButton,
      new Node({
        pdomOrder: [
          timeControlNode,
          restartButton,
          ...presetButtons,
          pad1.handle,
          pad2.handle,
          mass1Control,
          mass2Control,
          modeRadio,
          angleControl,
          frameRadio,
          frameSpeedControl,
          conservation.newtonCheckbox,
          resetAllButton,
        ],
      }),
    ];
  }
}

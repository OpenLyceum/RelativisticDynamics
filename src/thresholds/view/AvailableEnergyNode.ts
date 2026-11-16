/**
 * AvailableEnergyNode.ts
 *
 * The verdict, as a meter: a bar of length √s (the energy available in the CM
 * frame) against a marker at Σm_f c² (the rest energy the products need). Green
 * once the bar reaches the marker, red short of it. Below it, the readouts that
 * explain the threshold: the threshold itself, the beam energy, √s, Σm_f, the
 * speed of the CM frame, and how much of the lab energy is tied up in moving the
 * CM frame and so cannot make particles.
 */

import { DerivedProperty, Multilink } from "scenerystack/axon";
import { Line, Node, Rectangle, RichText, Text, VBox } from "scenerystack/scenery";
import { formatBeta, formatEnergy } from "../../common/view/chartUtils.js";
import { createReadoutRow } from "../../common/view/controlHelpers.js";
import { StringManager } from "../../i18n/StringManager.js";
import RelativisticDynamicsColors from "../../RelativisticDynamicsColors.js";
import { FONTS, THRESHOLDS_VIEW } from "../../RelativisticDynamicsConstants.js";

import { Verdict } from "../model/reactions.js";
import type { ThresholdsModel } from "../model/ThresholdsModel.js";

const METER_WIDTH: number = THRESHOLDS_VIEW.METER_WIDTH;
const METER_HEIGHT: number = THRESHOLDS_VIEW.METER_HEIGHT;
const READOUT_WIDTH: number = THRESHOLDS_VIEW.METER_READOUT_WIDTH;

export class AvailableEnergyNode extends Node {
  public constructor(model: ThresholdsModel) {
    super();
    const strings = StringManager.getInstance().getThresholdsStrings();

    const title = new Text(strings.meterTitleStringProperty, {
      font: FONTS.CHART_TITLE,
      fill: RelativisticDynamicsColors.textColorProperty,
      maxWidth: METER_WIDTH,
    });
    const track = new Rectangle(0, 0, METER_WIDTH, METER_HEIGHT, {
      fill: RelativisticDynamicsColors.chartBackgroundColorProperty,
      stroke: RelativisticDynamicsColors.chartAxisColorProperty,
    });
    const bar = new Rectangle(0, 0, 0, METER_HEIGHT);
    const marker = new Line(0, THRESHOLDS_VIEW.MARKER_START_Y, 0, METER_HEIGHT + 6, {
      stroke: RelativisticDynamicsColors.invariantColorProperty,
      lineWidth: THRESHOLDS_VIEW.MARKER_LINE_WIDTH,
    });
    const sqrtSLabel = new RichText("", {
      font: FONTS.TICK_LABEL,
      fill: RelativisticDynamicsColors.textColorProperty,
      maxWidth: THRESHOLDS_VIEW.SQRT_S_LABEL_MAX_WIDTH,
    });
    const markerLabel = new RichText("", {
      font: FONTS.TICK_LABEL,
      fill: RelativisticDynamicsColors.invariantColorProperty,
      maxWidth: THRESHOLDS_VIEW.MARKER_LABEL_MAX_WIDTH,
    });
    const meter = new Node({ children: [track, bar, marker, sqrtSLabel, markerLabel] });

    const r = strings.readouts;
    const format = (value: number, none: string): string =>
      Number.isFinite(value) ? formatEnergy(value, THRESHOLDS_VIEW.METER_FORMAT_DIGITS) : none;
    const values = {
      threshold: new DerivedProperty([model.thresholdProperty, strings.infinityStringProperty], (v, none) =>
        format(v, none),
      ),
      beam: new DerivedProperty([model.beamKineticEnergyProperty], (v) =>
        formatEnergy(v, THRESHOLDS_VIEW.METER_VALUE_DIGITS),
      ),
      sqrtS: new DerivedProperty([model.sqrtSProperty], (v) => formatEnergy(v, THRESHOLDS_VIEW.METER_VALUE_DIGITS)),
      finalMass: new DerivedProperty([model.finalMassProperty], (v) =>
        formatEnergy(v, THRESHOLDS_VIEW.METER_VALUE_DIGITS),
      ),
      cmSpeed: new DerivedProperty([model.cmVelocityProperty], (v) => `${formatBeta(v.magnitude)} c`),
      tiedUp: new DerivedProperty([model.initialStateProperty, model.sqrtSProperty], ([p1, p2], sqrtS) =>
        formatEnergy(Math.max(0, p1.energy + p2.energy - sqrtS), THRESHOLDS_VIEW.METER_VALUE_DIGITS),
      ),
    };
    const readouts = new VBox({
      align: "left",
      spacing: THRESHOLDS_VIEW.METER_READOUTS_SPACING,
      children: [
        createReadoutRow(
          r.thresholdStringProperty,
          values.threshold,
          RelativisticDynamicsColors.textColorProperty,
          READOUT_WIDTH,
        ),
        createReadoutRow(
          r.beamStringProperty,
          values.beam,
          RelativisticDynamicsColors.body1ColorProperty,
          READOUT_WIDTH,
        ),
        createReadoutRow(
          r.sqrtSStringProperty,
          values.sqrtS,
          RelativisticDynamicsColors.textColorProperty,
          READOUT_WIDTH,
        ),
        createReadoutRow(
          r.finalMassStringProperty,
          values.finalMass,
          RelativisticDynamicsColors.invariantColorProperty,
          READOUT_WIDTH,
        ),
        createReadoutRow(
          r.cmSpeedStringProperty,
          values.cmSpeed,
          RelativisticDynamicsColors.textColorProperty,
          READOUT_WIDTH,
        ),
        createReadoutRow(
          r.tiedUpStringProperty,
          values.tiedUp,
          RelativisticDynamicsColors.textColorProperty,
          READOUT_WIDTH,
        ),
      ],
    });

    this.children = [
      new VBox({
        align: "left",
        spacing: THRESHOLDS_VIEW.METER_CHILDREN_SPACING,
        children: [title, meter, readouts],
      }),
    ];

    Multilink.multilink(
      [
        model.sqrtSProperty,
        model.finalMassProperty,
        model.verdictProperty,
        strings.sqrtSLabelStringProperty,
        strings.finalMassLabelStringProperty,
      ],
      (sqrtS, finalMass, verdict, sqrtSName, finalMassName) => {
        const scale = METER_WIDTH / (1.15 * Math.max(sqrtS, finalMass, 1e-9));
        bar.setRectWidth(sqrtS * scale);
        bar.fill =
          verdict === Verdict.ALLOWED
            ? RelativisticDynamicsColors.allowedColorProperty
            : RelativisticDynamicsColors.forbiddenColorProperty;
        marker.x = finalMass * scale;
        sqrtSLabel.string = `${sqrtSName} = ${formatEnergy(sqrtS, THRESHOLDS_VIEW.SQRT_S_LABEL_DIGITS)}`;
        sqrtSLabel.left = THRESHOLDS_VIEW.METER_LEFT_INSET;
        sqrtSLabel.top = METER_HEIGHT + THRESHOLDS_VIEW.SQRT_S_LABEL_TOP_GAP;
        markerLabel.string = `${finalMassName} = ${formatEnergy(finalMass, THRESHOLDS_VIEW.MARKER_LABEL_DIGITS)}`;
        markerLabel.centerX = Math.min(METER_WIDTH - markerLabel.width / 2, Math.max(markerLabel.width / 2, marker.x));
        markerLabel.bottom = THRESHOLDS_VIEW.MARKER_LABEL_BOTTOM;
      },
    );
  }
}

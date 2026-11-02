/**
 * AccelerateTrackNode.ts
 *
 * The race: three lanes on a 20 m track, all starting together. A light pulse
 * (yellow), the particle as Newton predicts it (orange), and the particle as
 * relativity predicts it (cyan). The Newtonian ghost overtakes the light pulse
 * within a few nanoseconds for an electron; the real particle closes on the pulse
 * but never passes it. Each lane shows its current speed.
 */

import { Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { Circle, Line, Node, Rectangle, Text, type TPaint } from "scenerystack/scenery";
import { formatBeta, formatSignificant } from "../../common/view/chartUtils.js";
import { StringManager } from "../../i18n/StringManager.js";
import RelativisticDynamicsColors from "../../RelativisticDynamicsColors.js";
import { ACCELERATE, FONTS } from "../../RelativisticDynamicsConstants.js";
import type { AccelerateModel } from "../model/AccelerateModel.js";

const LANE_HEIGHT = 34;
const LABEL_COLUMN = 90;
const READOUT_COLUMN = 150;
const MARKER_RADIUS = 9;
const TICK_SPACING_M = 2;

export class AccelerateTrackNode extends Node {
  /**
   * @param showNewtonProperty - whether the Newtonian lane is drawn (a simulation preference)
   */
  public constructor(model: AccelerateModel, showNewtonProperty: TReadOnlyProperty<boolean>, width: number) {
    super();
    const strings = StringManager.getInstance().getAccelerateStrings();
    const trackLeft = LABEL_COLUMN;
    const trackWidth = width - LABEL_COLUMN - READOUT_COLUMN;
    const toView = (metres: number): number =>
      trackLeft + (Math.max(0, Math.min(ACCELERATE.TRACK_LENGTH_M, metres)) / ACCELERATE.TRACK_LENGTH_M) * trackWidth;

    type Lane = { marker: Node; readout: Text };
    const makeLane = (
      index: number,
      labelProperty: TReadOnlyProperty<string>,
      color: TPaint,
      marker: Node,
      visibleProperty?: TReadOnlyProperty<boolean>,
    ): Lane => {
      const y = index * LANE_HEIGHT + LANE_HEIGHT / 2;
      const label = new Text(labelProperty, {
        font: FONTS.READOUT_VALUE,
        fill: color,
        maxWidth: LABEL_COLUMN - 10,
        right: trackLeft - 10,
        centerY: y,
      });
      const lane = new Line(trackLeft, y, trackLeft + trackWidth, y, {
        stroke: RelativisticDynamicsColors.chartGridColorProperty,
        lineWidth: 2,
      });
      const readout = new Text("", {
        font: FONTS.READOUT_VALUE,
        fill: color,
        maxWidth: READOUT_COLUMN - 14,
        left: trackLeft + trackWidth + 14,
        centerY: y,
      });
      marker.centerY = y;
      if (visibleProperty) {
        for (const node of [label, lane, readout, marker]) {
          node.visibleProperty = visibleProperty;
        }
      }
      this.addChild(label);
      this.addChild(lane);
      this.addChild(readout);
      return { marker, readout };
    };

    const light = makeLane(
      0,
      strings.lanes.lightStringProperty,
      RelativisticDynamicsColors.lightColorProperty,
      new Rectangle(-12, -3, 24, 6, { fill: RelativisticDynamicsColors.lightColorProperty, cornerRadius: 3 }),
    );
    const newton = makeLane(
      1,
      strings.lanes.newtonStringProperty,
      RelativisticDynamicsColors.newtonianColorProperty,
      new Circle(MARKER_RADIUS, {
        fill: null,
        stroke: RelativisticDynamicsColors.newtonianColorProperty,
        lineWidth: 2.5,
        lineDash: [4, 3],
      }),
      showNewtonProperty,
    );
    const relativity = makeLane(
      2,
      strings.lanes.relativityStringProperty,
      RelativisticDynamicsColors.relativisticColorProperty,
      new Circle(MARKER_RADIUS, { fill: RelativisticDynamicsColors.relativisticColorProperty }),
    );

    // Start and finish lines, and a distance scale under the lanes.
    const bottom = 3 * LANE_HEIGHT;
    for (const metres of [0, ACCELERATE.TRACK_LENGTH_M]) {
      this.addChild(
        new Line(toView(metres), 0, toView(metres), bottom, {
          stroke: RelativisticDynamicsColors.chartAxisColorProperty,
          lineWidth: 2,
        }),
      );
    }
    for (let metres = 0; metres <= ACCELERATE.TRACK_LENGTH_M; metres += TICK_SPACING_M) {
      const x = toView(metres);
      this.addChild(new Line(x, bottom, x, bottom + 5, { stroke: RelativisticDynamicsColors.chartAxisColorProperty }));
      this.addChild(
        new Text(String(metres), {
          font: FONTS.TICK_LABEL,
          fill: RelativisticDynamicsColors.textColorProperty,
          centerX: x,
          top: bottom + 6,
        }),
      );
    }
    this.addChild(
      new Text(strings.trackAxisStringProperty, {
        font: FONTS.AXIS_LABEL,
        fill: RelativisticDynamicsColors.secondaryTextColorProperty,
        centerX: trackLeft + trackWidth / 2,
        top: bottom + 22,
        maxWidth: trackWidth,
      }),
    );

    // Markers on top of every lane line.
    this.addChild(light.marker);
    this.addChild(newton.marker);
    this.addChild(relativity.marker);

    Multilink.multilink(
      [model.snapshotProperty, strings.fasterThanLightStringProperty],
      (snapshot, fasterThanLight) => {
        light.marker.centerX = toView(snapshot.lightPosition);
        newton.marker.centerX = toView(snapshot.newtonianPosition);
        relativity.marker.centerX = toView(snapshot.position);

        light.readout.string = "u = c";
        relativity.readout.string = `u = ${formatBeta(snapshot.beta)} c`;
        const newtonBeta = snapshot.newtonianBeta;
        newton.readout.string =
          newtonBeta > 1
            ? `u = ${formatSignificant(newtonBeta, 3)} c, ${fasterThanLight}`
            : `u = ${formatBeta(newtonBeta)} c`;
      },
    );
  }
}

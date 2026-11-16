import { ACCELERATE_TRACK_NODE_SETTINGS } from "../../RelativisticDynamicsConstants.js";
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

const LANE_HEIGHT: number = ACCELERATE_TRACK_NODE_SETTINGS.LANE_HEIGHT;
const LABEL_COLUMN: number = ACCELERATE_TRACK_NODE_SETTINGS.LABEL_COLUMN;
const READOUT_COLUMN: number = ACCELERATE_TRACK_NODE_SETTINGS.READOUT_COLUMN;
const MARKER_RADIUS: number = ACCELERATE_TRACK_NODE_SETTINGS.MARKER_RADIUS;
const TICK_SPACING_M: number = ACCELERATE_TRACK_NODE_SETTINGS.TICK_SPACING_M;

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
        maxWidth: LABEL_COLUMN - ACCELERATE_TRACK_NODE_SETTINGS.LABEL_MAX_WIDTH_OFFSET,
        right: trackLeft - ACCELERATE_TRACK_NODE_SETTINGS.LABEL_RIGHT_OFFSET,
        centerY: y,
      });
      const lane = new Line(trackLeft, y, trackLeft + trackWidth, y, {
        stroke: RelativisticDynamicsColors.chartGridColorProperty,
        lineWidth: ACCELERATE_TRACK_NODE_SETTINGS.LANE_LINE_WIDTH,
      });
      const readout = new Text("", {
        font: FONTS.READOUT_VALUE,
        fill: color,
        maxWidth: READOUT_COLUMN - ACCELERATE_TRACK_NODE_SETTINGS.READOUT_MAX_WIDTH_OFFSET,
        left: trackLeft + trackWidth + ACCELERATE_TRACK_NODE_SETTINGS.READOUT_LEFT_OFFSET,
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
      new Rectangle(
        ACCELERATE_TRACK_NODE_SETTINGS.LIGHT_X,
        ACCELERATE_TRACK_NODE_SETTINGS.LIGHT_Y,
        ACCELERATE_TRACK_NODE_SETTINGS.LIGHT_WIDTH,
        ACCELERATE_TRACK_NODE_SETTINGS.LIGHT_HEIGHT,
        {
          fill: RelativisticDynamicsColors.lightColorProperty,
          cornerRadius: ACCELERATE_TRACK_NODE_SETTINGS.LIGHT_CORNER_RADIUS,
        },
      ),
    );
    const newton = makeLane(
      1,
      strings.lanes.newtonStringProperty,
      RelativisticDynamicsColors.newtonianColorProperty,
      new Circle(MARKER_RADIUS, {
        fill: null,
        stroke: RelativisticDynamicsColors.newtonianColorProperty,
        lineWidth: ACCELERATE_TRACK_NODE_SETTINGS.NEWTON_LINE_WIDTH,
        lineDash: [
          ACCELERATE_TRACK_NODE_SETTINGS.NEWTON_LINE_DASH_DASH,
          ACCELERATE_TRACK_NODE_SETTINGS.CONSTRUCTOR_NEWTON_LINE_DASH_DASH,
        ],
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
          lineWidth: ACCELERATE_TRACK_NODE_SETTINGS.CONSTRUCTOR_LINE_WIDTH,
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
          top: bottom + ACCELERATE_TRACK_NODE_SETTINGS.CONSTRUCTOR_TOP_OFFSET,
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
            ? `u = ${formatSignificant(newtonBeta, ACCELERATE_TRACK_NODE_SETTINGS.FORMAT_SIGNIFICANT_DIGITS)} c, ${fasterThanLight}`
            : `u = ${formatBeta(newtonBeta)} c`;
      },
    );
  }
}

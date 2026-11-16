/**
 * AvailableEnergyChartNode.ts
 *
 * √s against the total kinetic energy the accelerator supplies, for the two
 * ways of spending it. A head-on collider turns every MeV into available energy:
 * √s = K_supplied + m₁ + m₂, a straight line. A fixed target wastes most of it on
 * moving the centre of momentum: √s grows only like the square root of the beam
 * energy. The horizontal line is Σm_f c²; where each curve crosses it is that
 * configuration's threshold. This is the chapter's "wasted energy" figure, live.
 */

import { DerivedProperty, Multilink } from "scenerystack/axon";
import { LinePlot } from "scenerystack/bamboo";
import { Range, Vector2 } from "scenerystack/dot";
import { Circle, Node, RichText, Text, VBox } from "scenerystack/scenery";
import { sqrtSFixedTarget } from "../../common/model/kinematics.js";
import { ChartFrameNode } from "../../common/view/ChartFrameNode.js";
import { StringManager } from "../../i18n/StringManager.js";
import RelativisticDynamicsColors from "../../RelativisticDynamicsColors.js";
import { FONTS, THRESHOLDS_VIEW } from "../../RelativisticDynamicsConstants.js";

import { BeamConfiguration, suppliedKineticEnergy } from "../model/reactions.js";
import type { ThresholdsModel } from "../model/ThresholdsModel.js";

const WIDTH: number = THRESHOLDS_VIEW.CHART_WIDTH;
const HEIGHT: number = THRESHOLDS_VIEW.CHART_HEIGHT;
const SAMPLES: number = THRESHOLDS_VIEW.CHART_SAMPLES;

export class AvailableEnergyChartNode extends Node {
  public constructor(model: ThresholdsModel) {
    super();
    const strings = StringManager.getInstance().getThresholdsStrings();

    const chart = new ChartFrameNode({
      viewWidth: WIDTH,
      viewHeight: HEIGHT,
      xRange: new Range(0, 1),
      yRange: new Range(0, 1),
      xAxisLabelProperty: strings.chartXAxisStringProperty,
      yAxisLabelProperty: strings.chartYAxisStringProperty,
    });
    const transform = chart.chartTransform;
    const fixedCurve = new LinePlot(transform, [], {
      stroke: RelativisticDynamicsColors.body2ColorProperty,
      lineWidth: THRESHOLDS_VIEW.FIXED_CURVE_LINE_WIDTH,
    });
    const colliderCurve = new LinePlot(transform, [], {
      stroke: RelativisticDynamicsColors.body1ColorProperty,
      lineWidth: THRESHOLDS_VIEW.COLLIDER_CURVE_LINE_WIDTH,
    });
    const thresholdLine = new LinePlot(transform, [], {
      stroke: RelativisticDynamicsColors.invariantColorProperty,
      lineWidth: THRESHOLDS_VIEW.THRESHOLD_LINE_WIDTH,
      lineDash: [THRESHOLDS_VIEW.THRESHOLD_LINE_DASH, THRESHOLDS_VIEW.THRESHOLD_LINE_GAP],
    });
    chart.plotLayer.children = [thresholdLine, fixedCurve, colliderCurve];
    const marker = new Circle(THRESHOLDS_VIEW.CHART_MARKER_RADIUS, {
      fill: RelativisticDynamicsColors.textColorProperty,
    });
    const label = (
      textProperty: typeof strings.chartFixedStringProperty,
      fill: typeof RelativisticDynamicsColors.body1ColorProperty,
    ) =>
      new RichText(textProperty, {
        font: FONTS.TICK_LABEL,
        fill,
        maxWidth: THRESHOLDS_VIEW.CURVE_LABEL_MAX_WIDTH,
      });
    const fixedLabel = label(strings.chartFixedStringProperty, RelativisticDynamicsColors.body2ColorProperty);
    const colliderLabel = label(strings.chartColliderStringProperty, RelativisticDynamicsColors.body1ColorProperty);
    const thresholdLabel = label(
      strings.chartThresholdStringProperty,
      RelativisticDynamicsColors.invariantColorProperty,
    );
    chart.overlayLayer.children = [fixedLabel, colliderLabel, thresholdLabel, marker];

    // Supplied energy at the right edge: the current configuration's full slider range
    // (both beams together for a collider), so the marker is always on the chart.
    const xMaxProperty = new DerivedProperty(
      [model.reactionProperty, model.configurationProperty, model.beamRangeProperty],
      (reaction, configuration, beamRange) => suppliedKineticEnergy(reaction, configuration, beamRange),
    );

    Multilink.multilink(
      [model.reactionProperty, model.finalMassProperty, xMaxProperty],
      (reaction, finalMass, xMax) => {
        const m1 = reaction.beam.mass;
        const m2 = reaction.target.mass;
        const fixedAt = (k: number): number => sqrtSFixedTarget(m1, m1 + k, m2);
        const colliderAt = (k: number): number => k + m1 + m2;
        const showCollider = reaction.colliderAvailable;
        const yMax = 1.15 * Math.max(finalMass, fixedAt(xMax), showCollider ? colliderAt(xMax) : 0);
        chart.setRanges(new Range(0, xMax), new Range(0, yMax));

        const fixed: Vector2[] = [];
        for (let i = 0; i <= SAMPLES; i++) {
          const k = (xMax * i) / SAMPLES;
          fixed.push(new Vector2(k, fixedAt(k)));
        }
        fixedCurve.setDataSet(fixed);
        colliderCurve.setDataSet(
          showCollider ? [new Vector2(0, colliderAt(0)), new Vector2(xMax, colliderAt(xMax))] : [],
        );
        colliderLabel.visible = showCollider;
        thresholdLine.setDataSet(finalMass > 0 ? [new Vector2(0, finalMass), new Vector2(xMax, finalMass)] : []);
        thresholdLabel.visible = finalMass > 0;

        fixedLabel.right = WIDTH - THRESHOLDS_VIEW.FIXED_LABEL_RIGHT_INSET;
        fixedLabel.bottom = transform.modelToViewY(fixedAt(xMax)) - THRESHOLDS_VIEW.FIXED_LABEL_BOTTOM_GAP;
        // Below and to the right of the line, clear of the marker that rides on it.
        colliderLabel.left =
          transform.modelToViewX(xMax * THRESHOLDS_VIEW.COLLIDER_LABEL_X_FACTOR) +
          THRESHOLDS_VIEW.COLLIDER_LABEL_LEFT_GAP;
        colliderLabel.top = Math.max(
          THRESHOLDS_VIEW.COLLIDER_LABEL_TOP_MIN,
          transform.modelToViewY(colliderAt(xMax * THRESHOLDS_VIEW.COLLIDER_LABEL_Y_FACTOR)) +
            THRESHOLDS_VIEW.COLLIDER_LABEL_TOP_GAP,
        );
        thresholdLabel.left = THRESHOLDS_VIEW.CHART_LEFT_INSET;
        thresholdLabel.bottom = transform.modelToViewY(finalMass) - 2;
      },
    );

    Multilink.multilink(
      [model.reactionProperty, model.configurationProperty, model.beamKineticEnergyProperty, model.sqrtSProperty],
      (reaction, configuration, k, sqrtS) => {
        const supplied = suppliedKineticEnergy(reaction, configuration, k);
        const x = Math.min(transform.modelXRange.max, supplied);
        marker.center = new Vector2(transform.modelToViewX(x), transform.modelToViewY(sqrtS));
        marker.fill =
          configuration === BeamConfiguration.FIXED_TARGET
            ? RelativisticDynamicsColors.body2ColorProperty
            : RelativisticDynamicsColors.body1ColorProperty;
      },
    );

    this.children = [
      new VBox({
        align: "left",
        spacing: THRESHOLDS_VIEW.CHART_CHILDREN_SPACING,
        children: [
          new Text(strings.chartTitleStringProperty, {
            font: FONTS.CHART_TITLE,
            fill: RelativisticDynamicsColors.textColorProperty,
            maxWidth: WIDTH + THRESHOLDS_VIEW.CHART_TITLE_WIDTH_PAD,
          }),
          chart,
        ],
      }),
    ];
  }
}

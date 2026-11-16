import { AVAILABLE_ENERGY_CHART_NODE_SETTINGS } from "../../RelativisticDynamicsConstants.js";
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
import { FONTS } from "../../RelativisticDynamicsConstants.js";
import { BeamConfiguration, suppliedKineticEnergy } from "../model/reactions.js";
import type { ThresholdsModel } from "../model/ThresholdsModel.js";

const WIDTH: number = AVAILABLE_ENERGY_CHART_NODE_SETTINGS.WIDTH;
const HEIGHT: number = AVAILABLE_ENERGY_CHART_NODE_SETTINGS.HEIGHT;
const SAMPLES: number = AVAILABLE_ENERGY_CHART_NODE_SETTINGS.SAMPLES;

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
      lineWidth: AVAILABLE_ENERGY_CHART_NODE_SETTINGS.FIXED_CURVE_LINE_WIDTH,
    });
    const colliderCurve = new LinePlot(transform, [], {
      stroke: RelativisticDynamicsColors.body1ColorProperty,
      lineWidth: AVAILABLE_ENERGY_CHART_NODE_SETTINGS.COLLIDER_CURVE_LINE_WIDTH,
    });
    const thresholdLine = new LinePlot(transform, [], {
      stroke: RelativisticDynamicsColors.invariantColorProperty,
      lineWidth: AVAILABLE_ENERGY_CHART_NODE_SETTINGS.THRESHOLD_LINE_LINE_WIDTH,
      lineDash: [
        AVAILABLE_ENERGY_CHART_NODE_SETTINGS.THRESHOLD_LINE_LINE_DASH_DASH,
        AVAILABLE_ENERGY_CHART_NODE_SETTINGS.CONSTRUCTOR_THRESHOLD_LINE_LINE_DASH_DASH,
      ],
    });
    chart.plotLayer.children = [thresholdLine, fixedCurve, colliderCurve];
    const marker = new Circle(AVAILABLE_ENERGY_CHART_NODE_SETTINGS.MARKER_RADIUS, {
      fill: RelativisticDynamicsColors.textColorProperty,
    });
    const label = (
      textProperty: typeof strings.chartFixedStringProperty,
      fill: typeof RelativisticDynamicsColors.body1ColorProperty,
    ) =>
      new RichText(textProperty, {
        font: FONTS.TICK_LABEL,
        fill,
        maxWidth: AVAILABLE_ENERGY_CHART_NODE_SETTINGS.LABEL_MAX_WIDTH,
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

        fixedLabel.right = WIDTH - AVAILABLE_ENERGY_CHART_NODE_SETTINGS.CONSTRUCTOR_RIGHT_OFFSET;
        fixedLabel.bottom =
          transform.modelToViewY(fixedAt(xMax)) - AVAILABLE_ENERGY_CHART_NODE_SETTINGS.CONSTRUCTOR_BOTTOM_OFFSET;
        // Below and to the right of the line, clear of the marker that rides on it.
        colliderLabel.left =
          transform.modelToViewX(xMax * AVAILABLE_ENERGY_CHART_NODE_SETTINGS.CONSTRUCTOR_LEFT_FACTOR) +
          AVAILABLE_ENERGY_CHART_NODE_SETTINGS.CONSTRUCTOR_LEFT_OFFSET;
        colliderLabel.top = Math.max(
          AVAILABLE_ENERGY_CHART_NODE_SETTINGS.CONSTRUCTOR_TOP,
          transform.modelToViewY(colliderAt(xMax * AVAILABLE_ENERGY_CHART_NODE_SETTINGS.CONSTRUCTOR_TOP_FACTOR)) +
            AVAILABLE_ENERGY_CHART_NODE_SETTINGS.CONSTRUCTOR_TOP_OFFSET,
        );
        thresholdLabel.left = AVAILABLE_ENERGY_CHART_NODE_SETTINGS.LEFT_LEFT;
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
        spacing: AVAILABLE_ENERGY_CHART_NODE_SETTINGS.CHILDREN_SPACING,
        children: [
          new Text(strings.chartTitleStringProperty, {
            font: FONTS.CHART_TITLE,
            fill: RelativisticDynamicsColors.textColorProperty,
            maxWidth: WIDTH + AVAILABLE_ENERGY_CHART_NODE_SETTINGS.CONSTRUCTOR_MAX_WIDTH_OFFSET,
          }),
          chart,
        ],
      }),
    ];
  }
}

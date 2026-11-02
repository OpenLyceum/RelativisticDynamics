/**
 * AccelerateChartsNode.ts
 *
 * The two charts under the track.
 *
 *  Left   speed (or momentum) against time, traced as the run plays. Newton's
 *         speed is a straight line that leaves the top of the chart; relativity's
 *         bends over and creeps up to the c line. In momentum mode the two
 *         theories draw one and the same line, p = Ft: they agree on momentum and
 *         disagree only on what it implies for speed.
 *
 *  Right  speed² against kinetic energy, the plot of Bertozzi's 1964 experiment:
 *         Newton's straight line 2K/m, relativity's curve 1 − (m/(K + m))², and
 *         his five electron runs, which follow the curve.
 */

import { DerivedProperty, Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { LinePlot, ScatterPlot } from "scenerystack/bamboo";
import { Range, Vector2 } from "scenerystack/dot";
import { Circle, Node, Text, VBox } from "scenerystack/scenery";
import { ChartFrameNode } from "../../common/view/ChartFrameNode.js";
import { StringManager } from "../../i18n/StringManager.js";
import RelativisticDynamicsColors from "../../RelativisticDynamicsColors.js";
import { ACCELERATE, FONTS } from "../../RelativisticDynamicsConstants.js";
import type { AccelerateModel } from "../model/AccelerateModel.js";
import {
  accelerationSnapshot,
  bertozziPoints,
  nanosecondsToMetres,
  newtonianBetaSquared,
  relativisticBetaSquared,
} from "../model/acceleration.js";

const CHART_WIDTH = 245;
const CHART_HEIGHT = 200;
const SAMPLES = 120;
const MARKER_RADIUS = 5;

export class AccelerateChartsNode extends Node {
  /**
   * @param showNewtonProperty - whether Newton's curves and marker are drawn (a simulation preference)
   */
  public constructor(model: AccelerateModel, showNewtonProperty: TReadOnlyProperty<boolean>) {
    super();
    const strings = StringManager.getInstance().getAccelerateStrings();

    // ── Left: speed or momentum against time ─────────────────────────────────
    const leftYLabel = new DerivedProperty(
      [model.chartQuantityProperty, strings.speedAxisStringProperty, strings.momentumAxisStringProperty],
      (quantity, speed, momentum) => (quantity === "speed" ? speed : momentum),
    );
    const leftTitle = new DerivedProperty(
      [model.chartQuantityProperty, strings.speedChartTitleStringProperty, strings.momentumChartTitleStringProperty],
      (quantity, speed, momentum) => (quantity === "speed" ? speed : momentum),
    );
    const timeChart = new ChartFrameNode({
      viewWidth: CHART_WIDTH,
      viewHeight: CHART_HEIGHT,
      xRange: new Range(0, 1),
      yRange: new Range(0, ACCELERATE.CHART_MAX_BETA),
      xAxisLabelProperty: strings.timeAxisStringProperty,
      yAxisLabelProperty: leftYLabel,
    });
    const tLight = new LinePlot(timeChart.chartTransform, [], {
      stroke: RelativisticDynamicsColors.lightColorProperty,
      lineWidth: 1.5,
      lineDash: [6, 4],
    });
    const tNewton = new LinePlot(timeChart.chartTransform, [], {
      stroke: RelativisticDynamicsColors.newtonianColorProperty,
      lineWidth: 2.5,
      lineDash: [6, 3],
    });
    const tRelativity = new LinePlot(timeChart.chartTransform, [], {
      stroke: RelativisticDynamicsColors.relativisticColorProperty,
      lineWidth: 2.5,
    });
    timeChart.plotLayer.children = [tLight, tRelativity, tNewton];
    const cLabel = new Text(strings.speedOfLightStringProperty, {
      font: FONTS.READOUT_VALUE,
      fill: RelativisticDynamicsColors.lightColorProperty,
    });
    const momentumNote = new Text(strings.momentumNoteStringProperty, {
      font: FONTS.TICK_LABEL,
      fill: RelativisticDynamicsColors.textColorProperty,
      maxWidth: CHART_WIDTH - 12,
      left: 6,
      top: 6,
    });
    timeChart.overlayLayer.children = [cLabel, momentumNote];

    // ── Right: β² against K ─────────────────────────────────────────────────
    const energyChart = new ChartFrameNode({
      viewWidth: CHART_WIDTH,
      viewHeight: CHART_HEIGHT,
      xRange: new Range(0, 20),
      yRange: new Range(0, ACCELERATE.CHART_MAX_BETA_SQUARED),
      xAxisLabelProperty: strings.kineticEnergyAxisStringProperty,
      yAxisLabelProperty: strings.betaSquaredAxisStringProperty,
    });
    const kLight = new LinePlot(energyChart.chartTransform, [], {
      stroke: RelativisticDynamicsColors.lightColorProperty,
      lineWidth: 1.5,
      lineDash: [6, 4],
    });
    const kNewton = new LinePlot(energyChart.chartTransform, [], {
      stroke: RelativisticDynamicsColors.newtonianColorProperty,
      lineWidth: 2,
      lineDash: [6, 3],
    });
    const kRelativity = new LinePlot(energyChart.chartTransform, [], {
      stroke: RelativisticDynamicsColors.relativisticColorProperty,
      lineWidth: 2,
    });
    const bertozzi = new ScatterPlot(
      energyChart.chartTransform,
      bertozziPoints().map((p) => new Vector2(p.kineticEnergy, p.betaSquared)),
      { radius: 4.5, fill: RelativisticDynamicsColors.textColorProperty },
    );
    bertozzi.visibleProperty = new DerivedProperty(
      [model.showBertozziProperty, model.particleProperty],
      (show, particle) => show && particle === "electron",
    );
    energyChart.plotLayer.children = [kLight, kNewton, kRelativity, bertozzi];
    const newtonMarker = new Circle(MARKER_RADIUS, {
      stroke: RelativisticDynamicsColors.newtonianColorProperty,
      lineWidth: 2,
    });
    const relativityMarker = new Circle(MARKER_RADIUS, { fill: RelativisticDynamicsColors.relativisticColorProperty });
    energyChart.overlayLayer.children = [newtonMarker, relativityMarker];
    for (const node of [tNewton, kNewton, newtonMarker]) {
      node.visibleProperty = showNewtonProperty;
    }

    const titled = (titleProperty: TReadOnlyProperty<string>, chart: ChartFrameNode): VBox =>
      new VBox({
        spacing: 6,
        children: [
          new Text(titleProperty, {
            font: FONTS.CHART_TITLE,
            fill: RelativisticDynamicsColors.textColorProperty,
            maxWidth: CHART_WIDTH,
          }),
          chart,
        ],
      });
    const left = titled(leftTitle, timeChart);
    const right = titled(strings.betaSquaredChartTitleStringProperty, energyChart);
    right.left = left.right + 75;
    this.children = [left, right];

    // ── Geometry that depends on the run (particle, field) ───────────────────
    Multilink.multilink(
      [
        model.massProperty,
        model.fieldProperty,
        model.runDurationProperty,
        model.chartQuantityProperty,
        model.particleProperty,
      ],
      (mass, field, duration, quantity, particle) => {
        const finalMomentum = field * nanosecondsToMetres(duration);
        const yMax = quantity === "speed" ? ACCELERATE.CHART_MAX_BETA : finalMomentum * 1.1;
        timeChart.setRanges(new Range(0, duration), new Range(0, yMax));
        tLight.setDataSet(quantity === "speed" ? [new Vector2(0, 1), new Vector2(duration, 1)] : []);
        cLabel.visible = quantity === "speed";
        cLabel.right = CHART_WIDTH - 4;
        cLabel.bottom = timeChart.chartTransform.modelToViewY(1) - 2;
        momentumNote.visible = quantity === "momentum";

        const finalKineticEnergy = field * ACCELERATE.TRACK_LENGTH_M;
        const kMax =
          particle === "electron"
            ? Math.max(finalKineticEnergy, ACCELERATE.ELECTRON_CHART_MIN_KINETIC_ENERGY_MEV)
            : finalKineticEnergy;
        // A slow proton never gets near β² = 1; zoom the vertical axis onto what it does reach.
        const betaSquaredMax =
          particle === "electron"
            ? ACCELERATE.CHART_MAX_BETA_SQUARED
            : Math.min(ACCELERATE.CHART_MAX_BETA_SQUARED, Math.max(0.05, 1.25 * newtonianBetaSquared(mass, kMax)));
        energyChart.setRanges(new Range(0, kMax), new Range(0, betaSquaredMax));
        const relativityCurve: Vector2[] = [];
        for (let i = 0; i <= SAMPLES; i++) {
          const k = (kMax * i) / SAMPLES;
          relativityCurve.push(new Vector2(k, relativisticBetaSquared(mass, k)));
        }
        kRelativity.setDataSet(relativityCurve);
        kNewton.setDataSet([new Vector2(0, 0), new Vector2(kMax, newtonianBetaSquared(mass, kMax))]);
        kLight.setDataSet([new Vector2(0, 1), new Vector2(kMax, 1)]);
      },
    );

    // ── The trace, up to the current time ────────────────────────────────────
    Multilink.multilink(
      [
        model.timeProperty,
        model.massProperty,
        model.fieldProperty,
        model.chartQuantityProperty,
        model.snapshotProperty,
      ],
      (time, mass, field, quantity, snapshot) => {
        const relativity: Vector2[] = [];
        const newton: Vector2[] = [];
        for (let i = 0; i <= SAMPLES; i++) {
          const t = (time * i) / SAMPLES;
          const s = accelerationSnapshot(mass, field, nanosecondsToMetres(t));
          if (quantity === "speed") {
            relativity.push(new Vector2(t, s.beta));
            newton.push(new Vector2(t, s.newtonianBeta));
          } else {
            relativity.push(new Vector2(t, s.momentum));
            newton.push(new Vector2(t, s.momentum));
          }
        }
        tRelativity.setDataSet(relativity);
        tNewton.setDataSet(newton);

        const transform = energyChart.chartTransform;
        relativityMarker.center = new Vector2(
          transform.modelToViewX(snapshot.kineticEnergy),
          transform.modelToViewY(snapshot.beta * snapshot.beta),
        );
        // Newton's marker rides its own line; once off the top it is pinned to the frame edge.
        newtonMarker.center = new Vector2(
          transform.modelToViewX(Math.min(snapshot.newtonianKineticEnergy, transform.modelXRange.max)),
          Math.max(0, transform.modelToViewY(snapshot.newtonianBeta * snapshot.newtonianBeta)),
        );
      },
    );
  }
}

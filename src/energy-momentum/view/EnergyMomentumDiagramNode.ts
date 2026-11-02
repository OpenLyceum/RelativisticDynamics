/**
 * EnergyMomentumDiagramNode.ts
 *
 * The (pc, E) plane. A massive particle's four-momentum always lies on its *mass
 * shell*, the hyperbola E² − (pc)² = (mc²)², whatever frame measures it; a
 * photon's lies on the light line E = |pc|. The lab point and the moving
 * observer's point are the same four-momentum seen from two frames, so changing
 * the observer's speed slides the point *along* the hyperbola. That is the
 * Chapter 2 boost acting on (E, p) instead of (ct, x), and the reason the
 * invariant mass is the same for everyone.
 *
 * Axes are in units of mc² (so every massive particle has the same unit
 * hyperbola) or, for a massless particle, in MeV. The two axes use equal pixel
 * scales, which keeps the light line at 45°. The diagram zooms out in steps when
 * a point would leave it, so the curvature near the bottom of the hyperbola is
 * visible at low speed and the asymptote at high speed.
 */

import { DerivedProperty, Multilink } from "scenerystack/axon";
import { LinePlot } from "scenerystack/bamboo";
import { Range, Vector2 } from "scenerystack/dot";
import { Circle, Node, Text } from "scenerystack/scenery";
import { ChartFrameNode } from "../../common/view/ChartFrameNode.js";
import { StringManager } from "../../i18n/StringManager.js";
import RelativisticDynamicsColors from "../../RelativisticDynamicsColors.js";
import { ENERGY_MOMENTUM, FONTS } from "../../RelativisticDynamicsConstants.js";
import type { EnergyMomentumModel } from "../model/EnergyMomentumModel.js";

const ZOOM_LEVELS = ENERGY_MOMENTUM.DIAGRAM_ZOOM_LEVELS;
const P = ZOOM_LEVELS[0];
/** Largest range the diagram ever shows; the light line is drawn this far. */
const P_MAX = ZOOM_LEVELS[ZOOM_LEVELS.length - 1] ?? P;
const VIEW_WIDTH = ENERGY_MOMENTUM.DIAGRAM_VIEW_WIDTH;
/** Equal scales: the E range is half the pc range, so the height is half the width. */
const VIEW_HEIGHT = VIEW_WIDTH / 2;
const HYPERBOLA_SAMPLES = 120;
const POINT_RADIUS = 6;

export class EnergyMomentumDiagramNode extends Node {
  private readonly disposeDiagram: () => void;

  public constructor(model: EnergyMomentumModel) {
    super();
    const strings = StringManager.getInstance().getEnergyMomentumStrings();

    const xAxisLabelProperty = new DerivedProperty(
      [model.isMasslessProperty, strings.scaledMomentumAxisStringProperty, strings.photonMomentumAxisStringProperty],
      (massless, scaled, photon) => (massless ? photon : scaled),
    );
    const yAxisLabelProperty = new DerivedProperty(
      [model.isMasslessProperty, strings.scaledEnergyAxisStringProperty, strings.photonEnergyAxisStringProperty],
      (massless, scaled, photon) => (massless ? photon : scaled),
    );

    const chart = new ChartFrameNode({
      viewWidth: VIEW_WIDTH,
      viewHeight: VIEW_HEIGHT,
      xRange: new Range(-P, P),
      yRange: new Range(0, P),
      xAxisLabelProperty,
      yAxisLabelProperty,
    });
    const transform = chart.chartTransform;

    const title = new Text(strings.diagramTitleStringProperty, {
      font: FONTS.SECTION_HEADER,
      fill: RelativisticDynamicsColors.textColorProperty,
      maxWidth: VIEW_WIDTH,
      centerX: VIEW_WIDTH / 2,
      bottom: -8,
    });

    // The light line, both branches. Fixed: it is the same in every frame.
    const lightLine = new LinePlot(
      transform,
      [new Vector2(-P_MAX, P_MAX), new Vector2(0, 0), new Vector2(P_MAX, P_MAX)],
      {
        stroke: RelativisticDynamicsColors.lightColorProperty,
        lineWidth: 2,
        lineDash: [6, 4],
      },
    );
    const lightLabel = new Text(strings.lightLineStringProperty, {
      font: FONTS.TICK_LABEL,
      fill: RelativisticDynamicsColors.lightColorProperty,
      maxWidth: 80,
    });

    // The unit mass shell E = √(p² + 1). Hidden for a massless particle, whose shell is the light line.
    const massShell = new LinePlot(transform, [], {
      stroke: RelativisticDynamicsColors.invariantColorProperty,
      lineWidth: 2.5,
    });
    const massShellLabel = new Text(strings.massShellStringProperty, {
      font: FONTS.TICK_LABEL,
      fill: RelativisticDynamicsColors.invariantColorProperty,
      maxWidth: 80,
    });
    const massShellGroup = new Node({ children: [massShell, massShellLabel] });

    // Drop lines from the lab point to the axes, so pc and E can be read off.
    const dropLines = new LinePlot(transform, [], {
      stroke: RelativisticDynamicsColors.relativisticColorProperty,
      lineWidth: 1,
      lineDash: [3, 3],
    });

    chart.plotLayer.addChild(lightLine);
    chart.plotLayer.addChild(massShellGroup);
    chart.plotLayer.addChild(dropLines);
    chart.overlayLayer.addChild(lightLabel);

    const labPoint = new Circle(POINT_RADIUS, {
      fill: RelativisticDynamicsColors.relativisticColorProperty,
      stroke: RelativisticDynamicsColors.backgroundColorProperty,
    });
    const framePoint = new Circle(POINT_RADIUS, {
      fill: RelativisticDynamicsColors.accentColorProperty,
      stroke: RelativisticDynamicsColors.backgroundColorProperty,
    });
    const labLabel = new Text(strings.labPointStringProperty, {
      font: FONTS.PARTICLE_LABEL,
      fill: RelativisticDynamicsColors.relativisticColorProperty,
      maxWidth: 70,
    });
    const frameLabel = new Text(strings.framePointStringProperty, {
      font: FONTS.PARTICLE_LABEL,
      fill: RelativisticDynamicsColors.accentColorProperty,
      maxWidth: 80,
    });
    chart.overlayLayer.children = [lightLabel, framePoint, frameLabel, labPoint, labLabel];

    const viewBoundsMin = new Vector2(0, 0);
    const viewBoundsMax = new Vector2(VIEW_WIDTH, VIEW_HEIGHT);
    /** A model point's view position, clamped to the frame (an off-chart point sits hollow on the edge). */
    const place = (point: Circle, label: Text, p: number, e: number, labelAbove: boolean): void => {
      const view = new Vector2(transform.modelToViewX(p), transform.modelToViewY(e));
      const clamped = new Vector2(
        Math.max(viewBoundsMin.x, Math.min(viewBoundsMax.x, view.x)),
        Math.max(viewBoundsMin.y, Math.min(viewBoundsMax.y, view.y)),
      );
      const inside = clamped.equals(view);
      point.center = clamped;
      point.lineWidth = inside ? 1 : 3;
      label.centerX = Math.max(label.width / 2, Math.min(VIEW_WIDTH - label.width / 2, clamped.x));
      if (labelAbove) {
        label.bottom = clamped.y - POINT_RADIUS - 2;
      } else {
        label.top = clamped.y + POINT_RADIUS + 2;
      }
    };

    /** Re-ranges the chart to ±range and redraws everything whose geometry depends on it. */
    let currentRange = 0;
    const setZoom = (range: number): void => {
      if (range === currentRange) {
        return;
      }
      currentRange = range;
      chart.setRanges(new Range(-range, range), new Range(0, range));
      const points: Vector2[] = [];
      for (let i = 0; i <= HYPERBOLA_SAMPLES; i++) {
        const p = -range + (2 * range * i) / HYPERBOLA_SAMPLES;
        points.push(new Vector2(p, Math.hypot(p, 1)));
      }
      massShell.setDataSet(points);
      // "E = pc" sits below the left branch, in the empty region no particle can reach;
      // "mass shell" sits above the right branch, clear of the points that ride on it.
      lightLabel.right = transform.modelToViewX(-0.55 * range) - 2;
      lightLabel.top = transform.modelToViewY(0.55 * range) + 6;
      const shellP = 0.55 * range;
      massShellLabel.right = transform.modelToViewX(shellP) - 8;
      massShellLabel.bottom = transform.modelToViewY(Math.hypot(shellP, 1)) - 4;
    };
    setZoom(P);

    const multilink = Multilink.multilink(
      [
        model.labMomentumProperty,
        model.frameMomentumProperty,
        model.scaleProperty,
        model.isMasslessProperty,
        model.frameBetaProperty,
      ],
      (lab, frame, scale, massless, frameBeta) => {
        massShellGroup.visible = !massless;
        const labP = lab.px / scale;
        const labE = lab.energy / scale;
        const frameP = frame.px / scale;
        const frameE = frame.energy / scale;
        const showFrame = frameBeta !== 0;

        // Smallest zoom level that holds both points with a little headroom.
        const needed = 1.08 * Math.max(Math.abs(labP), labE, showFrame ? Math.max(Math.abs(frameP), frameE) : 0);
        setZoom(ZOOM_LEVELS.find((level) => level >= needed) ?? P_MAX);

        place(labPoint, labLabel, labP, labE, false);
        dropLines.setDataSet([new Vector2(labP, 0), new Vector2(labP, labE), new Vector2(-currentRange, labE)]);

        framePoint.visible = showFrame;
        frameLabel.visible = showFrame;
        place(framePoint, frameLabel, frameP, frameE, true);
      },
    );

    this.children = [title, chart];

    this.disposeDiagram = () => {
      multilink.dispose();
      xAxisLabelProperty.dispose();
      yAxisLabelProperty.dispose();
    };
  }

  public override dispose(): void {
    this.disposeDiagram();
    super.dispose();
  }
}

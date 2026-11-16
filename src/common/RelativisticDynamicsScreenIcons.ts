/**
 * RelativisticDynamicsScreenIcons.ts
 *
 * Home-screen and navigation-bar icons, one per screen, each a miniature of the
 * screen's central picture drawn in the sim's colour language:
 *
 *   Accelerate       the race: light pulse ahead, Newton's ghost overtaking it, the real particle behind
 *   Energy–Momentum  the triangle E² = (pc)² + (mc²)² beside its mass-shell hyperbola
 *   Collisions       two bodies meeting at a point and flying apart
 *   Thresholds       a beam striking a target and four products leaving together
 */

import { Shape } from "scenerystack/kite";
import { Circle, Line, Node, Path, Rectangle, type TPaint } from "scenerystack/scenery";
import { ArrowNode } from "scenerystack/scenery-phet";
import { ScreenIcon } from "scenerystack/sim";
import RelativisticDynamicsColors from "../RelativisticDynamicsColors.js";
import { SCREEN_ICONS } from "../RelativisticDynamicsConstants.js";

const W = 548;
const H = 373;

function background(): Rectangle {
  return new Rectangle(0, 0, W, H, { fill: RelativisticDynamicsColors.backgroundColorProperty });
}

function iconFrom(...content: Node[]): ScreenIcon {
  return new ScreenIcon(new Node({ children: [background(), ...content] }), {
    maxIconWidthProportion: 1,
    maxIconHeightProportion: 1,
    fill: RelativisticDynamicsColors.backgroundColorProperty,
  });
}

const arrow = (x1: number, y1: number, x2: number, y2: number, fill: TPaint): ArrowNode =>
  new ArrowNode(x1, y1, x2, y2, {
    fill,
    stroke: null,
    headWidth: SCREEN_ICONS.ARROW_HEAD_WIDTH,
    headHeight: SCREEN_ICONS.ARROW_HEAD_HEIGHT,
    tailWidth: SCREEN_ICONS.ARROW_TAIL_WIDTH,
  });

export function createAccelerateIcon(): ScreenIcon {
  const [lightY, newtonY, relativityY] = [95, 187, 279] as const;
  const laneY = [lightY, newtonY, relativityY];
  const lanes = laneY.map(
    (y) =>
      new Line(SCREEN_ICONS.LANES_START_X, y, SCREEN_ICONS.LANES_END_X, y, {
        stroke: RelativisticDynamicsColors.chartGridColorProperty,
        lineWidth: SCREEN_ICONS.LANES_LINE_WIDTH,
      }),
  );
  return iconFrom(
    ...lanes,
    new Line(
      SCREEN_ICONS.ACCELERATE_FINISH_X,
      SCREEN_ICONS.ACCELERATE_FINISH_TOP_Y,
      SCREEN_ICONS.ACCELERATE_FINISH_X,
      SCREEN_ICONS.ACCELERATE_FINISH_BOTTOM_Y,
      {
        stroke: RelativisticDynamicsColors.chartAxisColorProperty,
        lineWidth: SCREEN_ICONS.ACCELERATE_FINISH_LINE_WIDTH,
      },
    ),
    new Rectangle(
      SCREEN_ICONS.ACCELERATE_LIGHT_X,
      lightY - 12,
      SCREEN_ICONS.ACCELERATE_LIGHT_WIDTH,
      SCREEN_ICONS.ACCELERATE_LIGHT_HEIGHT,
      {
        fill: RelativisticDynamicsColors.lightColorProperty,
        cornerRadius: SCREEN_ICONS.ACCELERATE_LIGHT_CORNER_RADIUS,
      },
    ),
    new Circle(SCREEN_ICONS.ACCELERATE_MARKER_RADIUS, {
      x: SCREEN_ICONS.ACCELERATE_NEWTON_X,
      y: newtonY,
      stroke: RelativisticDynamicsColors.newtonianColorProperty,
      lineWidth: SCREEN_ICONS.ACCELERATE_NEWTON_LINE_WIDTH,
      lineDash: [SCREEN_ICONS.ACCELERATE_NEWTON_DASH, 10],
    }),
    new Circle(SCREEN_ICONS.ACCELERATE_MARKER_RADIUS, {
      x: SCREEN_ICONS.ACCELERATE_RELATIVITY_X,
      y: relativityY,
      fill: RelativisticDynamicsColors.relativisticColorProperty,
    }),
  );
}

export function createEnergyMomentumIcon(): ScreenIcon {
  // Triangle: right angle at the bottom left, legs pc (blue) and mc² (green), hypotenuse E (pink).
  const ox = 60;
  const oy = 310;
  const pc = 230;
  const mc2 = 170;
  const triangle = new Node({
    children: [
      new Line(ox, oy, ox + pc, oy, {
        stroke: RelativisticDynamicsColors.momentumColorProperty,
        lineWidth: SCREEN_ICONS.TRIANGLE_LINE_WIDTH,
      }),
      new Line(ox, oy, ox, oy - mc2, {
        stroke: RelativisticDynamicsColors.restEnergyColorProperty,
        lineWidth: SCREEN_ICONS.TRIANGLE_LINE_WIDTH,
      }),
      new Line(ox, oy - mc2, ox + pc, oy, {
        stroke: RelativisticDynamicsColors.totalEnergyColorProperty,
        lineWidth: SCREEN_ICONS.TRIANGLE_LINE_WIDTH,
      }),
    ],
  });
  // Mass shell E = √(p² + 1) and its light-line asymptote, on the right.
  const cx = 420;
  const by = 330;
  const unit = 70;
  const shell = new Shape();
  for (let i = 0; i <= 40; i++) {
    const p = -1.5 + (3 * i) / 40;
    const x = cx + p * unit;
    const y = by - Math.hypot(p, 1) * unit;
    if (i === 0) {
      shell.moveTo(x, y);
    } else {
      shell.lineTo(x, y);
    }
  }
  return iconFrom(
    triangle,
    new Path(
      new Shape()
        .moveTo(cx - 1.6 * unit, by - 1.6 * unit)
        .lineTo(cx, by)
        .lineTo(cx + 1.6 * unit, by - 1.6 * unit),
      {
        stroke: RelativisticDynamicsColors.lightColorProperty,
        lineWidth: SCREEN_ICONS.ENERGY_LIGHT_LINE_WIDTH,
        lineDash: [SCREEN_ICONS.ENERGY_LIGHT_DASH, 10],
      },
    ),
    new Path(shell, {
      stroke: RelativisticDynamicsColors.invariantColorProperty,
      lineWidth: SCREEN_ICONS.ENERGY_SHELL_LINE_WIDTH,
    }),
    new Circle(SCREEN_ICONS.ENERGY_POINT_RADIUS, {
      x: cx + SCREEN_ICONS.ENERGY_POINT_X_FACTOR * unit,
      y: by - Math.hypot(SCREEN_ICONS.ENERGY_POINT_P, 1) * unit,
      fill: RelativisticDynamicsColors.relativisticColorProperty,
    }),
  );
}

export function createCollisionsIcon(): ScreenIcon {
  const cx = W / 2;
  const cy = H / 2;
  return iconFrom(
    new Line(SCREEN_ICONS.COLLISIONS_INCOMING_START_X, cy, cx, cy, {
      stroke: RelativisticDynamicsColors.trailColorProperty,
      lineWidth: SCREEN_ICONS.COLLISIONS_TRAIL_LINE_WIDTH,
    }),
    new Line(cx, cy, cx + 170, cy - 120, {
      stroke: RelativisticDynamicsColors.trailColorProperty,
      lineWidth: SCREEN_ICONS.COLLISIONS_TRAIL_LINE_WIDTH,
    }),
    new Line(cx, cy, cx + 170, cy + 120, {
      stroke: RelativisticDynamicsColors.trailColorProperty,
      lineWidth: SCREEN_ICONS.COLLISIONS_TRAIL_LINE_WIDTH,
    }),
    new Circle(SCREEN_ICONS.COLLISIONS_BODY_RADIUS, {
      x: cx + SCREEN_ICONS.COLLISIONS_BODY_X_OFFSET,
      y: cy - SCREEN_ICONS.COLLISIONS_BODY_Y_OFFSET,
      fill: RelativisticDynamicsColors.body1ColorProperty,
    }),
    new Circle(SCREEN_ICONS.COLLISIONS_BODY_RADIUS, {
      x: cx + SCREEN_ICONS.COLLISIONS_BODY_X_OFFSET,
      y: cy + SCREEN_ICONS.COLLISIONS_BODY_Y_OFFSET,
      fill: RelativisticDynamicsColors.body2ColorProperty,
    }),
    arrow(cx + 150, cy - 106, cx + 225, cy - 159, RelativisticDynamicsColors.body1ColorProperty),
    arrow(cx + 150, cy + 106, cx + 225, cy + 159, RelativisticDynamicsColors.body2ColorProperty),
    new Circle(SCREEN_ICONS.COLLISIONS_COMPOSITE_RADIUS, {
      x: SCREEN_ICONS.COLLISIONS_COMPOSITE_X,
      y: cy,
      fill: RelativisticDynamicsColors.body1ColorProperty,
      opacity: SCREEN_ICONS.COLLISIONS_COMPOSITE_OPACITY,
    }),
  );
}

export function createThresholdsIcon(): ScreenIcon {
  const cy = H / 2;
  const tx = 300;
  const products = [-1.5, -0.5, 0.5, 1.5].map(
    (k) =>
      new Circle(SCREEN_ICONS.THRESHOLDS_PRODUCT_RADIUS, {
        x: tx + SCREEN_ICONS.THRESHOLDS_PRODUCT_X_OFFSET,
        y: cy + k * SCREEN_ICONS.THRESHOLDS_PRODUCT_Y_PITCH,
        fill: RelativisticDynamicsColors.compositeColorProperty,
      }),
  );
  const productArrows = [-1.5, -0.5, 0.5, 1.5].map((k) =>
    arrow(
      tx + 150,
      cy + k * SCREEN_ICONS.THRESHOLDS_PRODUCT_Y_PITCH,
      tx + 230,
      cy + k * SCREEN_ICONS.THRESHOLDS_PRODUCT_Y_PITCH,
      RelativisticDynamicsColors.compositeColorProperty,
    ),
  );
  return iconFrom(
    new Circle(SCREEN_ICONS.THRESHOLDS_BEAM_RADIUS, {
      x: SCREEN_ICONS.THRESHOLDS_BEAM_X,
      y: cy,
      fill: RelativisticDynamicsColors.body1ColorProperty,
    }),
    arrow(105, cy, 210, cy, RelativisticDynamicsColors.body1ColorProperty),
    new Circle(SCREEN_ICONS.THRESHOLDS_BEAM_RADIUS, {
      x: tx - SCREEN_ICONS.THRESHOLDS_TARGET_X_OFFSET,
      y: cy,
      fill: RelativisticDynamicsColors.body2ColorProperty,
    }),
    ...products,
    ...productArrows,
  );
}

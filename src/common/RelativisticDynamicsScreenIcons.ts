import { RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS } from "../RelativisticDynamicsConstants.js";
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
    headWidth: RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.ARROW_HEAD_WIDTH,
    headHeight: RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.ARROW_HEAD_HEIGHT,
    tailWidth: RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.ARROW_TAIL_WIDTH,
  });

export function createAccelerateIcon(): ScreenIcon {
  const [lightY, newtonY, relativityY] = [95, 187, 279] as const;
  const laneY = [lightY, newtonY, relativityY];
  const lanes = laneY.map(
    (y) =>
      new Line(
        RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.LANES_START_X,
        y,
        RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.LANES_END_X,
        y,
        {
          stroke: RelativisticDynamicsColors.chartGridColorProperty,
          lineWidth: RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.LANES_LINE_WIDTH,
        },
      ),
  );
  return iconFrom(
    ...lanes,
    new Line(
      RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.CREATE_ACCELERATE_ICON_START_X,
      RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.CREATE_ACCELERATE_ICON_START_Y,
      RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.CREATE_ACCELERATE_ICON_END_X,
      RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.CREATE_ACCELERATE_ICON_END_Y,
      {
        stroke: RelativisticDynamicsColors.chartAxisColorProperty,
        lineWidth: RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.CREATE_ACCELERATE_ICON_LINE_WIDTH,
      },
    ),
    new Rectangle(
      RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.CREATE_ACCELERATE_ICON_X,
      lightY - 12,
      RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.CREATE_ACCELERATE_ICON_WIDTH,
      RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.CREATE_ACCELERATE_ICON_HEIGHT,
      {
        fill: RelativisticDynamicsColors.lightColorProperty,
        cornerRadius: RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.CREATE_ACCELERATE_ICON_CORNER_RADIUS,
      },
    ),
    new Circle(RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.CREATE_ACCELERATE_ICON_RADIUS, {
      x: RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.CREATE_ACCELERATE_ICON_X_VARIANT_2,
      y: newtonY,
      stroke: RelativisticDynamicsColors.newtonianColorProperty,
      lineWidth: RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.CREATE_ACCELERATE_ICON_LINE_WIDTH_VARIANT_2,
      lineDash: [RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.CREATE_ACCELERATE_ICON_LINE_DASH_DASH, 10],
    }),
    new Circle(RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.CREATE_ACCELERATE_ICON_RADIUS, {
      x: RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.CREATE_ACCELERATE_ICON_X_VARIANT_3,
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
        lineWidth: RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.TRIANGLE_LINE_WIDTH,
      }),
      new Line(ox, oy, ox, oy - mc2, {
        stroke: RelativisticDynamicsColors.restEnergyColorProperty,
        lineWidth: RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.TRIANGLE_LINE_WIDTH,
      }),
      new Line(ox, oy - mc2, ox + pc, oy, {
        stroke: RelativisticDynamicsColors.totalEnergyColorProperty,
        lineWidth: RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.TRIANGLE_LINE_WIDTH,
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
        lineWidth: RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.CREATE_ENERGY_MOMENTUM_ICON_LINE_WIDTH,
        lineDash: [RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.CREATE_ENERGY_MOMENTUM_ICON_LINE_DASH_DASH, 10],
      },
    ),
    new Path(shell, {
      stroke: RelativisticDynamicsColors.invariantColorProperty,
      lineWidth: RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.CREATE_ENERGY_MOMENTUM_ICON_LINE_WIDTH_VARIANT_2,
    }),
    new Circle(RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.CREATE_ENERGY_MOMENTUM_ICON_RADIUS, {
      x: cx + RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.CREATE_ENERGY_MOMENTUM_ICON_X_FACTOR * unit,
      y: by - Math.hypot(RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.CREATE_ENERGY_MOMENTUM_ICON_Y, 1) * unit,
      fill: RelativisticDynamicsColors.relativisticColorProperty,
    }),
  );
}

export function createCollisionsIcon(): ScreenIcon {
  const cx = W / 2;
  const cy = H / 2;
  return iconFrom(
    new Line(RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.CREATE_COLLISIONS_ICON_START_X, cy, cx, cy, {
      stroke: RelativisticDynamicsColors.trailColorProperty,
      lineWidth: RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.CREATE_COLLISIONS_ICON_LINE_WIDTH,
    }),
    new Line(cx, cy, cx + 170, cy - 120, {
      stroke: RelativisticDynamicsColors.trailColorProperty,
      lineWidth: RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.CREATE_COLLISIONS_ICON_LINE_WIDTH,
    }),
    new Line(cx, cy, cx + 170, cy + 120, {
      stroke: RelativisticDynamicsColors.trailColorProperty,
      lineWidth: RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.CREATE_COLLISIONS_ICON_LINE_WIDTH,
    }),
    new Circle(RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.CREATE_COLLISIONS_ICON_RADIUS, {
      x: cx + RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.CREATE_COLLISIONS_ICON_X_OFFSET,
      y: cy - RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.CREATE_COLLISIONS_ICON_Y_OFFSET,
      fill: RelativisticDynamicsColors.body1ColorProperty,
    }),
    new Circle(RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.CREATE_COLLISIONS_ICON_RADIUS, {
      x: cx + RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.CREATE_COLLISIONS_ICON_X_OFFSET,
      y: cy + RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.CREATE_COLLISIONS_ICON_Y_OFFSET,
      fill: RelativisticDynamicsColors.body2ColorProperty,
    }),
    arrow(cx + 150, cy - 106, cx + 225, cy - 159, RelativisticDynamicsColors.body1ColorProperty),
    arrow(cx + 150, cy + 106, cx + 225, cy + 159, RelativisticDynamicsColors.body2ColorProperty),
    new Circle(RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.CREATE_COLLISIONS_ICON_RADIUS_SEGMENT_2, {
      x: RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.CREATE_COLLISIONS_ICON_X,
      y: cy,
      fill: RelativisticDynamicsColors.body1ColorProperty,
      opacity: RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.CREATE_COLLISIONS_ICON_OPACITY,
    }),
  );
}

export function createThresholdsIcon(): ScreenIcon {
  const cy = H / 2;
  const tx = 300;
  const products = [-1.5, -0.5, 0.5, 1.5].map(
    (k) =>
      new Circle(RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.PRODUCTS_RADIUS, {
        x: tx + RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.PRODUCTS_X_OFFSET,
        y: cy + k * RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.PRODUCTS_Y_FACTOR,
        fill: RelativisticDynamicsColors.compositeColorProperty,
      }),
  );
  const productArrows = [-1.5, -0.5, 0.5, 1.5].map((k) =>
    arrow(tx + 150, cy + k * 62, tx + 230, cy + k * 62, RelativisticDynamicsColors.compositeColorProperty),
  );
  return iconFrom(
    new Circle(RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.CREATE_THRESHOLDS_ICON_RADIUS, {
      x: RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.CREATE_THRESHOLDS_ICON_X,
      y: cy,
      fill: RelativisticDynamicsColors.body1ColorProperty,
    }),
    arrow(105, cy, 210, cy, RelativisticDynamicsColors.body1ColorProperty),
    new Circle(RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.CREATE_THRESHOLDS_ICON_RADIUS, {
      x: tx - RELATIVISTIC_DYNAMICS_SCREEN_ICONS_SETTINGS.CREATE_THRESHOLDS_ICON_X_OFFSET,
      y: cy,
      fill: RelativisticDynamicsColors.body2ColorProperty,
    }),
    ...products,
    ...productArrows,
  );
}

/**
 * CollisionPlayAreaNode.ts
 *
 * The collision as seen from the selected frame: a square-gridded plane (equal
 * scales, light-seconds), the two incoming bodies converging on the origin, and
 * whatever leaves it. Each body carries a velocity arrow and leaves a faint trail.
 * A dashed circle around the collision point marks how far light travels in one
 * second, so speeds can be judged against c at a glance.
 *
 * Disk area is proportional to rest mass, so a perfectly inelastic composite is
 * visibly *heavier* than the two bodies that made it.
 */

import { Multilink } from "scenerystack/axon";
import { Range, Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { StringUtils } from "scenerystack/phetcommon";
import { Circle, Node, Path, Text, type TPaint } from "scenerystack/scenery";
import { ArrowNode } from "scenerystack/scenery-phet";
import { ChartFrameNode } from "../../common/view/ChartFrameNode.js";
import { formatSignificant } from "../../common/view/chartUtils.js";
import { StringManager } from "../../i18n/StringManager.js";
import RelativisticDynamicsColors from "../../RelativisticDynamicsColors.js";
import { COLLISIONS, FONTS } from "../../RelativisticDynamicsConstants.js";
import type { CollisionsModel } from "../model/CollisionsModel.js";
import { type Body, positionAt } from "../model/collisionGeometry.js";

/** Pixels per unit of velocity for the arrows (an arrow of this length is a speed of c). */
const ARROW_SCALE = 55;

export class CollisionPlayAreaNode extends Node {
  public constructor(model: CollisionsModel, viewWidth: number, viewHeight: number) {
    super();
    const strings = StringManager.getInstance().getCollisionsStrings();
    const halfWidth = COLLISIONS.PLAY_AREA_HALF_WIDTH;
    const halfHeight = (halfWidth * viewHeight) / viewWidth;

    const chart = new ChartFrameNode({
      viewWidth,
      viewHeight,
      xRange: new Range(-halfWidth, halfWidth),
      yRange: new Range(-halfHeight, halfHeight),
      xAxisLabelProperty: strings.xAxisStringProperty,
      yAxisLabelProperty: strings.yAxisStringProperty,
      targetDivisions: 6,
    });
    const transform = chart.chartTransform;
    const toView = (p: Vector2): Vector2 => new Vector2(transform.modelToViewX(p.x), transform.modelToViewY(p.y));
    const pixelsPerUnit = viewWidth / (2 * halfWidth);

    // Light travels this far in one second of the viewing frame's time.
    const lightCircle = new Circle(pixelsPerUnit, {
      center: toView(Vector2.ZERO),
      stroke: RelativisticDynamicsColors.lightColorProperty,
      lineDash: [4, 4],
      opacity: 0.6,
    });

    const trails = new Path(null, { stroke: RelativisticDynamicsColors.trailColorProperty, lineWidth: 2 });
    chart.plotLayer.children = [lightCircle, trails];

    type Sprite = { disk: Circle; arrow: ArrowNode };
    const makeSprite = (fill: TPaint): Sprite => ({
      disk: new Circle(COLLISIONS.BODY_RADIUS_PX, {
        fill,
        stroke: RelativisticDynamicsColors.backgroundColorProperty,
        lineWidth: 1.5,
      }),
      arrow: new ArrowNode(0, 0, 1, 0, {
        fill: fill,
        stroke: null,
        headWidth: 9,
        headHeight: 8,
        tailWidth: 3,
      }),
    });
    const incomingSprites = [
      makeSprite(RelativisticDynamicsColors.body1ColorProperty),
      makeSprite(RelativisticDynamicsColors.body2ColorProperty),
    ];
    const elasticSprites = [
      makeSprite(RelativisticDynamicsColors.body1ColorProperty),
      makeSprite(RelativisticDynamicsColors.body2ColorProperty),
    ];
    const compositeSprite = makeSprite(RelativisticDynamicsColors.compositeColorProperty);
    const spriteLayer = new Node();
    for (const sprite of [...incomingSprites, ...elasticSprites, compositeSprite]) {
      spriteLayer.addChild(sprite.disk);
      spriteLayer.addChild(sprite.arrow);
    }
    chart.plotLayer.addChild(spriteLayer);

    const viewingText = new Text("", {
      font: FONTS.READOUT_VALUE,
      fill: RelativisticDynamicsColors.textColorProperty,
      maxWidth: viewWidth - 16,
      left: 8,
      top: 6,
    });
    chart.overlayLayer.addChild(viewingText);

    const place = (sprite: Sprite, body: Body, time: number, visible: boolean): void => {
      sprite.disk.visible = visible;
      sprite.arrow.visible = visible && body.velocity.magnitude > 1e-6;
      if (!visible) {
        return;
      }
      const center = toView(positionAt(body, time));
      sprite.disk.radius = COLLISIONS.BODY_RADIUS_PX * Math.sqrt(body.mass);
      sprite.disk.center = center;
      // View y points down, so flip the arrow's vertical component.
      const tip = center.plus(new Vector2(body.velocity.x, -body.velocity.y).timesScalar(ARROW_SCALE));
      // ArrowNode cannot draw a zero-length arrow (it normalizes the direction); skip it when hidden.
      if (sprite.arrow.visible) {
        sprite.arrow.setTailAndTip(center.x, center.y, tip.x, tip.y);
      }
    };

    Multilink.multilink(
      [
        model.viewStateProperty,
        model.timeProperty,
        model.modeProperty,
        model.frameProperty,
        model.frameBetaProperty,
        strings.viewingLabelStringProperty,
        strings.frameNames.labStringProperty,
        strings.frameNames.centerOfMomentumStringProperty,
        strings.frameNames.movingStringProperty,
      ],
      (state, time, mode, frame, beta, viewingPattern, labName, cmName, movingPattern) => {
        const before = time < 0;
        const [in1, in2] = state.incoming;
        if (in1 && in2) {
          place(incomingSprites[0] as Sprite, in1, time, before);
          place(incomingSprites[1] as Sprite, in2, time, before);
        }
        const elastic = mode === "elastic";
        const [out1, out2] = state.outgoing;
        if (elastic && out1 && out2) {
          place(elasticSprites[0] as Sprite, out1, time, !before);
          place(elasticSprites[1] as Sprite, out2, time, !before);
          place(compositeSprite, out1, time, false);
        } else if (out1) {
          place(compositeSprite, out1, time, !before);
          place(elasticSprites[0] as Sprite, out1, time, false);
          place(elasticSprites[1] as Sprite, out1, time, false);
        }

        // Trails: each incoming body from the start of the run to now (or to the collision),
        // each outgoing body from the collision to now.
        const start = -COLLISIONS.RUN_HALF_DURATION;
        const shape = new Shape();
        for (const body of state.incoming) {
          shape.moveToPoint(toView(positionAt(body, start))).lineToPoint(toView(positionAt(body, Math.min(time, 0))));
        }
        if (!before) {
          for (const body of state.outgoing) {
            shape.moveToPoint(toView(Vector2.ZERO)).lineToPoint(toView(positionAt(body, time)));
          }
        }
        trails.shape = shape;

        const frameName =
          frame === "lab"
            ? labName
            : frame === "centerOfMomentum"
              ? cmName
              : StringUtils.fillIn(movingPattern, { beta: formatSignificant(beta, 2) });
        viewingText.string = StringUtils.fillIn(viewingPattern, { frame: frameName });
      },
    );

    this.children = [chart];
  }
}

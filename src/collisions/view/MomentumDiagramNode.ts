/**
 * MomentumDiagramNode.ts
 *
 * The momenta γmu of the bodies, head to tail, in the viewing frame: the incoming
 * pair as solid arrows, the outgoing set as outlined arrows, and their common sum
 * in violet. Both chains end at the same point because momentum is conserved. In
 * the centre-of-momentum frame each chain closes on itself and the sum shrinks to
 * nothing.
 *
 * The drawing is rescaled to fit its box, so it shows directions and proportions,
 * not absolute size.
 */

import { Multilink } from "scenerystack/axon";
import { Bounds2, Vector2 } from "scenerystack/dot";
import { Circle, Node, Rectangle, Text, type TPaint } from "scenerystack/scenery";
import { ArrowNode } from "scenerystack/scenery-phet";
import { FourMomentum } from "../../common/model/kinematics.js";
import { StringManager } from "../../i18n/StringManager.js";
import RelativisticDynamicsColors from "../../RelativisticDynamicsColors.js";
import { FONTS } from "../../RelativisticDynamicsConstants.js";
import type { CollisionsModel } from "../model/CollisionsModel.js";
import type { Body } from "../model/collisionGeometry.js";

const ARROW_OPTIONS = { headWidth: 10, headHeight: 9, tailWidth: 3 };

export class MomentumDiagramNode extends Node {
  public constructor(model: CollisionsModel, size: number) {
    super();
    const strings = StringManager.getInstance().getCollisionsStrings();

    const frame = new Rectangle(0, 0, size, size, {
      fill: RelativisticDynamicsColors.chartBackgroundColorProperty,
      stroke: RelativisticDynamicsColors.chartAxisColorProperty,
    });
    const title = new Text(strings.momentumDiagramTitleStringProperty, {
      font: FONTS.CHART_TITLE,
      fill: RelativisticDynamicsColors.textColorProperty,
      maxWidth: size,
      left: 0,
      bottom: -4,
    });

    const solid = (fill: TPaint): ArrowNode => new ArrowNode(0, 0, 1, 0, { ...ARROW_OPTIONS, fill, stroke: null });
    const outline = (fill: TPaint): ArrowNode =>
      new ArrowNode(0, 0, 1, 0, { ...ARROW_OPTIONS, fill: null, stroke: fill, lineWidth: 1.5 });

    const in1 = solid(RelativisticDynamicsColors.body1ColorProperty);
    const in2 = solid(RelativisticDynamicsColors.body2ColorProperty);
    const out1 = outline(RelativisticDynamicsColors.body1ColorProperty);
    const out2 = outline(RelativisticDynamicsColors.body2ColorProperty);
    const outComposite = outline(RelativisticDynamicsColors.compositeColorProperty);
    const total = new ArrowNode(0, 0, 1, 0, {
      ...ARROW_OPTIONS,
      fill: RelativisticDynamicsColors.invariantColorProperty,
      stroke: null,
      opacity: 0.8,
    });
    const origin = new Circle(3, { fill: RelativisticDynamicsColors.textColorProperty });
    const arrows = new Node({ children: [total, in1, in2, out1, out2, outComposite, origin] });

    this.children = [frame, title, arrows];

    const momentumOf = (b: Body): Vector2 =>
      FourMomentum.fromMassAndVelocity(b.mass, b.velocity.x, b.velocity.y).momentum;

    Multilink.multilink([model.viewStateProperty], (state) => {
      const incoming = state.incoming.map(momentumOf);
      const outgoing = state.outgoing.map(momentumOf);
      const sum = incoming.reduce((s, p) => s.plus(p), Vector2.ZERO);

      // Chain points in model units: origin → p1 → p1 + p2, and origin → q1 (→ q1 + q2).
      const inMid = incoming[0] ?? Vector2.ZERO;
      const outMid = outgoing[0] ?? Vector2.ZERO;
      const points = [Vector2.ZERO, inMid, sum, outMid];
      const bounds = Bounds2.NOTHING.copy();
      for (const p of points) {
        bounds.addPoint(p);
      }
      const span = Math.max(bounds.width, bounds.height, 1e-6);
      const scale = (0.78 * size) / span;
      const centre = bounds.center;
      const toView = (p: Vector2): Vector2 =>
        new Vector2(size / 2 + (p.x - centre.x) * scale, size / 2 - (p.y - centre.y) * scale);

      const set = (arrow: ArrowNode, from: Vector2, to: Vector2, visible: boolean): void => {
        const a = toView(from);
        const b = toView(to);
        arrow.visible = visible && a.distance(b) > 2;
        // ArrowNode cannot draw a zero-length arrow (it normalizes the direction); skip it when hidden.
        if (arrow.visible) {
          arrow.setTailAndTip(a.x, a.y, b.x, b.y);
        }
      };
      set(in1, Vector2.ZERO, inMid, true);
      set(in2, inMid, sum, true);
      const elastic = outgoing.length === 2;
      set(out1, Vector2.ZERO, outMid, elastic);
      set(out2, outMid, sum, elastic);
      set(outComposite, Vector2.ZERO, sum, !elastic);
      set(total, Vector2.ZERO, sum, elastic);
      origin.center = toView(Vector2.ZERO);
    });
  }
}

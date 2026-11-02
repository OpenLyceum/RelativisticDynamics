/**
 * ReactionFrameNode.ts
 *
 * One reaction, before and after, as seen from one frame: the beam and target
 * with their velocity arrows, then the products with theirs. Shown twice on the
 * screen, once for the lab and once for the centre-of-momentum frame, which is
 * the chapter's threshold argument drawn out. At threshold the products sit
 * still in the CM frame and move off *together* in the lab: the beam's leftover
 * kinetic energy is locked up in the motion of the centre of momentum and cannot
 * make particles.
 *
 * Arrows show velocity (length ∝ β, full length = c), so "moving together" reads
 * as identical arrows. Particle positions after the reaction are schematic.
 */

import { Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import { Circle, Line, Node, Rectangle, RichText, Text, type TPaint } from "scenerystack/scenery";
import { ArrowNode } from "scenerystack/scenery-phet";
import type { FourMomentum } from "../../common/model/kinematics.js";
import type { Particle } from "../../common/model/particles.js";
import { StringManager } from "../../i18n/StringManager.js";
import RelativisticDynamicsColors from "../../RelativisticDynamicsColors.js";
import { FONTS } from "../../RelativisticDynamicsConstants.js";
import { Verdict } from "../model/reactions.js";
import type { ThresholdsModel } from "../model/ThresholdsModel.js";

export const REACTION_FRAME_WIDTH = 330;
const HEIGHT = 196;
const BEFORE_Y = 62;
const AFTER_Y = 150;
/** Arrow length for a speed of c, px. */
const ARROW_LENGTH = 62;
/** Distance of a product from the centre of its cluster, px. */
const CLUSTER_RADIUS = 26;
/** The most product sprites any reaction needs. */
const MAX_PRODUCTS = 4;

type Sprite = { disk: Circle; arrow: ArrowNode; label: Text; baseFill: TPaint };

export class ReactionFrameNode extends Node {
  /**
   * @param frameVelocityProperty - velocity of this panel's frame relative to the lab
   */
  public constructor(
    model: ThresholdsModel,
    titleProperty: TReadOnlyProperty<string>,
    frameVelocityProperty: TReadOnlyProperty<Vector2>,
    productsProperty: TReadOnlyProperty<FourMomentum[]>,
  ) {
    super();
    const strings = StringManager.getInstance().getThresholdsStrings();
    const centerX = REACTION_FRAME_WIDTH / 2;

    const background = new Rectangle(0, 0, REACTION_FRAME_WIDTH, HEIGHT, 6, 6, {
      fill: RelativisticDynamicsColors.chartBackgroundColorProperty,
      stroke: RelativisticDynamicsColors.chartAxisColorProperty,
    });
    const title = new Text(titleProperty, {
      font: FONTS.CHART_TITLE,
      fill: RelativisticDynamicsColors.textColorProperty,
      maxWidth: REACTION_FRAME_WIDTH - 16,
      left: 8,
      top: 6,
    });
    const sectionLabel = (labelProperty: TReadOnlyProperty<string>, y: number): Text =>
      new Text(labelProperty, {
        font: FONTS.TICK_LABEL,
        fill: RelativisticDynamicsColors.secondaryTextColorProperty,
        maxWidth: 60,
        left: 8,
        centerY: y,
      });
    const divider = new Line(8, (BEFORE_Y + AFTER_Y) / 2 + 4, REACTION_FRAME_WIDTH - 8, (BEFORE_Y + AFTER_Y) / 2 + 4, {
      stroke: RelativisticDynamicsColors.chartGridColorProperty,
      lineDash: [4, 4],
    });

    const makeSprite = (fill: TPaint): Sprite => ({
      disk: new Circle(8, { fill, stroke: RelativisticDynamicsColors.backgroundColorProperty }),
      arrow: new ArrowNode(0, 0, 1, 0, { fill, stroke: null, headWidth: 9, headHeight: 8, tailWidth: 3 }),
      label: new Text("", { font: FONTS.PARTICLE_LABEL, fill, maxWidth: 40 }),
      baseFill: fill,
    });
    const beam = makeSprite(RelativisticDynamicsColors.body1ColorProperty);
    const target = makeSprite(RelativisticDynamicsColors.body2ColorProperty);
    const products: Sprite[] = [];
    for (let i = 0; i < MAX_PRODUCTS; i++) {
      products.push(makeSprite(RelativisticDynamicsColors.compositeColorProperty));
    }

    const message = new RichText("", {
      font: FONTS.READOUT_VALUE,
      fill: RelativisticDynamicsColors.forbiddenColorProperty,
      align: "center",
      maxWidth: REACTION_FRAME_WIDTH - 80,
    });

    const spriteNodes = (s: Sprite): Node[] => [s.arrow, s.disk, s.label];
    this.children = [
      background,
      title,
      sectionLabel(strings.beforeStringProperty, BEFORE_Y),
      sectionLabel(strings.afterStringProperty, AFTER_Y),
      divider,
      ...spriteNodes(beam),
      ...spriteNodes(target),
      ...products.flatMap(spriteNodes),
      message,
    ];

    const place = (
      sprite: Sprite,
      particle: Particle,
      position: Vector2,
      velocity: Vector2,
      visible: boolean,
    ): void => {
      sprite.disk.visible = visible;
      sprite.label.visible = visible;
      sprite.arrow.visible = visible && velocity.magnitude * ARROW_LENGTH > 3;
      if (!visible) {
        return;
      }
      sprite.disk.radius = particle.id === "leadNucleus" ? 12 : particle.mass === 0 ? 5 : 8;
      // Photons are always drawn in the colour of light.
      const fill = particle.mass === 0 ? RelativisticDynamicsColors.lightColorProperty : sprite.baseFill;
      sprite.disk.fill = fill;
      sprite.arrow.fill = fill;
      sprite.label.fill = fill;
      sprite.disk.center = position;
      sprite.label.string = particle.symbol;
      // Beside the disk rather than above it, where a vertical arrow would run through it.
      sprite.label.left = position.x + sprite.disk.radius + 2;
      sprite.label.bottom = position.y - 2;
      const tip = position.plus(new Vector2(velocity.x, -velocity.y).timesScalar(ARROW_LENGTH));
      // ArrowNode cannot draw a zero-length arrow (it normalizes the direction); skip it when hidden.
      if (sprite.arrow.visible) {
        sprite.arrow.setTailAndTip(position.x, position.y, tip.x, tip.y);
      }
    };

    Multilink.multilink(
      [
        model.reactionProperty,
        model.initialStateProperty,
        frameVelocityProperty,
        productsProperty,
        model.verdictProperty,
        strings.belowThresholdStringProperty,
        strings.forbiddenStringProperty,
        strings.forbiddenReasonStringProperty,
      ],
      (reaction, initial, frameVelocity, finalState, verdict, belowText, forbiddenText, forbiddenReason) => {
        const [p1, p2] = initial.map((p) => p.boostedBy(frameVelocity));
        if (p1 && p2) {
          place(beam, reaction.beam, new Vector2(centerX - 70, BEFORE_Y), p1.velocity, true);
          place(target, reaction.target, new Vector2(centerX + 70, BEFORE_Y), p2.velocity, true);
        }

        const allowed = verdict === Verdict.ALLOWED;
        const n = reaction.products.length;
        products.forEach((sprite, i) => {
          const particle = reaction.products[i];
          const momentum = finalState[i];
          if (!(allowed && particle && momentum)) {
            place(sprite, reaction.beam, Vector2.ZERO, Vector2.ZERO, false);
            return;
          }
          // Spread the products around the cluster centre in the same directions as their CM momenta.
          const angle = Math.PI / 2 + (2 * Math.PI * i) / n;
          const offset =
            n > 1 ? new Vector2(Math.cos(angle), -Math.sin(angle)).timesScalar(CLUSTER_RADIUS) : Vector2.ZERO;
          place(sprite, particle, new Vector2(centerX, AFTER_Y).plus(offset), momentum.velocity, true);
        });

        message.visible = !allowed;
        message.string =
          verdict === Verdict.FORBIDDEN
            ? `${forbiddenText}<br><span style="font-size:11px">${forbiddenReason}</span>`
            : belowText;
        message.centerX = centerX;
        message.centerY = AFTER_Y;
      },
    );
  }
}

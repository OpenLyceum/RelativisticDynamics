import { REACTION_FRAME_NODE_SETTINGS } from "../../RelativisticDynamicsConstants.js";
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

export const REACTION_FRAME_WIDTH: number = REACTION_FRAME_NODE_SETTINGS.REACTION_FRAME_WIDTH;
const HEIGHT: number = REACTION_FRAME_NODE_SETTINGS.HEIGHT;
const BEFORE_Y: number = REACTION_FRAME_NODE_SETTINGS.BEFORE_Y;
const AFTER_Y: number = REACTION_FRAME_NODE_SETTINGS.AFTER_Y;
/** Arrow length for a speed of c, px. */
const ARROW_LENGTH: number = REACTION_FRAME_NODE_SETTINGS.ARROW_LENGTH;
/** Distance of a product from the centre of its cluster, px. */
const CLUSTER_RADIUS: number = REACTION_FRAME_NODE_SETTINGS.CLUSTER_RADIUS;
/** The most product sprites any reaction needs. */
const MAX_PRODUCTS: number = REACTION_FRAME_NODE_SETTINGS.MAX_PRODUCTS;

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

    const background = new Rectangle(
      0,
      0,
      REACTION_FRAME_WIDTH,
      HEIGHT,
      REACTION_FRAME_NODE_SETTINGS.BACKGROUND_CORNER_X,
      REACTION_FRAME_NODE_SETTINGS.BACKGROUND_CORNER_Y,
      {
        fill: RelativisticDynamicsColors.chartBackgroundColorProperty,
        stroke: RelativisticDynamicsColors.chartAxisColorProperty,
      },
    );
    const title = new Text(titleProperty, {
      font: FONTS.CHART_TITLE,
      fill: RelativisticDynamicsColors.textColorProperty,
      maxWidth: REACTION_FRAME_WIDTH - REACTION_FRAME_NODE_SETTINGS.TITLE_MAX_WIDTH_OFFSET,
      left: REACTION_FRAME_NODE_SETTINGS.TITLE_LEFT,
      top: REACTION_FRAME_NODE_SETTINGS.TITLE_TOP,
    });
    const sectionLabel = (labelProperty: TReadOnlyProperty<string>, y: number): Text =>
      new Text(labelProperty, {
        font: FONTS.TICK_LABEL,
        fill: RelativisticDynamicsColors.secondaryTextColorProperty,
        maxWidth: REACTION_FRAME_NODE_SETTINGS.SECTION_LABEL_MAX_WIDTH,
        left: REACTION_FRAME_NODE_SETTINGS.SECTION_LABEL_LEFT,
        centerY: y,
      });
    const divider = new Line(
      REACTION_FRAME_NODE_SETTINGS.DIVIDER_START_X,
      (BEFORE_Y + AFTER_Y) / 2 + 4,
      REACTION_FRAME_WIDTH - 8,
      (BEFORE_Y + AFTER_Y) / 2 + 4,
      {
        stroke: RelativisticDynamicsColors.chartGridColorProperty,
        lineDash: [
          REACTION_FRAME_NODE_SETTINGS.DIVIDER_LINE_DASH_DASH,
          REACTION_FRAME_NODE_SETTINGS.DIVIDER_LINE_DASH_DASH,
        ],
      },
    );

    const makeSprite = (fill: TPaint): Sprite => ({
      disk: new Circle(REACTION_FRAME_NODE_SETTINGS.MAKE_SPRITE_RADIUS, {
        fill,
        stroke: RelativisticDynamicsColors.backgroundColorProperty,
      }),
      arrow: new ArrowNode(0, 0, 1, 0, {
        fill,
        stroke: null,
        headWidth: REACTION_FRAME_NODE_SETTINGS.MAKE_SPRITE_HEAD_WIDTH,
        headHeight: REACTION_FRAME_NODE_SETTINGS.MAKE_SPRITE_HEAD_HEIGHT,
        tailWidth: REACTION_FRAME_NODE_SETTINGS.MAKE_SPRITE_TAIL_WIDTH,
      }),
      label: new Text("", {
        font: FONTS.PARTICLE_LABEL,
        fill,
        maxWidth: REACTION_FRAME_NODE_SETTINGS.MAKE_SPRITE_MAX_WIDTH,
      }),
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
      maxWidth: REACTION_FRAME_WIDTH - REACTION_FRAME_NODE_SETTINGS.MESSAGE_MAX_WIDTH_OFFSET,
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
      sprite.disk.radius =
        particle.id === "leadNucleus"
          ? REACTION_FRAME_NODE_SETTINGS.PLACE_RADIUS
          : particle.mass === 0
            ? REACTION_FRAME_NODE_SETTINGS.CONSTRUCTOR_PLACE_RADIUS
            : 8;
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

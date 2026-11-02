/**
 * VelocityPadNode.ts
 *
 * A two-dimensional velocity control: a disk whose rim is the speed of light,
 * with a draggable handle at the body's lab-frame velocity. Dragging (pointer or
 * keyboard) sets the velocity; the handle cannot leave the disk, so no setting
 * reaches c. The pad *is* velocity space, which makes "faster than light" a place
 * the student can see but not get to.
 */

import { Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { Vector2 as V2, type Vector2, type Vector2Property } from "scenerystack/dot";
import { ModelViewTransform2, StringUtils } from "scenerystack/phetcommon";
import { Circle, InteractiveHighlighting, Line, Node, RichDragListener, Text, type TPaint } from "scenerystack/scenery";
import { formatSignificant } from "../../common/view/chartUtils.js";
import { StringManager } from "../../i18n/StringManager.js";
import RelativisticDynamicsColors from "../../RelativisticDynamicsColors.js";
import { COLLISIONS, FONTS } from "../../RelativisticDynamicsConstants.js";

/** Radius of the c circle, px. */
const RADIUS = 52;
const HANDLE_RADIUS = 8;
/** Keyboard step, as a fraction of c. */
const KEYBOARD_STEP = 0.05;

class Handle extends InteractiveHighlighting(Circle) {}

export class VelocityPadNode extends Node {
  public readonly handle: Node;

  public constructor(
    velocityProperty: Vector2Property,
    fill: TPaint,
    labelProperty: TReadOnlyProperty<string>,
    accessibleName: TReadOnlyProperty<string>,
  ) {
    super();
    const a11y = StringManager.getInstance().getCollisionsA11yStrings().controls;

    const lightCircle = new Circle(RADIUS, {
      fill: RelativisticDynamicsColors.chartBackgroundColorProperty,
      stroke: RelativisticDynamicsColors.lightColorProperty,
      lineWidth: 2,
    });
    const maxCircle = new Circle(RADIUS * COLLISIONS.MAX_SPEED, {
      stroke: RelativisticDynamicsColors.chartGridColorProperty,
      lineDash: [3, 3],
    });
    const axes = new Node({
      children: [
        new Line(-RADIUS, 0, RADIUS, 0, { stroke: RelativisticDynamicsColors.chartGridColorProperty }),
        new Line(0, -RADIUS, 0, RADIUS, { stroke: RelativisticDynamicsColors.chartGridColorProperty }),
      ],
    });
    const cLabel = new Text("c", {
      font: FONTS.TICK_LABEL,
      fill: RelativisticDynamicsColors.lightColorProperty,
      left: RADIUS * 0.72 + 2,
      bottom: -RADIUS * 0.72 - 2,
    });
    const spoke = new Line(0, 0, 0, 0, { stroke: fill, lineWidth: 2 });

    const handle = new Handle(HANDLE_RADIUS, {
      fill,
      stroke: RelativisticDynamicsColors.backgroundColorProperty,
      cursor: "pointer",
      tagName: "div",
      focusable: true,
      ariaRole: "application",
      accessibleName,
      accessibleHelpText: a11y.velocityHelpStringProperty,
    });
    this.handle = handle;

    const title = new Text(labelProperty, {
      font: FONTS.READOUT_VALUE,
      fill,
      maxWidth: 2 * RADIUS + 20,
      centerX: 0,
      bottom: -RADIUS - 6,
    });
    const valueText = new Text("", {
      font: FONTS.TICK_LABEL,
      fill: RelativisticDynamicsColors.textColorProperty,
      maxWidth: 2 * RADIUS + 30,
      centerX: 0,
      top: RADIUS + 4,
    });

    this.children = [lightCircle, maxCircle, axes, cLabel, spoke, handle, title, valueText];

    // Model (velocity, y up) to pad coordinates (pixels, y down).
    const transform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(V2.ZERO, V2.ZERO, RADIUS);
    const clampToDisk = (v: Vector2): Vector2 =>
      v.magnitude > COLLISIONS.MAX_SPEED ? v.withMagnitude(COLLISIONS.MAX_SPEED) : v;
    handle.addInputListener(
      new RichDragListener({
        positionProperty: velocityProperty,
        transform,
        mapPosition: clampToDisk,
        keyboardDragListenerOptions: {
          dragDelta: KEYBOARD_STEP * RADIUS,
          shiftDragDelta: (KEYBOARD_STEP * RADIUS) / 5,
        },
        end: () => handle.addAccessibleObjectResponse(valueResponse),
      }),
    );

    // Spoken when a drag ends. Not written into the handle's PDOM content while dragging:
    // rewriting the focused element's description on every step drops keyboard focus.
    let valueResponse = "";

    Multilink.multilink([velocityProperty, a11y.velocityValueStringProperty], (velocity, pattern) => {
      const view = transform.modelToViewPosition(velocity);
      handle.center = view;
      spoke.setLine(0, 0, view.x, view.y);
      const speed = formatSignificant(velocity.magnitude, 2);
      const angle = Math.round((Math.atan2(velocity.y, velocity.x) * 180) / Math.PI);
      valueText.string = `${speed} c, ${velocity.magnitude < 1e-6 ? 0 : angle}°`;
      valueResponse = StringUtils.fillIn(pattern, { speed, angle: velocity.magnitude < 1e-6 ? 0 : angle });
    });
  }
}

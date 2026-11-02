/**
 * EnergyTriangleNode.ts
 *
 * The chapter's energy–momentum triangle (Figure ch03-energy-momentum), drawn
 * live: a right triangle whose horizontal leg is pc, whose vertical leg is mc²,
 * and whose hypotenuse is E. Below it, a bar splits E into rest energy and
 * kinetic energy, with Newton's ½mu² for the same speed underneath; and three
 * badges light up for the limits the chapter asks students to memorise.
 *
 * The triangle is rescaled every time so its longer leg fills the box: what the
 * student should read off is its *shape*. A slow particle is a tall, thin
 * triangle (E ≈ mc²); a fast one is long and flat (E ≈ pc); a photon has no
 * vertical leg at all.
 */

import { Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { Shape } from "scenerystack/kite";
import { Line, Node, Path, Rectangle, RichText, Text, VBox } from "scenerystack/scenery";
import { formatEnergy } from "../../common/view/chartUtils.js";
import { StringManager } from "../../i18n/StringManager.js";
import RelativisticDynamicsColors from "../../RelativisticDynamicsColors.js";
import { ENERGY_MOMENTUM, FONTS } from "../../RelativisticDynamicsConstants.js";
import type { EnergyMomentumModel } from "../model/EnergyMomentumModel.js";

/** Side of the square box the triangle is fitted into, px. */
const BOX = 170;
/** Full length of the energy bar, px. */
const BAR_WIDTH = 210;
const BAR_HEIGHT = 14;

export class EnergyTriangleNode extends Node {
  public constructor(model: EnergyMomentumModel) {
    super();
    const strings = StringManager.getInstance().getEnergyMomentumStrings();

    // ── Triangle ────────────────────────────────────────────────────────────
    const momentumLeg = new Line(0, 0, 0, 0, {
      stroke: RelativisticDynamicsColors.momentumColorProperty,
      lineWidth: 4,
    });
    const massLeg = new Line(0, 0, 0, 0, { stroke: RelativisticDynamicsColors.restEnergyColorProperty, lineWidth: 4 });
    const hypotenuse = new Line(0, 0, 0, 0, {
      stroke: RelativisticDynamicsColors.totalEnergyColorProperty,
      lineWidth: 4,
    });
    const rightAngle = new Path(null, { stroke: RelativisticDynamicsColors.chartAxisColorProperty, lineWidth: 1 });

    const labelOptions = { font: FONTS.READOUT_VALUE, maxWidth: 150 };
    const momentumLabel = new RichText("", { ...labelOptions, fill: RelativisticDynamicsColors.momentumColorProperty });
    const massLabel = new RichText("", { ...labelOptions, fill: RelativisticDynamicsColors.restEnergyColorProperty });
    const energyLabel = new RichText("", {
      ...labelOptions,
      fill: RelativisticDynamicsColors.totalEnergyColorProperty,
    });

    // A fixed-size invisible box keeps the column from resizing as the triangle changes shape.
    const triangleBox = new Rectangle(0, -BOX, BOX, BOX);
    const triangle = new Node({
      children: [triangleBox, rightAngle, momentumLeg, massLeg, hypotenuse],
    });
    // The values go in a legend keyed by colour rather than on the legs: a very steep or
    // very flat triangle leaves no room beside its short leg.
    const legend = new VBox({ align: "left", spacing: 2, children: [energyLabel, massLabel, momentumLabel] });

    const title = new Text(strings.triangleTitleStringProperty, {
      font: FONTS.SECTION_HEADER,
      fill: RelativisticDynamicsColors.textColorProperty,
      maxWidth: BAR_WIDTH + 20,
    });

    // ── Energy bar ──────────────────────────────────────────────────────────
    const barTitle = new Text(strings.energyBarTitleStringProperty, {
      font: FONTS.CONTROL_TITLE,
      fill: RelativisticDynamicsColors.secondaryTextColorProperty,
      maxWidth: BAR_WIDTH,
    });
    const restBar = new Rectangle(0, 0, 0, BAR_HEIGHT, { fill: RelativisticDynamicsColors.restEnergyColorProperty });
    const kineticBar = new Rectangle(0, 0, 0, BAR_HEIGHT, {
      fill: RelativisticDynamicsColors.kineticEnergyColorProperty,
    });
    const newtonBar = new Rectangle(0, 0, 0, BAR_HEIGHT, { fill: RelativisticDynamicsColors.newtonianColorProperty });
    const barOutline = new Rectangle(0, 0, BAR_WIDTH, BAR_HEIGHT, {
      stroke: RelativisticDynamicsColors.chartAxisColorProperty,
    });
    const smallLabel = { font: FONTS.TICK_LABEL, maxWidth: BAR_WIDTH / 2 };
    const restBarLabel = new RichText("mc²", {
      ...smallLabel,
      fill: RelativisticDynamicsColors.restEnergyColorProperty,
    });
    const kineticBarLabel = new RichText("K", {
      ...smallLabel,
      fill: RelativisticDynamicsColors.kineticEnergyColorProperty,
    });
    const newtonLabel = new Text(strings.newtonianBarStringProperty, {
      ...smallLabel,
      fill: RelativisticDynamicsColors.newtonianColorProperty,
    });
    const energyBar = new Node({ children: [restBar, kineticBar, barOutline, restBarLabel, kineticBarLabel] });
    const newtonRow = new Node({ children: [newtonBar, newtonLabel] });

    // ── Limit badges ────────────────────────────────────────────────────────
    const badge = (labelProperty: TReadOnlyProperty<string>): Text =>
      new Text(labelProperty, { font: FONTS.READOUT_VALUE, maxWidth: BAR_WIDTH + 20 });
    const atRestBadge = badge(strings.limits.atRestStringProperty);
    const ultraBadge = badge(strings.limits.ultrarelativisticStringProperty);
    const masslessBadge = badge(strings.limits.masslessStringProperty);

    this.children = [
      new VBox({
        align: "left",
        spacing: 10,
        children: [
          title,
          triangle,
          legend,
          barTitle,
          energyBar,
          newtonRow,
          new VBox({ align: "left", spacing: 4, children: [atRestBadge, ultraBadge, masslessBadge] }),
        ],
      }),
    ];

    Multilink.multilink([model.labStateProperty], (state) => {
      const pc = state.momentum;
      const mc2 = state.mass;
      const longest = Math.max(pc, mc2);
      const scale = longest > 0 ? BOX / longest : 0;
      const px = pc * scale;
      const my = -mc2 * scale;

      momentumLeg.setLine(0, 0, px, 0);
      massLeg.setLine(0, 0, 0, my);
      hypotenuse.setLine(0, my, px, 0);
      const corner = Math.min(10, px / 3, -my / 3);
      rightAngle.shape = corner > 2 ? new Shape().moveTo(corner, 0).lineTo(corner, -corner).lineTo(0, -corner) : null;

      momentumLabel.string = `pc = ${formatEnergy(pc, 3)}`;
      massLabel.string = `mc² = ${formatEnergy(mc2, 3)}`;
      energyLabel.string = `E = ${formatEnergy(state.energy, 3)}`;

      // Bars share one scale: the full bar is E.
      const unit = state.energy > 0 ? BAR_WIDTH / state.energy : 0;
      restBar.setRectWidth(mc2 * unit);
      kineticBar.setRect(mc2 * unit, 0, state.kineticEnergy * unit, BAR_HEIGHT);
      restBarLabel.left = 2;
      restBarLabel.top = BAR_HEIGHT + 2;
      kineticBarLabel.right = BAR_WIDTH - 2;
      kineticBarLabel.top = BAR_HEIGHT + 2;
      restBarLabel.visible = mc2 * unit > 30;

      const newtonEnergy = mc2 > 0 ? 0.5 * mc2 * state.beta * state.beta : 0;
      newtonBar.setRectWidth(newtonEnergy * unit);
      newtonLabel.left = newtonEnergy * unit + 6;
      newtonLabel.centerY = BAR_HEIGHT / 2;
      newtonRow.visible = mc2 > 0;

      const massless = mc2 === 0;
      const atRest = !massless && state.beta < ENERGY_MOMENTUM.AT_REST_BETA;
      const ultra = !massless && state.gamma >= ENERGY_MOMENTUM.ULTRARELATIVISTIC_GAMMA;
      const light = (on: boolean, node: Text) => {
        node.fill = on
          ? RelativisticDynamicsColors.textColorProperty
          : RelativisticDynamicsColors.secondaryTextColorProperty;
        node.opacity = on ? 1 : 0.5;
      };
      light(atRest, atRestBadge);
      light(ultra, ultraBadge);
      light(massless, masslessBadge);
    });
  }
}

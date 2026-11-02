/**
 * ConservationPanel.ts
 *
 * Before-and-after bars for every total the chapter cares about, computed in the
 * viewing frame: Σγmuₓ, Σγmu_y, ΣE, Σmc², ΣK, and, on request, Newton's Σmuₓ
 * and Σmu_y. Each row draws the "before" total as a solid bar and the "after"
 * total as an outlined bar on a shared zero line, then marks the row conserved
 * (✓) or not (✗).
 *
 * The relativistic momentum and energy rows are ✓ in every frame and for every
 * collision. Rest energy and kinetic energy trade off in a sticking collision.
 * Newton's rows fail in general, and that failure in a moving frame is the
 * chapter's argument for p = γmu.
 */

import { Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { Line, Node, Rectangle, RichText, Text, type TPaint, VBox } from "scenerystack/scenery";
import { RelativisticDynamicsPanel } from "../../common/RelativisticDynamicsPanel.js";
import { formatSignificant } from "../../common/view/chartUtils.js";
import { createCheckbox, createSectionHeader } from "../../common/view/controlHelpers.js";
import { StringManager } from "../../i18n/StringManager.js";
import RelativisticDynamicsColors from "../../RelativisticDynamicsColors.js";
import { FONTS } from "../../RelativisticDynamicsConstants.js";
import type { CollisionsModel } from "../model/CollisionsModel.js";
import type { Totals } from "../model/collisionGeometry.js";

const LABEL_WIDTH = 52;
const BAR_REGION = 100;
const BAR_HEIGHT = 7;
const VALUE_WIDTH = 70;
const ROW_HEIGHT = 2 * BAR_HEIGHT + 10;
/** Relative tolerance below which before and after count as equal. */
const TOLERANCE = 1e-7;

type RowSpec = {
  label: TReadOnlyProperty<string>;
  value: (totals: Totals) => number;
  fill: TPaint;
  visibleProperty?: TReadOnlyProperty<boolean>;
};

class ConservationRow extends Node {
  private readonly beforeBar: Rectangle;
  private readonly afterBar: Rectangle;
  private readonly valueText: Text;
  private readonly verdictText: Text;
  public readonly spec: RowSpec;

  public constructor(spec: RowSpec) {
    super();
    this.spec = spec;
    const label = new RichText(spec.label, {
      font: FONTS.READOUT_VALUE,
      fill: spec.fill,
      maxWidth: LABEL_WIDTH,
      centerY: ROW_HEIGHT / 2,
    });
    const zeroX = LABEL_WIDTH + 6 + BAR_REGION / 2;
    const zeroLine = new Line(zeroX, 1, zeroX, ROW_HEIGHT - 1, {
      stroke: RelativisticDynamicsColors.chartAxisColorProperty,
    });
    this.beforeBar = new Rectangle(0, 4, 0, BAR_HEIGHT, { fill: spec.fill });
    this.afterBar = new Rectangle(0, 6 + BAR_HEIGHT, 0, BAR_HEIGHT, { stroke: spec.fill, lineWidth: 1.5 });
    this.valueText = new Text("", {
      font: FONTS.TICK_LABEL,
      fill: RelativisticDynamicsColors.textColorProperty,
      maxWidth: VALUE_WIDTH,
      left: LABEL_WIDTH + BAR_REGION + 14,
      centerY: ROW_HEIGHT / 2,
    });
    this.verdictText = new Text("", {
      font: FONTS.READOUT_VALUE,
      left: LABEL_WIDTH + BAR_REGION + VALUE_WIDTH + 18,
      centerY: ROW_HEIGHT / 2,
    });
    this.children = [label, zeroLine, this.beforeBar, this.afterBar, this.valueText, this.verdictText];
    if (spec.visibleProperty) {
      this.visibleProperty = spec.visibleProperty;
    }
  }

  public update(before: Totals, after: Totals, scale: number): void {
    const zeroX = LABEL_WIDTH + 6 + BAR_REGION / 2;
    const half = BAR_REGION / 2;
    const b = this.spec.value(before);
    const a = this.spec.value(after);
    const bar = (rect: Rectangle, value: number): void => {
      const length = scale > 0 ? (value / scale) * half : 0;
      rect.setRect(Math.min(zeroX, zeroX + length), rect.rectY, Math.abs(length), BAR_HEIGHT);
    };
    bar(this.beforeBar, b);
    bar(this.afterBar, a);
    this.valueText.string = `${formatSignificant(clean(b), 3)} → ${formatSignificant(clean(a), 3)}`;
    const conserved = Math.abs(a - b) <= TOLERANCE * Math.max(1, scale);
    this.verdictText.string = conserved ? "✓" : "✗";
    this.verdictText.fill = conserved
      ? RelativisticDynamicsColors.allowedColorProperty
      : RelativisticDynamicsColors.forbiddenColorProperty;
  }
}

/** Rounds roundoff-sized values to zero so "−0.000" never shows. */
const clean = (value: number): number => (Math.abs(value) < 1e-9 ? 0 : value);

export class ConservationPanel extends RelativisticDynamicsPanel {
  public readonly newtonCheckbox: Node;

  public constructor(model: CollisionsModel) {
    const sm = StringManager.getInstance();
    const strings = sm.getCollisionsStrings();
    const a11y = sm.getCollisionsA11yStrings().controls;
    const rows = strings.rows;

    const specs: RowSpec[] = [
      {
        label: rows.momentumXStringProperty,
        value: (t) => t.momentum.x,
        fill: RelativisticDynamicsColors.relativisticColorProperty,
      },
      {
        label: rows.momentumYStringProperty,
        value: (t) => t.momentum.y,
        fill: RelativisticDynamicsColors.relativisticColorProperty,
      },
      {
        label: rows.energyStringProperty,
        value: (t) => t.energy,
        fill: RelativisticDynamicsColors.totalEnergyColorProperty,
      },
      {
        label: rows.restEnergyStringProperty,
        value: (t) => t.restEnergy,
        fill: RelativisticDynamicsColors.restEnergyColorProperty,
      },
      {
        label: rows.kineticEnergyStringProperty,
        value: (t) => t.kineticEnergy,
        fill: RelativisticDynamicsColors.kineticEnergyColorProperty,
      },
      {
        label: rows.newtonXStringProperty,
        value: (t) => t.newtonianMomentum.x,
        fill: RelativisticDynamicsColors.newtonianColorProperty,
        visibleProperty: model.showNewtonProperty,
      },
      {
        label: rows.newtonYStringProperty,
        value: (t) => t.newtonianMomentum.y,
        fill: RelativisticDynamicsColors.newtonianColorProperty,
        visibleProperty: model.showNewtonProperty,
      },
    ];
    const rowNodes = specs.map((spec) => new ConservationRow(spec));

    const legend = new Node({
      children: [
        new Rectangle(0, 0, 14, BAR_HEIGHT, { fill: RelativisticDynamicsColors.textColorProperty }),
        new Text(strings.beforeStringProperty, {
          font: FONTS.TICK_LABEL,
          fill: RelativisticDynamicsColors.textColorProperty,
          left: 18,
          centerY: BAR_HEIGHT / 2,
          maxWidth: 60,
        }),
        new Rectangle(90, 0, 14, BAR_HEIGHT, { stroke: RelativisticDynamicsColors.textColorProperty }),
        new Text(strings.afterStringProperty, {
          font: FONTS.TICK_LABEL,
          fill: RelativisticDynamicsColors.textColorProperty,
          left: 108,
          centerY: BAR_HEIGHT / 2,
          maxWidth: 60,
        }),
      ],
    });

    const newtonCheckbox = createCheckbox(
      model.showNewtonProperty,
      strings.showNewtonStringProperty,
      a11y.showNewtonStringProperty,
    );

    super(
      new VBox({
        align: "left",
        spacing: 6,
        children: [
          createSectionHeader(strings.conservationHeadingStringProperty),
          legend,
          // Hidden Newton rows keep their space, so toggling them does not shift the panels below.
          new VBox({ align: "left", spacing: 2, children: rowNodes, excludeInvisibleChildrenFromBounds: false }),
          newtonCheckbox,
        ],
      }),
    );
    this.newtonCheckbox = newtonCheckbox;

    Multilink.multilink([model.totalsBeforeProperty, model.totalsAfterProperty], (before, after) => {
      // One scale for every row, so a momentum bar and an energy bar can be compared.
      let scale = 0;
      for (const spec of specs) {
        scale = Math.max(scale, Math.abs(spec.value(before)), Math.abs(spec.value(after)));
      }
      for (const row of rowNodes) {
        row.update(before, after, scale);
      }
    });
  }
}

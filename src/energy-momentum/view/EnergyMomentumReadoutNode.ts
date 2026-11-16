/**
 * EnergyMomentumReadoutNode.ts
 *
 * The numbers behind the pictures: β, γ, p, K, E and the invariant mass, in the
 * lab and as the moving observer measures them. Every row but the last changes
 * when the observer speeds up; the invariant mass row never does, and it is drawn
 * in the invariant colour to say so.
 */

import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { GridBox, type Node, Text, type TPaint } from "scenerystack/scenery";
import type { ParticleState } from "../../common/model/kinematics.js";
import { RelativisticDynamicsPanel } from "../../common/RelativisticDynamicsPanel.js";
import { formatBeta, formatEnergy, formatSignificant } from "../../common/view/chartUtils.js";
import { StringManager } from "../../i18n/StringManager.js";
import RelativisticDynamicsColors from "../../RelativisticDynamicsColors.js";
import { ENERGY_MOMENTUM_VIEW, FONTS } from "../../RelativisticDynamicsConstants.js";

import type { EnergyMomentumModel } from "../model/EnergyMomentumModel.js";

const LABEL_WIDTH: number = ENERGY_MOMENTUM_VIEW.READOUT_LABEL_WIDTH;
const VALUE_WIDTH: number = ENERGY_MOMENTUM_VIEW.READOUT_VALUE_WIDTH;

type Row = {
  label: TReadOnlyProperty<string>;
  value: (state: ParticleState, signedMomentum: number) => string;
  fill?: TPaint;
};

export class EnergyMomentumReadoutNode extends RelativisticDynamicsPanel {
  private readonly disposeReadout: () => void;

  public constructor(model: EnergyMomentumModel) {
    const common = StringManager.getInstance().getCommonStrings();
    const strings = StringManager.getInstance().getEnergyMomentumStrings();
    const q = common.quantities;

    const rows: Row[] = [
      { label: q.speedStringProperty, value: (s) => `${formatBeta(s.beta)} c` },
      {
        label: q.gammaStringProperty,
        value: (s) =>
          Number.isFinite(s.gamma) ? formatSignificant(s.gamma, ENERGY_MOMENTUM_VIEW.READOUT_GAMMA_DIGITS) : "∞",
      },
      {
        label: q.momentumStringProperty,
        value: (_s, signed) => formatEnergy(signed, ENERGY_MOMENTUM_VIEW.READOUT_MOMENTUM_DIGITS, "/c"),
        fill: RelativisticDynamicsColors.momentumColorProperty,
      },
      {
        label: q.kineticEnergyStringProperty,
        value: (s) => formatEnergy(s.kineticEnergy, ENERGY_MOMENTUM_VIEW.READOUT_KINETIC_DIGITS),
        fill: RelativisticDynamicsColors.kineticEnergyColorProperty,
      },
      {
        label: q.totalEnergyStringProperty,
        value: (s) => formatEnergy(s.energy, ENERGY_MOMENTUM_VIEW.READOUT_ENERGY_DIGITS),
        fill: RelativisticDynamicsColors.totalEnergyColorProperty,
      },
      {
        label: q.invariantMassStringProperty,
        value: (s) => formatEnergy(s.mass, ENERGY_MOMENTUM_VIEW.READOUT_MASS_DIGITS, "/c²"),
        fill: RelativisticDynamicsColors.invariantColorProperty,
      },
    ];

    const disposables: { dispose: () => void }[] = [];
    const header = (labelProperty: TReadOnlyProperty<string>, fill: TPaint): Text =>
      new Text(labelProperty, { font: FONTS.READOUT_VALUE, fill, maxWidth: VALUE_WIDTH });

    const cells: Node[][] = [
      [
        new Text("", { font: FONTS.READOUT }),
        header(strings.labColumnStringProperty, RelativisticDynamicsColors.relativisticColorProperty),
        header(strings.frameColumnStringProperty, RelativisticDynamicsColors.accentColorProperty),
      ],
    ];
    for (const row of rows) {
      const labValue = new DerivedProperty([model.labStateProperty, model.labMomentumProperty], (s, p) =>
        row.value(s, p.px),
      );
      const frameValue = new DerivedProperty([model.frameStateProperty, model.frameMomentumProperty], (s, p) =>
        row.value(s, p.px),
      );
      disposables.push(labValue, frameValue);
      const valueOptions = {
        font: FONTS.READOUT_VALUE,
        fill: row.fill ?? RelativisticDynamicsColors.textColorProperty,
        maxWidth: VALUE_WIDTH,
      };
      cells.push([
        new Text(row.label, {
          font: FONTS.READOUT,
          fill: RelativisticDynamicsColors.secondaryTextColorProperty,
          maxWidth: LABEL_WIDTH,
        }),
        new Text(labValue, valueOptions),
        new Text(frameValue, valueOptions),
      ]);
    }

    const grid = new GridBox({
      rows: cells,
      xSpacing: ENERGY_MOMENTUM_VIEW.READOUT_GRID_X_SPACING,
      ySpacing: ENERGY_MOMENTUM_VIEW.READOUT_GRID_Y_SPACING,
      xAlign: "left",
    });

    super(grid);

    this.disposeReadout = () => {
      // The label and value Texts listen to localized strings and to the DerivedProperties
      // below; disposing the panel alone would leave them linked.
      grid.disposeSubtree();
      for (const d of disposables) {
        d.dispose();
      }
    };
  }

  public override dispose(): void {
    this.disposeReadout();
    super.dispose();
  }
}

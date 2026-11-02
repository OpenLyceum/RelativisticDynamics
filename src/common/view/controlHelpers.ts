/**
 * controlHelpers.ts
 *
 * Factories for the controls and readouts that recur on every screen, so a slider
 * on one screen and a slider on another are literally the same control rather
 * than two that happen to look alike. Adapted from the SpecialRelativity sim's
 * helpers of the same name.
 */

import type { PhetioProperty, TReadOnlyProperty } from "scenerystack/axon";
import { Dimension2, type Range } from "scenerystack/dot";
import { Node, Text, type TPaint } from "scenerystack/scenery";
import { NumberControl } from "scenerystack/scenery-phet";
import { Checkbox, RectangularPushButton, VerticalAquaRadioButtonGroup } from "scenerystack/sun";
import RelativisticDynamicsColors from "../../RelativisticDynamicsColors.js";
import { CONTROL_WIDTH, FONTS } from "../../RelativisticDynamicsConstants.js";
import { FLAT_RECTANGULAR_BUTTON_OPTIONS, LIGHT_SURFACE_TEXT_FILL } from "../RelativisticDynamicsButtonOptions.js";

export type NumberControlConfig = {
  titleProperty: TReadOnlyProperty<string>;
  valuePatternProperty: TReadOnlyProperty<string>;
  accessibleName: TReadOnlyProperty<string>;
  accessibleHelpText: TReadOnlyProperty<string>;
  decimalPlaces: number;
  delta: number;
  /** A sub-range of `range` the value is currently allowed into, when that depends on the model. */
  enabledRangeProperty?: TReadOnlyProperty<Range>;
  /**
   * Overall width the control should fit; defaults to CONTROL_WIDTH. A narrow
   * control puts its title on a row of its own so the title is not squeezed.
   */
  width?: number;
};

/** Below this width the title gets its own row. */
const NARROW_CONTROL_WIDTH = 170;

/**
 * A themed NumberControl: title above, value in a box, slider below.
 */
export const createNumberControl = (
  property: PhetioProperty<number>,
  range: Range,
  config: NumberControlConfig,
): NumberControl =>
  new NumberControl(config.titleProperty, property, range, {
    layoutFunction:
      (config.width ?? CONTROL_WIDTH) < NARROW_CONTROL_WIDTH
        ? NumberControl.createLayoutFunction3({ ySpacing: 6 })
        : NumberControl.createLayoutFunction2({ ySpacing: 10 }),
    delta: config.delta,
    titleNodeOptions: {
      font: FONTS.CONTROL_TITLE,
      fill: RelativisticDynamicsColors.textColorProperty,
      // In the wide layout the value box and its two arrow buttons share the title's row.
      maxWidth:
        (config.width ?? CONTROL_WIDTH) < NARROW_CONTROL_WIDTH
          ? (config.width ?? CONTROL_WIDTH)
          : (config.width ?? CONTROL_WIDTH) - 110,
    },
    numberDisplayOptions: {
      valuePattern: config.valuePatternProperty,
      decimalPlaces: config.decimalPlaces,
      textOptions: {
        font: FONTS.READOUT_VALUE,
        fill: RelativisticDynamicsColors.controlSurfaceTextColorProperty,
      },
      backgroundFill: RelativisticDynamicsColors.controlSurfaceColorProperty,
      backgroundStroke: RelativisticDynamicsColors.panelBorderColorProperty,
    },
    arrowButtonOptions: FLAT_RECTANGULAR_BUTTON_OPTIONS,
    sliderOptions: {
      trackSize: new Dimension2((config.width ?? CONTROL_WIDTH) - 40, 4),
      thumbFill: RelativisticDynamicsColors.accentColorProperty,
      majorTickLength: 10,
    },
    accessibleName: config.accessibleName,
    accessibleHelpText: config.accessibleHelpText,
    // Spread rather than assign: `exactOptionalPropertyTypes` rejects an explicit
    // undefined, and "no sub-range" must mean "absent".
    ...(config.enabledRangeProperty ? { enabledRangeProperty: config.enabledRangeProperty } : {}),
  });

/** A themed checkbox with its label. */
export const createCheckbox = (
  property: PhetioProperty<boolean>,
  labelProperty: TReadOnlyProperty<string>,
  accessibleName: TReadOnlyProperty<string>,
  width = CONTROL_WIDTH,
): Checkbox =>
  new Checkbox(
    property,
    new Text(labelProperty, {
      font: FONTS.READOUT,
      fill: RelativisticDynamicsColors.textColorProperty,
      maxWidth: width - 30,
    }),
    {
      checkboxColor: RelativisticDynamicsColors.textColorProperty,
      checkboxColorBackground: RelativisticDynamicsColors.panelBackgroundColorProperty,
      accessibleName,
    },
  );

/**
 * A themed flat push button carrying a text label. `enabledProperty` is optional,
 * so an always-available button need not invent an always-true Property.
 */
export const createPushButton = (
  labelProperty: TReadOnlyProperty<string>,
  config: {
    accessibleName: TReadOnlyProperty<string>;
    accessibleHelpText: TReadOnlyProperty<string>;
    enabledProperty?: TReadOnlyProperty<boolean>;
    listener: () => void;
    maxTextWidth?: number;
  },
): RectangularPushButton =>
  new RectangularPushButton({
    ...FLAT_RECTANGULAR_BUTTON_OPTIONS,
    content: new Text(labelProperty, {
      font: FONTS.READOUT,
      fill: LIGHT_SURFACE_TEXT_FILL,
      maxWidth: config.maxTextWidth ?? CONTROL_WIDTH - 24,
    }),
    baseColor: RelativisticDynamicsColors.controlSurfaceColorProperty,
    // Spread rather than assign: `exactOptionalPropertyTypes` rejects an explicit
    // undefined, and "always enabled" must mean "absent".
    ...(config.enabledProperty ? { enabledProperty: config.enabledProperty } : {}),
    listener: config.listener,
    accessibleName: config.accessibleName,
    accessibleHelpText: config.accessibleHelpText,
  });

/**
 * A themed vertical group of radio buttons: the control for a choice between
 * named peers rather than a value on a scale.
 */
export const createRadioButtonGroup = <T>(
  property: PhetioProperty<T>,
  items: readonly {
    value: T;
    labelProperty: TReadOnlyProperty<string>;
    accessibleName: TReadOnlyProperty<string>;
    enabledProperty?: TReadOnlyProperty<boolean>;
  }[],
  config: {
    accessibleName: TReadOnlyProperty<string>;
    accessibleHelpText: TReadOnlyProperty<string>;
    width?: number;
  },
): VerticalAquaRadioButtonGroup<T> =>
  new VerticalAquaRadioButtonGroup<T>(
    property,
    items.map((item) => ({
      value: item.value,
      createNode: () =>
        new Text(item.labelProperty, {
          font: FONTS.READOUT,
          fill: RelativisticDynamicsColors.textColorProperty,
          maxWidth: (config.width ?? CONTROL_WIDTH) - 40,
        }),
      options: {
        accessibleName: item.accessibleName,
        ...(item.enabledProperty ? { enabledProperty: item.enabledProperty } : {}),
      },
    })),
    {
      spacing: 7,
      align: "left",
      radioButtonOptions: {
        selectedColor: RelativisticDynamicsColors.accentColorProperty,
        deselectedColor: RelativisticDynamicsColors.controlSurfaceColorProperty,
        stroke: RelativisticDynamicsColors.chartAxisColorProperty,
      },
      accessibleName: config.accessibleName,
      accessibleHelpText: config.accessibleHelpText,
    },
  );

/**
 * A "label ......... value" row. The label and value are pushed to opposite ends
 * of a fixed width so a column of these reads as a table rather than as ragged
 * text, and the value can change length without shifting its neighbours.
 */
export const createReadoutRow = (
  labelProperty: TReadOnlyProperty<string>,
  valueProperty: TReadOnlyProperty<string>,
  valueFill: TPaint = RelativisticDynamicsColors.textColorProperty,
  width = CONTROL_WIDTH,
): Node => {
  const label = new Text(labelProperty, {
    font: FONTS.READOUT,
    fill: RelativisticDynamicsColors.secondaryTextColorProperty,
    maxWidth: width * 0.62,
  });
  const value = new Text(valueProperty, {
    font: FONTS.READOUT_VALUE,
    fill: valueFill,
    maxWidth: width * 0.38,
  });
  // Explicit placement rather than a justified HBox: the value's right edge is pinned
  // to the row width, so a column of rows lines up whatever the value's length.
  const row = new Node({ children: [label, value] });
  const place = (): void => {
    label.left = 0;
    label.centerY = 0;
    value.right = width;
    value.centerY = 0;
  };
  label.boundsProperty.lazyLink(place);
  value.boundsProperty.lazyLink(place);
  place();
  return row;
};

/** A bold section heading inside a panel. */
export const createSectionHeader = (labelProperty: TReadOnlyProperty<string>): Node =>
  new Text(labelProperty, {
    font: FONTS.SECTION_HEADER,
    fill: RelativisticDynamicsColors.textColorProperty,
    maxWidth: CONTROL_WIDTH,
  });

/** A quieter heading for a group of rows inside a section. */
export const createSubHeader = (labelProperty: TReadOnlyProperty<string>): Node =>
  new Text(labelProperty, {
    font: FONTS.CONTROL_TITLE,
    fill: RelativisticDynamicsColors.secondaryTextColorProperty,
    maxWidth: CONTROL_WIDTH,
  });

/**
 * main.ts
 *
 * Entry point for the simulation. Initializes SceneryStack, creates the
 * screens, and starts the main event loop.
 *
 * !! CRITICAL IMPORT ORDER !!
 * brand.js MUST be the first import. Each module imports the next, so the import nesting is
 *
 *   main → brand → splash → assert → init
 *
 * and therefore the actual EXECUTION order (deepest import runs first) is the reverse:
 *
 *   init → assert → splash → brand → main
 *
 * SceneryStack requires this exact load order. Never reorder these imports.
 */

// brand.js MUST be first; importing it runs the whole chain (init→assert→splash→brand) before main.
import "./brand.js";

import { onReadyToLaunch, PreferencesModel, Sim } from "scenerystack/sim";
import { Tandem } from "scenerystack/tandem";
import { AccelerateScreen } from "./accelerate/AccelerateScreen.js";
import { CollisionsScreen } from "./collisions/CollisionsScreen.js";
import { EnergyMomentumScreen } from "./energy-momentum/EnergyMomentumScreen.js";
import { StringManager } from "./i18n/StringManager.js";
import { RelativisticDynamicsPreferencesModel } from "./preferences/RelativisticDynamicsPreferencesModel.js";
import { RelativisticDynamicsPreferencesNode } from "./preferences/RelativisticDynamicsPreferencesNode.js";
import RelativisticDynamicsColors from "./RelativisticDynamicsColors.js";
import { ThresholdsScreen } from "./thresholds/ThresholdsScreen.js";

onReadyToLaunch(() => {
  const stringManager = StringManager.getInstance();

  // Simulation-specific preferences; initial values come from relativisticDynamicsQueryParameters.
  const simPreferences = new RelativisticDynamicsPreferencesModel(Tandem.ROOT.createTandem("preferences"));

  const screens = [
    new AccelerateScreen({
      name: stringManager.getScreenNames().accelerateStringProperty,
      tandem: Tandem.ROOT.createTandem("accelerateScreen"),
      backgroundColorProperty: RelativisticDynamicsColors.backgroundColorProperty,
    }),
    new EnergyMomentumScreen({
      name: stringManager.getScreenNames().energyMomentumStringProperty,
      tandem: Tandem.ROOT.createTandem("energyMomentumScreen"),
      backgroundColorProperty: RelativisticDynamicsColors.backgroundColorProperty,
    }),
    new CollisionsScreen({
      name: stringManager.getScreenNames().collisionsStringProperty,
      tandem: Tandem.ROOT.createTandem("collisionsScreen"),
      backgroundColorProperty: RelativisticDynamicsColors.backgroundColorProperty,
    }),
    new ThresholdsScreen({
      name: stringManager.getScreenNames().thresholdsStringProperty,
      tandem: Tandem.ROOT.createTandem("thresholdsScreen"),
      backgroundColorProperty: RelativisticDynamicsColors.backgroundColorProperty,
    }),
  ];

  const sim = new Sim(stringManager.getTitleStringProperty(), screens, {
    preferencesModel: new PreferencesModel({
      visualOptions: {
        // Adds a "Projector Mode" toggle in Preferences → Visual
        supportsProjectorMode: true,
        // Enables keyboard-navigation highlight outlines
        supportsInteractiveHighlights: true,
      },
      simulationOptions: {
        customPreferences: [
          {
            createContent: (tandem: Tandem) => new RelativisticDynamicsPreferencesNode(simPreferences, tandem),
          },
        ],
      },
      localizationOptions: {
        // Adds a language picker in Preferences → Language
        supportsDynamicLocale: true,
      },
    }),

    // Optional: fill in credits shown in Help → About
    credits: {
      leadDesign: "",
      softwareDevelopment: "",
      team: "",
      qualityAssurance: "",
    },
  });

  sim.start();
});

/**
 * relativisticDynamicsQueryParameters.ts
 *
 * Simulation-specific query parameters, read once at startup.
 *
 * Usage: append e.g. `?hideNewton` to the sim URL.
 */

import { logGlobal } from "scenerystack/phet-core";
import { QueryStringMachine } from "scenerystack/query-string-machine";
import RelativisticDynamicsNamespace from "../RelativisticDynamicsNamespace.js";

const relativisticDynamicsQueryParameters = QueryStringMachine.getAll({
  /**
   * Start with Newton's predictions hidden: the ghost particle and Newtonian curves on
   * the Accelerate screen and the ½mu² bar on the Energy–Momentum screen. Useful once a
   * class has seen the comparison and wants the relativistic picture alone.
   */
  hideNewton: {
    type: "flag",
    public: true,
  },
});

RelativisticDynamicsNamespace.register("relativisticDynamicsQueryParameters", relativisticDynamicsQueryParameters);

// Log query parameters (for the console / PhET-iO).
logGlobal("phet.chipper.queryParameters");

export default relativisticDynamicsQueryParameters;

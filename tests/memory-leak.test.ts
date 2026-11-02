/**
 * Memory-leak regression suite (fleet standard).
 *
 * List every model/view object that links Properties, adds listeners, or owns child
 * nodes, with a factory that builds a fresh instance. The shared harness in
 * tests/helpers/memoryLeak.ts (template-owned) checks that each one is garbage
 * collected after dispose() and leaves no survivors across repeated cycles
 * (idempotentDispose: true also checks a second dispose()). Add sim-specific leak
 * tests below using forceGC().
 *
 * This sim creates nothing at runtime: every view lives as long as its screen. The
 * cases below are the view nodes that implement dispose(), each built against one
 * long-lived model shared by every cycle, so a listener left on the model would keep
 * the node reachable and fail the test.
 */

import { EnergyMomentumModel } from "../src/energy-momentum/model/EnergyMomentumModel.js";
import { EnergyMomentumDiagramNode } from "../src/energy-momentum/view/EnergyMomentumDiagramNode.js";
import { EnergyMomentumReadoutNode } from "../src/energy-momentum/view/EnergyMomentumReadoutNode.js";
import { describeDisposalLeaks } from "./helpers/memoryLeak.js";

const sharedModel = new EnergyMomentumModel();

describeDisposalLeaks([
  { name: "EnergyMomentumDiagramNode", create: () => new EnergyMomentumDiagramNode(sharedModel) },
  { name: "EnergyMomentumReadoutNode", create: () => new EnergyMomentumReadoutNode(sharedModel) },
]);

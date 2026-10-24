/**
 * The design tokens live in the design-system submodule, shared with
 * julianhilgemann.com so both sites speak one design language. This file only
 * re-exports them, which keeps every import path identical to
 * julianhilgemann.com's (`../styles/tokens.mjs`): a component or script
 * copied across from there works unchanged.
 *
 * To pick up a change made in design-system:
 *   git submodule update --remote design-system
 */
export * from "../../design-system/tokens.mjs";

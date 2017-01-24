'use strict';

/**
 * A "placebo" reducer that passes through it's supplied supplied
 * state as-is.
 * 
 * @param {*} state - The current immutable state that is the reduction target.
 * @param {ReduxAction} action - The standard redux action which drives the reduction process.
 * @param {string} action.type - The action type.
 * 
 * @returns {*} The next state after reduction.
 */
export default function reducerPassThrough(state, action) {
  return state;
}

/*
 * @flow
 */

const RESET_REQUEST_STATE :'RESET_REQUEST_STATE' = 'RESET_REQUEST_STATE';
type ResetRequestStateAction = {|
  requestStateAction :string[];
  type :typeof RESET_REQUEST_STATE;
|};

const resetRequestState = (requestStateAction :string[]) :ResetRequestStateAction => ({
  requestStateAction,
  type: RESET_REQUEST_STATE,
});

const RESET_REQUEST_STATES :'RESET_REQUEST_STATES' = 'RESET_REQUEST_STATES';
type ResetRequestStatesAction = {|
  actions :string[];
  type :typeof RESET_REQUEST_STATES;
|};

const resetRequestStates = (actions :string[]) :ResetRequestStatesAction => ({
  actions,
  type: RESET_REQUEST_STATES,
});

export {
  RESET_REQUEST_STATE,
  RESET_REQUEST_STATES,
  resetRequestState,
  resetRequestStates,
};

export type {
  ResetRequestStatesAction,
};

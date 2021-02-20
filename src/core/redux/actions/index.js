/*
 * @flow
 */

const RESET_REQUEST_STATE :'RESET_REQUEST_STATE' = 'RESET_REQUEST_STATE';
type ResetRequestStateAction = (path :string[]) => {|
  path :string[];
  type :typeof RESET_REQUEST_STATE;
|};

// TODO: remove in favor of resetRequestStates
const resetRequestState :ResetRequestStateAction = (path :string[]) => ({
  path,
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
  ResetRequestStateAction,
  ResetRequestStatesAction,
};

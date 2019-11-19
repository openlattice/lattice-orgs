/*
 * @flow
 */

const RESET_REQUEST_STATE :'RESET_REQUEST_STATE' = 'RESET_REQUEST_STATE';
declare type ResetRequestStateAction = (actionType :string) => {|
  actionType :string;
  type :typeof RESET_REQUEST_STATE;
|};

const resetRequestState :ResetRequestStateAction = (actionType :string) => ({
  actionType,
  type: RESET_REQUEST_STATE,
});

export {
  RESET_REQUEST_STATE,
  resetRequestState,
};

export type {
  ResetRequestStateAction,
};

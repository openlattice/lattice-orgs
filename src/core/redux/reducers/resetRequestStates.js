/*
 * @flow
 */

import { Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import { LangUtils } from 'lattice-utils';

import { ERROR, REQUEST_STATE } from '../constants';
import type { ResetRequestStatesAction } from '../actions';

const { isNonEmptyString } = LangUtils;

export default function reducer(state :Map, action :ResetRequestStatesAction) {

  const { actions = [] } = action;
  let newState = state;
  actions.forEach((requestStateAction :string) => {
    if (isNonEmptyString(requestStateAction) && state.hasIn([requestStateAction])) {
      newState = newState
        .setIn([requestStateAction, ERROR], false)
        .setIn([requestStateAction, REQUEST_STATE], RequestStates.STANDBY);
    }
  });

  return newState;
}

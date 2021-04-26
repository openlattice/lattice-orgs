/*
 * @flow
 */

import { Map } from 'immutable';
import { LangUtils } from 'lattice-utils';

import { RS_INITIAL_STATE } from '../constants';
import type { ResetRequestStatesAction } from '../actions';

const { isNonEmptyArray } = LangUtils;

export default function reducer(state :Map, action :ResetRequestStatesAction) {

  const { requestStateAction = [] } = action;
  let newState = state;
  if (isNonEmptyArray(requestStateAction) && state.hasIn(requestStateAction)) {
    newState = newState.setIn(requestStateAction, RS_INITIAL_STATE);
  }

  return newState;
}

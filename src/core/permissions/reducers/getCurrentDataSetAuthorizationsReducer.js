/*
 * @flow
 */

import { Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  CURRENT,
  ERROR,
  REQUEST_STATE,
} from '../../redux/constants';
import {
  GET_CURRENT_DATA_SET_AUTHORIZATIONS,
  getCurrentDataSetAuthorizations,
} from '../actions';

export default function getCurrentDataSetAuthorizationsReducer(state :Map, action :SequenceAction) {

  return getCurrentDataSetAuthorizations.reducer(state, action, {
    REQUEST: () => state
      .setIn([GET_CURRENT_DATA_SET_AUTHORIZATIONS, REQUEST_STATE], RequestStates.PENDING)
      .setIn([GET_CURRENT_DATA_SET_AUTHORIZATIONS, action.id], action),
    SUCCESS: () => {
      if (state.hasIn([GET_CURRENT_DATA_SET_AUTHORIZATIONS, action.id])) {
        return state
          .mergeIn([CURRENT], action.value)
          .setIn([GET_CURRENT_DATA_SET_AUTHORIZATIONS, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([GET_CURRENT_DATA_SET_AUTHORIZATIONS, action.id])) {
        return state
          .setIn([GET_CURRENT_DATA_SET_AUTHORIZATIONS, ERROR], action.value)
          .setIn([GET_CURRENT_DATA_SET_AUTHORIZATIONS, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([GET_CURRENT_DATA_SET_AUTHORIZATIONS, action.id]),
  });
}

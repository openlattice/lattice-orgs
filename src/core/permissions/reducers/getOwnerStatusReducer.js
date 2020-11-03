/*
 * @flow
 */

import { Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  ERROR,
  IS_OWNER,
  REQUEST_STATE,
} from '../../redux/constants';
import {
  GET_OWNER_STATUS,
  getOwnerStatus,
} from '../actions';

export default function reducer(state :Map, action :SequenceAction) {

  return getOwnerStatus.reducer(state, action, {
    REQUEST: () => state
      .setIn([GET_OWNER_STATUS, REQUEST_STATE], RequestStates.PENDING)
      .setIn([GET_OWNER_STATUS, action.id], action),
    SUCCESS: () => {
      if (state.hasIn([GET_OWNER_STATUS, action.id])) {
        return state
          .mergeIn([IS_OWNER], action.value)
          .setIn([GET_OWNER_STATUS, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([GET_OWNER_STATUS, action.id])) {
        return state
          .setIn([GET_OWNER_STATUS, ERROR], action.value)
          .setIn([GET_OWNER_STATUS, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([GET_OWNER_STATUS, action.id]),
  });
}

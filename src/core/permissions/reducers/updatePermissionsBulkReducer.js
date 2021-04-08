/*
 * @flow
 */

import { Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { ERROR, REQUEST_STATE } from '../../redux/constants';
import {
  UPDATE_PERMISSIONS_BULK,
  updatePermissionsBulk,
} from '../actions';

export default function reducer(state :Map, action :SequenceAction) {

  return updatePermissionsBulk.reducer(state, action, {
    REQUEST: () => state
      .setIn([UPDATE_PERMISSIONS_BULK, REQUEST_STATE], RequestStates.PENDING)
      .setIn([UPDATE_PERMISSIONS_BULK, action.id], action),
    SUCCESS: () => state
      .setIn([UPDATE_PERMISSIONS_BULK, REQUEST_STATE], RequestStates.SUCCESS),
    FAILURE: () => {
      if (state.hasIn([UPDATE_PERMISSIONS_BULK, action.id])) {
        return state
          .setIn([UPDATE_PERMISSIONS_BULK, ERROR], action.value)
          .setIn([UPDATE_PERMISSIONS_BULK, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([UPDATE_PERMISSIONS_BULK, action.id]),
  });
}

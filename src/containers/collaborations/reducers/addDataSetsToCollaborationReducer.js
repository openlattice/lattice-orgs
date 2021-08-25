/*
 * @flow
 */

import { Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  ERROR,
  REQUEST_STATE
} from '../../../core/redux/constants';
import { ADD_DATA_SETS_TO_COLLABORATION, addDataSetsToCollaboration } from '../actions';

export default function addDataSetsToCollaborationReducer(state :Map, action :SequenceAction) {
  return addDataSetsToCollaboration.reducer(state, action, {
    REQUEST: () => state
      .setIn([ADD_DATA_SETS_TO_COLLABORATION, REQUEST_STATE], RequestStates.PENDING)
      .setIn([ADD_DATA_SETS_TO_COLLABORATION, action.id], action),
    // Don't need to set dataset - this is handled by the addDataSetToCollaboration reducer.
    SUCCESS: () => state
      .setIn([ADD_DATA_SETS_TO_COLLABORATION, REQUEST_STATE], RequestStates.SUCCESS),
    FAILURE: () => {
      if (state.hasIn([ADD_DATA_SETS_TO_COLLABORATION, action.id])) {
        return state
          .setIn([ADD_DATA_SETS_TO_COLLABORATION, ERROR], action.value)
          .setIn([ADD_DATA_SETS_TO_COLLABORATION, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([ADD_DATA_SETS_TO_COLLABORATION, action.id]),
  });
}

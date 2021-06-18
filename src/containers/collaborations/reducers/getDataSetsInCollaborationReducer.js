/*
 * @flow
 */

import { Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  COLLABORATION_DATA_SETS,
  ERROR,
  REQUEST_STATE
} from '../../../core/redux/constants';
import { GET_DATA_SETS_IN_COLLABORATION, getDataSetsInCollaboration } from '../actions';

export default function getDataSetsInCollaborationReducer(state :Map, action :SequenceAction) {
  return getDataSetsInCollaboration.reducer(state, action, {
    REQUEST: () => state
      .setIn([GET_DATA_SETS_IN_COLLABORATION, REQUEST_STATE], RequestStates.PENDING)
      .setIn([GET_DATA_SETS_IN_COLLABORATION, action.id], action),
    SUCCESS: () => {
      const storedSeqAction = state.getIn([GET_DATA_SETS_IN_COLLABORATION, action.id]);
      if (storedSeqAction) {
        const { collaborationId } = storedSeqAction.value;
        return state
          .setIn([COLLABORATION_DATA_SETS, collaborationId], action.value)
          .setIn([GET_DATA_SETS_IN_COLLABORATION, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([GET_DATA_SETS_IN_COLLABORATION, action.id])) {
        return state
          .setIn([GET_DATA_SETS_IN_COLLABORATION, ERROR], action.value)
          .setIn([GET_DATA_SETS_IN_COLLABORATION, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([GET_DATA_SETS_IN_COLLABORATION, action.id]),
  });
}

/*
 * @flow
 */

import { List, Map } from 'immutable';
import { CollaborationsApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  COLLABORATION_DATA_SETS,
  ERROR,
  REQUEST_STATE
} from '../../../core/redux/constants';

const { ADD_DATA_SET_TO_COLLABORATION, addDataSetToCollaboration } = CollaborationsApiActions;

export default function addDataSetToCollaborationReducer(state :Map, action :SequenceAction) {
  return addDataSetToCollaboration.reducer(state, action, {
    REQUEST: () => state
      .setIn([ADD_DATA_SET_TO_COLLABORATION, REQUEST_STATE], RequestStates.PENDING)
      .setIn([ADD_DATA_SET_TO_COLLABORATION, action.id], action),
    SUCCESS: () => {
      const storedSeqAction = state.getIn([ADD_DATA_SET_TO_COLLABORATION, action.id]);
      if (storedSeqAction) {
        const { collaborationId, dataSetId, organizationId } = storedSeqAction.value;
        const newState = state
          .updateIn(
            [COLLABORATION_DATA_SETS, collaborationId, organizationId],
            List(),
            (prevDataSetList) => prevDataSetList.push(dataSetId)
          )
          .setIn([ADD_DATA_SET_TO_COLLABORATION, REQUEST_STATE], RequestStates.SUCCESS);
        return newState;
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([ADD_DATA_SET_TO_COLLABORATION, action.id])) {
        return state
          .setIn([ADD_DATA_SET_TO_COLLABORATION, ERROR], action.value)
          .setIn([ADD_DATA_SET_TO_COLLABORATION, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([ADD_DATA_SET_TO_COLLABORATION, action.id]),
  });
}

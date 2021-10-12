/*
 * @flow
 */

import { List, Map } from 'immutable';
import { CollaborationsApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { COLLABORATION_DATA_SETS, ERROR, REQUEST_STATE } from '../../../common/constants';

const { REMOVE_DATA_SET_FROM_COLLABORATION, removeDataSetFromCollaboration } = CollaborationsApiActions;

export default function removeDataSetFromCollaborationReducer(state :Map, action :SequenceAction) {
  return removeDataSetFromCollaboration.reducer(state, action, {
    REQUEST: () => state
      .setIn([REMOVE_DATA_SET_FROM_COLLABORATION, REQUEST_STATE], RequestStates.PENDING)
      .setIn([REMOVE_DATA_SET_FROM_COLLABORATION, action.id], action),
    SUCCESS: () => {
      const storedSeqAction = state.getIn([REMOVE_DATA_SET_FROM_COLLABORATION, action.id]);
      if (storedSeqAction) {
        const { collaborationId, dataSetId, organizationId } = storedSeqAction.value;
        return state
          .updateIn([COLLABORATION_DATA_SETS, collaborationId], Map(), (prevDataSetMap) => prevDataSetMap
            .update(organizationId, List(), (prevDataSetList) => prevDataSetList.filter((dsId) => dsId !== dataSetId)))
          .setIn([REMOVE_DATA_SET_FROM_COLLABORATION, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([REMOVE_DATA_SET_FROM_COLLABORATION, action.id])) {
        return state
          .setIn([REMOVE_DATA_SET_FROM_COLLABORATION, ERROR], action.value)
          .setIn([REMOVE_DATA_SET_FROM_COLLABORATION, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([REMOVE_DATA_SET_FROM_COLLABORATION, action.id]),
  });
}

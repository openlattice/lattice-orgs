/*
 * @flow
 */

import { Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  COLLABORATIONS,
  ERROR,
  REQUEST_STATE
} from '../../../core/redux/constants';
import { CREATE_NEW_COLLABORATION, createNewCollaboration } from '../actions';

export default function createNewCollaborationReducer(state :Map, action :SequenceAction) {
  return createNewCollaboration.reducer(state, action, {
    REQUEST: () => state
      .setIn([CREATE_NEW_COLLABORATION, REQUEST_STATE], RequestStates.PENDING)
      .setIn([CREATE_NEW_COLLABORATION, action.id], action),
    SUCCESS: () => {
      if (state.getIn([CREATE_NEW_COLLABORATION, action.id])) {
        const { collaboration, collaborationId } = action.value;
        const collaborations :Map<UUID, Map> = state.get(COLLABORATIONS, Map())
          .set(collaborationId, collaboration);
        return state
          .set(COLLABORATIONS, collaborations)
          .setIn([CREATE_NEW_COLLABORATION, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([CREATE_NEW_COLLABORATION, action.id])) {
        return state
          .setIn([CREATE_NEW_COLLABORATION, ERROR], action.value)
          .setIn([CREATE_NEW_COLLABORATION, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([CREATE_NEW_COLLABORATION, action.id]),
  });
}

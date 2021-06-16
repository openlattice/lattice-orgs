/*
 * @flow
 */

import { Map } from 'immutable';
import { CollaborationsApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  ERROR,
  COLLABORATIONS,
  REQUEST_STATE
} from '../../../core/redux/constants';

const { DELETE_COLLABORATION, deleteCollaboration } = CollaborationsApiActions;

export default function deleteCollaborationReducer(state :Map, action :SequenceAction) {
  return deleteCollaboration.reducer(state, action, {
    REQUEST: () => state
      .setIn([DELETE_COLLABORATION, REQUEST_STATE], RequestStates.PENDING)
      .setIn([DELETE_COLLABORATION, action.id], action),
    SUCCESS: () => {
      const storedSeqAction = state.getIn([DELETE_COLLABORATION, action.id]);
      if (storedSeqAction) {
        return state
          .deleteIn([COLLABORATIONS, storedSeqAction.value])
          .setIn([DELETE_COLLABORATION, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([DELETE_COLLABORATION, action.id])) {
        return state
          .setIn([DELETE_COLLABORATION, ERROR], action.value)
          .setIn([DELETE_COLLABORATION, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([DELETE_COLLABORATION, action.id]),
  });
}

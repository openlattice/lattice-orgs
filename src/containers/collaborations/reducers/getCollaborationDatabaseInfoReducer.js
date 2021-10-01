/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { CollaborationsApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { DATABASE_DETAILS, ERROR, REQUEST_STATE } from '../../../common/constants';

const { GET_COLLABORATION_DATABASE_INFO, getCollaborationDatabaseInfo } = CollaborationsApiActions;

export default function getCollaborationDatabaseInfoReducer(state :Map, action :SequenceAction) {
  return getCollaborationDatabaseInfo.reducer(state, action, {
    REQUEST: () => state
      .setIn([GET_COLLABORATION_DATABASE_INFO, REQUEST_STATE], RequestStates.PENDING)
      .setIn([GET_COLLABORATION_DATABASE_INFO, action.id], action),
    SUCCESS: () => {
      const storedSeqAction = state.getIn([GET_COLLABORATION_DATABASE_INFO, action.id]);
      if (storedSeqAction) {
        return state
          .setIn([DATABASE_DETAILS, storedSeqAction.value], fromJS(action.value))
          .setIn([GET_COLLABORATION_DATABASE_INFO, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([GET_COLLABORATION_DATABASE_INFO, action.id])) {
        return state
          .setIn([GET_COLLABORATION_DATABASE_INFO, ERROR], action.value)
          .setIn([GET_COLLABORATION_DATABASE_INFO, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([GET_COLLABORATION_DATABASE_INFO, action.id]),
  });
}

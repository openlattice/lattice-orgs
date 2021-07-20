/*
 * @flow
 */

import { Map } from 'immutable';
import { CollaborationsApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  DATABASE_DETAILS,
  ERROR,
  REQUEST_STATE,
  TITLE
} from '../../../core/redux/constants';

const { RENAME_COLLABORATION_DATABASE, renameCollaborationDatabase } = CollaborationsApiActions;

export default function renameCollaborationDatabaseReducer(state :Map, action :SequenceAction) {
  return renameCollaborationDatabase.reducer(state, action, {
    REQUEST: () => state
      .setIn([RENAME_COLLABORATION_DATABASE, REQUEST_STATE], RequestStates.PENDING)
      .setIn([RENAME_COLLABORATION_DATABASE, action.id], action),
    SUCCESS: () => {
      const storedSeqAction = state.getIn([RENAME_COLLABORATION_DATABASE, action.id]);
      if (storedSeqAction) {
        const { collaborationId, name } = storedSeqAction.value;
        return state
          .setIn([DATABASE_DETAILS, collaborationId, TITLE], name)
          .setIn([RENAME_COLLABORATION_DATABASE, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([RENAME_COLLABORATION_DATABASE, action.id])) {
        return state
          .setIn([RENAME_COLLABORATION_DATABASE, ERROR], action.value)
          .setIn([RENAME_COLLABORATION_DATABASE, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([RENAME_COLLABORATION_DATABASE, action.id]),
  });
}

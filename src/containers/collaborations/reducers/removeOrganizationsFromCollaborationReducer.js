/*
 * @flow
 */

import { List, Map } from 'immutable';
import { CollaborationsApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  COLLABORATIONS,
  ORGANIZATION_IDS,
  ERROR,
  REQUEST_STATE
} from '../../../core/redux/constants';

const { REMOVE_ORGANIZATIONS_FROM_COLLABORATION, removeOrganizationsFromCollaboration } = CollaborationsApiActions;

export default function removeOrganiztionsToCollaborationReducer(state :Map, action :SequenceAction) {
  return removeOrganizationsFromCollaboration.reducer(state, action, {
    REQUEST: () => state
      .setIn([REMOVE_ORGANIZATIONS_FROM_COLLABORATION, REQUEST_STATE], RequestStates.PENDING)
      .setIn([REMOVE_ORGANIZATIONS_FROM_COLLABORATION, action.id], action),
    SUCCESS: () => {
      const storedSeqAction = state.getIn([REMOVE_ORGANIZATIONS_FROM_COLLABORATION, action.id]);
      if (storedSeqAction) {
        const { collaborationId, organizationIds } = storedSeqAction.value;
        return state
          .updateIn(
            [COLLABORATIONS, collaborationId, ORGANIZATION_IDS],
            List(),
            (prev) => prev.filterNot((id) => organizationIds.includes(id))
          )
          .setIn([REMOVE_ORGANIZATIONS_FROM_COLLABORATION, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([REMOVE_ORGANIZATIONS_FROM_COLLABORATION, action.id])) {
        return state
          .setIn([REMOVE_ORGANIZATIONS_FROM_COLLABORATION, ERROR], action.value)
          .setIn([REMOVE_ORGANIZATIONS_FROM_COLLABORATION, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([REMOVE_ORGANIZATIONS_FROM_COLLABORATION, action.id]),
  });
}

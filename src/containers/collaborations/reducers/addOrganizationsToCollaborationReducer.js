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

const { ADD_ORGANIZATIONS_TO_COLLABORATION, addOrganizationsToCollaboration } = CollaborationsApiActions;

export default function addOrganiztionsToCollaborationReducer(state :Map, action :SequenceAction) {
  return addOrganizationsToCollaboration.reducer(state, action, {
    REQUEST: () => state
      .setIn([ADD_ORGANIZATIONS_TO_COLLABORATION, REQUEST_STATE], RequestStates.PENDING)
      .setIn([ADD_ORGANIZATIONS_TO_COLLABORATION, action.id], action),
    SUCCESS: () => {
      const storedSeqAction = state.getIn([ADD_ORGANIZATIONS_TO_COLLABORATION, action.id]);
      if (storedSeqAction) {
        const { collaborationId, organizationIds } = storedSeqAction.value;
        return state
          .updateIn([COLLABORATIONS, collaborationId, ORGANIZATION_IDS], List(), (prev) => prev.merge(organizationIds))
          .setIn([ADD_ORGANIZATIONS_TO_COLLABORATION, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([ADD_ORGANIZATIONS_TO_COLLABORATION, action.id])) {
        return state
          .setIn([ADD_ORGANIZATIONS_TO_COLLABORATION, ERROR], action.value)
          .setIn([ADD_ORGANIZATIONS_TO_COLLABORATION, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([ADD_ORGANIZATIONS_TO_COLLABORATION, action.id]),
  });
}

/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { CollaborationsApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  COLLABORATIONS_BY_ORGANIZATION_ID,
  ERROR,
  REQUEST_STATE
} from '../../../core/redux/constants';

const { GET_COLLABORATIONS_WITH_ORGANIZATION, getCollaborationsWithOrganization } = CollaborationsApiActions;

export default function getCollaborationsWithOrganizationReducer(state :Map, action :SequenceAction) {
  return getCollaborationsWithOrganization.reducer(state, action, {
    REQUEST: () => state
      .setIn([GET_COLLABORATIONS_WITH_ORGANIZATION, REQUEST_STATE], RequestStates.PENDING)
      .setIn([GET_COLLABORATIONS_WITH_ORGANIZATION, action.id], action),
    SUCCESS: () => {
      const storedSeqAction = state.getIn([GET_COLLABORATIONS_WITH_ORGANIZATION, action.id]);
      if (storedSeqAction) {
        const organizationId = storedSeqAction.value;
        return state
          .setIn([COLLABORATIONS_BY_ORGANIZATION_ID, organizationId], fromJS(action.value))
          .setIn([GET_COLLABORATIONS_WITH_ORGANIZATION, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([GET_COLLABORATIONS_WITH_ORGANIZATION, action.id])) {
        return state
          .setIn([GET_COLLABORATIONS_WITH_ORGANIZATION, ERROR], action.value)
          .setIn([GET_COLLABORATIONS_WITH_ORGANIZATION, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([GET_COLLABORATIONS_WITH_ORGANIZATION, action.id]),
  });
}

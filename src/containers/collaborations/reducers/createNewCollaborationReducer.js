/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  COLLABORATIONS,
  COLLABORATIONS_ORG_IDS,
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
      const storedSeqAction = state.getIn([CREATE_NEW_COLLABORATION, action.id]);
      if (storedSeqAction) {
        const { organizationIds } = storedSeqAction;
        const { collaboration, collaborationId } = action.value;
        const collaborationsOrgs = state.get(COLLABORATIONS_ORG_IDS, Map())
          .set(collaborationId, fromJS(organizationIds));
        const collaborations :Map<UUID, Map> = state.get(COLLABORATIONS, Map())
          .set(collaborationId, collaboration);
        return state
          .set(COLLABORATIONS, collaborations)
          .set(COLLABORATIONS_ORG_IDS, collaborationsOrgs)
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

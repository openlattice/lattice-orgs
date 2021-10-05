/*
 * @flow
 */

import { Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { REQUEST_STATE } from '../../../core/redux/constants';
import { REMOVE_MEMBERS_FROM_ORGANIZATION, removeMembersFromOrganization } from '../actions';

export default function removeMembersFromOrganizationReducer(state :Map, action :SequenceAction) {
  return removeMembersFromOrganization.reducer(state, action, {
    REQUEST: () => state
      .setIn([REMOVE_MEMBERS_FROM_ORGANIZATION, REQUEST_STATE], RequestStates.PENDING)
      .setIn([REMOVE_MEMBERS_FROM_ORGANIZATION, action.id], action),
    SUCCESS: () => state.setIn([REMOVE_MEMBERS_FROM_ORGANIZATION, REQUEST_STATE], RequestStates.SUCCESS),
    FAILURE: () => state.setIn([REMOVE_MEMBERS_FROM_ORGANIZATION, REQUEST_STATE], RequestStates.FAILURE),
    FINALLY: () => state.deleteIn([REMOVE_MEMBERS_FROM_ORGANIZATION, action.id]),
  });
}

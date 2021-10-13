/*
 * @flow
 */

import { Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { REQUEST_STATE } from '../../../common/constants';
import { REVOKE_ROLES_FROM_MEMBERS, revokeRolesFromMembers } from '../actions';

export default function revokeRolesFromMembersReducer(state :Map, action :SequenceAction) {
  return revokeRolesFromMembers.reducer(state, action, {
    REQUEST: () => state
      .setIn([REVOKE_ROLES_FROM_MEMBERS, REQUEST_STATE], RequestStates.PENDING)
      .setIn([REVOKE_ROLES_FROM_MEMBERS, action.id], action),
    SUCCESS: () => state.setIn([REVOKE_ROLES_FROM_MEMBERS, REQUEST_STATE], RequestStates.SUCCESS),
    FAILURE: () => state.setIn([REVOKE_ROLES_FROM_MEMBERS, REQUEST_STATE], RequestStates.FAILURE),
    FINALLY: () => state.deleteIn([REVOKE_ROLES_FROM_MEMBERS, action.id]),
  });
}

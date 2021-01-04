/*
 * @flow
 */

import { Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { REQUEST_STATE } from '../../redux/constants';
import {
  GET_ORG_ROLE_OBJECT_PERMISSIONS,
  getOrgRoleObjectPermissions,
} from '../actions';

export default function reducer(state :Map, action :SequenceAction) {

  return getOrgRoleObjectPermissions.reducer(state, action, {
    REQUEST: () => state.setIn([GET_ORG_ROLE_OBJECT_PERMISSIONS, REQUEST_STATE], RequestStates.PENDING),
    SUCCESS: () => state.setIn([GET_ORG_ROLE_OBJECT_PERMISSIONS, REQUEST_STATE], RequestStates.SUCCESS),
    FAILURE: () => state.setIn([GET_ORG_ROLE_OBJECT_PERMISSIONS, REQUEST_STATE], RequestStates.FAILURE),
  });
}

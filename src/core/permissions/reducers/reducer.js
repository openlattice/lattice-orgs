/*
 * @flow
 */

import { Map, fromJS } from 'immutable';

import gatherOrganizationPermissionsReducer from './gatherOrganizationPermissionsReducer';

import { RESET_REQUEST_STATE } from '../../redux/actions';
import { ACES, RS_INITIAL_STATE } from '../../redux/constants';
import { resetRequestStateReducer } from '../../redux/reducers';
import {
  GATHER_ORGANIZATION_PERMISSIONS,
  gatherOrganizationPermissions,
} from '../actions';

const INITIAL_STATE :Map = fromJS({
  // actions
  [GATHER_ORGANIZATION_PERMISSIONS]: RS_INITIAL_STATE,
  // data
  [ACES]: Map(),
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  if (action.type === RESET_REQUEST_STATE) {
    return resetRequestStateReducer(state, action);
  }

  if (gatherOrganizationPermissions.case(action.type)) {
    return gatherOrganizationPermissionsReducer(state, action);
  }

  return state;
}

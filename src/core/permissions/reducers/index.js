/*
 * @flow
 */

import { Map, fromJS } from 'immutable';

import assignPermissionsToDataSetReducer from './assignPermissionsToDataSetReducer';
import getCurrentDataSetAuthorizationsReducer from './getCurrentDataSetAuthorizationsReducer';
import getCurrentRoleAuthorizationsReducer from './getCurrentRoleAuthorizationsReducer';
import getDataSetPermissionsReducer from './getDataSetPermissionsReducer';
import getOrgDataSetObjectPermissionsReducer from './getOrgDataSetObjectPermissionsReducer';
import getOrgObjectPermissionsReducer from './getOrgObjectPermissionsReducer';
import getOrgRoleObjectPermissionsReducer from './getOrgRoleObjectPermissionsReducer';
import getOwnerStatusReducer from './getOwnerStatusReducer';
import getPageDataSetPermissionsReducer from './getPageDataSetPermissionsReducer';
import getPermissionsReducer from './getPermissionsReducer';
import initializeDataSetPermissionsReducer from './initializeDataSetPermissionsReducer';
import initializeObjectPermissionsReducer from './initializeObjectPermissionsReducer';
import setPermissionsReducer from './setPermissionsReducer';
import updatePermissionsReducer from './updatePermissionsReducer';

import { RESET_REQUEST_STATE } from '../../redux/actions';
import {
  ACES,
  CURRENT,
  CURRENT_ROLE_AUTHORIZATIONS,
  IS_OWNER,
  RS_INITIAL_STATE
} from '../../redux/constants';
import { resetRequestStateReducer } from '../../redux/reducers';
import {
  ASSIGN_PERMISSIONS_TO_DATA_SET,
  GET_CURRENT_DATA_SET_AUTHORIZATIONS,
  GET_CURRENT_ROLE_AUTHORIZATIONS,
  GET_DATA_SET_PERMISSIONS,
  GET_ORG_DATA_SET_OBJECT_PERMISSIONS,
  GET_ORG_OBJECT_PERMISSIONS,
  GET_ORG_ROLE_OBJECT_PERMISSIONS,
  GET_OWNER_STATUS,
  GET_PAGE_DATA_SET_PERMISSIONS,
  GET_PERMISSIONS,
  INITIALIZE_DATA_SET_PERMISSIONS,
  INITIALIZE_OBJECT_PERMISSIONS,
  RESET_CURRENT_ROLE_AUTHORIZATIONS,
  SET_PERMISSIONS,
  UPDATE_PERMISSIONS,
  assignPermissionsToDataSet,
  getCurrentDataSetAuthorizations,
  getCurrentRoleAuthorizations,
  getDataSetPermissions,
  getOrgDataSetObjectPermissions,
  getOrgObjectPermissions,
  getOrgRoleObjectPermissions,
  getOwnerStatus,
  getPageDataSetPermissions,
  getPermissions,
  initializeDataSetPermissions,
  initializeObjectPermissions,
  setPermissions,
  updatePermissions,
} from '../actions';

const INITIAL_STATE :Map = fromJS({
  // actions
  [ASSIGN_PERMISSIONS_TO_DATA_SET]: RS_INITIAL_STATE,
  [GET_CURRENT_DATA_SET_AUTHORIZATIONS]: RS_INITIAL_STATE,
  [GET_CURRENT_ROLE_AUTHORIZATIONS]: RS_INITIAL_STATE,
  [GET_DATA_SET_PERMISSIONS]: RS_INITIAL_STATE,
  [GET_ORG_DATA_SET_OBJECT_PERMISSIONS]: RS_INITIAL_STATE,
  [GET_ORG_OBJECT_PERMISSIONS]: RS_INITIAL_STATE,
  [GET_ORG_ROLE_OBJECT_PERMISSIONS]: RS_INITIAL_STATE,
  [GET_OWNER_STATUS]: RS_INITIAL_STATE,
  [GET_PAGE_DATA_SET_PERMISSIONS]: RS_INITIAL_STATE,
  [GET_PERMISSIONS]: RS_INITIAL_STATE,
  [INITIALIZE_OBJECT_PERMISSIONS]: RS_INITIAL_STATE,
  [INITIALIZE_DATA_SET_PERMISSIONS]: RS_INITIAL_STATE,
  [SET_PERMISSIONS]: RS_INITIAL_STATE,
  [UPDATE_PERMISSIONS]: RS_INITIAL_STATE,
  // data
  [ACES]: Map(),
  [CURRENT]: Map(),
  [CURRENT_ROLE_AUTHORIZATIONS]: Map(),
  [IS_OWNER]: Map(),
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case RESET_REQUEST_STATE: {
      return resetRequestStateReducer(state, action);
    }

    case RESET_CURRENT_ROLE_AUTHORIZATIONS: {
      return state.set(CURRENT_ROLE_AUTHORIZATIONS, INITIAL_STATE.get(CURRENT_ROLE_AUTHORIZATIONS));
    }

    case assignPermissionsToDataSet.case(action.type): {
      return assignPermissionsToDataSetReducer(state, action);
    }

    case getCurrentDataSetAuthorizations.case(action.type): {
      return getCurrentDataSetAuthorizationsReducer(state, action);
    }

    case getCurrentRoleAuthorizations.case(action.type): {
      return getCurrentRoleAuthorizationsReducer(state, action);
    }

    case getDataSetPermissions.case(action.type): {
      return getDataSetPermissionsReducer(state, action);
    }

    case getOrgDataSetObjectPermissions.case(action.type): {
      return getOrgDataSetObjectPermissionsReducer(state, action);
    }

    case getOrgObjectPermissions.case(action.type): {
      return getOrgObjectPermissionsReducer(state, action);
    }

    case getOrgRoleObjectPermissions.case(action.type): {
      return getOrgRoleObjectPermissionsReducer(state, action);
    }

    case getOwnerStatus.case(action.type): {
      return getOwnerStatusReducer(state, action);
    }

    case getPageDataSetPermissions.case(action.type): {
      return getPageDataSetPermissionsReducer(state, action);
    }

    case getPermissions.case(action.type): {
      return getPermissionsReducer(state, action);
    }

    case initializeDataSetPermissions.case(action.type): {
      return initializeDataSetPermissionsReducer(state, action);
    }

    case initializeObjectPermissions.case(action.type): {
      return initializeObjectPermissionsReducer(state, action);
    }

    case setPermissions.case(action.type): {
      return setPermissionsReducer(state, action);
    }

    case updatePermissions.case(action.type): {
      return updatePermissionsReducer(state, action);
    }

    default:
      return state;
  }
}

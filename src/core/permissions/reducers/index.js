/*
 * @flow
 */

import { Map, fromJS } from 'immutable';

import assignPermissionsToDataSetReducer from './assignPermissionsToDataSetReducer';
import getDataSetPermissionsReducer from './getDataSetPermissionsReducer';
import getOrganizationObjectPermissionsReducer from './getOrganizationObjectPermissionsReducer';
import getOwnerStatusReducer from './getOwnerStatusReducer';
import getPageDataSetPermissionsReducer from './getPageDataSetPermissionsReducer';
import getPermissionsReducer from './getPermissionsReducer';
import setPermissionsReducer from './setPermissionsReducer';

import { RESET_REQUEST_STATE } from '../../redux/actions';
import { ACES, IS_OWNER, RS_INITIAL_STATE } from '../../redux/constants';
import { resetRequestStateReducer } from '../../redux/reducers';
import {
  ASSIGN_PERMISSIONS_TO_DATA_SET,
  GET_DATA_SET_PERMISSIONS,
  GET_ORGANIZATION_OBJECT_PERMISSIONS,
  GET_OWNER_STATUS,
  GET_PAGE_DATA_SET_PERMISSIONS,
  GET_PERMISSIONS,
  SET_PERMISSIONS,
  assignPermissionsToDataSet,
  getDataSetPermissions,
  getOrganizationObjectPermissions,
  getOwnerStatus,
  getPageDataSetPermissions,
  getPermissions,
  setPermissions,
} from '../actions';

const INITIAL_STATE :Map = fromJS({
  // actions
  [ASSIGN_PERMISSIONS_TO_DATA_SET]: RS_INITIAL_STATE,
  [GET_DATA_SET_PERMISSIONS]: RS_INITIAL_STATE,
  [GET_ORGANIZATION_OBJECT_PERMISSIONS]: RS_INITIAL_STATE,
  [GET_OWNER_STATUS]: RS_INITIAL_STATE,
  [GET_PAGE_DATA_SET_PERMISSIONS]: RS_INITIAL_STATE,
  [GET_PERMISSIONS]: RS_INITIAL_STATE,
  [SET_PERMISSIONS]: RS_INITIAL_STATE,
  // data
  [ACES]: Map(),
  [IS_OWNER]: Map(),
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case RESET_REQUEST_STATE: {
      return resetRequestStateReducer(state, action);
    }

    case assignPermissionsToDataSet.case(action.type): {
      return assignPermissionsToDataSetReducer(state, action);
    }

    case getDataSetPermissions.case(action.type): {
      return getDataSetPermissionsReducer(state, action);
    }

    case getOrganizationObjectPermissions.case(action.type): {
      return getOrganizationObjectPermissionsReducer(state, action);
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

    case setPermissions.case(action.type): {
      return setPermissionsReducer(state, action);
    }

    default:
      return state;
  }
}

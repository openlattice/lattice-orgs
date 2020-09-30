/*
 * @flow
 */

import { Map, fromJS } from 'immutable';

import getDataSetPermissionsReducer from './getDataSetPermissionsReducer';
import getPermissionsReducer from './getPermissionsReducer';
import getPropertyTypePermissionsReducer from './getPropertyTypePermissionsReducer';
import setPermissionsReducer from './setPermissionsReducer';

import { RESET_REQUEST_STATE } from '../../redux/actions';
import { ACES, RS_INITIAL_STATE } from '../../redux/constants';
import { resetRequestStateReducer } from '../../redux/reducers';
import {
  GET_DATA_SET_PERMISSIONS,
  GET_PERMISSIONS,
  GET_PROPERTY_TYPE_PERMISSIONS,
  SET_PERMISSIONS,
  getDataSetPermissions,
  getPermissions,
  getPropertyTypePermissions,
  setPermissions,
} from '../actions';

const INITIAL_STATE :Map = fromJS({
  // actions
  [GET_DATA_SET_PERMISSIONS]: RS_INITIAL_STATE,
  [GET_PERMISSIONS]: RS_INITIAL_STATE,
  [GET_PROPERTY_TYPE_PERMISSIONS]: RS_INITIAL_STATE,
  [SET_PERMISSIONS]: RS_INITIAL_STATE,
  // data
  [ACES]: Map(),
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case RESET_REQUEST_STATE: {
      return resetRequestStateReducer(state, action);
    }

    case getDataSetPermissions.case(action.type): {
      return getDataSetPermissionsReducer(state, action);
    }

    case getPermissions.case(action.type): {
      return getPermissionsReducer(state, action);
    }

    case getPropertyTypePermissions.case(action.type): {
      return getPropertyTypePermissionsReducer(state, action);
    }

    case setPermissions.case(action.type): {
      return setPermissionsReducer(state, action);
    }

    default:
      return state;
  }
}

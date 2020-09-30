/*
 * @flow
 */

import { Map, fromJS } from 'immutable';

import getEntitySetPermissionsReducer from './getEntitySetPermissionsReducer';
import getPermissionsReducer from './getPermissionsReducer';
import getPropertyTypePermissionsReducer from './getPropertyTypePermissionsReducer';
import setPermissionsReducer from './setPermissionsReducer';

import { RESET_REQUEST_STATE } from '../../redux/actions';
import { ACES, RS_INITIAL_STATE } from '../../redux/constants';
import { resetRequestStateReducer } from '../../redux/reducers';
import {
  GET_ENTITY_SET_PERMISSIONS,
  GET_PERMISSIONS,
  GET_PROPERTY_TYPE_PERMISSIONS,
  SET_PERMISSIONS,
  getEntitySetPermissions,
  getPermissions,
  getPropertyTypePermissions,
  setPermissions,
} from '../actions';

const INITIAL_STATE :Map = fromJS({
  // actions
  [GET_ENTITY_SET_PERMISSIONS]: RS_INITIAL_STATE,
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

    case getEntitySetPermissions.case(action.type): {
      return getEntitySetPermissionsReducer(state, action);
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

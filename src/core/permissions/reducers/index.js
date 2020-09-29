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

  if (action.type === RESET_REQUEST_STATE) {
    return resetRequestStateReducer(state, action);
  }

  if (action.type === getEntitySetPermissions.case(action.type)) {
    return getEntitySetPermissionsReducer(state, action);
  }

  if (action.type === getPermissions.case(action.type)) {
    return getPermissionsReducer(state, action);
  }

  if (action.type === getPropertyTypePermissions.case(action.type)) {
    return getPropertyTypePermissionsReducer(state, action);
  }

  if (action.type === setPermissions.case(action.type)) {
    return setPermissionsReducer(state, action);
  }

  return state;
}

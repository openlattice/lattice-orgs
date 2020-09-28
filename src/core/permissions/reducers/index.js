/*
 * @flow
 */

import { Map, fromJS } from 'immutable';

import getPermissionsReducer from './getPermissionsReducer';
import setPermissionsReducer from './setPermissionsReducer';

import { RESET_REQUEST_STATE } from '../../redux/actions';
import { ACES, RS_INITIAL_STATE } from '../../redux/constants';
import { resetRequestStateReducer } from '../../redux/reducers';
import {
  GET_PERMISSIONS,
  SET_PERMISSIONS,
  getPermissions,
  setPermissions,
} from '../actions';

const INITIAL_STATE :Map = fromJS({
  // actions
  [GET_PERMISSIONS]: RS_INITIAL_STATE,
  [SET_PERMISSIONS]: RS_INITIAL_STATE,
  // data
  [ACES]: Map(),
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  if (action.type === RESET_REQUEST_STATE) {
    return resetRequestStateReducer(state, action);
  }

  if (action.type === getPermissions.case(action.type)) {
    return getPermissionsReducer(state, action);
  }

  if (action.type === setPermissions.case(action.type)) {
    return setPermissionsReducer(state, action);
  }

  return state;
}

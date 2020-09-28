/*
 * @flow
 */

import { Map, fromJS } from 'immutable';

import getPermissionsReducer from './getPermissionsReducer';

import { RESET_REQUEST_STATE } from '../../redux/actions';
import { ACES, RS_INITIAL_STATE } from '../../redux/constants';
import { resetRequestStateReducer } from '../../redux/reducers';
import {
  GET_PERMISSIONS,
  getPermissions,
} from '../actions';

const INITIAL_STATE :Map = fromJS({
  // actions
  [GET_PERMISSIONS]: RS_INITIAL_STATE,
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

  return state;
}

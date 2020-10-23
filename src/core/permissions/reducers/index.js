/*
 * @flow
 */

import { Map, fromJS } from 'immutable';

import getDataSetPermissionsInDSPCReducer from './getDataSetPermissionsInDataSetPermissionsContainerReducer';
import getDataSetPermissionsInDSPMReducer from './getDataSetPermissionsInDataSetPermissionsModalReducer';
import getPermissionsReducer from './getPermissionsReducer';
import setPermissionsReducer from './setPermissionsReducer';

import { RESET_REQUEST_STATE } from '../../redux/actions';
import { ACES, RS_INITIAL_STATE } from '../../redux/constants';
import { resetRequestStateReducer } from '../../redux/reducers';
import {
  GET_DATA_SET_PERMISSIONS_IN_DATA_SET_PERMISSIONS_CONTAINER,
  GET_DATA_SET_PERMISSIONS_IN_DATA_SET_PERMISSIONS_MODAL,
  GET_PERMISSIONS,
  SET_PERMISSIONS,
  getDataSetPermissionsInDataSetPermissionsContainer,
  getDataSetPermissionsInDataSetPermissionsModal,
  getPermissions,
  setPermissions,
} from '../actions';

const INITIAL_STATE :Map = fromJS({
  // actions
  [GET_DATA_SET_PERMISSIONS_IN_DATA_SET_PERMISSIONS_CONTAINER]: RS_INITIAL_STATE,
  [GET_DATA_SET_PERMISSIONS_IN_DATA_SET_PERMISSIONS_MODAL]: RS_INITIAL_STATE,
  [GET_PERMISSIONS]: RS_INITIAL_STATE,
  [SET_PERMISSIONS]: RS_INITIAL_STATE,
  // data
  [ACES]: Map(),
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case RESET_REQUEST_STATE: {
      return resetRequestStateReducer(state, action);
    }

    case getDataSetPermissionsInDataSetPermissionsContainer.case(action.type): {
      return getDataSetPermissionsInDSPCReducer(state, action);
    }

    case getDataSetPermissionsInDataSetPermissionsModal.case(action.type): {
      return getDataSetPermissionsInDSPMReducer(state, action);
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

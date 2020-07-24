/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { ReduxConstants } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';

import {
  UPDATE_USER_PERMISSION,
  updateUserPermission,
} from './PermissionsActions';

import { ReduxActions } from '../redux';
import { ERROR, RS_INITIAL_STATE } from '../redux/constants';

const { RESET_REQUEST_STATE } = ReduxActions;
const { REQUEST_STATE } = ReduxConstants;

const INITIAL_STATE :Map = fromJS({
  [UPDATE_USER_PERMISSION]: RS_INITIAL_STATE,
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case RESET_REQUEST_STATE: {
      const { path } = action;
      if (path && state.hasIn(path)) {
        return state
          .setIn([...path, ERROR], false)
          .setIn([...path, REQUEST_STATE], RequestStates.STANDBY);
      }
      return state;
    }

    case updateUserPermission.case(action.type): {
      return updateUserPermission.reducer(state, action, {
        REQUEST: () => state.setIn([UPDATE_USER_PERMISSION, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state.setIn([UPDATE_USER_PERMISSION, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state.setIn([UPDATE_USER_PERMISSION, REQUEST_STATE], RequestStates.FAILURE),
      });
    }

    default:
      return state;
  }
}

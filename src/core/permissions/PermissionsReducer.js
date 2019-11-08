/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';

import { RESET_REQUEST_STATE } from '../redux/ReduxActions';
import {
  UPDATE_USER_PERMISSION,
  updateUserPermission,
} from './PermissionsActions';

const INITIAL_STATE :Map = fromJS({
  [UPDATE_USER_PERMISSION]: {
    requestState: RequestStates.STANDBY,
  },
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case RESET_REQUEST_STATE: {
      const { actionType } = action;
      if (actionType && state.has(actionType)) {
        return state.setIn([actionType, 'requestState'], RequestStates.STANDBY);
      }
      return state;
    }

    case updateUserPermission.case(action.type): {
      return updateUserPermission.reducer(state, action, {
        REQUEST: () => state.setIn([UPDATE_USER_PERMISSION, 'requestState'], RequestStates.PENDING),
        SUCCESS: () => state.setIn([UPDATE_USER_PERMISSION, 'requestState'], RequestStates.SUCCESS),
        FAILURE: () => state.setIn([UPDATE_USER_PERMISSION, 'requestState'], RequestStates.FAILURE),
      });
    }

    default:
      return state;
  }
}

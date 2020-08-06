/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { ReduxConstants } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';

import {
  GET_ENTITY_SETS_WITH_PERMISSIONS,
  getEntitySetsWithPermissions,
} from './PermissionsActions';

import { ReduxActions } from '../redux';
import { ERROR, RS_INITIAL_STATE } from '../redux/constants';

const { RESET_REQUEST_STATE } = ReduxActions;
const { REQUEST_STATE } = ReduxConstants;

const INITIAL_STATE :Map = fromJS({
  [GET_ENTITY_SETS_WITH_PERMISSIONS]: RS_INITIAL_STATE,
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

    case getEntitySetsWithPermissions.case(action.type): {
      return getEntitySetsWithPermissions.reducer(state, action, {
        REQUEST: () => state.setIn([GET_ENTITY_SETS_WITH_PERMISSIONS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state.setIn([GET_ENTITY_SETS_WITH_PERMISSIONS, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state.setIn([GET_ENTITY_SETS_WITH_PERMISSIONS, REQUEST_STATE], RequestStates.FAILURE),
      });
    }

    default:
      return state;
  }
}

/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { PermissionsApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';

const {
  UPDATE_ACLS,
  updateAcls,
} = PermissionsApiActions;

const INITIAL_STATE :Map = fromJS({
  [UPDATE_ACLS]: {
    requestState: RequestStates.STANDBY,
  },
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case updateAcls.case(action.type): {
      return updateAcls.reducer(state, action, {
        REQUEST: () => state.setIn([UPDATE_ACLS, 'requestState'], RequestStates.PENDING),
        SUCCESS: () => state.setIn([UPDATE_ACLS, 'requestState'], RequestStates.SUCCESS),
        FAILURE: () => state.setIn([UPDATE_ACLS, 'requestState'], RequestStates.FAILURE),
      });
    }

    default:
      return state;
  }
}

/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { PrincipalsApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { RESET_REQUEST_STATE } from '../redux/ReduxActions';

const {
  GET_ALL_USERS,
  getAllUsers,
} = PrincipalsApiActions;

const INITIAL_STATE :Map = fromJS({
  [GET_ALL_USERS]: {
    requestState: RequestStates.STANDBY,
  },
  users: Map(),
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case RESET_REQUEST_STATE: {
      const { actionType } = action;
      if (actionType === GET_ALL_USERS) {
        return state
          .set('users', Map())
          .setIn([actionType, 'requestState'], RequestStates.STANDBY);
      }
      return state;
    }

    case getAllUsers.case(action.type): {
      const seqAction :SequenceAction = action;
      return getAllUsers.reducer(state, action, {
        REQUEST: () => state
          .setIn([GET_ALL_USERS, 'requestState'], RequestStates.PENDING)
          .setIn([GET_ALL_USERS, seqAction.id], seqAction),
        SUCCESS: () => state
          .set('users', fromJS(seqAction.value))
          .setIn([GET_ALL_USERS, 'requestState'], RequestStates.SUCCESS),
        FAILURE: () => state.setIn([GET_ALL_USERS, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([GET_ALL_USERS, seqAction.id]),
      });
    }

    default:
      return state;
  }
}

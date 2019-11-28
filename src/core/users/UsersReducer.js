/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { PrincipalsApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { INITIAL_SEARCH_RESULTS } from '../redux/ReduxConstants';
import { RESET_USER_SEARCH_RESULTS } from './UsersActions';

const {
  GET_ALL_USERS,
  SEARCH_ALL_USERS,
  getAllUsers,
  searchAllUsers,
} = PrincipalsApiActions;

const INITIAL_STATE :Map = fromJS({
  [GET_ALL_USERS]: {
    requestState: RequestStates.STANDBY,
  },
  [SEARCH_ALL_USERS]: {
    requestState: RequestStates.STANDBY,
  },
  users: Map(),
  userSearchResults: INITIAL_SEARCH_RESULTS,
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case RESET_USER_SEARCH_RESULTS: {
      return state.set('userSearchResults', INITIAL_SEARCH_RESULTS);
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

    case searchAllUsers.case(action.type): {
      const seqAction :SequenceAction = action;
      return searchAllUsers.reducer(state, action, {
        REQUEST: () => state
          .setIn([SEARCH_ALL_USERS, 'requestState'], RequestStates.PENDING)
          .setIn([SEARCH_ALL_USERS, seqAction.id], seqAction),
        SUCCESS: () => state
          .set('userSearchResults', fromJS(seqAction.value))
          .setIn([SEARCH_ALL_USERS, 'requestState'], RequestStates.SUCCESS),
        FAILURE: () => state
          .set('userSearchResults', Map())
          .setIn([SEARCH_ALL_USERS, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([SEARCH_ALL_USERS, seqAction.id]),
      });
    }

    default:
      return state;
  }
}

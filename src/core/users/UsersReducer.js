/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { PrincipalsApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { RESET_USER_SEARCH_RESULTS } from './actions';

import {
  INITIAL_SEARCH_RESULTS,
  REQUEST_STATE,
  RS_INITIAL_STATE,
  USERS,
  USER_SEARCH_RESULTS,
} from '../redux/constants';

const {
  GET_ALL_USERS,
  SEARCH_ALL_USERS,
  getAllUsers,
  searchAllUsers,
} = PrincipalsApiActions;

const INITIAL_STATE :Map = fromJS({
  // actions
  [GET_ALL_USERS]: RS_INITIAL_STATE,
  [SEARCH_ALL_USERS]: RS_INITIAL_STATE,
  // data
  [USERS]: Map(),
  [USER_SEARCH_RESULTS]: INITIAL_SEARCH_RESULTS,
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case RESET_USER_SEARCH_RESULTS: {
      return state.set(USER_SEARCH_RESULTS, INITIAL_SEARCH_RESULTS);
    }

    case getAllUsers.case(action.type): {
      const seqAction :SequenceAction = action;
      return getAllUsers.reducer(state, action, {
        REQUEST: () => state
          .setIn([GET_ALL_USERS, REQUEST_STATE], RequestStates.PENDING)
          .setIn([GET_ALL_USERS, seqAction.id], seqAction),
        SUCCESS: () => state
          .set(USERS, fromJS(seqAction.value))
          .setIn([GET_ALL_USERS, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state.setIn([GET_ALL_USERS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([GET_ALL_USERS, seqAction.id]),
      });
    }

    case searchAllUsers.case(action.type): {
      const seqAction :SequenceAction = action;
      return searchAllUsers.reducer(state, action, {
        REQUEST: () => state
          .setIn([SEARCH_ALL_USERS, REQUEST_STATE], RequestStates.PENDING)
          .setIn([SEARCH_ALL_USERS, seqAction.id], seqAction),
        SUCCESS: () => state
          .set(USER_SEARCH_RESULTS, fromJS(seqAction.value))
          .setIn([SEARCH_ALL_USERS, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state
          .set(USER_SEARCH_RESULTS, Map())
          .setIn([SEARCH_ALL_USERS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([SEARCH_ALL_USERS, seqAction.id]),
      });
    }

    default:
      return state;
  }
}

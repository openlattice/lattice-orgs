/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { PrincipalsApiActions } from 'lattice-sagas';

import getUsersReducer from './getUsersReducer';
import searchAllUsersReducer from './searchAllUsersReducer';

import {
  RS_INITIAL_STATE,
  USERS,
  USER_SEARCH_RESULTS,
} from '../../redux/constants';
import {
  RESET_USER_SEARCH_RESULTS,
  SEARCH_ALL_USERS,
  searchAllUsers,
} from '../actions';

const {
  GET_USERS,
  getUsers,
} = PrincipalsApiActions;

const INITIAL_STATE :Map = fromJS({
  // actions
  [GET_USERS]: RS_INITIAL_STATE,
  [SEARCH_ALL_USERS]: RS_INITIAL_STATE,
  // data
  [USERS]: Map(),
  [USER_SEARCH_RESULTS]: Map(),
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case RESET_USER_SEARCH_RESULTS: {
      return state.set(USER_SEARCH_RESULTS, Map());
    }

    case getUsers.case(action.type): {
      return getUsersReducer(state, action);
    }

    case searchAllUsers.case(action.type): {
      return searchAllUsersReducer(state, action);
    }

    default:
      return state;
  }
}

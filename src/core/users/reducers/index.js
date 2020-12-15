/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { PrincipalsApiActions } from 'lattice-sagas';

import searchAllUsersReducer from './searchAllUsersReducer';

import {
  RS_INITIAL_STATE,
  USERS,
  USER_SEARCH_RESULTS,
} from '../../redux/constants';
import { RESET_USER_SEARCH_RESULTS } from '../actions';

const {
  SEARCH_ALL_USERS,
  searchAllUsers,
} = PrincipalsApiActions;

const INITIAL_STATE :Map = fromJS({
  // actions
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

    case searchAllUsers.case(action.type): {
      return searchAllUsersReducer(state, action);
    }

    default:
      return state;
  }
}

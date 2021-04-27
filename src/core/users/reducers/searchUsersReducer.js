/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { PrincipalsApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  REQUEST_STATE,
  USER_SEARCH_RESULTS,
} from '../../redux/constants';

const {
  SEARCH_USERS,
  searchUsers,
} = PrincipalsApiActions;

export default function reducer(state :Map, action :SequenceAction) {

  return searchUsers.reducer(state, action, {
    REQUEST: () => state
      .setIn([SEARCH_USERS, REQUEST_STATE], RequestStates.PENDING)
      .setIn([SEARCH_USERS, action.id], action),
    SUCCESS: () => {
      if (state.hasIn([SEARCH_USERS, action.id])) {
        return state
          .set(USER_SEARCH_RESULTS, fromJS(action.value))
          .setIn([SEARCH_USERS, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([SEARCH_USERS, action.id])) {
        return state
          .set(USER_SEARCH_RESULTS, Map())
          .setIn([SEARCH_USERS, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([SEARCH_USERS, action.id]),
  });
}

/*
 * @flow
 */

import { Map } from 'immutable';
import type { SequenceAction } from 'redux-reqseq';

import {
  SEARCH_DATA_SETS,
  SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS,
  SEARCH_DATA_SETS_TO_FILTER,
} from '../actions';
import {
  INITIAL_STATE_SEARCH,
  INITIAL_STATE_SEARCH_DATA_SETS,
} from '../constants';

export default function reducer(state :Map, action :SequenceAction) {

  if (action.value && state.has(action.value)) {
    if (
      action.value === SEARCH_DATA_SETS
      || action.value === SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS
      || action.value === SEARCH_DATA_SETS_TO_FILTER
    ) {
      return state.set(action.value, INITIAL_STATE_SEARCH_DATA_SETS);
    }
    return state.set(action.value, INITIAL_STATE_SEARCH);
  }

  return state;
}

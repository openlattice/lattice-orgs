/*
 * @flow
 */

import { Map, fromJS } from 'immutable';

import clearSearchStateReducer from './clearSearchStateReducer';
import searchDataSetsReducer from './searchDataSetsReducer';
import searchDataSetsToAssignPermissionsReducer from './searchDataSetsToAssignPermissionsReducer';
import searchDataSetsToFilterReducer from './searchDataSetsToFilterReducer';

import {
  CLEAR_SEARCH_STATE,
  SEARCH_DATA_SETS,
  SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS,
  SEARCH_DATA_SETS_TO_FILTER,
  searchDataSets,
  searchDataSetsToFilter,
  searchDataSetsToAssignPermissions,
} from '../actions';
import { SEARCH_INITIAL_STATE } from '../constants';

const INITIAL_STATE :Map = fromJS({
  [SEARCH_DATA_SETS]: SEARCH_INITIAL_STATE,
  [SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS]: SEARCH_INITIAL_STATE,
  [SEARCH_DATA_SETS_TO_FILTER]: SEARCH_INITIAL_STATE,
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case CLEAR_SEARCH_STATE: {
      return clearSearchStateReducer(state, action);
    }

    case searchDataSets.case(action.type): {
      return searchDataSetsReducer(state, action);
    }

    case searchDataSetsToAssignPermissions.case(action.type): {
      return searchDataSetsToAssignPermissionsReducer(state, action);
    }

    case searchDataSetsToFilter.case(action.type): {
      return searchDataSetsToFilterReducer(state, action);
    }

    default:
      return state;
  }
}

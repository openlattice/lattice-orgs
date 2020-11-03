/*
 * @flow
 */

import { Map, fromJS } from 'immutable';

import clearSearchStateReducer from './clearSearchStateReducer';
import searchDataReducer from './searchDataReducer';
import searchDataSetsReducer from './searchDataSetsReducer';
import searchDataSetsToAssignPermissionsReducer from './searchDataSetsToAssignPermissionsReducer';
import searchDataSetsToFilterReducer from './searchDataSetsToFilterReducer';
import searchOrganizationDataSetsReducer from './searchOrganizationDataSetsReducer';

import {
  CLEAR_SEARCH_STATE,
  SEARCH_DATA,
  SEARCH_DATA_SETS,
  SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS,
  SEARCH_DATA_SETS_TO_FILTER,
  SEARCH_ORGANIZATION_DATA_SETS,
  searchData,
  searchDataSets,
  searchDataSetsToAssignPermissions,
  searchDataSetsToFilter,
  searchOrganizationDataSets,
} from '../actions';
import {
  INITIAL_STATE_SEARCH,
  INITIAL_STATE_SEARCH_DATA_SETS,
} from '../constants';

const INITIAL_STATE :Map = fromJS({
  [SEARCH_DATA]: INITIAL_STATE_SEARCH,
  [SEARCH_DATA_SETS]: INITIAL_STATE_SEARCH_DATA_SETS,
  [SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS]: INITIAL_STATE_SEARCH_DATA_SETS,
  [SEARCH_DATA_SETS_TO_FILTER]: INITIAL_STATE_SEARCH_DATA_SETS,
  [SEARCH_ORGANIZATION_DATA_SETS]: INITIAL_STATE_SEARCH_DATA_SETS,
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case CLEAR_SEARCH_STATE: {
      return clearSearchStateReducer(state, action);
    }

    case searchData.case(action.type): {
      return searchDataReducer(state, action);
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

    case searchOrganizationDataSets.case(action.type): {
      return searchOrganizationDataSetsReducer(state, action);
    }

    default:
      return state;
  }
}

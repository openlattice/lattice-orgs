/*
 * @flow
 */

import { Map, fromJS } from 'immutable';

import clearSearchStateReducer from './clearSearchStateReducer';
import searchDataReducer from './searchDataReducer';
import searchDataSetsReducer from './searchDataSetsReducer';
import searchOrganizationDataSetsReducer from './searchOrganizationDataSetsReducer';

import { RESET_REQUEST_STATE } from '../../redux/actions';
import { resetRequestStateReducer } from '../../redux/reducers';
import {
  CLEAR_SEARCH_STATE,
  SEARCH_DATA,
  SEARCH_DATA_SETS,
  SEARCH_ORGANIZATION_DATA_SETS,
  searchData,
  searchDataSets,
  searchOrganizationDataSets,
} from '../actions';
import { INITIAL_SEARCH_STATE } from '../constants';

const INITIAL_STATE :Map = fromJS({
  [SEARCH_DATA]: INITIAL_SEARCH_STATE,
  [SEARCH_DATA_SETS]: INITIAL_SEARCH_STATE,
  [SEARCH_ORGANIZATION_DATA_SETS]: INITIAL_SEARCH_STATE,
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case CLEAR_SEARCH_STATE: {
      return clearSearchStateReducer(state, action);
    }

    case RESET_REQUEST_STATE: {
      return resetRequestStateReducer(state, action);
    }

    case searchData.case(action.type): {
      return searchDataReducer(state, action);
    }

    case searchDataSets.case(action.type): {
      return searchDataSetsReducer(state, action);
    }

    case searchOrganizationDataSets.case(action.type): {
      return searchOrganizationDataSetsReducer(state, action);
    }

    default:
      return state;
  }
}

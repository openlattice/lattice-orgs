/*
 * @flow
 */

import { Map, fromJS } from 'immutable';

import clearSearchStateReducer from './clearSearchStateReducer';
import searchDataSetsInDSPCReducer from './searchDataSetsInDataSetPermissionsContainerReducer';
import searchDataSetsInDSPMReducer from './searchDataSetsInDataSetPermissionsModalReducer';

import {
  CLEAR_SEARCH_STATE,
  SEARCH_DATA_SETS_IN_DATA_SET_PERMISSIONS_CONTAINER,
  SEARCH_DATA_SETS_IN_DATA_SET_PERMISSIONS_MODAL,
  searchDataSetsInDataSetPermissionsContainer,
  searchDataSetsInDataSetPermissionsModal,
} from '../actions';
import { SEARCH_INITIAL_STATE } from '../constants';

const INITIAL_STATE :Map = fromJS({
  [SEARCH_DATA_SETS_IN_DATA_SET_PERMISSIONS_CONTAINER]: SEARCH_INITIAL_STATE,
  [SEARCH_DATA_SETS_IN_DATA_SET_PERMISSIONS_MODAL]: SEARCH_INITIAL_STATE,
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case CLEAR_SEARCH_STATE: {
      return clearSearchStateReducer(state, action);
    }

    case searchDataSetsInDataSetPermissionsContainer.case(action.type): {
      return searchDataSetsInDSPCReducer(state, action);
    }

    case searchDataSetsInDataSetPermissionsModal.case(action.type): {
      return searchDataSetsInDSPMReducer(state, action);
    }

    default:
      return state;
  }
}

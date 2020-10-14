/*
 * @flow
 */

import { Map, fromJS } from 'immutable';

import clearSearchStateReducer from './clearSearchStateReducer';
import searchDataSetsReducer from './searchDataSetsReducer';

import { SEARCH_INITIAL_STATE } from '../../redux/constants';
import {
  CLEAR_SEARCH_STATE,
  SEARCH_DATA_SETS,
  searchDataSets,
} from '../actions';

const INITIAL_STATE :Map = fromJS({
  [SEARCH_DATA_SETS]: SEARCH_INITIAL_STATE,
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case CLEAR_SEARCH_STATE: {
      return clearSearchStateReducer(state, action);
    }

    case searchDataSets.case(action.type):
      return searchDataSetsReducer(state, action);

    default:
      return state;
  }
}

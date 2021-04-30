/*
 * @flow
 */

import { Map, fromJS } from 'immutable';

import fetchAtlasDataSetDataReducer from './fetchAtlasDataSetDataReducer';
import fetchEntitySetDataReducer from './fetchEntitySetDataReducer';

import { RESET_REQUEST_STATES } from '../../redux/actions';
import { ATLAS_DATA_SET_DATA, ENTITY_SET_DATA } from '../../redux/constants';
import { resetRequestStatesReducer } from '../../redux/reducers';
import {
  FETCH_ATLAS_DATA_SET_DATA,
  FETCH_ENTITY_SET_DATA,
  fetchAtlasDataSetData,
  fetchEntitySetData,
} from '../actions';

const INITIAL_STATE :Map = fromJS({
  // actions
  [FETCH_ATLAS_DATA_SET_DATA]: Map(),
  [FETCH_ENTITY_SET_DATA]: Map(),
  // data
  [ATLAS_DATA_SET_DATA]: Map(),
  [ENTITY_SET_DATA]: Map(),
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case RESET_REQUEST_STATES: {
      return resetRequestStatesReducer(state, action);
    }

    case fetchAtlasDataSetData.case(action.type): {
      return fetchAtlasDataSetDataReducer(state, action);
    }

    case fetchEntitySetData.case(action.type): {
      return fetchEntitySetDataReducer(state, action);
    }

    default:
      return state;
  }
}

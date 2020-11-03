/*
 * @flow
 */

import { Map, Set } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  ATLAS_DATA_SET_IDS,
  ENTITY_SET_IDS,
  ERROR,
  HITS,
  PAGE,
  QUERY,
  REQUEST_STATE,
  TOTAL_HITS,
} from '../../redux/constants';
import {
  SEARCH_DATA_SETS,
  searchDataSets,
} from '../actions';

export default function reducer(state :Map, action :SequenceAction) {

  return searchDataSets.reducer(state, action, {
    REQUEST: () => state
      .setIn([SEARCH_DATA_SETS, REQUEST_STATE], RequestStates.PENDING)
      .setIn([SEARCH_DATA_SETS, action.id], action),
    SUCCESS: () => {
      const storedAction :SequenceAction = state.getIn([SEARCH_DATA_SETS, action.id]);
      if (storedAction) {
        const { page, query } = storedAction.value;
        return state
          .setIn([SEARCH_DATA_SETS, HITS, ATLAS_DATA_SET_IDS], Set(action.value[HITS][ATLAS_DATA_SET_IDS]))
          .setIn([SEARCH_DATA_SETS, HITS, ENTITY_SET_IDS], Set(action.value[HITS][ENTITY_SET_IDS]))
          .setIn([SEARCH_DATA_SETS, PAGE], page)
          .setIn([SEARCH_DATA_SETS, QUERY], query)
          .setIn([SEARCH_DATA_SETS, TOTAL_HITS, ATLAS_DATA_SET_IDS], action.value[TOTAL_HITS][ATLAS_DATA_SET_IDS])
          .setIn([SEARCH_DATA_SETS, TOTAL_HITS, ENTITY_SET_IDS], action.value[TOTAL_HITS][ENTITY_SET_IDS])
          .setIn([SEARCH_DATA_SETS, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([SEARCH_DATA_SETS, action.id])) {
        return state
          .setIn([SEARCH_DATA_SETS, ERROR], action.value)
          .setIn([SEARCH_DATA_SETS, HITS], Map())
          .setIn([SEARCH_DATA_SETS, TOTAL_HITS], Map())
          .setIn([SEARCH_DATA_SETS, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([SEARCH_DATA_SETS, action.id]),
  });
}

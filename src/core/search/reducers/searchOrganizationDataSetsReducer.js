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
  SEARCH_ORGANIZATION_DATA_SETS,
  searchOrganizationDataSets,
} from '../actions';

export default function reducer(state :Map, action :SequenceAction) {

  return searchOrganizationDataSets.reducer(state, action, {
    REQUEST: () => state
      .setIn([SEARCH_ORGANIZATION_DATA_SETS, REQUEST_STATE], RequestStates.PENDING)
      .setIn([SEARCH_ORGANIZATION_DATA_SETS, action.id], action),
    SUCCESS: () => {
      const storedAction :SequenceAction = state.getIn([SEARCH_ORGANIZATION_DATA_SETS, action.id]);
      if (storedAction) {
        const { page, query } = storedAction.value;
        const hits = action.value[HITS];
        const totalHits = action.value[TOTAL_HITS];
        return state
          .setIn([SEARCH_ORGANIZATION_DATA_SETS, HITS, ATLAS_DATA_SET_IDS], Set(hits[ATLAS_DATA_SET_IDS]))
          .setIn([SEARCH_ORGANIZATION_DATA_SETS, HITS, ENTITY_SET_IDS], Set(hits[ENTITY_SET_IDS]))
          .setIn([SEARCH_ORGANIZATION_DATA_SETS, PAGE], page)
          .setIn([SEARCH_ORGANIZATION_DATA_SETS, QUERY], query)
          .setIn([SEARCH_ORGANIZATION_DATA_SETS, TOTAL_HITS, ATLAS_DATA_SET_IDS], totalHits[ATLAS_DATA_SET_IDS])
          .setIn([SEARCH_ORGANIZATION_DATA_SETS, TOTAL_HITS, ENTITY_SET_IDS], totalHits[ENTITY_SET_IDS])
          .setIn([SEARCH_ORGANIZATION_DATA_SETS, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([SEARCH_ORGANIZATION_DATA_SETS, action.id])) {
        return state
          .setIn([SEARCH_ORGANIZATION_DATA_SETS, ERROR], action.value)
          .setIn([SEARCH_ORGANIZATION_DATA_SETS, HITS], Map())
          .setIn([SEARCH_ORGANIZATION_DATA_SETS, TOTAL_HITS], Map())
          .setIn([SEARCH_ORGANIZATION_DATA_SETS, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([SEARCH_ORGANIZATION_DATA_SETS, action.id]),
  });
}

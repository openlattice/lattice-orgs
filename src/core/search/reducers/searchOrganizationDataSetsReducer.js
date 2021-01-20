/*
 * @flow
 */

import { Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { REQUEST_STATE } from '../../redux/constants';
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
      if (state.hasIn([SEARCH_ORGANIZATION_DATA_SETS, action.id])) {
        return state.setIn([SEARCH_ORGANIZATION_DATA_SETS, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([SEARCH_ORGANIZATION_DATA_SETS, action.id])) {
        return state.setIn([SEARCH_ORGANIZATION_DATA_SETS, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([SEARCH_ORGANIZATION_DATA_SETS, action.id]),
  });
}

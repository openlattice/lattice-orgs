/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { CollaborationsApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  COLLABORATIONS_BY_DATA_SET_ID,
  ERROR,
  REQUEST_STATE
} from '../../../core/redux/constants';

const { GET_COLLABORATIONS_WITH_DATA_SETS, getCollaborationsWithDataSets } = CollaborationsApiActions;

export default function getCollaborationsWithDataSetsReducer(state :Map, action :SequenceAction) {
  return getCollaborationsWithDataSets.reducer(state, action, {
    REQUEST: () => state
      .setIn([GET_COLLABORATIONS_WITH_DATA_SETS, REQUEST_STATE], RequestStates.PENDING)
      .setIn([GET_COLLABORATIONS_WITH_DATA_SETS, action.id], action),
    SUCCESS: () => {
      const storedSeqAction = state.getIn([GET_COLLABORATIONS_WITH_DATA_SETS, action.id]);
      if (storedSeqAction) {
        const dataSetId = storedSeqAction.value;
        return state
          .setIn([COLLABORATIONS_BY_DATA_SET_ID, dataSetId], fromJS(action.value))
          .setIn([GET_COLLABORATIONS_WITH_DATA_SETS, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([GET_COLLABORATIONS_WITH_DATA_SETS, action.id])) {
        return state
          .setIn([GET_COLLABORATIONS_WITH_DATA_SETS, ERROR], action.value)
          .setIn([GET_COLLABORATIONS_WITH_DATA_SETS, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([GET_COLLABORATIONS_WITH_DATA_SETS, action.id]),
  });
}

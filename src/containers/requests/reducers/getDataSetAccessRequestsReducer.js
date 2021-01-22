/*
 * @flow
 */

import { Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { ACCESS_REQUESTS, REQUEST_STATE } from '../../../core/redux/constants';
import { GET_DATA_SET_ACCESS_REQUESTS, getDataSetAccessRequests } from '../actions';

export default function reducer(state :Map, action :SequenceAction) {

  return getDataSetAccessRequests.reducer(state, action, {
    REQUEST: () => state
      .setIn([GET_DATA_SET_ACCESS_REQUESTS, REQUEST_STATE], RequestStates.PENDING)
      .setIn([GET_DATA_SET_ACCESS_REQUESTS, action.id], action),
    SUCCESS: () => {
      const storedAction = state.getIn([GET_DATA_SET_ACCESS_REQUESTS, action.id]);
      if (storedAction) {
        const { dataSetId } = storedAction.value;
        return state
          .setIn([ACCESS_REQUESTS, dataSetId], action.value)
          .setIn([GET_DATA_SET_ACCESS_REQUESTS, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      const storedAction = state.getIn([GET_DATA_SET_ACCESS_REQUESTS, action.id]);
      if (storedAction) {
        const { dataSetId } = storedAction.value;
        return state
          .setIn([ACCESS_REQUESTS, dataSetId], Map())
          .setIn([GET_DATA_SET_ACCESS_REQUESTS, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([GET_DATA_SET_ACCESS_REQUESTS, action.id]),
  });
}

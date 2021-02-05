/*
 * @flow
 */

import { Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  METADATA,
  REQUEST_STATE,
} from '../../redux/constants';
import { GET_DATA_SET_METADATA, getDataSetMetaData } from '../actions';

export default function reducer(state :Map, action :SequenceAction) {

  return getDataSetMetaData.reducer(state, action, {
    REQUEST: () => state
      .setIn([GET_DATA_SET_METADATA, REQUEST_STATE], RequestStates.PENDING)
      .setIn([GET_DATA_SET_METADATA, action.id], action),
    SUCCESS: () => {
      const storedAction = state.getIn([GET_DATA_SET_METADATA, action.id]);
      if (storedAction) {
        const { dataSetId } = storedAction.value;
        // TODO: wrong location, need to refactor
        return state
          .setIn([METADATA, dataSetId], action.value)
          .setIn([GET_DATA_SET_METADATA, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([GET_DATA_SET_METADATA, action.id])) {
        return state.setIn([GET_DATA_SET_METADATA, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([GET_DATA_SET_METADATA, action.id]),
  });
}

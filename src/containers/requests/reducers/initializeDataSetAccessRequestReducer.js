/*
 * @flow
 */

import { Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { ACCESS_REQUEST_DATA_SCHEMA, ACCESS_REQUEST_UI_SCHEMA, REQUEST_STATE } from '../../../core/redux/constants';
import { INITIALIZE_DATA_SET_ACCESS_REQUEST, initializeDataSetAccessRequest } from '../actions';

export default function reducer(state :Map, action :SequenceAction) {

  return initializeDataSetAccessRequest.reducer(state, action, {
    REQUEST: () => state
      .setIn([INITIALIZE_DATA_SET_ACCESS_REQUEST, REQUEST_STATE], RequestStates.PENDING)
      .setIn([INITIALIZE_DATA_SET_ACCESS_REQUEST, action.id], action),
    SUCCESS: () => {
      if (state.hasIn([INITIALIZE_DATA_SET_ACCESS_REQUEST, action.id])) {
        const { dataSchema, uiSchema } = action.value;
        return state
          .setIn([ACCESS_REQUEST_DATA_SCHEMA], dataSchema)
          .setIn([ACCESS_REQUEST_UI_SCHEMA], uiSchema)
          .setIn([INITIALIZE_DATA_SET_ACCESS_REQUEST, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([INITIALIZE_DATA_SET_ACCESS_REQUEST, action.id])) {
        return state.setIn([INITIALIZE_DATA_SET_ACCESS_REQUEST, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([INITIALIZE_DATA_SET_ACCESS_REQUEST, action.id]),
  });
}

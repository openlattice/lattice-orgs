/*
 * @flow
 */

import { Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { REQUEST_STATE } from '../../../core/redux/constants';
import {
  SUBMIT_DATA_SET_ACCESS_REQUEST,
  submitDataSetAccessRequest,
} from '../actions';

export default function reducer(state :Map, action :SequenceAction) {

  return submitDataSetAccessRequest.reducer(state, action, {
    REQUEST: () => state.setIn([SUBMIT_DATA_SET_ACCESS_REQUEST, REQUEST_STATE], RequestStates.PENDING),
    SUCCESS: () => state.setIn([SUBMIT_DATA_SET_ACCESS_REQUEST, REQUEST_STATE], RequestStates.SUCCESS),
    FAILURE: () => state.setIn([SUBMIT_DATA_SET_ACCESS_REQUEST, REQUEST_STATE], RequestStates.FAILURE),
  });
}

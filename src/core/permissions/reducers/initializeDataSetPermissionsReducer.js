/*
 * @flow
 */

import { Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { REQUEST_STATE } from '../../redux/constants';
import {
  INITIALIZE_DATA_SET_PERMISSIONS,
  initializeDataSetPermissions,
} from '../actions';

export default function reducer(state :Map, action :SequenceAction) {

  return initializeDataSetPermissions.reducer(state, action, {
    REQUEST: () => state.setIn([INITIALIZE_DATA_SET_PERMISSIONS, REQUEST_STATE], RequestStates.PENDING),
    SUCCESS: () => state.setIn([INITIALIZE_DATA_SET_PERMISSIONS, REQUEST_STATE], RequestStates.SUCCESS),
    FAILURE: () => state.setIn([INITIALIZE_DATA_SET_PERMISSIONS, REQUEST_STATE], RequestStates.FAILURE),
  });
}

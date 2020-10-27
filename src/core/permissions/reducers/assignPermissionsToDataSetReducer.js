/*
 * @flow
 */

import { Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { REQUEST_STATE } from '../../redux/constants';
import {
  ASSIGN_PERMISSIONS_TO_DATA_SET,
  assignPermissionsToDataSet,
} from '../actions';

export default function reducer(state :Map, action :SequenceAction) {

  // TODO: update stored aces
  return assignPermissionsToDataSet.reducer(state, action, {
    REQUEST: () => state.setIn([ASSIGN_PERMISSIONS_TO_DATA_SET, REQUEST_STATE], RequestStates.PENDING),
    SUCCESS: () => state.setIn([ASSIGN_PERMISSIONS_TO_DATA_SET, REQUEST_STATE], RequestStates.SUCCESS),
    FAILURE: () => state.setIn([ASSIGN_PERMISSIONS_TO_DATA_SET, REQUEST_STATE], RequestStates.FAILURE),
  });
}

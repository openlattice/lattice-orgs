/*
 * @flow
 */

import { Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { REQUEST_STATE } from '../../redux/constants';
import {
  GET_DATA_SET_PERMISSIONS,
  getDataSetPermissions,
} from '../actions';

export default function reducer(state :Map, action :SequenceAction) {

  return getDataSetPermissions.reducer(state, action, {
    REQUEST: () => state.setIn([GET_DATA_SET_PERMISSIONS, REQUEST_STATE], RequestStates.PENDING),
    SUCCESS: () => state.setIn([GET_DATA_SET_PERMISSIONS, REQUEST_STATE], RequestStates.SUCCESS),
    FAILURE: () => state.setIn([GET_DATA_SET_PERMISSIONS, REQUEST_STATE], RequestStates.FAILURE),
  });
}

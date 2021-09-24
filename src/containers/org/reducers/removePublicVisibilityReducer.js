/*
 * @flow
 */

import { Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { REQUEST_STATE } from '../../../core/redux/constants';
import { REMOVE_PUBLIC_VISIBILITY, removePublicVisibility } from '../actions';

export default function reducer(state :Map, action :SequenceAction) {
  return removePublicVisibility.reducer(state, action, {
    REQUEST: () => state.setIn([REMOVE_PUBLIC_VISIBILITY, REQUEST_STATE], RequestStates.PENDING),
    SUCCESS: () => state.setIn([REMOVE_PUBLIC_VISIBILITY, REQUEST_STATE], RequestStates.SUCCESS),
    FAILURE: () => state.setIn([REMOVE_PUBLIC_VISIBILITY, REQUEST_STATE], RequestStates.FAILURE),
  });
}

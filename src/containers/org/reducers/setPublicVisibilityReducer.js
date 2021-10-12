/*
 * @flow
 */

import { Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { REQUEST_STATE } from '../../../common/constants';
import { SET_PUBLIC_VISIBILITY, setPublicVisibility } from '../actions';

export default function reducer(state :Map, action :SequenceAction) {
  return setPublicVisibility.reducer(state, action, {
    REQUEST: () => state.setIn([SET_PUBLIC_VISIBILITY, REQUEST_STATE], RequestStates.PENDING),
    SUCCESS: () => state.setIn([SET_PUBLIC_VISIBILITY, REQUEST_STATE], RequestStates.SUCCESS),
    FAILURE: () => state.setIn([SET_PUBLIC_VISIBILITY, REQUEST_STATE], RequestStates.FAILURE),
  });
}

/*
 * @flow
 */

import { Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { REQUEST_STATE } from '../../redux/constants';
import { GET_OR_SELECT_ENTITY_SETS, getOrSelectEntitySets } from '../actions';

export default function reducer(state :Map, action :SequenceAction) {

  return getOrSelectEntitySets.reducer(state, action, {
    REQUEST: () => state.setIn([GET_OR_SELECT_ENTITY_SETS, REQUEST_STATE], RequestStates.PENDING),
    SUCCESS: () => state.setIn([GET_OR_SELECT_ENTITY_SETS, REQUEST_STATE], RequestStates.SUCCESS),
    FAILURE: () => state.setIn([GET_OR_SELECT_ENTITY_SETS, REQUEST_STATE], RequestStates.FAILURE),
  });
}

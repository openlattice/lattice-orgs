/*
 * @flow
 */

import { Map } from 'immutable';
import type { SequenceAction } from 'redux-reqseq';

import { SEARCH_INITIAL_STATE } from '../../redux/constants';

export default function reducer(state :Map, action :SequenceAction) {

  if (action.value && state.has(action.value)) {
    return state.set(action.value, SEARCH_INITIAL_STATE);
  }

  return state;
}

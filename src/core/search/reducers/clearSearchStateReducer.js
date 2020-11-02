/*
 * @flow
 */

import { Map } from 'immutable';
import type { SequenceAction } from 'redux-reqseq';

import { HITS } from '../../redux/constants';
import { SEARCH_ORGANIZATION_DATA_SETS } from '../actions';
import { SEARCH_INITIAL_STATE } from '../constants';

export default function reducer(state :Map, action :SequenceAction) {

  if (action.value && state.has(action.value)) {
    if (action.value === SEARCH_ORGANIZATION_DATA_SETS) {
      return state.set(action.value, SEARCH_INITIAL_STATE.set(HITS, Map()));
    }
    return state.set(action.value, SEARCH_INITIAL_STATE);
  }

  return state;
}

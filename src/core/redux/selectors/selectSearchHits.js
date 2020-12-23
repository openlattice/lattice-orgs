/*
 * @flow
 */

import { Map, Set, getIn } from 'immutable';
import type { UUID } from 'lattice';

import { HITS, SEARCH } from '../constants';

export default function selectSearchHits(action :string) {

  return (state :Map) :Set<UUID> => getIn(state, [SEARCH, action, HITS]) || Set();
}

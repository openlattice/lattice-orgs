/*
 * @flow
 */

import {
  List,
  Map,
  getIn,
  hasIn,
} from 'immutable';
import type { UUID } from 'lattice';

import { SEARCH_DATA_SETS } from '../../search/actions';
import { HITS, SEARCH } from '../constants';

const EMPTY_LIST = List();

export default function selectDataSetSearchHits() {

  return (state :Map) :Map<UUID, Map> => {

    if (hasIn(state, [SEARCH, SEARCH_DATA_SETS, HITS])) {
      return getIn(state, [SEARCH, SEARCH_DATA_SETS, HITS]);
    }

    return EMPTY_LIST;
  };
}

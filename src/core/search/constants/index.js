/*
 * @flow
 */

import { List, Map, Set } from 'immutable';
import { RequestStates } from 'redux-reqseq';

import {
  ATLAS_DATA_SET_IDS,
  ENTITY_SET_IDS,
  ERROR,
  HITS,
  PAGE,
  QUERY,
  REQUEST_STATE,
  TOTAL_HITS,
} from '../../redux/constants';

const MAX_HITS_10 :10 = 10;
const MAX_HITS_20 :20 = 20;
const MAX_HITS_10000 :10000 = 10000;

const INITIAL_STATE_SEARCH = Map({
  [ERROR]: false,
  [HITS]: List(),
  [PAGE]: 1,
  [QUERY]: '',
  [REQUEST_STATE]: RequestStates.STANDBY,
  [TOTAL_HITS]: 0,
});

const INITIAL_STATE_SEARCH_DATA_SETS = INITIAL_STATE_SEARCH
  .set(HITS, Map({ [ATLAS_DATA_SET_IDS]: Set(), [ENTITY_SET_IDS]: Set() }))
  .set(TOTAL_HITS, Map({ [ATLAS_DATA_SET_IDS]: 0, [ENTITY_SET_IDS]: 0 }));

export {
  INITIAL_STATE_SEARCH,
  INITIAL_STATE_SEARCH_DATA_SETS,
  MAX_HITS_10,
  MAX_HITS_20,
  MAX_HITS_10000,
};

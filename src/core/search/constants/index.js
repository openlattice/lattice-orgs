/*
 * @flow
 */

import { List, Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';

import {
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

const INITIAL_SEARCH_STATE = Map({
  [ERROR]: false,
  [HITS]: List(),
  [PAGE]: 1,
  [QUERY]: '',
  [REQUEST_STATE]: RequestStates.STANDBY,
  [TOTAL_HITS]: 0,
});

export {
  INITIAL_SEARCH_STATE,
  MAX_HITS_10,
  MAX_HITS_20,
  MAX_HITS_10000,
};

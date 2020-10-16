/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const CLEAR_SEARCH_STATE :'CLEAR_SEARCH_STATE' = 'CLEAR_SEARCH_STATE';
const clearSearchState = (action :string) => ({
  type: CLEAR_SEARCH_STATE,
  value: action || '',
});

const SEARCH_DATA_SETS :'SEARCH_DATA_SETS' = 'SEARCH_DATA_SETS';
const searchDataSets :RequestSequence = newRequestSequence(SEARCH_DATA_SETS);

export {
  CLEAR_SEARCH_STATE,
  SEARCH_DATA_SETS,
  clearSearchState,
  searchDataSets,
};

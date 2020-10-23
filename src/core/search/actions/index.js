/*
 * @flow
 */

/* eslint-disable max-len */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const CLEAR_SEARCH_STATE :'CLEAR_SEARCH_STATE' = 'CLEAR_SEARCH_STATE';
const clearSearchState = (action :string) => ({
  type: CLEAR_SEARCH_STATE,
  value: action || '',
});

const SEARCH_DATA_SETS :'SEARCH_DATA_SETS' = 'SEARCH_DATA_SETS';
const searchDataSets :RequestSequence = newRequestSequence(SEARCH_DATA_SETS);

const SEARCH_DATA_SETS_IN_DATA_SET_PERMISSIONS_CONTAINER :'SEARCH_DATA_SETS_IN_DATA_SET_PERMISSIONS_CONTAINER' = 'SEARCH_DATA_SETS_IN_DATA_SET_PERMISSIONS_CONTAINER';
const searchDataSetsInDataSetPermissionsContainer :RequestSequence = newRequestSequence(SEARCH_DATA_SETS_IN_DATA_SET_PERMISSIONS_CONTAINER);

const SEARCH_DATA_SETS_IN_DATA_SET_PERMISSIONS_MODAL :'SEARCH_DATA_SETS_IN_DATA_SET_PERMISSIONS_MODAL' = 'SEARCH_DATA_SETS_IN_DATA_SET_PERMISSIONS_MODAL';
const searchDataSetsInDataSetPermissionsModal :RequestSequence = newRequestSequence(SEARCH_DATA_SETS_IN_DATA_SET_PERMISSIONS_MODAL);

export {
  CLEAR_SEARCH_STATE,
  SEARCH_DATA_SETS,
  SEARCH_DATA_SETS_IN_DATA_SET_PERMISSIONS_CONTAINER,
  SEARCH_DATA_SETS_IN_DATA_SET_PERMISSIONS_MODAL,
  clearSearchState,
  searchDataSets,
  searchDataSetsInDataSetPermissionsContainer,
  searchDataSetsInDataSetPermissionsModal,
};

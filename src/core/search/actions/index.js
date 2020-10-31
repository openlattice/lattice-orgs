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

const SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS :'SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS' = 'SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS';
const searchDataSetsToAssignPermissions :RequestSequence = newRequestSequence(SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS);

const SEARCH_DATA_SETS_TO_FILTER :'SEARCH_DATA_SETS_TO_FILTER' = 'SEARCH_DATA_SETS_TO_FILTER';
const searchDataSetsToFilter :RequestSequence = newRequestSequence(SEARCH_DATA_SETS_TO_FILTER);

const SEARCH_ENTITY_SET :'SEARCH_ENTITY_SET' = 'SEARCH_ENTITY_SET';
const searchEntitySet :RequestSequence = newRequestSequence(SEARCH_ENTITY_SET);

const SEARCH_ORGANIZATION_DATA_SETS :'SEARCH_ORGANIZATION_DATA_SETS' = 'SEARCH_ORGANIZATION_DATA_SETS';
const searchOrganizationDataSets :RequestSequence = newRequestSequence(SEARCH_ORGANIZATION_DATA_SETS);

export {
  CLEAR_SEARCH_STATE,
  SEARCH_DATA_SETS,
  SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS,
  SEARCH_DATA_SETS_TO_FILTER,
  SEARCH_ENTITY_SET,
  SEARCH_ORGANIZATION_DATA_SETS,
  clearSearchState,
  searchDataSets,
  searchDataSetsToAssignPermissions,
  searchDataSetsToFilter,
  searchEntitySet,
  searchOrganizationDataSets,
};

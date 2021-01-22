/*
 * @flow
 */

import { ReduxConstants } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';

export const {
  APP,
  AUTH,
  DATA,
  EDM,
  ENTITY_SETS,
  ENTITY_SETS_INDEX_MAP,
  ENTITY_TYPES,
  ENTITY_TYPES_INDEX_MAP,
  ERROR,
  HITS,
  MEMBERS,
  ORGANIZATIONS,
  ORGS,
  PAGE,
  PERMISSIONS,
  PROPERTY_TYPES,
  PROPERTY_TYPES_INDEX_MAP,
  QUERY,
  REQUEST_STATE,
  SEARCH,
  TOTAL_HITS,
  USERS,
} = ReduxConstants;

export const ACCESS_REQUESTS :'accessRequests' = 'accessRequests';
export const ACCESS_REQUEST_DATA_SCHEMA :'accessRequestDataSchema' = 'accessRequestDataSchema';
export const ACCESS_REQUEST_UI_SCHEMA :'accessRequestUISchema' = 'accessRequestUISchema';
export const ACCOUNT :'account' = 'account';
export const ACES :'aces' = 'aces';
export const ATLAS_CREDENTIALS :'atlasCredentials' = 'atlasCredentials';
export const ATLAS_DATA_SETS :'atlasDataSets' = 'atlasDataSets';
export const ATLAS_DATA_SET_IDS :'atlasDataSetIds' = 'atlasDataSetIds';
export const DATA_SET :'dataSet' = 'dataSet';
export const DATA_SET_COLUMNS :'dataSetColumns' = 'dataSetColumns';
export const CURRENT :'current' = 'current';
export const DATABASE_NAME :'databaseName' = 'databaseName';
export const DATA_SET_SCHEMA :'dataSetSchema' = 'dataSetSchema';
export const DATA_SOURCES :'dataSources' = 'dataSources';
export const ENTITY_SET_IDS :'entitySetIds' = 'entitySetIds';
export const INTEGRATION_DETAILS :'integrationDetails' = 'integrationDetails';
export const IS_OWNER :'isOwner' = 'isOwner';
export const METADATA :'metadata' = 'metadata';
export const REQUESTS :'requests' = 'requests';
export const USER_SEARCH_RESULTS :'userSearchResults' = 'userSearchResults';

// TODO: does this belong here?
export const RS_INITIAL_STATE = {
  [ERROR]: false,
  [REQUEST_STATE]: RequestStates.STANDBY,
};

/*
 * @flow
 */

import { Map } from 'immutable';
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

export const ACCOUNT :'account' = 'account';
export const ACES :'aces' = 'aces';
export const ATLAS_CREDENTIALS :'atlasCredentials' = 'atlasCredentials';
export const ATLAS_DATA_SETS :'atlasDataSets' = 'atlasDataSets';
export const ATLAS_DATA_SET_IDS :'atlasDataSetIds' = 'atlasDataSetIds';
export const CURRENT :'current' = 'current';
export const DATABASE_NAME :'databaseName' = 'databaseName';
export const DATA_SET_SCHEMA :'dataSetSchema' = 'dataSetSchema';
export const ENTITY_SET_IDS :'entitySetIds' = 'entitySetIds';
export const INTEGRATION_DETAILS :'integrationDetails' = 'integrationDetails';
export const IS_OWNER :'isOwner' = 'isOwner';
export const SHIPROOM :'shiproom' = 'shiproom';
export const USER_SEARCH_RESULTS :'userSearchResults' = 'userSearchResults';

// TODO: does this belong here?
export const INITIAL_SEARCH_RESULTS :Map = Map();

// TODO: does this belong here?
export const RS_INITIAL_STATE = {
  [ERROR]: false,
  [REQUEST_STATE]: RequestStates.STANDBY,
};

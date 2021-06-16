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

// TODO: Add COLLABORATIONS const to ReduxConstants in lattice-utils
export const COLLABORATIONS :'collaborations' = 'collaborations';

export const ACCOUNT :'account' = 'account';
export const ACES :'aces' = 'aces';
export const APP_INSTALLS :'appInstalls' = 'appInstalls';
export const ATLAS_CREDENTIALS :'atlasCredentials' = 'atlasCredentials';
export const CURRENT :'current' = 'current';
export const CURRENT_ROLE_AUTHORIZATIONS :'currentRoleAuthorizations' = 'currentRoleAuthorizations';
export const DATABASE_NAME :'databaseName' = 'databaseName';
export const DATA_SET :'dataSet' = 'dataSet';
export const DATA_SET_COLUMNS :'dataSetColumns' = 'dataSetColumns';
export const DATA_SET_PERMISSIONS_PAGE :'dataSetPermissionsPage' = 'dataSetPermissionsPage';
export const DATA_SET_SCHEMA :'dataSetSchema' = 'dataSetSchema';
export const ENTITY_SET_DATA :'entitySetData' = 'entitySetData';
export const ENTITY_SET_SIZE_MAP :'entitySetSizeMap' = 'entitySetSizeMap';
export const ENTITY_SET_IDS :'entitySetIds' = 'entitySetIds';
export const ENTITY_NEIGHBORS_MAP :'entityNeighborsMap' = 'entityNeighborsMap';
export const EXPLORE :'explore' = 'explore';
export const INTEGRATION_DETAILS :'integrationDetails' = 'integrationDetails';
export const IS_OWNER :'isOwner' = 'isOwner';
export const MY_KEYS :'myKeys' = 'myKeys';
export const NEW_ORGANIZATION_ID :'newOrganizationId' = 'newOrganizationId';
export const ORGANIZATION :'organization' = 'organization';
export const ORGANIZATION_IDS :'organizationIds' = 'organizationIds';
export const ORG_DATA_SETS :'organizationDataSets' = 'organizationDataSets';
export const ORG_DATA_SET_COLUMNS :'organizationDataSetColumns' = 'organizationDataSetColumns';
export const PAGE_PERMISSIONS_BY_DATA_SET :'pagePermissionsByDataSet' = 'pagePermissionsByDataSet';
export const SELECTED_ENTITY_DATA :'selectedEntityData' = 'selectedEntityData';
export const TOTAL_PERMISSIONS :'totalPermissions' = 'totalPermissions';
export const USER_SEARCH_RESULTS :'userSearchResults' = 'userSearchResults';

// TODO: does this belong here?
export const RS_INITIAL_STATE = {
  [ERROR]: false,
  [REQUEST_STATE]: RequestStates.STANDBY,
};

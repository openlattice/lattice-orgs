/*
 * @flow
 */

/* eslint-disable max-len */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const ASSIGN_PERMISSIONS_TO_DATA_SET :'ASSIGN_PERMISSIONS_TO_DATA_SET' = 'ASSIGN_PERMISSIONS_TO_DATA_SET';
const assignPermissionsToDataSet :RequestSequence = newRequestSequence(ASSIGN_PERMISSIONS_TO_DATA_SET);

const GET_CURRENT_DATA_SET_AUTHORIZATIONS :'GET_CURRENT_DATA_SET_AUTHORIZATIONS' = 'GET_CURRENT_DATA_SET_AUTHORIZATIONS';
const getCurrentDataSetAuthorizations :RequestSequence = newRequestSequence(GET_CURRENT_DATA_SET_AUTHORIZATIONS);

const GET_CURRENT_ROLE_AUTHORIZATIONS :'GET_CURRENT_ROLE_AUTHORIZATIONS' = 'GET_CURRENT_ROLE_AUTHORIZATIONS';
const getCurrentRoleAuthorizations :RequestSequence = newRequestSequence(GET_CURRENT_ROLE_AUTHORIZATIONS);

const GET_DATA_SET_KEYS :'GET_DATA_SET_KEYS' = 'GET_DATA_SET_KEYS';
const getDataSetKeys :RequestSequence = newRequestSequence(GET_DATA_SET_KEYS);

const GET_DATA_SET_PERMISSIONS :'GET_DATA_SET_PERMISSIONS' = 'GET_DATA_SET_PERMISSIONS';
const getDataSetPermissions :RequestSequence = newRequestSequence(GET_DATA_SET_PERMISSIONS);

const GET_ORG_DATA_SET_OBJECT_PERMISSIONS :'GET_ORG_DATA_SET_OBJECT_PERMISSIONS' = 'GET_ORG_DATA_SET_OBJECT_PERMISSIONS';
const getOrgDataSetObjectPermissions :RequestSequence = newRequestSequence(GET_ORG_DATA_SET_OBJECT_PERMISSIONS);

const GET_ORG_OBJECT_PERMISSIONS :'GET_ORG_OBJECT_PERMISSIONS' = 'GET_ORG_OBJECT_PERMISSIONS';
const getOrgObjectPermissions :RequestSequence = newRequestSequence(GET_ORG_OBJECT_PERMISSIONS);

const GET_ORG_ROLE_OBJECT_PERMISSIONS :'GET_ORG_ROLE_OBJECT_PERMISSIONS' = 'GET_ORG_ROLE_OBJECT_PERMISSIONS';
const getOrgRoleObjectPermissions :RequestSequence = newRequestSequence(GET_ORG_ROLE_OBJECT_PERMISSIONS);

const GET_OWNER_STATUS :'GET_OWNER_STATUS' = 'GET_OWNER_STATUS';
const getOwnerStatus :RequestSequence = newRequestSequence(GET_OWNER_STATUS);

const GET_PAGE_DATA_SET_PERMISSIONS :'GET_PAGE_DATA_SET_PERMISSIONS' = 'GET_PAGE_DATA_SET_PERMISSIONS';
const getPageDataSetPermissions :RequestSequence = newRequestSequence(GET_PAGE_DATA_SET_PERMISSIONS);

const GET_PERMISSIONS :'GET_PERMISSIONS' = 'GET_PERMISSIONS';
const getPermissions :RequestSequence = newRequestSequence(GET_PERMISSIONS);

const INITIALIZE_DATA_SET_PERMISSIONS :'INITIALIZE_DATA_SET_PERMISSIONS' = 'INITIALIZE_DATA_SET_PERMISSIONS';
const initializeDataSetPermissions :RequestSequence = newRequestSequence(INITIALIZE_DATA_SET_PERMISSIONS);

const INITIALIZE_OBJECT_PERMISSIONS :'INITIALIZE_OBJECT_PERMISSIONS' = 'INITIALIZE_OBJECT_PERMISSIONS';
const initializeObjectPermissions :RequestSequence = newRequestSequence(INITIALIZE_OBJECT_PERMISSIONS);

const SET_PERMISSIONS :'SET_PERMISSIONS' = 'SET_PERMISSIONS';
const setPermissions :RequestSequence = newRequestSequence(SET_PERMISSIONS);

const UPDATE_PERMISSIONS :'UPDATE_PERMISSIONS' = 'UPDATE_PERMISSIONS';
const updatePermissions :RequestSequence = newRequestSequence(UPDATE_PERMISSIONS);

const RESET_CURRENT_ROLE_AUTHORIZATIONS :'RESET_CURRENT_ROLE_AUTHORIZATIONS' = 'RESET_CURRENT_ROLE_AUTHORIZATIONS';
const resetCurrentRoleAuthorizations = () => ({
  type: RESET_CURRENT_ROLE_AUTHORIZATIONS
});

export {
  ASSIGN_PERMISSIONS_TO_DATA_SET,
  GET_CURRENT_DATA_SET_AUTHORIZATIONS,
  GET_CURRENT_ROLE_AUTHORIZATIONS,
  GET_DATA_SET_KEYS,
  GET_DATA_SET_PERMISSIONS,
  GET_ORG_DATA_SET_OBJECT_PERMISSIONS,
  GET_ORG_OBJECT_PERMISSIONS,
  GET_ORG_ROLE_OBJECT_PERMISSIONS,
  GET_OWNER_STATUS,
  GET_PAGE_DATA_SET_PERMISSIONS,
  GET_PERMISSIONS,
  INITIALIZE_DATA_SET_PERMISSIONS,
  INITIALIZE_OBJECT_PERMISSIONS,
  RESET_CURRENT_ROLE_AUTHORIZATIONS,
  SET_PERMISSIONS,
  UPDATE_PERMISSIONS,
  assignPermissionsToDataSet,
  getCurrentDataSetAuthorizations,
  getCurrentRoleAuthorizations,
  getDataSetKeys,
  getDataSetPermissions,
  getOrgDataSetObjectPermissions,
  getOrgObjectPermissions,
  getOrgRoleObjectPermissions,
  getOwnerStatus,
  getPageDataSetPermissions,
  getPermissions,
  initializeDataSetPermissions,
  initializeObjectPermissions,
  resetCurrentRoleAuthorizations,
  setPermissions,
  updatePermissions,
};

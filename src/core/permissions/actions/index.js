/*
 * @flow
 */

/* eslint-disable max-len */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const ASSIGN_PERMISSIONS_TO_DATA_SET :'ASSIGN_PERMISSIONS_TO_DATA_SET' = 'ASSIGN_PERMISSIONS_TO_DATA_SET';
const assignPermissionsToDataSet :RequestSequence = newRequestSequence(ASSIGN_PERMISSIONS_TO_DATA_SET);

const GET_DATA_SET_PERMISSIONS :'GET_DATA_SET_PERMISSIONS' = 'GET_DATA_SET_PERMISSIONS';
const getDataSetPermissions :RequestSequence = newRequestSequence(GET_DATA_SET_PERMISSIONS);

const GET_ORGANIZATION_OBJECT_PERMISSIONS :'GET_ORGANIZATION_OBJECT_PERMISSIONS' = 'GET_ORGANIZATION_OBJECT_PERMISSIONS';
const getOrganizationObjectPermissions :RequestSequence = newRequestSequence(GET_ORGANIZATION_OBJECT_PERMISSIONS);

const GET_OWNER_STATUS :'GET_OWNER_STATUS' = 'GET_OWNER_STATUS';
const getOwnerStatus :RequestSequence = newRequestSequence(GET_OWNER_STATUS);

const GET_PAGE_DATA_SET_PERMISSIONS :'GET_PAGE_DATA_SET_PERMISSIONS' = 'GET_PAGE_DATA_SET_PERMISSIONS';
const getPageDataSetPermissions :RequestSequence = newRequestSequence(GET_PAGE_DATA_SET_PERMISSIONS);

const GET_PERMISSIONS :'GET_PERMISSIONS' = 'GET_PERMISSIONS';
const getPermissions :RequestSequence = newRequestSequence(GET_PERMISSIONS);

const SET_PERMISSIONS :'SET_PERMISSIONS' = 'SET_PERMISSIONS';
const setPermissions :RequestSequence = newRequestSequence(SET_PERMISSIONS);

export {
  ASSIGN_PERMISSIONS_TO_DATA_SET,
  GET_DATA_SET_PERMISSIONS,
  GET_ORGANIZATION_OBJECT_PERMISSIONS,
  GET_OWNER_STATUS,
  GET_PAGE_DATA_SET_PERMISSIONS,
  GET_PERMISSIONS,
  SET_PERMISSIONS,
  assignPermissionsToDataSet,
  getDataSetPermissions,
  getOrganizationObjectPermissions,
  getOwnerStatus,
  getPageDataSetPermissions,
  getPermissions,
  setPermissions,
};

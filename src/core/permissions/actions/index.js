/*
 * @flow
 */

/* eslint-disable max-len */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_DATA_SET_PERMISSIONS :'GET_DATA_SET_PERMISSIONS' = 'GET_DATA_SET_PERMISSIONS';
const getDataSetPermissions :RequestSequence = newRequestSequence(GET_DATA_SET_PERMISSIONS);

const GET_DATA_SET_PERMISSIONS_IN_DATA_SET_PERMISSIONS_CONTAINER :'GET_DATA_SET_PERMISSIONS_IN_DATA_SET_PERMISSIONS_CONTAINER' = 'GET_DATA_SET_PERMISSIONS_IN_DATA_SET_PERMISSIONS_CONTAINER';
const getDataSetPermissionsInDataSetPermissionsContainer :RequestSequence = newRequestSequence(GET_DATA_SET_PERMISSIONS_IN_DATA_SET_PERMISSIONS_CONTAINER);

const GET_DATA_SET_PERMISSIONS_IN_DATA_SET_PERMISSIONS_MODAL :'GET_DATA_SET_PERMISSIONS_IN_DATA_SET_PERMISSIONS_MODAL' = 'GET_DATA_SET_PERMISSIONS_IN_DATA_SET_PERMISSIONS_MODAL';
const getDataSetPermissionsInDataSetPermissionsModal :RequestSequence = newRequestSequence(GET_DATA_SET_PERMISSIONS_IN_DATA_SET_PERMISSIONS_MODAL);

const GET_PERMISSIONS :'GET_PERMISSIONS' = 'GET_PERMISSIONS';
const getPermissions :RequestSequence = newRequestSequence(GET_PERMISSIONS);

const SET_PERMISSIONS :'SET_PERMISSIONS' = 'SET_PERMISSIONS';
const setPermissions :RequestSequence = newRequestSequence(SET_PERMISSIONS);

export {
  GET_DATA_SET_PERMISSIONS,
  GET_DATA_SET_PERMISSIONS_IN_DATA_SET_PERMISSIONS_CONTAINER,
  GET_DATA_SET_PERMISSIONS_IN_DATA_SET_PERMISSIONS_MODAL,
  GET_PERMISSIONS,
  SET_PERMISSIONS,
  getDataSetPermissions,
  getDataSetPermissionsInDataSetPermissionsContainer,
  getDataSetPermissionsInDataSetPermissionsModal,
  getPermissions,
  setPermissions,
};

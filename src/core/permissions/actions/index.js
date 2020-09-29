/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_ENTITY_SET_PERMISSIONS :'GET_ENTITY_SET_PERMISSIONS' = 'GET_ENTITY_SET_PERMISSIONS';
const getEntitySetPermissions :RequestSequence = newRequestSequence(GET_ENTITY_SET_PERMISSIONS);

const GET_PERMISSIONS :'GET_PERMISSIONS' = 'GET_PERMISSIONS';
const getPermissions :RequestSequence = newRequestSequence(GET_PERMISSIONS);

const GET_PROPERTY_TYPE_PERMISSIONS :'GET_PROPERTY_TYPE_PERMISSIONS' = 'GET_PROPERTY_TYPE_PERMISSIONS';
const getPropertyTypePermissions :RequestSequence = newRequestSequence(GET_PROPERTY_TYPE_PERMISSIONS);

const SET_PERMISSIONS :'SET_PERMISSIONS' = 'SET_PERMISSIONS';
const setPermissions :RequestSequence = newRequestSequence(SET_PERMISSIONS);

export {
  GET_ENTITY_SET_PERMISSIONS,
  GET_PERMISSIONS,
  GET_PROPERTY_TYPE_PERMISSIONS,
  SET_PERMISSIONS,
  getEntitySetPermissions,
  getPermissions,
  getPropertyTypePermissions,
  setPermissions,
};

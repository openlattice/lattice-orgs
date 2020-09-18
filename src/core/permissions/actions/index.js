/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_PERMISSIONS :'GET_PERMISSIONS' = 'GET_PERMISSIONS';
const getPermissions :RequestSequence = newRequestSequence(GET_PERMISSIONS);

const GET_PROPERTY_TYPE_PERMISSIONS :'GET_PROPERTY_TYPE_PERMISSIONS' = 'GET_PROPERTY_TYPE_PERMISSIONS';
const getPropertyTypePermissions :RequestSequence = newRequestSequence(GET_PROPERTY_TYPE_PERMISSIONS);

export {
  GET_PERMISSIONS,
  GET_PROPERTY_TYPE_PERMISSIONS,
  getPermissions,
  getPropertyTypePermissions,
};

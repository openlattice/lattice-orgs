/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_ENTITY_SETS_WITH_PERMISSIONS :'GET_ENTITY_SETS_WITH_PERMISSIONS' = 'GET_ENTITY_SETS_WITH_PERMISSIONS';
const getEntitySetsWithPermissions :RequestSequence = newRequestSequence(GET_ENTITY_SETS_WITH_PERMISSIONS);

const UPDATE_USER_PERMISSION :'UPDATE_USER_PERMISSION' = 'UPDATE_USER_PERMISSION';
const updateUserPermission :RequestSequence = newRequestSequence(UPDATE_USER_PERMISSION);

export {
  GET_ENTITY_SETS_WITH_PERMISSIONS,
  UPDATE_USER_PERMISSION,
  getEntitySetsWithPermissions,
  updateUserPermission,
};

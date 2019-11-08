/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const UPDATE_USER_PERMISSION :'UPDATE_USER_PERMISSION' = 'UPDATE_USER_PERMISSION';
const updateUserPermission :RequestSequence = newRequestSequence(UPDATE_USER_PERMISSION);

export {
  UPDATE_USER_PERMISSION,
  updateUserPermission,
};

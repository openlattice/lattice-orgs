/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GATHER_ORGANIZATION_PERMISSIONS :'GATHER_ORGANIZATION_PERMISSIONS' = 'GATHER_ORGANIZATION_PERMISSIONS';
const gatherOrganizationPermissions :RequestSequence = newRequestSequence(GATHER_ORGANIZATION_PERMISSIONS);

export {
  GATHER_ORGANIZATION_PERMISSIONS,
  gatherOrganizationPermissions,
};

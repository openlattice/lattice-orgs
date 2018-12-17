/*
 * @flow
 */

import { isValidUUID } from '../../utils/ValidationUtils';

const ORGANIZATION_ID :string = 'organization_id';

function getOrganizationId() :?string {

  const organizationId :?string = localStorage.getItem(ORGANIZATION_ID);
  if (typeof organizationId === 'string' && organizationId.trim().length) {
    return organizationId;
  }
  return null;
}

function storeOrganizationId(organizationId :?string) :void {

  if (!organizationId || !isValidUUID(organizationId)) {
    return;
  }
  localStorage.setItem(ORGANIZATION_ID, organizationId);
}

export {
  getOrganizationId,
  storeOrganizationId,
};

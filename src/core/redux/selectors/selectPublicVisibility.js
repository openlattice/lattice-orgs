/*
 * @flow
 */

import { List, Map, getIn } from 'immutable';
import { Types } from 'lattice';
import { ValidationUtils } from 'lattice-utils';
import type { UUID } from 'lattice';

import { ACES, AUTHENTICATED_USER, PERMISSIONS } from '../constants';

const { isValidUUID } = ValidationUtils;
const { PermissionTypes } = Types;

export default function selectPublicVisibility(organizationId :UUID) {

  return (state :Map) :boolean => {

    let isVisible = false;
    if (isValidUUID(organizationId)) {
      const orgAce = getIn(state, [PERMISSIONS, ACES, List([organizationId])], List());
      orgAce.forEach((ace) => {
        if (ace.principal.id === AUTHENTICATED_USER && ace.permissions.includes(PermissionTypes.READ)) {
          isVisible = true;
        }
      });
    }

    return isVisible;
  };
}

/*
 * @flow
 */

import { Map, getIn } from 'immutable';
import { ValidationUtils } from 'lattice-utils';
import type { UUID } from 'lattice';

import { IS_OWNER, ORGANIZATIONS } from '../constants';

const { isValidUUID } = ValidationUtils;

export default function selectCurrentUserIsOrgOwner(organizationId :UUID) {

  return (state :Map) :boolean => {

    if (isValidUUID(organizationId)) {
      return getIn(state, [ORGANIZATIONS, IS_OWNER, organizationId]);
    }

    return false;
  };
}

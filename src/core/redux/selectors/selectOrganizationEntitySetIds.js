/*
 * @flow
 */

import {
  Map,
  Set,
  getIn,
  hasIn,
} from 'immutable';
import { ValidationUtils } from 'lattice-utils';
import type { UUID } from 'lattice';

import { ENTITY_SET_IDS, ORGANIZATIONS } from '../constants';

const { isValidUUID } = ValidationUtils;

export default function selectOrganizationEntitySetIds(organizationId :?UUID) {

  return (state :Map) :Set<UUID> => {

    if (isValidUUID(organizationId)) {
      if (hasIn(state, [ORGANIZATIONS, ENTITY_SET_IDS, organizationId])) {
        return getIn(state, [ORGANIZATIONS, ENTITY_SET_IDS, organizationId]);
      }
    }

    return Set();
  };
}

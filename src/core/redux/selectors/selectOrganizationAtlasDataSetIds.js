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

import { ATLAS_DATA_SET_IDS, ORGANIZATIONS } from '../constants';

const { isValidUUID } = ValidationUtils;

export default function selectOrganizationAtlasDataSetIds(organizationId :?UUID) {

  return (state :Map) :Set<UUID> => {

    if (isValidUUID(organizationId)) {
      if (hasIn(state, [ORGANIZATIONS, ATLAS_DATA_SET_IDS, organizationId])) {
        return getIn(state, [ORGANIZATIONS, ATLAS_DATA_SET_IDS, organizationId]);
      }
    }

    return Set();
  };
}

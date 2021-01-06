/*
 * @flow
 */

import { Map, Set, getIn } from 'immutable';
import { ValidationUtils } from 'lattice-utils';
import type { UUID } from 'lattice';

import { ATLAS_DATA_SET_IDS, ORGANIZATIONS } from '../constants';

const { isValidUUID } = ValidationUtils;

export default function selectOrganizationAtlasDataSetIds(organizationId :?UUID) {

  return (state :Map) :Set<UUID> => {

    if (isValidUUID(organizationId)) {
      return getIn(state, [ORGANIZATIONS, ATLAS_DATA_SET_IDS, organizationId]) || Set();
    }

    return Set();
  };
}

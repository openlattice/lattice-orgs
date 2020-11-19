/*
 * @flow
 */

import { Map, getIn, hasIn } from 'immutable';
import { ValidationUtils } from 'lattice-utils';
import type { UUID } from 'lattice';

import { INTEGRATION_DETAILS, ORGANIZATIONS } from '../constants';

const { isValidUUID } = ValidationUtils;

const EMPTY_MAP = Map();

export default function selectOrganizationIntegrationDetails(organizationId :?UUID) {

  return (state :Map) :Map => {

    if (isValidUUID(organizationId)) {
      if (hasIn(state, [ORGANIZATIONS, INTEGRATION_DETAILS, organizationId])) {
        return getIn(state, [ORGANIZATIONS, INTEGRATION_DETAILS, organizationId]);
      }
    }

    return EMPTY_MAP;
  };
}

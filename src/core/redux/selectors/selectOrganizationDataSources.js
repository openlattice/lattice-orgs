/*
 * @flow
 */

import { List, Map, getIn } from 'immutable';
import { ValidationUtils } from 'lattice-utils';
import type { UUID } from 'lattice';

import { DATA_SOURCES, ORGANIZATIONS } from '../constants';

const { isValidUUID } = ValidationUtils;

export default function selectOrganizationDataSources(organizationId :?UUID) {

  return (state :Map) :List<Map> => {

    if (isValidUUID(organizationId)) {
      return getIn(state, [ORGANIZATIONS, DATA_SOURCES, organizationId]) || List();
    }

    return List();
  };
}

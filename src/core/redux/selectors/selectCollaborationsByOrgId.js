/*
 * @flow
 */

import { List, Map, getIn } from 'immutable';
import { ValidationUtils } from 'lattice-utils';
import type { UUID } from 'lattice';

import { COLLABORATIONS, COLLABORATIONS_BY_ORGANIZATION_ID } from '../../../common/constants';

const { isValidUUID } = ValidationUtils;

export default function selectCollaborationsByOrgId(organizationId :UUID) {

  return (state :Map) :List<UUID> => {

    if (isValidUUID(organizationId)) {
      return getIn(state, [COLLABORATIONS, COLLABORATIONS_BY_ORGANIZATION_ID, organizationId]) || List();
    }

    return List();
  };
}

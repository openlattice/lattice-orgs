/*
 * @flow
 */

import { List, Map, getIn } from 'immutable';
import { ValidationUtils } from 'lattice-utils';
import type { UUID } from 'lattice';

import { COLLABORATIONS, COLLABORATIONS_ORG_IDS } from '../constants';

const { isValidUUID } = ValidationUtils;

export default function selectCollaborationsOrgIds(collaborationId :UUID) {

  return (state :Map) :List<UUID> => {

    if (isValidUUID(collaborationId)) {
      return getIn(state, [COLLABORATIONS, COLLABORATIONS_ORG_IDS, collaborationId]) || List();
    }

    return Map();
  };
}

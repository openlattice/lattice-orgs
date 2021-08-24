/*
 * @flow
 */

import { List, Map, getIn } from 'immutable';
import { ValidationUtils } from 'lattice-utils';
import type { UUID } from 'lattice';

import { COLLABORATIONS } from '../constants';

const { isValidUUID } = ValidationUtils;

export default function selectCollaboration(collaborationId :UUID) {

  return (state :Map) :Map<UUID, List<UUID>> => {

    if (isValidUUID(collaborationId)) {
      return getIn(state, [COLLABORATIONS, COLLABORATIONS, collaborationId]) || Map();
    }

    return Map();
  };
}

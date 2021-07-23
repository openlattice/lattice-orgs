/*
 * @flow
 */

import { List, Map, getIn } from 'immutable';
import { ValidationUtils } from 'lattice-utils';
import type { UUID } from 'lattice';

import { COLLABORATIONS, COLLABORATION_DATA_SETS } from '../constants';

const { isValidUUID } = ValidationUtils;

export default function selectCollaborationDataSetMap(collaborationId :UUID) {

  return (state :Map) :Map<UUID, List<UUID>> => {

    if (isValidUUID(collaborationId)) {
      return getIn(state, [COLLABORATIONS, COLLABORATION_DATA_SETS, collaborationId]) || Map();
    }

    return Map();
  };
}

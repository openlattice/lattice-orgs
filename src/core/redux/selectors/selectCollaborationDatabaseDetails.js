/*
 * @flow
 */

import { Map, getIn } from 'immutable';
import { ValidationUtils } from 'lattice-utils';
import type { UUID } from 'lattice';

import { COLLABORATIONS, DATABASE_DETAILS } from '../constants';

const { isValidUUID } = ValidationUtils;

export default function selectCollaborationDatabaseDetails(collaborationId :UUID) {

  return (state :Map) :Map => {

    if (isValidUUID(collaborationId)) {
      return getIn(state, [COLLABORATIONS, DATABASE_DETAILS, collaborationId]) || Map();
    }

    return Map();
  };
}

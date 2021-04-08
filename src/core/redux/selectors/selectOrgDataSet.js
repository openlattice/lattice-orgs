/*
 * @flow
 */

import { List, Map, getIn } from 'immutable';
import { ValidationUtils } from 'lattice-utils';
import type { FQN, UUID } from 'lattice';

import { EDM, ORG_DATA_SETS } from '../constants';

const { isValidUUID } = ValidationUtils;

export default function selectOrgDataSet(organizationId :UUID, dataSetId :UUID) {

  return (state :Map) :Map<FQN, List> => {

    if (isValidUUID(organizationId) && isValidUUID(dataSetId)) {
      return getIn(state, [EDM, ORG_DATA_SETS, organizationId, dataSetId]) || Map();
    }

    return Map();
  };
}

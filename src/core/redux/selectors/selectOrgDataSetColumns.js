/*
 * @flow
 */

import { List, Map, getIn } from 'immutable';
import { ValidationUtils } from 'lattice-utils';
import type { FQN, UUID } from 'lattice';

import { EDM, ORG_DATA_SET_COLUMNS } from '../constants';

const { isValidUUID } = ValidationUtils;

export default function selectOrgDataSetColumns(organizationId :UUID, dataSetId :UUID) {

  return (state :Map) :List<Map<FQN, List>> => {

    if (isValidUUID(organizationId) && isValidUUID(dataSetId)) {
      return getIn(state, [EDM, ORG_DATA_SET_COLUMNS, organizationId, dataSetId]) || List();
    }

    return List();
  };
}

/*
 * @flow
 */

import { List, Map, getIn } from 'immutable';
import { ValidationUtils } from 'lattice-utils';
import type { FQN, UUID } from 'lattice';

import { EDM, ORG_DATA_SET_COLUMNS } from '../constants';

const { isValidUUID } = ValidationUtils;

export default function selectOrgDataSetsColumns(organizationId :UUID, dataSetIds ?:UUID[]) {

  return (state :Map) :Map<UUID, List<Map<FQN, List>>> => {

    if (isValidUUID(organizationId)) {
      if (dataSetIds) {
        return Map().withMutations((mutableMap :Map<UUID, Map>) => {
          dataSetIds.forEach((dataSetId :UUID) => {
            const dataSetColumns = getIn(state, [EDM, ORG_DATA_SET_COLUMNS, organizationId, dataSetId]) || List();
            mutableMap.set(dataSetId, dataSetColumns);
          });
        });
      }
      return getIn(state, [EDM, ORG_DATA_SET_COLUMNS, organizationId]) || Map();
    }

    return Map();
  };
}

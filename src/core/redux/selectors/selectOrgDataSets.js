/*
 * @flow
 */

import { List, Map, getIn } from 'immutable';
import { ValidationUtils } from 'lattice-utils';
import { Models } from 'lattice';
import type { FQN, UUID } from 'lattice';

import {
  EDM,
  ENTITY_SETS,
  ENTITY_SETS_INDEX_MAP,
  ORG_DATA_SETS
} from '../constants';

const { EntitySet } = Models;
const { isValidUUID } = ValidationUtils;

export default function selectOrgDataSets(organizationId :UUID, dataSetIds ?:UUID[]) {

  return (state :Map) :Map<UUID, Map<FQN, List>> => {

    if (isValidUUID(organizationId)) {
      if (dataSetIds) {
        return Map().withMutations((mutableMap :Map<UUID, Map>) => {
          dataSetIds.forEach((dataSetId :UUID) => {
            const entitySetIndex :number = state.getIn([EDM, ENTITY_SETS_INDEX_MAP, dataSetId], -1);
            if (entitySetIndex >= 0) {
              const dataSet :?EntitySet = state.getIn([EDM, ENTITY_SETS, entitySetIndex]);
              if (dataSet && dataSet.id) {
                mutableMap.set(dataSetId, dataSet.toImmutable());
              }
            }
          });
        });
      }
      return getIn(state, [EDM, ORG_DATA_SETS, organizationId]) || Map();
    }

    return Map();
  };
}

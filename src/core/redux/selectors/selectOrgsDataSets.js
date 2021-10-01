/*
 * @flow
 */

import { List, Map, getIn } from 'immutable';
import type { UUID } from 'lattice';

import { EDM, ORG_DATA_SETS } from '../../../common/constants';

export default function selectOrgsDataSets(dataSetsByOrgId :Map<UUID, List<UUID>>) {

  return (state :Map) :Map<UUID, Map<UUID, Map>> => Map().withMutations((mutableMap) => {
    dataSetsByOrgId.forEach((dataSetIds, orgId) => {
      dataSetIds.forEach((dataSetId :UUID) => {
        const dataSet = getIn(state, [EDM, ORG_DATA_SETS, orgId, dataSetId]) || Map();
        mutableMap.setIn([orgId, dataSetId], dataSet);
      });
    });
  });
}

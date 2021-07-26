/*
 * @flow
 */

import { List, Map, get } from 'immutable';
import type { UUID } from 'lattice';

export default function getDataSetsKeys(
  dataSets :Map<UUID, Map>,
  dataSetsColumns :Map<UUID, Map<UUID, Map>>,
) :List<List<UUID>> {

  return List().withMutations((keys :List<List<UUID>>) => {
    dataSets.forEach((dataSet, dataSetId) => {
      const dataSetColumns = dataSetsColumns.get(dataSetId);
      keys.push(List([dataSetId]));
      dataSetColumns.forEach((column :Map) => {
        const columnId :UUID = get(column, 'id');
        keys.push(List([dataSetId, columnId]));
      });
    });
  });
}

/*
 * @flow
 */

import { List, Map, get } from 'immutable';
import type { UUID } from 'lattice';

export default function getDataSetKeys(
  dataSet :Map,
  dataSetColumns :List<Map>,
) :List<List<UUID>> {

  return List().withMutations((keys :List<List<UUID>>) => {

    const dataSetId :UUID = get(dataSet, 'id');
    keys.push(List([dataSetId]));

    dataSetColumns.forEach((column :Map) => {
      const columnId :UUID = get(column, 'id');
      keys.push(List([dataSetId, columnId]));
    });
  });
}

/*
 * @flow
 */

import { List, Map } from 'immutable';
import { DataUtils } from 'lattice-utils';
import type { UUID } from 'lattice';

import { FQNS } from '../core/edm/constants';

const { getPropertyValue } = DataUtils;

// TODO: delete
export default function getDataSetKeys(dataSet :Map, dataSetColumns :List) :List<List<UUID>> {

  return List().withMutations((keys :List<List<UUID>>) => {

    const dataSetId :UUID = getPropertyValue(dataSet, [FQNS.OL_ID, 0]);
    keys.push(List([dataSetId]));

    dataSetColumns.forEach((column :Map) => {
      const columnId :UUID = getPropertyValue(column, [FQNS.OL_ID, 0]);
      keys.push(List([dataSetId, columnId]));
    });
  });
}

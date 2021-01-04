/*
 * @flow
 */

import { List, Set } from 'immutable';
import type { UUID } from 'lattice';

export default function getDataSetKeys(dataSetId :UUID, propertyIds :?Set<UUID>) :List<List<UUID>> {

  return List().withMutations((keys :List<List<UUID>>) => {
    keys.push(List([dataSetId]));
    Set(propertyIds).forEach((propertyId :UUID) => {
      keys.push(List([dataSetId, propertyId]));
    });
  });
}

/*
 * @flow
 */

import { Map } from 'immutable';
import { ReduxUtils } from 'lattice-utils';
import type { EntitySet, UUID } from 'lattice';

import selectAtlasDataSets from './selectAtlasDataSets';

const { selectEntitySets } = ReduxUtils;

export default function selectDataSet(dataSetId :UUID) {

  return (state :Map) :?EntitySet | Map => {

    const atlasDataSets :Map<UUID, Map> = selectAtlasDataSets([dataSetId])(state);
    const entitySets :Map<UUID, EntitySet> = selectEntitySets([dataSetId])(state);
    const atlasDataSet :?Map = atlasDataSets.get(dataSetId);
    const entitySet :?EntitySet = entitySets.get(dataSetId);
    return atlasDataSet || entitySet;
  };
}

/*
 * @flow
 */
import { useSelector } from 'react-redux';
import { Map, Collection } from 'immutable';
import type { UUID } from 'lattice';

import { ENTITY_SET_DATA, DATA } from '../../redux/constants';

export default function useEntitySetData(entitySetId :UUID, entityKeyIds :Collection<UUID> | UUID[]) :Map {
  return (
    useSelector((state :Map) => {
      const entitySetData :Map = state.getIn([DATA, ENTITY_SET_DATA, entitySetId], Map());
      return Map().withMutations((map) => {
        entityKeyIds.forEach((entityKeyId :UUID) => {
          map.set(entityKeyId, entitySetData.get(entityKeyId, Map()));
        });
      });
    })
  );
}

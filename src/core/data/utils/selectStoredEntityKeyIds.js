/*
 * @flow
 */

import { Map, Set } from 'immutable';
import type { UUID } from 'lattice';

import { DATA, ENTITY_SET_DATA } from '../../redux/constants';

export default function selectStoredEntityKeyIds(entitySetId :UUID, entityKeyIds :Set<UUID>) :Set<UUID> {
  return (
    (state :Map) => (
      state
        .getIn([DATA, ENTITY_SET_DATA, entitySetId], Map())
        .keySeq()
        .filter((entityKeyId :UUID) => entityKeyIds.has(entityKeyId))
        .toSet()
    )
  );
}

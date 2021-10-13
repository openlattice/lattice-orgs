/*
 * @flow
 */

import { Map } from 'immutable';
import { ReduxUtils } from 'lattice-utils';
import type { EntityType, UUID } from 'lattice';

const { selectEntityTypes } = ReduxUtils;

export default function selectEntityType(entityTypeId :UUID) {

  return (state :Map) :?EntityType => {
    const entityTypes :Map<UUID, EntityType> = selectEntityTypes([entityTypeId])(state);
    const entityType :?EntityType = entityTypes.get(entityTypeId);
    return entityType;
  };
}

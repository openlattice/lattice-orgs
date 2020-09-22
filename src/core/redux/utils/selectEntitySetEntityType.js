/*
 * @flow
 */

import { Map } from 'immutable';
import { ReduxUtils, ValidationUtils } from 'lattice-utils';
import { useSelector } from 'react-redux';
import type { EntitySet, EntityType, UUID } from 'lattice';

const { selectEntitySets, selectEntityTypes } = ReduxUtils;
const { isValidUUID } = ValidationUtils;

export default function selectEntitySetEntityType(idOrEntitySet :UUID | EntitySet) {

  return () :?EntityType => {

    let entitySetId :?UUID;
    if (isValidUUID(idOrEntitySet)) {
      entitySetId = idOrEntitySet;
    }
    // $FlowFixMe
    else if (isValidUUID(idOrEntitySet?.id)) {
      // $FlowFixMe
      entitySetId = idOrEntitySet.id;
    }
    else {
      return undefined;
    }

    const entitySets :Map<UUID, EntitySet> = useSelector(selectEntitySets([entitySetId]));
    const entitySet :?EntitySet = entitySets.get(entitySetId);
    const entityTypeId :?UUID = entitySet?.entityTypeId;
    const entityTypes :Map<UUID, EntityType> = useSelector(selectEntityTypes([entityTypeId]));
    const entityType :?EntityType = entityTypes.get(entityTypeId);
    return entityType;
  };
}

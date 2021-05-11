/*
 * @flow
 */

import { List, Map, Set } from 'immutable';
import { DataUtils } from 'lattice-utils';
import type {
  Ace,
  FQN,
  PermissionType,
  PropertyType,
  UUID,
} from 'lattice';

import { FQNS } from '../../edm/constants';

const { getPropertyValue } = DataUtils;

function computePermissionAssignments(
  myKeys :Set<List<UUID>>,
  dataSetColumns :List<Map<FQN, List>>,
  dataSetId :UUID,
  permissions :Map<List<UUID>, Ace>,
  permissionType :PermissionType,
  maybePropertyTypes :Map<UUID, PropertyType>,
) :{
  isAssignedToAll :boolean;
  isAssignedToOnlyNonPII :boolean;
} {

  let isAssignedToAll = true;
  let isAssignedToOnlyNonPII = true;

  dataSetColumns.forEach((column :Map<FQN, List>) => {
    const columnId :UUID = getPropertyValue(column, [FQNS.OL_ID, 0]);
    const propertyType :?PropertyType = maybePropertyTypes.get(columnId);
    const pii :boolean = propertyType?.pii || false;
    const key :List<UUID> = List([dataSetId, columnId]);
    const isOwner = myKeys.has(key);
    if (isOwner) {
      const ace :?Ace = permissions.get(key);
      const isPermissionAssigned = ace ? ace.permissions.includes(permissionType) : false;
      isAssignedToAll = isAssignedToAll && isPermissionAssigned;
      if ((isPermissionAssigned && pii === true) || (!isPermissionAssigned && pii === false)) {
        isAssignedToOnlyNonPII = false;
      }
    }
  });

  return { isAssignedToAll, isAssignedToOnlyNonPII };
}

export default computePermissionAssignments;

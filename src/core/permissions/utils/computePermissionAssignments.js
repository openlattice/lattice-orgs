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
) :Object {

  let isAssignedToAll = true;
  let isAssignedToOnlyNonPII = true;
  const ownershipByColumn = [];

  dataSetColumns.forEach((column :Map<FQN, List>) => {
    const columnId :UUID = getPropertyValue(column, [FQNS.OL_ID, 0]);
    const propertyType :?PropertyType = maybePropertyTypes.get(columnId);
    const pii :boolean = propertyType?.pii || false;
    const key :List<UUID> = List([dataSetId, columnId]);
    const isOwner = myKeys.has(key);
    ownershipByColumn.push(isOwner);
    if (isOwner) {
      const ace :?Ace = permissions.get(key);
      const isPermissionAssigned = ace ? ace.permissions.includes(permissionType) : false;
      isAssignedToAll = isAssignedToAll && isPermissionAssigned;
      if ((isPermissionAssigned && pii === true) || (!isPermissionAssigned && pii === false)) {
        isAssignedToOnlyNonPII = false;
      }
    }
  });

  const isOwnerOnAtLeastOneColumn = ownershipByColumn.reduce((result, isOwner) => isOwner, true);

  return { isAssignedToAll, isAssignedToOnlyNonPII, isOwnerOnAtLeastOneColumn };
}

export default computePermissionAssignments;

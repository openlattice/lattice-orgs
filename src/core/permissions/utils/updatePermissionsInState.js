/*
 * @flow
 */

import { List, Map, Set } from 'immutable';
import { Models, Types } from 'lattice';
import type {
  Ace,
  ActionType,
  PermissionType,
  UUID,
} from 'lattice';

const { AceBuilder } = Models;
const { ActionTypes } = Types;

function updatePermissionsInState(
  actionType :ActionType,
  permissions :Map<List<UUID>, Ace>,
  stateAces :Map<List<UUID>, List<Ace>>,
) {
  return stateAces.withMutations((mutableAces :Map<List<UUID>, List<Ace>>) => {
    permissions.forEach((ace :Ace, key :List<UUID>) => {
      mutableAces.update(key, (storedAces :List<Ace> = List()) => {

        const targetIndex :number = storedAces.findIndex((storedAce :Ace) => (
          storedAce.principal.id === ace.principal.id && storedAce.principal.type === ace.principal.type
        ));

        if (targetIndex >= 0) {
          const targetAce :Ace = storedAces.get(targetIndex);

          let updatedPermissions :Set<PermissionType> = Set(targetAce.permissions);
          if (actionType === ActionTypes.ADD) {
            updatedPermissions = updatedPermissions.union(ace.permissions);
          }
          else if (actionType === ActionTypes.REMOVE) {
            updatedPermissions = updatedPermissions.subtract(ace.permissions);
          }

          const updatedAce :Ace = (new AceBuilder())
            .setPermissions(updatedPermissions)
            .setPrincipal(targetAce.principal)
            .build();

          return storedAces.set(targetIndex, updatedAce);
        }

        if (targetIndex === -1 && actionType === ActionTypes.ADD) {
          return storedAces.push(ace);
        }

        return storedAces;
      });
    });
  });
}

export default updatePermissionsInState;

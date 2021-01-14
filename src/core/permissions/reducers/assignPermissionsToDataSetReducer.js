/*
 * @flow
 */

import { List, Map, Set } from 'immutable';
import { Models } from 'lattice';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';
import type {
  Ace,
  PermissionType,
  UUID,
} from 'lattice';

import { ACES, ERROR, REQUEST_STATE } from '../../redux/constants';
import {
  ASSIGN_PERMISSIONS_TO_DATA_SET,
  assignPermissionsToDataSet,
} from '../actions';

const { AceBuilder } = Models;

export default function reducer(state :Map, action :SequenceAction) {

  // TODO: update stored aces
  return assignPermissionsToDataSet.reducer(state, action, {
    REQUEST: () => state
      .setIn([ASSIGN_PERMISSIONS_TO_DATA_SET, REQUEST_STATE], RequestStates.PENDING)
      .setIn([ASSIGN_PERMISSIONS_TO_DATA_SET, action.id], action),
    SUCCESS: () => {
      const { permissions } = action.value;
      const aces = state.get(ACES).withMutations((mutableAces :Map<List<UUID>, List<Ace>>) => {
        permissions.forEach((ace :Ace, key :List<UUID>) => {
          mutableAces.update(key, (storedAces :List<Ace>) => {

            const targetIndex :number = storedAces.findIndex((storedAce :Ace) => (
              storedAce.principal.id === ace.principal.id && storedAce.principal.type === ace.principal.type
            ));

            if (targetIndex >= 0) {
              const targetAce :Ace = storedAces.get(targetIndex);

              let updatedPermissions :Set<PermissionType> = Set(targetAce.permissions);
              updatedPermissions = updatedPermissions.union(ace.permissions);

              const updatedAce :Ace = (new AceBuilder())
                .setPermissions(updatedPermissions)
                .setPrincipal(targetAce.principal)
                .build();

              return storedAces.set(targetIndex, updatedAce);
            }

            if (targetIndex === -1) {
              return storedAces.push(ace);
            }

            return storedAces;
          });
        });
      });
      return state
        .set(ACES, aces)
        .setIn([ASSIGN_PERMISSIONS_TO_DATA_SET, REQUEST_STATE], RequestStates.SUCCESS);
    },
    FAILURE: () => {
      if (state.hasIn([ASSIGN_PERMISSIONS_TO_DATA_SET, action.id])) {
        return state
          .setIn([ASSIGN_PERMISSIONS_TO_DATA_SET, ERROR], action.value)
          .setIn([ASSIGN_PERMISSIONS_TO_DATA_SET, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([ASSIGN_PERMISSIONS_TO_DATA_SET, action.id]),
  });
}

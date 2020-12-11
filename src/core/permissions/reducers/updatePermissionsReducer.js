/*
 * @flow
 */

import { List, Map, Set } from 'immutable';
import { Models, Types } from 'lattice';
import { RequestStates } from 'redux-reqseq';
import type {
  Ace,
  ActionType,
  PermissionType,
  UUID,
} from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  ACES,
  ERROR,
  REQUEST_STATE,
} from '../../redux/constants';
import {
  UPDATE_PERMISSIONS,
  updatePermissions,
} from '../actions';

const { AceBuilder } = Models;
const { ActionTypes } = Types;

export default function reducer(state :Map, action :SequenceAction) {

  return updatePermissions.reducer(state, action, {
    REQUEST: () => state
      .setIn([UPDATE_PERMISSIONS, REQUEST_STATE], RequestStates.PENDING)
      .setIn([UPDATE_PERMISSIONS, action.id], action),
    SUCCESS: () => {
      const storedAction :?SequenceAction = state.getIn([UPDATE_PERMISSIONS, action.id]);
      if (storedAction) {

        const {
          actionType,
          permissions,
        } :{
          actionType :ActionType;
          permissions :Map<List<UUID>, Ace>;
        } = storedAction.value;

        const aces = state.get(ACES).withMutations((mutableAces :Map<List<UUID>, List<Ace>>) => {
          permissions.forEach((ace :Ace, key :List<UUID>) => {
            mutableAces.update(key, (storedAces :List<Ace>) => {

              const targetIndex :number = storedAces.findIndex((storedAce :Ace) => (
                storedAce.principal.id === ace.principal.id && storedAce.principal.type === ace.principal.type
              ));
              const targetAce :Ace = storedAces.get(targetIndex);

              let updatedPermissions :Set<PermissionType> = Set(targetAce.permissions);
              if (actionType === ActionTypes.ADD) {
                updatedPermissions = updatedPermissions.union(ace.permissions);
              }
              else if (actionType === ActionTypes.REMOVE) {
                updatedPermissions = updatedPermissions.subtract(ace.permissions);
                // NOTE: this doesn't actually work, leaving it in for now in case we need it after the bug is fixed:
                // https://jira.openlattice.com/browse/LATTICE-2648
                /*
                 * if we're doing a REMOVE and the resulting permissions would be [] or ["DISCOVER"], then we should
                 * actually remove the ace itself by using SET instead of REMOVE and passing all the aces minus this one
                 */
                // if (updatedPermissions.isEmpty() || updatedPermissions.equals(Set([PermissionTypes.DISCOVER]))) {
                //   return storedAces.delete(targetIndex);
                // }
              }

              const updatedAce :Ace = (new AceBuilder())
                .setPermissions(updatedPermissions)
                .setPrincipal(targetAce.principal)
                .build();

              return storedAces.set(targetIndex, updatedAce);
            });
          });
        });

        return state
          .set(ACES, aces)
          .setIn([UPDATE_PERMISSIONS, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([UPDATE_PERMISSIONS, action.id])) {
        return state
          .setIn([UPDATE_PERMISSIONS, ERROR], action.value)
          .setIn([UPDATE_PERMISSIONS, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([UPDATE_PERMISSIONS, action.id]),
  });
}

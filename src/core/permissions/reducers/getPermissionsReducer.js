/*
 * @flow
 */

import { List, Map } from 'immutable';
import { Models, Types } from 'lattice';
import { RequestStates } from 'redux-reqseq';
import type { Ace, AclObject, UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  ACES,
  ERROR,
  REQUEST_STATE,
} from '../../redux/constants';
import {
  GET_PERMISSIONS,
  getPermissions,
} from '../actions';

const { AclBuilder } = Models;
const { PermissionTypes } = Types;

export default function reducer(state :Map, action :SequenceAction) {

  return getPermissions.reducer(state, action, {
    REQUEST: () => state
      .setIn([GET_PERMISSIONS, REQUEST_STATE], RequestStates.PENDING)
      .setIn([GET_PERMISSIONS, action.id], action),
    SUCCESS: () => {
      if (state.hasIn([GET_PERMISSIONS, action.id])) {
        const aces = state.get(ACES).withMutations((mutableAces :Map<List<UUID>, List<Ace>>) => {
          const acls :AclObject[] = action.value;
          acls.forEach((aclObj :AclObject) => {
            const acl = (new AclBuilder(aclObj)).build();
            const filteredAces = List(acl.aces)
              // NOTE: empty permissions, i.e. [], is effectively the same as not having any permissions, but the ace
              // is still around. once this bug is fixed, we can probably take out the filter
              // https://jira.openlattice.com/browse/LATTICE-2648
              .filter((ace :Ace) => ace.permissions.length > 0)
              // NOTE: we're ignoring the DISCOVER permission type, i.e. filter out ["DISCOVER"]
              // https://jira.openlattice.com/browse/LATTICE-2578
              // https://jira.openlattice.com/browse/APPS-2381
              .filterNot((ace :Ace) => ace.permissions.length === 1 && ace.permissions[0] === PermissionTypes.DISCOVER);
            mutableAces.set(List(acl.aclKey), filteredAces);
          });
        });
        return state
          .set(ACES, aces)
          .setIn([GET_PERMISSIONS, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([GET_PERMISSIONS, action.id])) {
        return state
          .setIn([GET_PERMISSIONS, ERROR], action.value)
          .setIn([GET_PERMISSIONS, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([GET_PERMISSIONS, action.id]),
  });
}

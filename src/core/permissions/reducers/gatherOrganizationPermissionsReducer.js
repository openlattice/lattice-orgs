/*
 * @flow
 */

import { List, Map, Set } from 'immutable';
import { Models } from 'lattice';
import { RequestStates } from 'redux-reqseq';
import type { AclObject } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  GATHER_ORGANIZATION_PERMISSIONS,
  gatherOrganizationPermissions,
} from '../actions';

import {
  ACES,
  ERROR,
  REQUEST_STATE,
} from '../../redux/constants';

const { AclBuilder } = Models;

export default function reducer(state :Map, action :SequenceAction) {

  return gatherOrganizationPermissions.reducer(state, action, {
    REQUEST: () => state
      .setIn([GATHER_ORGANIZATION_PERMISSIONS, REQUEST_STATE], RequestStates.PENDING)
      .setIn([GATHER_ORGANIZATION_PERMISSIONS, action.id], action),
    SUCCESS: () => {
      if (state.hasIn([GATHER_ORGANIZATION_PERMISSIONS, action.id])) {
        const aces = state.get(ACES).withMutations((mutableAces :Map) => {
          const acls :AclObject[] = action.value;
          acls.forEach((aclObj :AclObject) => {
            const acl = (new AclBuilder(aclObj)).build();
            mutableAces.set(Set(acl.aclKey), List(acl.aces));
          });
        });
        return state
          .set(ACES, aces)
          .setIn([GATHER_ORGANIZATION_PERMISSIONS, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([GATHER_ORGANIZATION_PERMISSIONS, action.id])) {
        return state
          .setIn([GATHER_ORGANIZATION_PERMISSIONS, ERROR], action.value)
          .setIn([GATHER_ORGANIZATION_PERMISSIONS, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([GATHER_ORGANIZATION_PERMISSIONS, action.id]),
  });
}

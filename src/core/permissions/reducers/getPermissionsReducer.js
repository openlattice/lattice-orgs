/*
 * @flow
 */

import { List, Map, Set } from 'immutable';
import { Models } from 'lattice';
import { RequestStates } from 'redux-reqseq';
import type { AclObject } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_PERMISSIONS,
  getPermissions,
} from '../actions';

import {
  ACES,
  ERROR,
  REQUEST_STATE,
} from '../../redux/constants';

const { AclBuilder } = Models;

export default function reducer(state :Map, action :SequenceAction) {

  return getPermissions.reducer(state, action, {
    REQUEST: () => state
      .setIn([GET_PERMISSIONS, REQUEST_STATE], RequestStates.PENDING)
      .setIn([GET_PERMISSIONS, action.id], action),
    SUCCESS: () => {
      if (state.hasIn([GET_PERMISSIONS, action.id])) {
        const aces = state.get(ACES).withMutations((mutableAces :Map) => {
          const acls :AclObject[] = action.value;
          acls.forEach((aclObj :AclObject) => {
            const acl = (new AclBuilder(aclObj)).build();
            mutableAces.set(Set(acl.aclKey), List(acl.aces));
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

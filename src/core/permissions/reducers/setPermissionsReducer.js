/*
 * @flow
 */

import { List, Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { Ace, UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  ACES,
  ERROR,
  REQUEST_STATE,
} from '../../redux/constants';
import {
  SET_PERMISSIONS,
  setPermissions,
} from '../actions';

export default function reducer(state :Map, action :SequenceAction) {

  return setPermissions.reducer(state, action, {
    REQUEST: () => state
      .setIn([SET_PERMISSIONS, REQUEST_STATE], RequestStates.PENDING)
      .setIn([SET_PERMISSIONS, action.id], action),
    SUCCESS: () => {
      const storedAction :?SequenceAction = state.getIn([SET_PERMISSIONS, action.id]);
      if (storedAction) {
        const permissions :Map<List<UUID>, Ace> = storedAction.value;
        const aces = state.get(ACES).withMutations((mutableAces :Map<List<UUID>, List<Ace>>) => {
          permissions.forEach((ace :Ace, key :List<UUID>) => {
            mutableAces.update(key, (currentAces :List<Ace>) => {
              const targetIndex :number = currentAces.findIndex((currentAce :Ace) => (
                currentAce.principal.id === ace.principal.id && currentAce.principal.type === ace.principal.type
              ));
              return currentAces.set(targetIndex, ace);
            });
          });
        });
        return state
          .set(ACES, aces)
          .setIn([SET_PERMISSIONS, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([SET_PERMISSIONS, action.id])) {
        return state
          .setIn([SET_PERMISSIONS, ERROR], action.value)
          .setIn([SET_PERMISSIONS, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([SET_PERMISSIONS, action.id]),
  });
}

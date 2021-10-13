/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { CollaborationsApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { COLLABORATIONS, ERROR, REQUEST_STATE } from '../../../common/constants';

const { GET_ALL_COLLABORATIONS, getAllCollaborations } = CollaborationsApiActions;

export default function getCollaborationsReducer(state :Map, action :SequenceAction) {
  return getAllCollaborations.reducer(state, action, {
    REQUEST: () => state
      .setIn([GET_ALL_COLLABORATIONS, REQUEST_STATE], RequestStates.PENDING)
      .setIn([GET_ALL_COLLABORATIONS, action.id], action),
    SUCCESS: () => {
      if (state.hasIn([GET_ALL_COLLABORATIONS, action.id])) {
        // TODO: Add Collaboration Model to lattice-js
        const collaborations :Map<UUID, Map> = Map().withMutations((mutableMap) => {
          action.value.forEach((collaboration :Object) => {
            mutableMap.set(collaboration.id, fromJS(collaboration));
          });
        });
        return state
          .set(COLLABORATIONS, collaborations)
          .setIn([GET_ALL_COLLABORATIONS, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([GET_ALL_COLLABORATIONS, action.id])) {
        return state
          .set(COLLABORATIONS, Map())
          .setIn([GET_ALL_COLLABORATIONS, ERROR], action.value)
          .setIn([GET_ALL_COLLABORATIONS, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([GET_ALL_COLLABORATIONS, action.id]),
  });
}

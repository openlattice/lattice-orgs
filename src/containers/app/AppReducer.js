/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  INITIALIZE_APPLICATION,
  initializeApplication,
} from './AppActions';

const INITIAL_STATE :Map = fromJS({
  [INITIALIZE_APPLICATION]: {
    requestState: RequestStates.STANDBY,
  },
});

export default function appReducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case initializeApplication.case(action.type): {
      const seqAction :SequenceAction = action;
      return initializeApplication.reducer(state, action, {
        REQUEST: () => state
          .setIn([INITIALIZE_APPLICATION, 'requestState'], RequestStates.PENDING)
          .setIn([INITIALIZE_APPLICATION, seqAction.id], seqAction),
        SUCCESS: () => {
          if (state.hasIn([INITIALIZE_APPLICATION, seqAction.id])) {
            return state.setIn([INITIALIZE_APPLICATION, 'requestState'], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => {
          if (state.hasIn([INITIALIZE_APPLICATION, seqAction.id])) {
            return state.setIn([INITIALIZE_APPLICATION, 'requestState'], RequestStates.FAILURE);
          }
          return state;
        },
        FINALLY: () => state.deleteIn([INITIALIZE_APPLICATION, seqAction.id]),
      });
    }

    default:
      return state;
  }
}

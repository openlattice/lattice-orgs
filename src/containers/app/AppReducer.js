/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { ReduxConstants } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  INITIALIZE_APPLICATION,
  initializeApplication,
} from './AppActions';

const { REQUEST_STATE } = ReduxConstants;

const INITIAL_STATE :Map = fromJS({
  [INITIALIZE_APPLICATION]: {
    [REQUEST_STATE]: RequestStates.STANDBY,
  },
});

export default function appReducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case initializeApplication.case(action.type): {
      const seqAction :SequenceAction = action;
      return initializeApplication.reducer(state, action, {
        REQUEST: () => state
          .setIn([INITIALIZE_APPLICATION, REQUEST_STATE], RequestStates.PENDING)
          .setIn([INITIALIZE_APPLICATION, seqAction.id], seqAction),
        SUCCESS: () => {
          if (state.hasIn([INITIALIZE_APPLICATION, seqAction.id])) {
            return state.setIn([INITIALIZE_APPLICATION, REQUEST_STATE], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => state
          .setIn([INITIALIZE_APPLICATION, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state
          .deleteIn([INITIALIZE_APPLICATION, seqAction.id]),
      });
    }

    default:
      return state;
  }
}

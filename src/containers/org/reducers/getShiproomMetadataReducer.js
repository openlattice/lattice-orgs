/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  REQUEST_STATE,
  RS_INITIAL_STATE,
} from '../../../core/redux/constants';
import { GET_SHIPROOM_METADATA, getShiproomMetadata } from '../actions';

const INITIAL_STATE = fromJS({
  [GET_SHIPROOM_METADATA]: RS_INITIAL_STATE,
  metadata: {}
});

export default function reducer(state :Map = INITIAL_STATE, action :SequenceAction) {
  switch (action.type) {
    case getShiproomMetadata.case(action.type): {
      return getShiproomMetadata.reducer(state, action, {
        REQUEST: () => state
          .setIn([GET_SHIPROOM_METADATA, REQUEST_STATE], RequestStates.PENDING)
          .setIn([GET_SHIPROOM_METADATA, action.id], action),
        SUCCESS: () => {
          const storedAction = state.getIn([GET_SHIPROOM_METADATA, action.id]);
          if (storedAction) {
            return state
              .set('metadata', action.value)
              .setIn([GET_SHIPROOM_METADATA, REQUEST_STATE], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => {
          if (state.hasIn([GET_SHIPROOM_METADATA, action.id])) {
            return state.setIn([GET_SHIPROOM_METADATA, REQUEST_STATE], RequestStates.FAILURE);
          }
          return state;
        },
        FINALLY: () => state.deleteIn([GET_SHIPROOM_METADATA, action.id]),
      });
    }

    default:
      return state;
  }
}

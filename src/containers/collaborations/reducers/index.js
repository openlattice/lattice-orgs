/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { CollaborationsApiActions } from 'lattice-sagas';

import getCollaborationsReducer from './getCollaborationsReducer';

import { RESET_REQUEST_STATES } from '../../../core/redux/actions';
import {
  COLLABORATIONS,
  RS_INITIAL_STATE,
} from '../../../core/redux/constants';
import { resetRequestStatesReducer } from '../../../core/redux/reducers';

const {
  GET_COLLABORATIONS,
  getCollaborations,
} = CollaborationsApiActions;

const INITIAL_STATE :Map = fromJS({
  // actions
  [GET_COLLABORATIONS]: RS_INITIAL_STATE,
  // data
  [COLLABORATIONS]: Map(),
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case RESET_REQUEST_STATES: {
      return resetRequestStatesReducer(state, action);
    }

    case getCollaborations.case(action.type): {
      return getCollaborationsReducer(state, action);
    }

    default: {
      return state;
    }
  }
}

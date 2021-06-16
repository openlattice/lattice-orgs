/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { CollaborationsApiActions } from 'lattice-sagas';

import createNewCollaborationReducer from './createNewCollaborationReducer';
import deleteCollaborationReducer from './deleteCollaborationReducer';
import getCollaborationsReducer from './getCollaborationsReducer';

import { RESET_REQUEST_STATES } from '../../../core/redux/actions';
import {
  COLLABORATIONS,
  RS_INITIAL_STATE,
} from '../../../core/redux/constants';
import { resetRequestStatesReducer } from '../../../core/redux/reducers';
import { CREATE_NEW_COLLABORATION, createNewCollaboration } from '../actions';

const {
  DELETE_COLLABORATION,
  GET_COLLABORATIONS,
  deleteCollaboration,
  getCollaborations,
} = CollaborationsApiActions;

const INITIAL_STATE :Map = fromJS({
  // actions
  [CREATE_NEW_COLLABORATION]: RS_INITIAL_STATE,
  [DELETE_COLLABORATION]: RS_INITIAL_STATE,
  [GET_COLLABORATIONS]: RS_INITIAL_STATE,
  // data
  [COLLABORATIONS]: Map(),
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case RESET_REQUEST_STATES: {
      return resetRequestStatesReducer(state, action);
    }

    case createNewCollaboration.case(action.type): {
      return createNewCollaborationReducer(state, action);
    }

    case deleteCollaboration.case(action.type): {
      return deleteCollaborationReducer(state, action);
    }

    case getCollaborations.case(action.type): {
      return getCollaborationsReducer(state, action);
    }

    default: {
      return state;
    }
  }
}

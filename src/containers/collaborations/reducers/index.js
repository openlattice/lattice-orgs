/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { CollaborationsApiActions } from 'lattice-sagas';

import addOrganizationsToCollaborationReducer from './addOrganizationsToCollaborationReducer';
import createNewCollaborationReducer from './createNewCollaborationReducer';
import deleteCollaborationReducer from './deleteCollaborationReducer';
import getCollaborationsReducer from './getCollaborationsReducer';
import removeOrganizationsFromCollaborationReducer from './removeOrganizationsFromCollaborationReducer';

import { RESET_REQUEST_STATES } from '../../../core/redux/actions';
import {
  COLLABORATIONS,
  RS_INITIAL_STATE,
} from '../../../core/redux/constants';
import { resetRequestStatesReducer } from '../../../core/redux/reducers';
import { CREATE_NEW_COLLABORATION, createNewCollaboration } from '../actions';

const {
  ADD_ORGANIZATIONS_TO_COLLABORATION,
  DELETE_COLLABORATION,
  GET_COLLABORATIONS,
  REMOVE_ORGANIZATIONS_FROM_COLLABORATION,
  addOrganizationsToCollaboration,
  deleteCollaboration,
  getCollaborations,
  removeOrganizationsFromCollaboration
} = CollaborationsApiActions;

const INITIAL_STATE :Map = fromJS({
  // actions
  [ADD_ORGANIZATIONS_TO_COLLABORATION]: RS_INITIAL_STATE,
  [CREATE_NEW_COLLABORATION]: RS_INITIAL_STATE,
  [DELETE_COLLABORATION]: RS_INITIAL_STATE,
  [GET_COLLABORATIONS]: RS_INITIAL_STATE,
  [REMOVE_ORGANIZATIONS_FROM_COLLABORATION]: RS_INITIAL_STATE,
  // data
  [COLLABORATIONS]: Map(),
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case RESET_REQUEST_STATES: {
      return resetRequestStatesReducer(state, action);
    }

    case addOrganizationsToCollaboration.case(action.type): {
      return addOrganizationsToCollaborationReducer(state, action);
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

    case removeOrganizationsFromCollaboration.case(action.type): {
      return removeOrganizationsFromCollaborationReducer(state, action);
    }

    default: {
      return state;
    }
  }
}

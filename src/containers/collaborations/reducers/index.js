/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { CollaborationsApiActions } from 'lattice-sagas';

import addDataSetToCollaborationReducer from './addDataSetToCollaborationReducer';
import addOrganizationsToCollaborationReducer from './addOrganizationsToCollaborationReducer';
import createNewCollaborationReducer from './createNewCollaborationReducer';
import deleteCollaborationReducer from './deleteCollaborationReducer';
import getCollaborationDatabaseInfoReducer from './getCollaborationDatabaseInfoReducer';
import getCollaborationsReducer from './getCollaborationsReducer';
import getDataSetsInCollaborationReducer from './getDataSetsInCollaborationReducer';
import removeOrganizationsFromCollaborationReducer from './removeOrganizationsFromCollaborationReducer';

import { RESET_REQUEST_STATES } from '../../../core/redux/actions';
import {
  COLLABORATIONS,
  COLLABORATION_DATA_SETS,
  DATABASE_DETAILS,
  RS_INITIAL_STATE,
} from '../../../core/redux/constants';
import { resetRequestStatesReducer } from '../../../core/redux/reducers';
import {
  CREATE_NEW_COLLABORATION,
  GET_DATA_SETS_IN_COLLABORATION,
  createNewCollaboration,
  getDataSetsInCollaboration,
} from '../actions';

const {
  ADD_DATA_SET_TO_COLLABORATION,
  ADD_ORGANIZATIONS_TO_COLLABORATION,
  DELETE_COLLABORATION,
  GET_COLLABORATION_DATABASE_INFO,
  GET_COLLABORATIONS,
  REMOVE_ORGANIZATIONS_FROM_COLLABORATION,
  addDataSetToCollaboration,
  addOrganizationsToCollaboration,
  deleteCollaboration,
  getCollaborationDatabaseInfo,
  getCollaborations,
  removeOrganizationsFromCollaboration
} = CollaborationsApiActions;

const INITIAL_STATE :Map = fromJS({
  // actions
  [ADD_DATA_SET_TO_COLLABORATION]: RS_INITIAL_STATE,
  [ADD_ORGANIZATIONS_TO_COLLABORATION]: RS_INITIAL_STATE,
  [CREATE_NEW_COLLABORATION]: RS_INITIAL_STATE,
  [DELETE_COLLABORATION]: RS_INITIAL_STATE,
  [GET_COLLABORATION_DATABASE_INFO]: RS_INITIAL_STATE,
  [GET_COLLABORATIONS]: RS_INITIAL_STATE,
  [GET_DATA_SETS_IN_COLLABORATION]: RS_INITIAL_STATE,
  [REMOVE_ORGANIZATIONS_FROM_COLLABORATION]: RS_INITIAL_STATE,
  // data
  [COLLABORATION_DATA_SETS]: Map(),
  [COLLABORATIONS]: Map(),
  [DATABASE_DETAILS]: Map(),
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case RESET_REQUEST_STATES: {
      return resetRequestStatesReducer(state, action);
    }

    case addDataSetToCollaboration.case(action.type): {
      return addDataSetToCollaborationReducer(state, action);
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

    case getDataSetsInCollaboration.case(action.type): {
      return getDataSetsInCollaborationReducer(state, action);
    }

    case getCollaborationDatabaseInfo.case(action.type): {
      return getCollaborationDatabaseInfoReducer(state, action);
    }

    case removeOrganizationsFromCollaboration.case(action.type): {
      return removeOrganizationsFromCollaborationReducer(state, action);
    }

    default: {
      return state;
    }
  }
}

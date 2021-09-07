/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { CollaborationsApiActions } from 'lattice-sagas';

import addDataSetToCollaborationReducer from './addDataSetToCollaborationReducer';
import addDataSetsToCollaborationReducer from './addDataSetsToCollaborationReducer';
import addOrganizationsToCollaborationReducer from './addOrganizationsToCollaborationReducer';
import createNewCollaborationReducer from './createNewCollaborationReducer';
import deleteCollaborationReducer from './deleteCollaborationReducer';
import getCollaborationDatabaseInfoReducer from './getCollaborationDatabaseInfoReducer';
import getCollaborationsReducer from './getCollaborationsReducer';
import getCollaborationsWithDataSetsReducer from './getCollaborationsWithDataSetsReducer';
import getCollaborationsWithOrganizationReducer from './getCollaborationsWithOrganizationReducer';
import getDataSetsInCollaborationReducer from './getDataSetsInCollaborationReducer';
import removeDataSetFromCollaborationReducer from './removeDataSetFromCollaborationReducer';
import removeOrganizationsFromCollaborationReducer from './removeOrganizationsFromCollaborationReducer';
import renameCollaborationDatabaseReducer from './renameCollaborationDatabaseReducer';

import { RESET_REQUEST_STATES } from '../../../core/redux/actions';
import {
  COLLABORATIONS,
  COLLABORATIONS_BY_DATA_SET_ID,
  COLLABORATIONS_BY_ORGANIZATION_ID,
  COLLABORATION_DATA_SETS,
  DATABASE_DETAILS,
  RS_INITIAL_STATE,
} from '../../../core/redux/constants';
import { resetRequestStatesReducer } from '../../../core/redux/reducers';
import {
  ADD_DATA_SETS_TO_COLLABORATION,
  CREATE_NEW_COLLABORATION,
  GET_DATA_SETS_IN_COLLABORATION,
  addDataSetsToCollaboration,
  createNewCollaboration,
  getDataSetsInCollaboration,
} from '../actions';

const {
  ADD_DATA_SET_TO_COLLABORATION,
  ADD_ORGANIZATIONS_TO_COLLABORATION,
  DELETE_COLLABORATION,
  GET_ALL_COLLABORATIONS,
  GET_COLLABORATIONS_WITH_DATA_SETS,
  GET_COLLABORATIONS_WITH_ORGANIZATION,
  GET_COLLABORATION_DATABASE_INFO,
  REMOVE_DATA_SET_FROM_COLLABORATION,
  REMOVE_ORGANIZATIONS_FROM_COLLABORATION,
  RENAME_COLLABORATION_DATABASE,
  addDataSetToCollaboration,
  addOrganizationsToCollaboration,
  deleteCollaboration,
  getCollaborationDatabaseInfo,
  getCollaborations,
  getCollaborationsWithDataSets,
  getCollaborationsWithOrganization,
  removeDataSetFromCollaboration,
  removeOrganizationsFromCollaboration,
  renameCollaborationDatabase
} = CollaborationsApiActions;

const INITIAL_STATE :Map = fromJS({
  // actions
  [ADD_DATA_SET_TO_COLLABORATION]: RS_INITIAL_STATE,
  [ADD_DATA_SETS_TO_COLLABORATION]: RS_INITIAL_STATE,
  [ADD_ORGANIZATIONS_TO_COLLABORATION]: RS_INITIAL_STATE,
  [CREATE_NEW_COLLABORATION]: RS_INITIAL_STATE,
  [DELETE_COLLABORATION]: RS_INITIAL_STATE,
  [GET_COLLABORATION_DATABASE_INFO]: RS_INITIAL_STATE,
  [GET_ALL_COLLABORATIONS]: RS_INITIAL_STATE,
  [GET_COLLABORATIONS_WITH_DATA_SETS]: RS_INITIAL_STATE,
  [GET_COLLABORATIONS_WITH_ORGANIZATION]: RS_INITIAL_STATE,
  [GET_DATA_SETS_IN_COLLABORATION]: RS_INITIAL_STATE,
  [REMOVE_DATA_SET_FROM_COLLABORATION]: RS_INITIAL_STATE,
  [REMOVE_ORGANIZATIONS_FROM_COLLABORATION]: RS_INITIAL_STATE,
  [RENAME_COLLABORATION_DATABASE]: RS_INITIAL_STATE,
  // data
  [COLLABORATION_DATA_SETS]: Map(),
  [COLLABORATIONS]: Map(),
  [COLLABORATIONS_BY_DATA_SET_ID]: Map(),
  [COLLABORATIONS_BY_ORGANIZATION_ID]: Map(),
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

    case addDataSetsToCollaboration.case(action.type): {
      return addDataSetsToCollaborationReducer(state, action);
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

    case getCollaborationsWithDataSets.case(action.type): {
      return getCollaborationsWithDataSetsReducer(state, action);
    }

    case getCollaborationsWithOrganization.case(action.type): {
      return getCollaborationsWithOrganizationReducer(state, action);
    }

    case getDataSetsInCollaboration.case(action.type): {
      return getDataSetsInCollaborationReducer(state, action);
    }

    case getCollaborationDatabaseInfo.case(action.type): {
      return getCollaborationDatabaseInfoReducer(state, action);
    }

    case removeDataSetFromCollaboration.case(action.type): {
      return removeDataSetFromCollaborationReducer(state, action);
    }

    case removeOrganizationsFromCollaboration.case(action.type): {
      return removeOrganizationsFromCollaborationReducer(state, action);
    }

    case renameCollaborationDatabase.case(action.type): {
      return renameCollaborationDatabaseReducer(state, action);
    }

    default: {
      return state;
    }
  }
}

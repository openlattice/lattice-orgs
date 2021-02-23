/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { OrganizationsApiActions } from 'lattice-sagas';

import addMemberToOrganizationReducer from './addMemberToOrganizationReducer';
import addMembersToOrganizationReducer from './addMembersToOrganizationReducer';
import addRoleToMemberReducer from './addRoleToMemberReducer';
import addRoleToOrganizationReducer from './addRoleToOrganizationReducer';
import assignRolesToMembersReducer from './assignRolesToMembersReducer';
import createNewOrganizationReducer from './createNewOrganizationReducer';
import deleteExistingOrganizationReducer from './deleteExistingOrganizationReducer';
import editOrganizationDetailsReducer from './editOrganizationDetailsReducer';
import editRoleDetailsReducer from './editRoleDetailsReducer';
import getOrganizationIntegrationDetailsReducer from './getOrganizationIntegrationDetailsReducer';
import getOrganizationMembersReducer from './getOrganizationMembersReducer';
import getOrganizationsAndAuthorizationsReducer from './getOrganizationsAndAuthorizationsReducer';

import { RESET_REQUEST_STATE } from '../../../core/redux/actions';
import { MEMBERS, ORGANIZATIONS, RS_INITIAL_STATE } from '../../../core/redux/constants';
import { resetRequestStateReducer } from '../../../core/redux/reducers';
import {
  ADD_MEMBERS_TO_ORGANIZATION,
  ADD_ROLE_TO_ORGANIZATION,
  ASSIGN_ROLES_TO_MEMBERS,
  CREATE_NEW_ORGANIZATION,
  DELETE_EXISTING_ORGANIZATION,
  EDIT_ORGANIZATION_DETAILS,
  EDIT_ROLE_DETAILS,
  GET_ORGANIZATIONS_AND_AUTHORIZATIONS,
  GET_ORGANIZATION_INTEGRATION_DETAILS,
  addMembersToOrganization,
  addRoleToOrganization,
  assignRolesToMembers,
  createNewOrganization,
  deleteExistingOrganization,
  editOrganizationDetails,
  editRoleDetails,
  getOrganizationIntegrationDetails,
  getOrganizationsAndAuthorizations,
} from '../actions';

const {
  ADD_MEMBER_TO_ORGANIZATION,
  ADD_ROLE_TO_MEMBER,
  GET_ORGANIZATION_MEMBERS,
  addMemberToOrganization,
  addRoleToMember,
  getOrganizationMembers,
} = OrganizationsApiActions;

const INITIAL_STATE :Map = fromJS({
  // actions
  [ADD_MEMBERS_TO_ORGANIZATION]: RS_INITIAL_STATE,
  [ADD_MEMBER_TO_ORGANIZATION]: RS_INITIAL_STATE,
  [ADD_ROLE_TO_MEMBER]: RS_INITIAL_STATE,
  [ADD_ROLE_TO_ORGANIZATION]: RS_INITIAL_STATE,
  [ASSIGN_ROLES_TO_MEMBERS]: RS_INITIAL_STATE,
  [CREATE_NEW_ORGANIZATION]: RS_INITIAL_STATE,
  [DELETE_EXISTING_ORGANIZATION]: RS_INITIAL_STATE,
  [EDIT_ORGANIZATION_DETAILS]: RS_INITIAL_STATE,
  [EDIT_ROLE_DETAILS]: RS_INITIAL_STATE,
  [GET_ORGANIZATIONS_AND_AUTHORIZATIONS]: RS_INITIAL_STATE,
  [GET_ORGANIZATION_INTEGRATION_DETAILS]: RS_INITIAL_STATE,
  [GET_ORGANIZATION_MEMBERS]: RS_INITIAL_STATE,
  // data
  [MEMBERS]: Map(),
  [ORGANIZATIONS]: Map(),
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case RESET_REQUEST_STATE: {
      return resetRequestStateReducer(state, action);
    }

    case addMemberToOrganization.case(action.type): {
      return addMemberToOrganizationReducer(state, action);
    }

    case addMembersToOrganization.case(action.type): {
      return addMembersToOrganizationReducer(state, action);
    }

    case addRoleToMember.case(action.type): {
      return addRoleToMemberReducer(state, action);
    }

    case addRoleToOrganization.case(action.type): {
      return addRoleToOrganizationReducer(state, action);
    }

    case assignRolesToMembers.case(action.type): {
      return assignRolesToMembersReducer(state, action);
    }

    case createNewOrganization.case(action.type): {
      return createNewOrganizationReducer(state, action);
    }

    case deleteExistingOrganization.case(action.type): {
      return deleteExistingOrganizationReducer(state, action);
    }

    case editOrganizationDetails.case(action.type): {
      return editOrganizationDetailsReducer(state, action);
    }

    case editRoleDetails.case(action.type): {
      return editRoleDetailsReducer(state, action);
    }

    case getOrganizationsAndAuthorizations.case(action.type): {
      return getOrganizationsAndAuthorizationsReducer(state, action);
    }

    case getOrganizationIntegrationDetails.case(action.type): {
      return getOrganizationIntegrationDetailsReducer(state, action);
    }

    case getOrganizationMembers.case(action.type): {
      return getOrganizationMembersReducer(state, action);
    }

    default: {
      return state;
    }
  }
}

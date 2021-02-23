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

import { RESET_REQUEST_STATE } from '../../../core/redux/actions';
import { MEMBERS, ORGANIZATIONS, RS_INITIAL_STATE } from '../../../core/redux/constants';
import { resetRequestStateReducer } from '../../../core/redux/reducers';
import {
  ADD_MEMBERS_TO_ORGANIZATION,
  ADD_ROLE_TO_ORGANIZATION,
  ASSIGN_ROLES_TO_MEMBERS,
  CREATE_NEW_ORGANIZATION,
  addMembersToOrganization,
  addRoleToOrganization,
  assignRolesToMembers,
  createNewOrganization,
} from '../actions';

export { default as addMembersToOrganizationReducer } from './addMembersToOrganizationReducer';
export { default as deleteExistingOrganizationReducer } from './deleteExistingOrganizationReducer';
export { default as editRoleDetailsReducer } from './editRoleDetailsReducer';
export { default as getOrganizationIntegrationDetailsReducer } from './getOrganizationIntegrationDetailsReducer';
export { default as renameOrganizationDatabaseReducer } from './renameOrganizationDatabaseReducer';

const {
  ADD_MEMBER_TO_ORGANIZATION,
  ADD_ROLE_TO_MEMBER,
  addMemberToOrganization,
  addRoleToMember,
} = OrganizationsApiActions;

const INITIAL_STATE :Map = fromJS({
  // actions
  [ADD_MEMBERS_TO_ORGANIZATION]: RS_INITIAL_STATE,
  [ADD_MEMBER_TO_ORGANIZATION]: RS_INITIAL_STATE,
  [ADD_ROLE_TO_MEMBER]: RS_INITIAL_STATE,
  [ADD_ROLE_TO_ORGANIZATION]: RS_INITIAL_STATE,
  [ASSIGN_ROLES_TO_MEMBERS]: RS_INITIAL_STATE,
  [CREATE_NEW_ORGANIZATION]: RS_INITIAL_STATE,
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

    default: {
      return state;
    }
  }
}

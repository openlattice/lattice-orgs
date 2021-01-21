/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import { Models, Types } from 'lattice';
import { DataSetsApiActions, OrganizationsApiActions } from 'lattice-sagas';
import { PersonUtils } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';
import type { OrganizationObject, UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_ORGANIZATIONS_AND_AUTHORIZATIONS,
  getOrganizationsAndAuthorizations,
} from './actions';

import { RESET_REQUEST_STATE } from '../../core/redux/actions';
import {
  ATLAS_DATA_SET_IDS,
  ENTITY_SET_IDS,
  ERROR,
  INTEGRATION_DETAILS,
  IS_OWNER,
  MEMBERS,
  ORGS,
  REQUEST_STATE,
  RS_INITIAL_STATE,
} from '../../core/redux/constants';
import {
  ADD_ROLE_TO_ORGANIZATION,
  CREATE_NEW_ORGANIZATION,
  EDIT_ORGANIZATION_DETAILS,
  EDIT_ROLE_DETAILS,
  GET_ORGANIZATION_INTEGRATION_DETAILS,
  INITIALIZE_ORGANIZATION,
  REMOVE_ROLE_FROM_ORGANIZATION,
  addRoleToOrganization,
  createNewOrganization,
  editOrganizationDetails,
  editRoleDetails,
  getOrganizationIntegrationDetails,
  initializeOrganization,
  removeRoleFromOrganization,
} from '../org/actions';
import {
  editRoleDetailsReducer,
  getOrganizationDataSetsReducer,
  getOrganizationIntegrationDetailsReducer,
  renameOrganizationDatabaseReducer,
} from '../org/reducers';
import { sortOrganizationMembers } from '../org/utils';
import type { AuthorizationObject } from '../../types';

const {
  Organization,
  OrganizationBuilder,
  Principal,
  PrincipalBuilder,
  Role,
} = Models;
const { PermissionTypes, PrincipalTypes } = Types;

const {
  GET_ORGANIZATION_DATA_SETS,
  getOrganizationDataSets,
} = DataSetsApiActions;
const {
  ADD_MEMBER_TO_ORGANIZATION,
  ADD_ROLE_TO_MEMBER,
  GET_ORGANIZATION_ENTITY_SETS,
  GET_ORGANIZATION_MEMBERS,
  REMOVE_MEMBER_FROM_ORGANIZATION,
  REMOVE_ROLE_FROM_MEMBER,
  RENAME_ORGANIZATION_DATABASE,
  addMemberToOrganization,
  addRoleToMember,
  getOrganizationEntitySets,
  getOrganizationMembers,
  removeMemberFromOrganization,
  removeRoleFromMember,
  renameOrganizationDatabase,
} = OrganizationsApiActions;

const { getUserId } = PersonUtils;

const INITIAL_STATE :Map = fromJS({
  // actions
  [ADD_MEMBER_TO_ORGANIZATION]: RS_INITIAL_STATE,
  [ADD_ROLE_TO_MEMBER]: RS_INITIAL_STATE,
  [ADD_ROLE_TO_ORGANIZATION]: RS_INITIAL_STATE,
  [CREATE_NEW_ORGANIZATION]: RS_INITIAL_STATE,
  [EDIT_ORGANIZATION_DETAILS]: RS_INITIAL_STATE,
  [EDIT_ROLE_DETAILS]: RS_INITIAL_STATE,
  [GET_ORGANIZATIONS_AND_AUTHORIZATIONS]: RS_INITIAL_STATE,
  [GET_ORGANIZATION_DATA_SETS]: RS_INITIAL_STATE,
  [GET_ORGANIZATION_ENTITY_SETS]: RS_INITIAL_STATE,
  [GET_ORGANIZATION_INTEGRATION_DETAILS]: RS_INITIAL_STATE,
  [GET_ORGANIZATION_MEMBERS]: RS_INITIAL_STATE,
  [INITIALIZE_ORGANIZATION]: RS_INITIAL_STATE,
  [REMOVE_MEMBER_FROM_ORGANIZATION]: RS_INITIAL_STATE,
  [REMOVE_ROLE_FROM_MEMBER]: RS_INITIAL_STATE,
  [REMOVE_ROLE_FROM_ORGANIZATION]: RS_INITIAL_STATE,
  [RENAME_ORGANIZATION_DATABASE]: RS_INITIAL_STATE,
  // data
  [ATLAS_DATA_SET_IDS]: Map(),
  [ENTITY_SET_IDS]: Map(),
  [INTEGRATION_DETAILS]: Map(),
  [IS_OWNER]: Map(),
  [MEMBERS]: Map(),
  [ORGS]: Map(),
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  if (action.type === editRoleDetails.case(action.type)) {
    return editRoleDetailsReducer(state, action);
  }

  if (action.type === getOrganizationDataSets.case(action.type)) {
    return getOrganizationDataSetsReducer(state, action);
  }

  if (action.type === getOrganizationIntegrationDetails.case(action.type)) {
    return getOrganizationIntegrationDetailsReducer(state, action);
  }

  if (action.type === renameOrganizationDatabase.case(action.type)) {
    return renameOrganizationDatabaseReducer(state, action);
  }

  // TODO: refactor this reducer
  switch (action.type) {

    case RESET_REQUEST_STATE: {
      const { path } = action;
      if (path && state.hasIn(path)) {
        return state
          .setIn([...path, ERROR], false)
          .setIn([...path, REQUEST_STATE], RequestStates.STANDBY);
      }
      return state;
    }

    case addMemberToOrganization.case(action.type): {
      const seqAction :SequenceAction = action;
      return addMemberToOrganization.reducer(state, action, {
        REQUEST: () => state
          .setIn([ADD_MEMBER_TO_ORGANIZATION, REQUEST_STATE], RequestStates.PENDING)
          .setIn([ADD_MEMBER_TO_ORGANIZATION, seqAction.id], seqAction),
        SUCCESS: () => {
          const storedSeqAction :?SequenceAction = state.getIn([ADD_MEMBER_TO_ORGANIZATION, seqAction.id]);
          if (storedSeqAction) {

            const { memberId, organizationId, profile } = storedSeqAction.value;
            const memberPrincipal :Principal = (new PrincipalBuilder())
              .setId(memberId)
              .setType(PrincipalTypes.USER)
              .build();

            const orgMemberObject = fromJS({
              principal: { principal: memberPrincipal.toImmutable() },
              profile,
              roles: List()
            });

            const currentOrg :Organization = state.getIn([ORGS, organizationId]);
            const updatedOrg :Map = currentOrg
              .toImmutable()
              .update(MEMBERS, (members :List = List()) => members.push(memberPrincipal));

            return state
              .updateIn(
                [MEMBERS, organizationId],
                (members :List = List()) => members.push(orgMemberObject).sort(sortOrganizationMembers),
              )
              .setIn([ORGS, organizationId], (new OrganizationBuilder(updatedOrg)).build())
              .setIn([ADD_MEMBER_TO_ORGANIZATION, REQUEST_STATE], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => {
          if (state.hasIn([ADD_MEMBER_TO_ORGANIZATION, seqAction.id])) {
            return state.setIn([ADD_MEMBER_TO_ORGANIZATION, REQUEST_STATE], RequestStates.FAILURE);
          }
          return state;
        },
        FINALLY: () => state.deleteIn([ADD_MEMBER_TO_ORGANIZATION, seqAction.id]),
      });
    }

    case addRoleToMember.case(action.type): {
      const seqAction :SequenceAction = action;
      return addRoleToMember.reducer(state, action, {
        REQUEST: () => state
          .setIn([ADD_ROLE_TO_MEMBER, REQUEST_STATE], RequestStates.PENDING)
          .setIn([ADD_ROLE_TO_MEMBER, seqAction.id], seqAction),
        SUCCESS: () => {
          const storedSeqAction :?SequenceAction = state.getIn([ADD_ROLE_TO_MEMBER, seqAction.id]);
          if (storedSeqAction) {

            const { memberId, organizationId, roleId } = storedSeqAction.value;

            const targetOrg :Organization = state.getIn([ORGS, organizationId]);
            const targetRole :?Role = targetOrg.roles.find((role) => role.id === roleId);
            const targetMemberIndex :number = state
              .getIn([MEMBERS, organizationId], List())
              .findIndex((member :Map) => getUserId(member) === memberId);

            if (targetRole && targetMemberIndex !== -1) {
              const targetMember :Map = state.getIn([MEMBERS, organizationId, targetMemberIndex], Map());
              const updatedMemberRoles :List = targetMember.get('roles', List()).push(targetRole.toImmutable());
              const updatedMember :Map = targetMember.set('roles', updatedMemberRoles);
              return state
                .setIn([MEMBERS, organizationId, targetMemberIndex], updatedMember)
                .setIn([ADD_ROLE_TO_MEMBER, REQUEST_STATE], RequestStates.SUCCESS);
            }
          }
          return state;
        },
        FAILURE: () => {
          if (state.hasIn([ADD_ROLE_TO_MEMBER, seqAction.id])) {
            return state.setIn([ADD_ROLE_TO_MEMBER, REQUEST_STATE], RequestStates.FAILURE);
          }
          return state;
        },
        FINALLY: () => state.deleteIn([ADD_ROLE_TO_MEMBER, seqAction.id]),
      });
    }

    case addRoleToOrganization.case(action.type): {
      const seqAction :SequenceAction = action;
      return addRoleToOrganization.reducer(state, action, {
        REQUEST: () => state
          .setIn([ADD_ROLE_TO_ORGANIZATION, REQUEST_STATE], RequestStates.PENDING)
          .setIn([ADD_ROLE_TO_ORGANIZATION, seqAction.id], seqAction),
        SUCCESS: () => {
          if (state.hasIn([ADD_ROLE_TO_ORGANIZATION, seqAction.id])) {

            const role :Role = seqAction.value;
            const org :Organization = state.getIn([ORGS, role.organizationId]);
            const updatedRoles = [...org.roles, role].sort((roleA, roleB) => (roleA.title.localeCompare(roleB.title)));
            const updatedOrg = (new OrganizationBuilder(org))
              .setRoles(updatedRoles)
              .build();

            return state
              .setIn([ORGS, role.organizationId], updatedOrg)
              .setIn([ADD_ROLE_TO_ORGANIZATION, REQUEST_STATE], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => {
          if (state.hasIn([ADD_ROLE_TO_ORGANIZATION, seqAction.id])) {
            return state.setIn([ADD_ROLE_TO_ORGANIZATION, REQUEST_STATE], RequestStates.FAILURE);
          }
          return state;
        },
        FINALLY: () => state.deleteIn([ADD_ROLE_TO_ORGANIZATION, seqAction.id]),
      });
    }

    case createNewOrganization.case(action.type): {
      const seqAction :SequenceAction = action;
      return createNewOrganization.reducer(state, action, {
        REQUEST: () => state
          .setIn([CREATE_NEW_ORGANIZATION, REQUEST_STATE], RequestStates.PENDING)
          .setIn([CREATE_NEW_ORGANIZATION, seqAction.id], seqAction),
        SUCCESS: () => {
          if (state.hasIn([CREATE_NEW_ORGANIZATION, seqAction.id])) {
            const org = (new OrganizationBuilder(seqAction.value)).build();
            return state
              .setIn([IS_OWNER, org.id], true)
              .setIn([ORGS, org.id], org)
              .setIn([CREATE_NEW_ORGANIZATION, REQUEST_STATE], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => {
          if (state.hasIn([CREATE_NEW_ORGANIZATION, seqAction.id])) {
            return state.setIn([CREATE_NEW_ORGANIZATION, REQUEST_STATE], RequestStates.FAILURE);
          }
          return state;
        },
        FINALLY: () => state.deleteIn([CREATE_NEW_ORGANIZATION, seqAction.id]),
      });
    }

    case editOrganizationDetails.case(action.type):
      return editOrganizationDetails.reducer(state, action, {
        REQUEST: () => state
          .setIn([EDIT_ORGANIZATION_DETAILS, REQUEST_STATE], RequestStates.PENDING)
          .setIn([EDIT_ORGANIZATION_DETAILS, action.id], action),
        SUCCESS: () => {
          const { organizationId, title, description } = action.value;
          const currentOrg :Organization = state.getIn([ORGS, organizationId]);
          const updatedOrg = currentOrg.toImmutable().merge({
            description,
            title,
          });

          return state
            .setIn([EDIT_ORGANIZATION_DETAILS, REQUEST_STATE], RequestStates.SUCCESS)
            .setIn([ORGS, organizationId], new OrganizationBuilder(updatedOrg).build());
        },
        FAILURE: () => state.setIn([EDIT_ORGANIZATION_DETAILS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([EDIT_ORGANIZATION_DETAILS, action.id]),
      });

    case getOrganizationsAndAuthorizations.case(action.type): {
      const seqAction :SequenceAction = action;
      return getOrganizationsAndAuthorizations.reducer(state, action, {
        REQUEST: () => state
          .setIn([GET_ORGANIZATIONS_AND_AUTHORIZATIONS, REQUEST_STATE], RequestStates.PENDING)
          .setIn([GET_ORGANIZATIONS_AND_AUTHORIZATIONS, seqAction.id], seqAction),
        SUCCESS: () => {
          if (state.hasIn([GET_ORGANIZATIONS_AND_AUTHORIZATIONS, seqAction.id])) {

            const isOwnerMap :Map<UUID, boolean> = Map().asMutable();
            seqAction.value.authorizations.forEach((authorization :AuthorizationObject) => {
              isOwnerMap.set(
                authorization.aclKey[0], // organization id
                authorization.permissions[PermissionTypes.OWNER] === true,
              );
            });

            const organizationsMap :Map<UUID, Organization> = Map().asMutable();
            seqAction.value.organizations.forEach((o :OrganizationObject) => {
              const org = (new OrganizationBuilder(o)).build();
              organizationsMap.set(org.id, org);
            });

            return state
              .set(IS_OWNER, isOwnerMap.asImmutable())
              .set(ORGS, organizationsMap.asImmutable())
              .setIn([GET_ORGANIZATIONS_AND_AUTHORIZATIONS, REQUEST_STATE], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => {
          if (state.hasIn([GET_ORGANIZATIONS_AND_AUTHORIZATIONS, seqAction.id])) {
            return state
              .set(ORGS, Map())
              .setIn([GET_ORGANIZATIONS_AND_AUTHORIZATIONS, REQUEST_STATE], RequestStates.FAILURE);
          }
          return state;
        },
        FINALLY: () => state.deleteIn([GET_ORGANIZATIONS_AND_AUTHORIZATIONS, seqAction.id]),
      });
    }

    case getOrganizationEntitySets.case(action.type): {
      const seqAction :SequenceAction = action;
      return getOrganizationEntitySets.reducer(state, action, {
        REQUEST: () => state
          .setIn([GET_ORGANIZATION_ENTITY_SETS, REQUEST_STATE], RequestStates.PENDING)
          .setIn([GET_ORGANIZATION_ENTITY_SETS, seqAction.id], seqAction),
        SUCCESS: () => {
          const storedSeqAction :?SequenceAction = state.getIn([GET_ORGANIZATION_ENTITY_SETS, seqAction.id]);
          if (storedSeqAction) {
            const organizationId :UUID = storedSeqAction.value;
            return state
              .setIn([ENTITY_SET_IDS, organizationId], fromJS(seqAction.value).keySeq().toSet())
              .setIn([GET_ORGANIZATION_ENTITY_SETS, REQUEST_STATE], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => {
          const storedSeqAction :?SequenceAction = state.getIn([GET_ORGANIZATION_ENTITY_SETS, seqAction.id]);
          if (storedSeqAction) {
            const organizationId :UUID = storedSeqAction.value;
            return state
              .deleteIn([ENTITY_SET_IDS, organizationId])
              .setIn([GET_ORGANIZATION_ENTITY_SETS, REQUEST_STATE], RequestStates.FAILURE);
          }
          return state;
        },
        FINALLY: () => state.deleteIn([GET_ORGANIZATION_ENTITY_SETS, seqAction.id]),
      });
    }

    case getOrganizationMembers.case(action.type): {
      const seqAction :SequenceAction = action;
      return getOrganizationMembers.reducer(state, action, {
        REQUEST: () => state
          .setIn([GET_ORGANIZATION_MEMBERS, REQUEST_STATE], RequestStates.PENDING)
          .setIn([GET_ORGANIZATION_MEMBERS, seqAction.id], seqAction),
        SUCCESS: () => {
          const storedSeqAction :?SequenceAction = state.getIn([GET_ORGANIZATION_MEMBERS, seqAction.id]);
          if (storedSeqAction) {
            const organizationId :UUID = storedSeqAction.value;
            const sortedMembers = fromJS(seqAction.value).sort(sortOrganizationMembers);
            return state
              .setIn([MEMBERS, organizationId], sortedMembers)
              .setIn([GET_ORGANIZATION_MEMBERS, REQUEST_STATE], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => {
          const storedSeqAction :?SequenceAction = state.getIn([GET_ORGANIZATION_MEMBERS, seqAction.id]);
          if (storedSeqAction) {
            const organizationId :UUID = storedSeqAction.value;
            return state
              .deleteIn([MEMBERS, organizationId])
              .setIn([GET_ORGANIZATION_MEMBERS, REQUEST_STATE], RequestStates.FAILURE);
          }
          return state;
        },
        FINALLY: () => state.deleteIn([GET_ORGANIZATION_MEMBERS, seqAction.id]),
      });
    }

    case initializeOrganization.case(action.type): {
      const seqAction :SequenceAction = action;
      return initializeOrganization.reducer(state, action, {
        REQUEST: () => state
          .setIn([INITIALIZE_ORGANIZATION, REQUEST_STATE], RequestStates.PENDING)
          .setIn([INITIALIZE_ORGANIZATION, seqAction.id], seqAction),
        SUCCESS: () => {
          if (state.hasIn([INITIALIZE_ORGANIZATION, seqAction.id])) {
            const organization = (new OrganizationBuilder(seqAction.value.organization)).build();
            return state
              .setIn([IS_OWNER, organization.id], seqAction.value.isOwner)
              .setIn([ORGS, organization.id], organization)
              .setIn([INITIALIZE_ORGANIZATION, REQUEST_STATE], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => {
          if (state.hasIn([INITIALIZE_ORGANIZATION, seqAction.id])) {
            return state
              .setIn([INITIALIZE_ORGANIZATION, ERROR], seqAction.value)
              .setIn([INITIALIZE_ORGANIZATION, REQUEST_STATE], RequestStates.FAILURE);
          }
          return state;
        },
        FINALLY: () => state.deleteIn([INITIALIZE_ORGANIZATION, seqAction.id]),
      });
    }

    case removeMemberFromOrganization.case(action.type): {
      const seqAction :SequenceAction = action;
      return removeMemberFromOrganization.reducer(state, action, {
        REQUEST: () => state
          .setIn([REMOVE_MEMBER_FROM_ORGANIZATION, REQUEST_STATE], RequestStates.PENDING)
          .setIn([REMOVE_MEMBER_FROM_ORGANIZATION, seqAction.id], seqAction),
        SUCCESS: () => {
          const storedSeqAction :?SequenceAction = state.getIn([REMOVE_MEMBER_FROM_ORGANIZATION, seqAction.id]);
          if (storedSeqAction) {

            const { memberId, organizationId } = storedSeqAction.value;
            const currentOrg :Organization = state.getIn([ORGS, organizationId]);
            const updatedOrg :Map = currentOrg
              .toImmutable()
              .update(
                MEMBERS,
                (members :List = List()) => members.filter((member :Map) => getUserId(member) !== memberId),
              );

            return state
              .updateIn(
                [MEMBERS, organizationId],
                (members :List = List()) => members.filter((member :Map) => getUserId(member) !== memberId),
              )
              .setIn([ORGS, organizationId], (new OrganizationBuilder(updatedOrg)).build())
              .setIn([REMOVE_MEMBER_FROM_ORGANIZATION, REQUEST_STATE], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => {
          if (state.hasIn([REMOVE_MEMBER_FROM_ORGANIZATION, seqAction.id])) {
            return state.setIn([REMOVE_MEMBER_FROM_ORGANIZATION, REQUEST_STATE], RequestStates.FAILURE);
          }
          return state;
        },
        FINALLY: () => state.deleteIn([REMOVE_MEMBER_FROM_ORGANIZATION, seqAction.id]),
      });
    }

    case removeRoleFromMember.case(action.type): {
      const seqAction :SequenceAction = action;
      return removeRoleFromMember.reducer(state, action, {
        REQUEST: () => state
          .setIn([REMOVE_ROLE_FROM_MEMBER, REQUEST_STATE], RequestStates.PENDING)
          .setIn([REMOVE_ROLE_FROM_MEMBER, seqAction.id], seqAction),
        SUCCESS: () => {
          const storedSeqAction :?SequenceAction = state.getIn([REMOVE_ROLE_FROM_MEMBER, seqAction.id]);
          if (storedSeqAction) {

            const { memberId, organizationId, roleId } = storedSeqAction.value;
            const targetMemberIndex :number = state
              .getIn([MEMBERS, organizationId], List())
              .findIndex((member :Map) => getUserId(member) === memberId);

            if (targetMemberIndex !== -1) {
              const targetMember :Map = state.getIn([MEMBERS, organizationId, targetMemberIndex], Map());
              const targetRoleIndex :number = targetMember
                .get('roles', List())
                .findIndex((role :Map) => role.get('id') === roleId);
              if (targetRoleIndex !== -1) {
                const updatedMember = targetMember.deleteIn(['roles', targetRoleIndex]);
                return state
                  .setIn([MEMBERS, organizationId, targetMemberIndex], updatedMember)
                  .setIn([REMOVE_ROLE_FROM_MEMBER, REQUEST_STATE], RequestStates.SUCCESS);
              }
            }
          }
          return state;
        },
        FAILURE: () => {
          if (state.hasIn([REMOVE_ROLE_FROM_MEMBER, seqAction.id])) {
            return state.setIn([REMOVE_ROLE_FROM_MEMBER, REQUEST_STATE], RequestStates.FAILURE);
          }
          return state;
        },
        FINALLY: () => state.deleteIn([REMOVE_ROLE_FROM_MEMBER, seqAction.id]),
      });
    }

    case removeRoleFromOrganization.case(action.type): {
      const seqAction :SequenceAction = action;
      return removeRoleFromOrganization.reducer(state, action, {
        REQUEST: () => state
          .setIn([REMOVE_ROLE_FROM_ORGANIZATION, REQUEST_STATE], RequestStates.PENDING)
          .setIn([REMOVE_ROLE_FROM_ORGANIZATION, seqAction.id], seqAction),
        SUCCESS: () => {
          const storedSeqAction :SequenceAction = state.getIn([REMOVE_ROLE_FROM_ORGANIZATION, seqAction.id]);
          if (storedSeqAction) {

            const {
              organizationId,
              roleId,
            } :{|
              organizationId :UUID;
              roleId :UUID;
            |} = storedSeqAction.value;

            const org :Organization = state.getIn([ORGS, organizationId]);
            const updatedRoles = org.roles.filter((role) => role.id !== roleId);
            const updatedOrg = (new OrganizationBuilder(org)).setRoles(updatedRoles).build();

            return state
              .setIn([ORGS, organizationId], updatedOrg)
              .setIn([REMOVE_ROLE_FROM_ORGANIZATION, REQUEST_STATE], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => {
          if (state.hasIn([REMOVE_ROLE_FROM_ORGANIZATION, seqAction.id])) {
            return state.setIn([REMOVE_ROLE_FROM_ORGANIZATION, REQUEST_STATE], RequestStates.FAILURE);
          }
          return state;
        },
        FINALLY: () => state.deleteIn([REMOVE_ROLE_FROM_ORGANIZATION, seqAction.id]),
      });
    }

    default:
      return state;
  }
}

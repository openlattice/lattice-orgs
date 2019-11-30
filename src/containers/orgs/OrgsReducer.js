/*
 * @flow
 */

import {
  List,
  Map,
  Set,
  fromJS,
} from 'immutable';
import { Models, Types } from 'lattice';
import { OrganizationsApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  ADD_CONNECTION,
  ADD_ROLE_TO_ORGANIZATION,
  GET_ORGANIZATION_ACLS,
  GET_ORGANIZATION_DETAILS,
  GET_ORGS_AND_PERMISSIONS,
  REMOVE_CONNECTION,
  REMOVE_ROLE_FROM_ORGANIZATION,
  addConnection,
  addRoleToOrganization,
  getOrganizationACLs,
  getOrganizationDetails,
  getOrgsAndPermissions,
  removeConnection,
  removeRoleFromOrganization,
} from './OrgsActions';

import { RESET_REQUEST_STATE } from '../../core/redux/ReduxActions';
// import Logger from '../../utils/Logger';
import { getUserId } from '../../utils/PersonUtils';

// const LOG :Logger = new Logger('OrgsReducer');

const {
  Grant,
  Organization,
  OrganizationBuilder,
  Principal,
  PrincipalBuilder,
  Role,
} = Models;

const { PermissionTypes, PrincipalTypes } = Types;

const {
  ADD_DOMAIN_TO_ORG,
  ADD_MEMBER_TO_ORG,
  ADD_ROLE_TO_MEMBER,
  CREATE_ORGANIZATION,
  DELETE_ORGANIZATION,
  GET_ORG_ENTITY_SETS,
  GET_ORG_MEMBERS,
  GRANT_TRUST_TO_ORG,
  REMOVE_DOMAIN_FROM_ORG,
  REMOVE_MEMBER_FROM_ORG,
  REMOVE_ROLE_FROM_MEMBER,
  REVOKE_TRUST_FROM_ORG,
  UPDATE_ORG_DESCRIPTION,
  UPDATE_ORG_TITLE,
  UPDATE_ROLE_GRANT,
  addDomainToOrganization,
  addMemberToOrganization,
  addRoleToMember,
  createOrganization,
  deleteOrganization,
  getOrganizationEntitySets,
  getOrganizationMembers,
  grantTrustToOrganization,
  removeDomainFromOrganization,
  removeMemberFromOrganization,
  removeRoleFromMember,
  revokeTrustFromOrganization,
  updateOrganizationDescription,
  updateOrganizationTitle,
  updateRoleGrant,
} = OrganizationsApiActions;

const INITIAL_STATE :Map = fromJS({
  [ADD_CONNECTION]: {
    requestState: RequestStates.STANDBY,
  },
  [ADD_DOMAIN_TO_ORG]: {
    requestState: RequestStates.STANDBY,
  },
  [ADD_MEMBER_TO_ORG]: {
    requestState: RequestStates.STANDBY,
  },
  [ADD_ROLE_TO_MEMBER]: {
    requestState: RequestStates.STANDBY,
  },
  [ADD_ROLE_TO_ORGANIZATION]: {
    requestState: RequestStates.STANDBY,
  },
  [CREATE_ORGANIZATION]: {
    requestState: RequestStates.STANDBY,
  },
  [DELETE_ORGANIZATION]: {
    requestState: RequestStates.STANDBY,
  },
  [GET_ORGS_AND_PERMISSIONS]: {
    requestState: RequestStates.STANDBY,
  },
  [GET_ORGANIZATION_ACLS]: {
    requestState: RequestStates.STANDBY,
  },
  [GET_ORGANIZATION_DETAILS]: {
    requestState: RequestStates.STANDBY,
  },
  [GET_ORG_ENTITY_SETS]: {
    requestState: RequestStates.STANDBY,
  },
  [GET_ORG_MEMBERS]: {
    requestState: RequestStates.STANDBY,
  },
  [GRANT_TRUST_TO_ORG]: {
    requestState: RequestStates.STANDBY,
  },
  [REMOVE_CONNECTION]: {
    requestState: RequestStates.STANDBY,
  },
  [REMOVE_DOMAIN_FROM_ORG]: {
    requestState: RequestStates.STANDBY,
  },
  [REMOVE_MEMBER_FROM_ORG]: {
    requestState: RequestStates.STANDBY,
  },
  [REMOVE_ROLE_FROM_MEMBER]: {
    requestState: RequestStates.STANDBY,
  },
  [REMOVE_ROLE_FROM_ORGANIZATION]: {
    requestState: RequestStates.STANDBY,
  },
  [REVOKE_TRUST_FROM_ORG]: {
    requestState: RequestStates.STANDBY,
  },
  [UPDATE_ORG_DESCRIPTION]: {
    requestState: RequestStates.STANDBY,
  },
  [UPDATE_ORG_TITLE]: {
    requestState: RequestStates.STANDBY,
  },
  [UPDATE_ROLE_GRANT]: {
    requestState: RequestStates.STANDBY,
  },
  isOwnerOfOrgIds: Set(),
  newlyCreatedOrgId: undefined,
  orgACLs: Map(),
  orgEntitySets: Map(),
  orgMembers: Map(),
  orgs: Map(),
});

export default function orgsReducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case RESET_REQUEST_STATE: {
      const { actionType } = action;
      if (actionType && state.has(actionType)) {
        return state.setIn([actionType, 'requestState'], RequestStates.STANDBY);
      }
      return state;
    }

    case addConnection.case(action.type): {
      const seqAction :SequenceAction = action;
      return addConnection.reducer(state, action, {
        REQUEST: () => state
          .setIn([ADD_CONNECTION, 'requestState'], RequestStates.PENDING)
          .setIn([ADD_CONNECTION, seqAction.id], seqAction),
        SUCCESS: () => {
          const storedSeqAction :SequenceAction = state.getIn([ADD_CONNECTION, seqAction.id]);
          if (storedSeqAction) {
            const { connection, organizationId } = storedSeqAction.value;
            return state
              .setIn([ADD_CONNECTION, 'requestState'], RequestStates.SUCCESS)
              .updateIn(
                ['orgs', organizationId, 'connections'],
                List(),
                (connections :List) => connections.push(connection),
              );
          }
          return state;
        },
        FAILURE: () => state.setIn([ADD_CONNECTION, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ADD_CONNECTION, seqAction.id]),
      });
    }

    case addDomainToOrganization.case(action.type): {
      const seqAction :SequenceAction = action;
      return addDomainToOrganization.reducer(state, action, {
        REQUEST: () => state
          .setIn([ADD_DOMAIN_TO_ORG, 'requestState'], RequestStates.PENDING)
          .setIn([ADD_DOMAIN_TO_ORG, seqAction.id], seqAction),
        SUCCESS: () => {
          const storedSeqAction :SequenceAction = state.getIn([ADD_DOMAIN_TO_ORG, seqAction.id]);
          if (storedSeqAction) {
            const { domain, organizationId } = storedSeqAction.value;
            const currentDomains :List<string> = state.getIn(['orgs', organizationId, 'emails'], List());
            const updatedDomains :Set<string> = currentDomains.push(domain);
            return state
              .setIn(['orgs', organizationId, 'emails'], updatedDomains)
              .setIn([ADD_DOMAIN_TO_ORG, 'requestState'], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => state.setIn([ADD_DOMAIN_TO_ORG, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ADD_DOMAIN_TO_ORG, seqAction.id]),
      });
    }

    case addMemberToOrganization.case(action.type): {
      const seqAction :SequenceAction = action;
      return addMemberToOrganization.reducer(state, action, {
        REQUEST: () => state
          .setIn([ADD_MEMBER_TO_ORG, 'requestState'], RequestStates.PENDING)
          .setIn([ADD_MEMBER_TO_ORG, seqAction.id], seqAction),
        SUCCESS: () => {
          const storedSeqAction :SequenceAction = state.getIn([ADD_MEMBER_TO_ORG, seqAction.id]);
          if (storedSeqAction) {
            const { memberId, organizationId } = storedSeqAction.value;
            const memberPrincipal :Principal = (new PrincipalBuilder())
              .setId(memberId)
              .setType(PrincipalTypes.USER)
              .build();
            const orgMemberObject = fromJS({
              principal: {
                principal: memberPrincipal.toImmutable(),
              },
              profile: {
                user_id: memberId
              },
            });
            return state
              .setIn([ADD_MEMBER_TO_ORG, 'requestState'], RequestStates.SUCCESS)
              .updateIn(
                ['orgs', organizationId, 'members'],
                List(),
                (members :List) => members.push(memberPrincipal.toImmutable()),
              )
              .updateIn(
                ['orgMembers', organizationId],
                List(),
                (members :List) => members.push(orgMemberObject),
              );
          }
          return state;
        },
        FAILURE: () => state.setIn([ADD_MEMBER_TO_ORG, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ADD_MEMBER_TO_ORG, seqAction.id]),
      });
    }

    case addRoleToMember.case(action.type): {
      const seqAction :SequenceAction = action;
      return addRoleToMember.reducer(state, action, {
        REQUEST: () => state
          .setIn([ADD_ROLE_TO_MEMBER, seqAction.id], seqAction)
          .setIn([ADD_ROLE_TO_MEMBER, 'requestState'], RequestStates.PENDING),
        SUCCESS: () => {
          const storedSeqAction :SequenceAction = state.getIn([ADD_ROLE_TO_MEMBER, seqAction.id]);
          if (storedSeqAction) {
            const { memberId, organizationId, roleId } = storedSeqAction.value;
            const targetRole :Map = state
              .getIn(['orgs', organizationId, 'roles'], List())
              .find((role :Map) => role.get('id') === roleId);
            const targetMemberIndex :number = state
              .getIn(['orgMembers', organizationId], List())
              .findIndex((member :Map) => getUserId(member) === memberId);
            if (targetRole && targetMemberIndex !== -1) {
              const targetMember :Map = state.getIn(['orgMembers', organizationId, targetMemberIndex], Map());
              const updatedMemberRoles :List = targetMember.get('roles', List()).push(targetRole);
              const updatedMember :Map = targetMember.set('roles', updatedMemberRoles);
              return state
                .setIn(['orgMembers', organizationId, targetMemberIndex], updatedMember)
                .setIn([ADD_ROLE_TO_MEMBER, 'requestState'], RequestStates.SUCCESS);
            }
          }
          return state;
        },
        FAILURE: () => state.setIn([ADD_ROLE_TO_MEMBER, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ADD_ROLE_TO_MEMBER, seqAction.id]),
      });
    }

    case addRoleToOrganization.case(action.type): {
      const seqAction :SequenceAction = action;
      return addRoleToOrganization.reducer(state, action, {
        REQUEST: () => state
          .setIn([ADD_ROLE_TO_ORGANIZATION, seqAction.id], seqAction)
          .setIn([ADD_ROLE_TO_ORGANIZATION, 'requestState'], RequestStates.PENDING),
        SUCCESS: () => {
          const storedSeqAction :SequenceAction = state.getIn([ADD_ROLE_TO_ORGANIZATION, seqAction.id]);
          if (storedSeqAction) {
            const role :Role = seqAction.value;
            return state
              .setIn([ADD_ROLE_TO_ORGANIZATION, 'requestState'], RequestStates.SUCCESS)
              .updateIn(
                ['orgs', role.organizationId, 'roles'],
                List(),
                (roles :List) => roles.push(role.toImmutable()),
              );
          }
          return state;
        },
        FAILURE: () => state.setIn([ADD_ROLE_TO_ORGANIZATION, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ADD_ROLE_TO_ORGANIZATION, seqAction.id]),
      });
    }

    case createOrganization.case(action.type): {
      const seqAction :SequenceAction = action;
      return createOrganization.reducer(state, action, {
        REQUEST: () => state
          .setIn([CREATE_ORGANIZATION, seqAction.id], seqAction)
          .setIn([CREATE_ORGANIZATION, 'requestState'], RequestStates.PENDING),
        SUCCESS: () => {
          const storedSeqAction :SequenceAction = state.getIn([CREATE_ORGANIZATION, seqAction.id]);
          if (storedSeqAction) {
            const orgId :UUID = seqAction.value;
            const org :Organization = storedSeqAction.value;
            const newOrg :Organization = (new OrganizationBuilder())
              .setId(orgId)
              .setPrincipal(org.principal)
              .setTitle(org.title)
              .build();
            const updatedOrgs :Map = state
              .get('orgs', Map())
              .set(orgId, newOrg.toImmutable());
            const updatedIsOwnerOfOrgIds :Set = state
              .get('isOwnerOfOrgIds', Set())
              .add(orgId);
            return state
              .set('isOwnerOfOrgIds', updatedIsOwnerOfOrgIds)
              .set('orgs', updatedOrgs)
              .set('newlyCreatedOrgId', orgId)
              .setIn([CREATE_ORGANIZATION, 'requestState'], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => state
          .set('newlyCreatedOrgId', undefined)
          .setIn([CREATE_ORGANIZATION, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([CREATE_ORGANIZATION, seqAction.id]),
      });
    }

    case deleteOrganization.case(action.type): {
      const seqAction :SequenceAction = action;
      return deleteOrganization.reducer(state, action, {
        REQUEST: () => state
          .setIn([DELETE_ORGANIZATION, 'requestState'], RequestStates.PENDING)
          .setIn([DELETE_ORGANIZATION, seqAction.id], seqAction),
        SUCCESS: () => {
          const storedSeqAction :SequenceAction = state.getIn([DELETE_ORGANIZATION, seqAction.id]);
          if (storedSeqAction) {
            const organizationId :UUID = storedSeqAction.value;
            return state
              .deleteIn(['orgs', organizationId])
              .deleteIn(['orgs', 'isOwnerOfOrgIds', organizationId])
              .setIn([DELETE_ORGANIZATION, 'requestState'], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => state.setIn([DELETE_ORGANIZATION, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([DELETE_ORGANIZATION, seqAction.id]),
      });
    }

    case getOrgsAndPermissions.case(action.type): {
      const seqAction :SequenceAction = action;
      return getOrgsAndPermissions.reducer(state, action, {
        REQUEST: () => state
          .setIn([GET_ORGS_AND_PERMISSIONS, 'requestState'], RequestStates.PENDING)
          .setIn([GET_ORGS_AND_PERMISSIONS, seqAction.id], seqAction),
        SUCCESS: () => {

          // NOTE: this logic will need to be implemented at some point, keeping it around for future reference
          /*
           * choosing the selected organization requires checking 3 places, in order of priority:
           *   1. URL
           *   2. localStorage
           *   3. organizations data
           */
          // let selectedOrganizationId :string = '';
          // // by default, choose the first organization from the response data
          // if (orgs && !orgs.isEmpty()) {
          //   selectedOrganizationId = orgs.getIn([0, 'id']);
          // }
          //
          // // check localStorage for a previously stored organization id
          // const storedOrganizationId :?string = getOrganizationId();
          // if (storedOrganizationId) {
          //   selectedOrganizationId = storedOrganizationId;
          // }
          //
          // // URL trumps everything
          // const match :?Match = matchPath(window.location.hash.slice(1), { path: Routes.ORG });
          // if (match && match.params.id) {
          //   const maybeOrgId :UUID = match.params.id;
          //   const isRealOrganizationId :number = orgs.findIndex((org :Map) => org.get('id') === maybeOrgId);
          //   if (isRealOrganizationId !== -1) {
          //     selectedOrganizationId = maybeOrgId;
          //   }
          // }

          const organizations :Map<UUID, Map> = seqAction.value.organizations;
          const permissions :Map<UUID, Map> = seqAction.value.permissions;

          const isOwnerOfOrgIds :Set<UUID> = organizations
            .filter((org :Map) => permissions.getIn([org.get('id'), PermissionTypes.OWNER]) === true)
            .keySeq()
            .toSet();

          return state
            .set('isOwnerOfOrgIds', isOwnerOfOrgIds)
            .set('orgs', organizations)
            .setIn([GET_ORGS_AND_PERMISSIONS, 'requestState'], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .set('isOwnerOfOrgIds', Set())
          .set('orgs', Map())
          .setIn([GET_ORGS_AND_PERMISSIONS, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([GET_ORGS_AND_PERMISSIONS, seqAction.id]),
      });
    }

    case getOrganizationDetails.case(action.type): {
      const seqAction :SequenceAction = action;
      return getOrganizationDetails.reducer(state, action, {
        REQUEST: () => state
          .setIn([GET_ORGANIZATION_DETAILS, 'requestState'], RequestStates.PENDING)
          .setIn([GET_ORGANIZATION_DETAILS, seqAction.id], seqAction),
        SUCCESS: () => {
          const { integration, org, trustedOrgIds } = seqAction.value;
          const orgId :UUID = org.get('id');
          const updatedOrg :Map = org
            .set('integration', integration)
            .set('trustedOrgIds', trustedOrgIds);
          return state
            .setIn(['orgs', orgId], updatedOrg)
            .setIn([GET_ORGANIZATION_DETAILS, 'requestState'], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([GET_ORGANIZATION_DETAILS, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([GET_ORGANIZATION_DETAILS, seqAction.id]),
      });
    }

    case getOrganizationACLs.case(action.type): {
      const seqAction :SequenceAction = action;
      return getOrganizationACLs.reducer(state, action, {
        REQUEST: () => state
          .setIn([GET_ORGANIZATION_ACLS, 'requestState'], RequestStates.PENDING)
          .setIn([GET_ORGANIZATION_ACLS, seqAction.id], seqAction),
        SUCCESS: () => {
          const storedSeqAction :SequenceAction = state.getIn([GET_ORGANIZATION_ACLS, seqAction.id]);
          if (storedSeqAction) {
            const organizationId :UUID = storedSeqAction.value;
            return state
              .setIn(['orgACLs', organizationId], seqAction.value)
              .setIn([GET_ORGANIZATION_ACLS, 'requestState'], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => {
          const storedSeqAction :SequenceAction = state.getIn([GET_ORGANIZATION_ACLS, seqAction.id]);
          if (storedSeqAction) {
            const organizationId :UUID = storedSeqAction.value;
            return state
              .setIn([GET_ORGANIZATION_ACLS, 'requestState'], RequestStates.FAILURE)
              .setIn(['orgACLs', organizationId], List());
          }
          return state.setIn([GET_ORGANIZATION_ACLS, 'requestState'], RequestStates.FAILURE);
        },
        FINALLY: () => state.deleteIn([GET_ORGANIZATION_ACLS, seqAction.id]),
      });
    }

    case getOrganizationEntitySets.case(action.type): {
      const seqAction :SequenceAction = action;
      return getOrganizationEntitySets.reducer(state, action, {
        REQUEST: () => state
          .setIn([GET_ORG_ENTITY_SETS, 'requestState'], RequestStates.PENDING)
          .setIn([GET_ORG_ENTITY_SETS, seqAction.id], seqAction),
        SUCCESS: () => {
          const storedSeqAction :SequenceAction = state.getIn([GET_ORG_ENTITY_SETS, seqAction.id]);
          if (storedSeqAction) {
            const organizationId :UUID = storedSeqAction.value;
            return state
              .setIn(['orgEntitySets', organizationId], fromJS(seqAction.value))
              .setIn([GET_ORG_ENTITY_SETS, 'requestState'], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => {
          const storedSeqAction :SequenceAction = state.getIn([GET_ORG_ENTITY_SETS, seqAction.id]);
          if (storedSeqAction) {
            const organizationId :UUID = storedSeqAction.value;
            return state
              .setIn(['orgEntitySets', organizationId], Map())
              .setIn([GET_ORG_ENTITY_SETS, 'requestState'], RequestStates.FAILURE);
          }
          return state.setIn([GET_ORG_ENTITY_SETS, 'requestState'], RequestStates.FAILURE);
        },
        FINALLY: () => state.deleteIn([GET_ORG_ENTITY_SETS, seqAction.id]),
      });
    }

    case getOrganizationMembers.case(action.type): {
      const seqAction :SequenceAction = action;
      return getOrganizationMembers.reducer(state, action, {
        REQUEST: () => state
          .setIn([GET_ORG_MEMBERS, 'requestState'], RequestStates.PENDING)
          .setIn([GET_ORG_MEMBERS, seqAction.id], seqAction),
        SUCCESS: () => {
          const storedSeqAction :SequenceAction = state.getIn([GET_ORG_MEMBERS, seqAction.id]);
          if (storedSeqAction) {
            const organizationId :UUID = storedSeqAction.value;
            return state
              .setIn([GET_ORG_MEMBERS, 'requestState'], RequestStates.SUCCESS)
              .setIn(['orgMembers', organizationId], fromJS(seqAction.value));
          }
          return state;
        },
        FAILURE: () => {
          const storedSeqAction :SequenceAction = state.getIn([GET_ORG_MEMBERS, seqAction.id]);
          if (storedSeqAction) {
            const organizationId :UUID = storedSeqAction.value;
            return state
              .setIn([GET_ORG_MEMBERS, 'requestState'], RequestStates.FAILURE)
              .setIn(['orgMembers', organizationId], List());
          }
          return state.setIn([GET_ORG_MEMBERS, 'requestState'], RequestStates.FAILURE);
        },
        FINALLY: () => state.deleteIn([GET_ORG_MEMBERS, seqAction.id]),
      });
    }

    case grantTrustToOrganization.case(action.type): {
      const seqAction :SequenceAction = action;
      return grantTrustToOrganization.reducer(state, action, {
        REQUEST: () => state
          .setIn([GRANT_TRUST_TO_ORG, 'requestState'], RequestStates.PENDING)
          .setIn([GRANT_TRUST_TO_ORG, seqAction.id], seqAction),
        SUCCESS: () => {
          const storedSeqAction :SequenceAction = state.getIn([GRANT_TRUST_TO_ORG, seqAction.id]);
          if (storedSeqAction) {
            const { organizationId, trustedOrgId } = storedSeqAction.value;
            const currentTrusted :List<UUID> = state.getIn(['orgs', organizationId, 'trustedOrgIds'], List());
            const updatedTrusted :List<UUID> = currentTrusted.push(trustedOrgId);
            return state
              .setIn(['orgs', organizationId, 'trustedOrgIds'], updatedTrusted)
              .setIn([GRANT_TRUST_TO_ORG, 'requestState'], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => state.setIn([GRANT_TRUST_TO_ORG, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([GRANT_TRUST_TO_ORG, seqAction.id]),
      });
    }

    case removeConnection.case(action.type): {
      const seqAction :SequenceAction = action;
      return removeConnection.reducer(state, action, {
        REQUEST: () => state
          .setIn([REMOVE_CONNECTION, 'requestState'], RequestStates.PENDING)
          .setIn([REMOVE_CONNECTION, seqAction.id], seqAction),
        SUCCESS: () => {
          const storedSeqAction :SequenceAction = state.getIn([REMOVE_CONNECTION, seqAction.id]);
          if (storedSeqAction) {
            const { connection, organizationId } = storedSeqAction.value;
            return state
              .setIn([REMOVE_CONNECTION, 'requestState'], RequestStates.SUCCESS)
              .updateIn(
                ['orgs', organizationId, 'connections'],
                List(),
                (connections :List) => connections.filter((currentConnection) => currentConnection !== connection),
              );
          }
          return state;
        },
        FAILURE: () => state.setIn([REMOVE_CONNECTION, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([REMOVE_CONNECTION, seqAction.id]),
      });
    }

    case removeDomainFromOrganization.case(action.type): {
      const seqAction :SequenceAction = action;
      return removeDomainFromOrganization.reducer(state, action, {
        REQUEST: () => state
          .setIn([REMOVE_DOMAIN_FROM_ORG, 'requestState'], RequestStates.PENDING)
          .setIn([REMOVE_DOMAIN_FROM_ORG, seqAction.id], seqAction),
        SUCCESS: () => {
          const storedSeqAction :SequenceAction = state.getIn([REMOVE_DOMAIN_FROM_ORG, seqAction.id]);
          if (storedSeqAction) {
            const { domain, organizationId } = storedSeqAction.value;
            const currentDomains :List<string> = state.getIn(['orgs', organizationId, 'emails'], List());
            const updatedDomains :List<string> = currentDomains.filter((currentDomain) => currentDomain !== domain);
            return state
              .setIn(['orgs', organizationId, 'emails'], updatedDomains)
              .setIn([REMOVE_DOMAIN_FROM_ORG, 'requestState'], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => state.setIn([REMOVE_DOMAIN_FROM_ORG, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([REMOVE_DOMAIN_FROM_ORG, seqAction.id]),
      });
    }

    case removeMemberFromOrganization.case(action.type): {
      const seqAction :SequenceAction = action;
      return removeMemberFromOrganization.reducer(state, action, {
        REQUEST: () => state
          .setIn([REMOVE_MEMBER_FROM_ORG, 'requestState'], RequestStates.PENDING)
          .setIn([REMOVE_MEMBER_FROM_ORG, seqAction.id], seqAction),
        SUCCESS: () => {
          const storedSeqAction :SequenceAction = state.getIn([REMOVE_MEMBER_FROM_ORG, seqAction.id]);
          if (storedSeqAction) {
            const { memberId, organizationId } = storedSeqAction.value;
            return state
              .setIn([REMOVE_MEMBER_FROM_ORG, 'requestState'], RequestStates.SUCCESS)
              .updateIn(
                ['orgs', organizationId, 'members'],
                List(),
                (members :List) => members.filter((member :Map) => getUserId(member) !== memberId),
              )
              .updateIn(
                ['orgMembers', organizationId],
                List(),
                (members :List) => members.filter((member :Map) => getUserId(member) !== memberId),
              );
          }
          return state;
        },
        FAILURE: () => state.setIn([REMOVE_MEMBER_FROM_ORG, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([REMOVE_MEMBER_FROM_ORG, seqAction.id]),
      });
    }

    case removeRoleFromMember.case(action.type): {
      const seqAction :SequenceAction = action;
      return removeRoleFromMember.reducer(state, action, {
        REQUEST: () => state
          .setIn([REMOVE_ROLE_FROM_MEMBER, seqAction.id], seqAction)
          .setIn([REMOVE_ROLE_FROM_MEMBER, 'requestState'], RequestStates.PENDING),
        SUCCESS: () => {
          const storedSeqAction :SequenceAction = state.getIn([REMOVE_ROLE_FROM_MEMBER, seqAction.id]);
          if (storedSeqAction) {
            const { memberId, organizationId, roleId } = storedSeqAction.value;
            const targetMemberIndex :number = state
              .getIn(['orgMembers', organizationId], List())
              .findIndex((member :Map) => getUserId(member) === memberId);
            if (targetMemberIndex !== -1) {
              const targetMember :Map = state.getIn(['orgMembers', organizationId, targetMemberIndex], Map());
              const targetRoleIndex :number = targetMember
                .get('roles', List())
                .findIndex((role :Map) => role.get('id') === roleId);
              if (targetRoleIndex !== -1) {
                const updatedMember = targetMember.deleteIn(['roles', targetRoleIndex]);
                return state
                  .setIn(['orgMembers', organizationId, targetMemberIndex], updatedMember)
                  .setIn([REMOVE_ROLE_FROM_MEMBER, 'requestState'], RequestStates.SUCCESS);
              }
            }
          }
          return state;
        },
        FAILURE: () => state.setIn([REMOVE_ROLE_FROM_MEMBER, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([REMOVE_ROLE_FROM_MEMBER, seqAction.id]),
      });
    }

    case removeRoleFromOrganization.case(action.type): {
      const seqAction :SequenceAction = action;
      return removeRoleFromOrganization.reducer(state, action, {
        REQUEST: () => state
          .setIn([REMOVE_ROLE_FROM_ORGANIZATION, seqAction.id], seqAction)
          .setIn([REMOVE_ROLE_FROM_ORGANIZATION, 'requestState'], RequestStates.PENDING),
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
            return state
              .setIn([REMOVE_ROLE_FROM_ORGANIZATION, 'requestState'], RequestStates.SUCCESS)
              .updateIn(
                ['orgs', organizationId, 'roles'],
                List(),
                (roles :List) => roles.filter((role :Map) => role.get('id') !== roleId),
              );
          }
          return state;
        },
        FAILURE: () => state.setIn([REMOVE_ROLE_FROM_ORGANIZATION, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([REMOVE_ROLE_FROM_ORGANIZATION, seqAction.id]),
      });
    }

    case revokeTrustFromOrganization.case(action.type): {
      const seqAction :SequenceAction = action;
      return revokeTrustFromOrganization.reducer(state, action, {
        REQUEST: () => state
          .setIn([REVOKE_TRUST_FROM_ORG, 'requestState'], RequestStates.PENDING)
          .setIn([REVOKE_TRUST_FROM_ORG, seqAction.id], seqAction),
        SUCCESS: () => {
          const storedSeqAction :SequenceAction = state.getIn([REVOKE_TRUST_FROM_ORG, seqAction.id]);
          if (storedSeqAction) {
            const { organizationId, trustedOrgId } = storedSeqAction.value;
            const updatedTrusted :List<UUID> = state.getIn(['orgs', organizationId, 'trustedOrgIds'], List())
              .filter((orgId :UUID) => orgId !== trustedOrgId);
            return state
              .setIn(['orgs', organizationId, 'trustedOrgIds'], updatedTrusted)
              .setIn([REVOKE_TRUST_FROM_ORG, 'requestState'], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => state.setIn([REVOKE_TRUST_FROM_ORG, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([REVOKE_TRUST_FROM_ORG, seqAction.id]),
      });
    }

    case updateOrganizationDescription.case(action.type): {
      const seqAction :SequenceAction = action;
      return updateOrganizationDescription.reducer(state, action, {
        REQUEST: () => state
          .setIn([UPDATE_ORG_DESCRIPTION, 'requestState'], RequestStates.PENDING)
          .setIn([UPDATE_ORG_DESCRIPTION, seqAction.id], seqAction),
        SUCCESS: () => {
          const storedSeqAction :SequenceAction = state.getIn([UPDATE_ORG_DESCRIPTION, seqAction.id]);
          if (storedSeqAction) {
            const { description, organizationId } = storedSeqAction.value;
            return state
              .setIn(['orgs', organizationId, 'description'], description)
              .setIn([UPDATE_ORG_DESCRIPTION, 'requestState'], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => state.setIn([UPDATE_ORG_DESCRIPTION, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([UPDATE_ORG_DESCRIPTION, seqAction.id]),
      });
    }

    case updateOrganizationTitle.case(action.type): {
      const seqAction :SequenceAction = action;
      return updateOrganizationTitle.reducer(state, action, {
        REQUEST: () => state
          .setIn([UPDATE_ORG_TITLE, 'requestState'], RequestStates.PENDING)
          .setIn([UPDATE_ORG_TITLE, seqAction.id], seqAction),
        SUCCESS: () => {
          const storedSeqAction :SequenceAction = state.getIn([UPDATE_ORG_TITLE, seqAction.id]);
          if (storedSeqAction) {
            const { title, organizationId } = storedSeqAction.value;
            return state
              .setIn(['orgs', organizationId, 'title'], title)
              .setIn([UPDATE_ORG_TITLE, 'requestState'], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => state.setIn([UPDATE_ORG_TITLE, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([UPDATE_ORG_TITLE, seqAction.id]),
      });
    }

    case updateRoleGrant.case(action.type): {
      const seqAction :SequenceAction = action;
      return updateRoleGrant.reducer(state, action, {
        REQUEST: () => state
          .setIn([UPDATE_ROLE_GRANT, 'requestState'], RequestStates.PENDING)
          .setIn([UPDATE_ROLE_GRANT, seqAction.id], seqAction),
        SUCCESS: () => {
          const storedSeqAction :SequenceAction = state.getIn([UPDATE_ROLE_GRANT, seqAction.id]);
          if (storedSeqAction) {
            const grant :Grant = storedSeqAction.value.grant;
            const organizationId :UUID = storedSeqAction.value.organizationId;
            const roleId :UUID = storedSeqAction.value.roleId;
            return state
              .setIn(['orgs', organizationId, 'grants', roleId], grant.toImmutable())
              .setIn([UPDATE_ROLE_GRANT, 'requestState'], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => state.setIn([UPDATE_ROLE_GRANT, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([UPDATE_ROLE_GRANT, seqAction.id]),
      });
    }

    default:
      return state;
  }
}

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
import { AuthUtils } from 'lattice-auth';
import { OrganizationsApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

// import Logger from '../../utils/Logger';
import { RESET_REQUEST_STATE } from '../../core/redux/ReduxActions';
import {
  GET_ORGANIZATION_DETAILS,
  GET_ORGANIZATION_PERMISSIONS,
  GET_ORGS_AND_PERMISSIONS,
  SEARCH_MEMBERS_TO_ADD_TO_ORG,
  getOrganizationDetails,
  getOrganizationPermissions,
  getOrgsAndPermissions,
  searchMembersToAddToOrg,
} from './OrgsActions';

// const LOG :Logger = new Logger('OrgsReducer');

const {
  Role,
  RoleBuilder,
} = Models;

const { PermissionTypes } = Types;

const {
  ADD_DOMAIN_TO_ORG,
  ADD_MEMBER_TO_ORG,
  CREATE_ROLE,
  DELETE_ORGANIZATION,
  DELETE_ROLE,
  GET_ORG_ENTITY_SETS,
  GET_ORG_MEMBERS,
  GRANT_TRUST_TO_ORG,
  REMOVE_DOMAIN_FROM_ORG,
  REMOVE_MEMBER_FROM_ORG,
  REVOKE_TRUST_FROM_ORG,
  UPDATE_ORG_DESCRIPTION,
  UPDATE_ORG_TITLE,
  addDomainToOrganization,
  addMemberToOrganization,
  createRole,
  deleteOrganization,
  deleteRole,
  getOrganizationEntitySets,
  getOrganizationMembers,
  grantTrustToOrganization,
  removeDomainFromOrganization,
  removeMemberFromOrganization,
  revokeTrustFromOrganization,
  updateOrganizationDescription,
  updateOrganizationTitle,
} = OrganizationsApiActions;

const INITIAL_STATE :Map = fromJS({
  [ADD_DOMAIN_TO_ORG]: {
    requestState: RequestStates.STANDBY,
  },
  [CREATE_ROLE]: {
    requestState: RequestStates.STANDBY,
  },
  [DELETE_ORGANIZATION]: {
    requestState: RequestStates.STANDBY,
  },
  [DELETE_ROLE]: {
    requestState: RequestStates.STANDBY,
  },
  [GET_ORGS_AND_PERMISSIONS]: {
    requestState: RequestStates.STANDBY,
  },
  [GET_ORGANIZATION_DETAILS]: {
    requestState: RequestStates.STANDBY,
  },
  [GET_ORGANIZATION_PERMISSIONS]: {
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
  [REMOVE_DOMAIN_FROM_ORG]: {
    requestState: RequestStates.STANDBY,
  },
  [REMOVE_MEMBER_FROM_ORG]: {
    requestState: RequestStates.STANDBY,
  },
  [REVOKE_TRUST_FROM_ORG]: {
    requestState: RequestStates.STANDBY,
  },
  [SEARCH_MEMBERS_TO_ADD_TO_ORG]: {
    requestState: RequestStates.STANDBY,
  },
  [UPDATE_ORG_DESCRIPTION]: {
    requestState: RequestStates.STANDBY,
  },
  [UPDATE_ORG_TITLE]: {
    requestState: RequestStates.STANDBY,
  },
  isMemberOfOrgIds: Set(),
  isOwnerOfOrgIds: Set(),
  memberSearchResults: Map(),
  orgAcls: Map(),
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
            const { memberId } = storedSeqAction.value;
            return state
              .deleteIn(['memberSearchResults', memberId])
              .setIn([ADD_MEMBER_TO_ORG, 'requestState'], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => state.setIn([ADD_MEMBER_TO_ORG, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ADD_MEMBER_TO_ORG, seqAction.id]),
      });
    }

    case createRole.case(action.type): {
      const seqAction :SequenceAction = action;
      return createRole.reducer(state, action, {
        REQUEST: () => state
          .setIn([CREATE_ROLE, 'requestState'], RequestStates.PENDING)
          .setIn([CREATE_ROLE, seqAction.id], seqAction),
        SUCCESS: () => {
          const storedSeqAction :SequenceAction = state.getIn([CREATE_ROLE, seqAction.id]);
          if (storedSeqAction) {
            const roleId :UUID = seqAction.value;
            const role :Role = storedSeqAction.value;
            const newRole :Role = (new RoleBuilder())
              .setDescription(role.description)
              .setId(roleId)
              .setOrganizationId(role.organizationId)
              .setPrincipal(role.principal)
              .setTitle(role.title)
              .build();
            const updatedRoles :List<Map> = state
              .getIn(['orgs', role.organizationId, 'roles'], List())
              .push(newRole.toImmutable());
            return state
              .setIn(['orgs', role.organizationId, 'roles'], updatedRoles)
              .setIn([CREATE_ROLE, 'requestState'], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => state.setIn([CREATE_ROLE, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([CREATE_ROLE, seqAction.id]),
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
              .deleteIn(['orgs', 'isMemberOfOrgIds', organizationId])
              .deleteIn(['orgs', 'isOwnerOfOrgIds', organizationId])
              .setIn([DELETE_ORGANIZATION, 'requestState'], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => state.setIn([DELETE_ORGANIZATION, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([DELETE_ORGANIZATION, seqAction.id]),
      });
    }

    case deleteRole.case(action.type): {
      const seqAction :SequenceAction = action;
      return deleteRole.reducer(state, action, {
        REQUEST: () => state
          .setIn([DELETE_ROLE, 'requestState'], RequestStates.PENDING)
          .setIn([DELETE_ROLE, seqAction.id], seqAction),
        SUCCESS: () => {
          const storedSeqAction :SequenceAction = state.getIn([DELETE_ROLE, seqAction.id]);
          if (storedSeqAction) {
            const { organizationId, roleId } = storedSeqAction.value;
            const currentRoles :List<Map> = state.getIn(['orgs', organizationId, 'roles'], List());
            const updatedRoles :List<Map> = currentRoles.filter((role :Map) => role.get('id') !== roleId);
            return state
              .setIn(['orgs', organizationId, 'roles'], updatedRoles)
              .setIn([DELETE_ROLE, 'requestState'], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => state.setIn([DELETE_ROLE, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([DELETE_ROLE, seqAction.id]),
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
          const userInfo :Object = AuthUtils.getUserInfo() || { id: '' };
          const userId :string = userInfo.id;

          const isOwnerOfOrgIds :Set<UUID> = organizations
            .filter((org :Map) => permissions.getIn([org.get('id'), PermissionTypes.OWNER]) === true)
            .keySeq()
            .toSet();

          const isMemberOfOrgIds :Set<UUID> = organizations
            .filter((org :Map) => {
              if (isOwnerOfOrgIds.has(org.get('id'))) {
                return false;
              }
              return org.get('members', List()).findIndex((member :Map) => member.get('id') === userId) !== -1;
            })
            .keySeq()
            .toSet();

          return state
            .set('isMemberOfOrgIds', isMemberOfOrgIds)
            .set('isOwnerOfOrgIds', isOwnerOfOrgIds)
            .set('orgs', organizations)
            .setIn([GET_ORGS_AND_PERMISSIONS, 'requestState'], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .set('isMemberOfOrgIds', Set())
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

    case getOrganizationPermissions.case(action.type): {
      const seqAction :SequenceAction = action;
      return getOrganizationPermissions.reducer(state, action, {
        REQUEST: () => state
          .setIn([GET_ORGANIZATION_PERMISSIONS, 'requestState'], RequestStates.PENDING)
          .setIn([GET_ORGANIZATION_PERMISSIONS, seqAction.id], seqAction),
        SUCCESS: () => {
          const storedSeqAction :SequenceAction = state.getIn([GET_ORGANIZATION_PERMISSIONS, seqAction.id]);
          if (storedSeqAction) {
            const organizationId :UUID = storedSeqAction.value;
            return state
              .setIn(['orgAcls', organizationId], seqAction.value)
              .setIn([GET_ORGANIZATION_PERMISSIONS, 'requestState'], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => {
          const storedSeqAction :SequenceAction = state.getIn([GET_ORGANIZATION_PERMISSIONS, seqAction.id]);
          if (storedSeqAction) {
            const organizationId :UUID = storedSeqAction.value;
            return state
              .setIn([GET_ORGANIZATION_PERMISSIONS, 'requestState'], RequestStates.FAILURE)
              .setIn(['orgAcls', organizationId], List());
          }
          return state.setIn([GET_ORGANIZATION_PERMISSIONS, 'requestState'], RequestStates.FAILURE);
        },
        FINALLY: () => state.deleteIn([GET_ORGANIZATION_PERMISSIONS, seqAction.id]),
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
            const updatedMembers :List<Map> = state.getIn(['orgs', organizationId, 'members'])
              .filter((member :Map) => member.getIn(['profile', 'user_id']) !== memberId);
            return state
              .setIn(['orgs', organizationId, 'members'], updatedMembers)
              .setIn([REMOVE_MEMBER_FROM_ORG, 'requestState'], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => state.setIn([REMOVE_MEMBER_FROM_ORG, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([REMOVE_MEMBER_FROM_ORG, seqAction.id]),
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

    case searchMembersToAddToOrg.case(action.type): {
      const seqAction :SequenceAction = action;
      return searchMembersToAddToOrg.reducer(state, action, {
        REQUEST: () => state
          .setIn([SEARCH_MEMBERS_TO_ADD_TO_ORG, 'requestState'], RequestStates.PENDING)
          .setIn([SEARCH_MEMBERS_TO_ADD_TO_ORG, seqAction.id], seqAction),
        SUCCESS: () => {
          const storedSeqAction :SequenceAction = state.getIn([SEARCH_MEMBERS_TO_ADD_TO_ORG, seqAction.id]);
          if (storedSeqAction) {
            const { organizationId } = storedSeqAction.value;
            const orgMembers :List<Map> = state.getIn(['orgs', organizationId, 'members'], List());
            const memberSearchResults = fromJS(seqAction.value)
              .filter((user :Map) => {
                const index = orgMembers.findIndex(
                  (member :Map) => member.getIn(['profile', 'user_id']) === user.get('user_id')
                );
                return index === -1; // user is already a member
              });
            return state
              .set('memberSearchResults', memberSearchResults)
              .setIn([SEARCH_MEMBERS_TO_ADD_TO_ORG, 'requestState'], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => state.setIn([SEARCH_MEMBERS_TO_ADD_TO_ORG, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([SEARCH_MEMBERS_TO_ADD_TO_ORG, seqAction.id]),
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

    default:
      return state;
  }
}

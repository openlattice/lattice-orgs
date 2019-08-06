/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import { Models } from 'lattice';
import { OrganizationsApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { RESET_REQUEST_STATE } from '../../core/redux/ReduxActions';
import {
  GET_ORGANIZATION_DETAILS,
  SEARCH_MEMBERS_TO_ADD_TO_ORG,
  getOrganizationDetails,
  searchMembersToAddToOrg,
} from './OrgsActions';

const {
  Role,
  RoleBuilder,
} = Models;

const {
  ADD_AUTO_APPROVED_DOMAIN,
  ADD_MEMBER_TO_ORGANIZATION,
  CREATE_ROLE,
  DELETE_ROLE,
  GET_ALL_ORGANIZATIONS,
  REMOVE_AUTO_APPROVED_DOMAIN,
  REMOVE_MEMBER_FROM_ORGANIZATION,
  addAutoApprovedDomain,
  addMemberToOrganization,
  createRole,
  deleteRole,
  getAllOrganizations,
  removeAutoApprovedDomain,
  removeMemberFromOrganization,
} = OrganizationsApiActions;

const INITIAL_STATE :Map<*, *> = fromJS({
  [ADD_AUTO_APPROVED_DOMAIN]: {
    requestState: RequestStates.STANDBY,
  },
  [CREATE_ROLE]: {
    requestState: RequestStates.STANDBY,
  },
  [DELETE_ROLE]: {
    requestState: RequestStates.STANDBY,
  },
  [GET_ALL_ORGANIZATIONS]: {
    requestState: RequestStates.STANDBY,
  },
  [GET_ORGANIZATION_DETAILS]: {
    requestState: RequestStates.STANDBY,
  },
  [REMOVE_AUTO_APPROVED_DOMAIN]: {
    requestState: RequestStates.STANDBY,
  },
  [REMOVE_MEMBER_FROM_ORGANIZATION]: {
    requestState: RequestStates.STANDBY,
  },
  [SEARCH_MEMBERS_TO_ADD_TO_ORG]: {
    requestState: RequestStates.STANDBY,
  },
  memberSearchResults: Map(),
  orgs: Map(),
});

export default function orgsReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case RESET_REQUEST_STATE: {
      const { actionType } = action;
      if (actionType && state.has(actionType)) {
        return state.setIn([actionType, 'requestState'], RequestStates.STANDBY);
      }
      return state;
    }

    case addAutoApprovedDomain.case(action.type): {
      const seqAction :SequenceAction = action;
      return addAutoApprovedDomain.reducer(state, action, {
        REQUEST: () => state
          .setIn([ADD_AUTO_APPROVED_DOMAIN, 'requestState'], RequestStates.PENDING)
          .setIn([ADD_AUTO_APPROVED_DOMAIN, seqAction.id], seqAction),
        SUCCESS: () => {
          const storedSeqAction :SequenceAction = state.getIn([ADD_AUTO_APPROVED_DOMAIN, seqAction.id]);
          if (storedSeqAction) {
            const { domain, organizationId } = storedSeqAction.value;
            const currentDomains :List<string> = state.getIn(['orgs', organizationId, 'emails'], List());
            const updatedDomains :Set<string> = currentDomains.push(domain);
            return state
              .setIn(['orgs', organizationId, 'emails'], updatedDomains)
              .setIn([ADD_AUTO_APPROVED_DOMAIN, 'requestState'], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => state.setIn([ADD_AUTO_APPROVED_DOMAIN, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ADD_AUTO_APPROVED_DOMAIN, seqAction.id]),
      });
    }

    case addMemberToOrganization.case(action.type): {
      const seqAction :SequenceAction = action;
      return addMemberToOrganization.reducer(state, action, {
        REQUEST: () => state
          .setIn([ADD_MEMBER_TO_ORGANIZATION, 'requestState'], RequestStates.PENDING)
          .setIn([ADD_MEMBER_TO_ORGANIZATION, seqAction.id], seqAction),
        SUCCESS: () => {
          const storedSeqAction :SequenceAction = state.getIn([ADD_MEMBER_TO_ORGANIZATION, seqAction.id]);
          if (storedSeqAction) {
            const { memberId } = storedSeqAction.value;
            return state
              .deleteIn(['memberSearchResults', memberId])
              .setIn([ADD_MEMBER_TO_ORGANIZATION, 'requestState'], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => state.setIn([ADD_MEMBER_TO_ORGANIZATION, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ADD_MEMBER_TO_ORGANIZATION, seqAction.id]),
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
            const roleId :UUID = action.value;
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

    case getAllOrganizations.case(action.type): {
      const seqAction :SequenceAction = action;
      return getAllOrganizations.reducer(state, action, {
        REQUEST: () => state
          .setIn([GET_ALL_ORGANIZATIONS, 'requestState'], RequestStates.PENDING)
          .setIn([GET_ALL_ORGANIZATIONS, seqAction.id], seqAction),
        SUCCESS: () => {

          const orgs :List = fromJS(seqAction.value);
          const orgsMap :Map = Map().withMutations((map :Map) => {
            orgs.forEach((org :Map) => map.set(org.get('id'), org));
          });

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

          return state
            .set('orgs', orgsMap)
            .setIn([GET_ALL_ORGANIZATIONS, 'requestState'], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .set('orgs', Map())
          .setIn([GET_ALL_ORGANIZATIONS, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([GET_ALL_ORGANIZATIONS, seqAction.id]),
      });
    }

    case getOrganizationDetails.case(action.type): {
      const seqAction :SequenceAction = action;
      return getOrganizationDetails.reducer(state, action, {
        REQUEST: () => state
          .setIn([GET_ORGANIZATION_DETAILS, 'requestState'], RequestStates.PENDING)
          .setIn([GET_ORGANIZATION_DETAILS, seqAction.id], seqAction),
        SUCCESS: () => {
          const org :Map = fromJS(seqAction.value);
          const orgId :UUID = org.get('id');
          return state
            .setIn(['orgs', orgId], org)
            .setIn([GET_ORGANIZATION_DETAILS, 'requestState'], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([GET_ORGANIZATION_DETAILS, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([GET_ORGANIZATION_DETAILS, seqAction.id]),
      });
    }

    case removeAutoApprovedDomain.case(action.type): {
      const seqAction :SequenceAction = action;
      return removeAutoApprovedDomain.reducer(state, action, {
        REQUEST: () => state
          .setIn([REMOVE_AUTO_APPROVED_DOMAIN, 'requestState'], RequestStates.PENDING)
          .setIn([REMOVE_AUTO_APPROVED_DOMAIN, seqAction.id], seqAction),
        SUCCESS: () => {
          const storedSeqAction :SequenceAction = state.getIn([REMOVE_AUTO_APPROVED_DOMAIN, seqAction.id]);
          if (storedSeqAction) {
            const { domain, organizationId } = storedSeqAction.value;
            const currentDomains :List<string> = state.getIn(['orgs', organizationId, 'emails'], List());
            const updatedDomains :List<string> = currentDomains.filter(currentDomain => currentDomain !== domain);
            return state
              .setIn(['orgs', organizationId, 'emails'], updatedDomains)
              .setIn([REMOVE_AUTO_APPROVED_DOMAIN, 'requestState'], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => state.setIn([REMOVE_AUTO_APPROVED_DOMAIN, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([REMOVE_AUTO_APPROVED_DOMAIN, seqAction.id]),
      });
    }

    case removeMemberFromOrganization.case(action.type): {
      const seqAction :SequenceAction = action;
      return removeMemberFromOrganization.reducer(state, action, {
        REQUEST: () => state
          .setIn([REMOVE_MEMBER_FROM_ORGANIZATION, 'requestState'], RequestStates.PENDING)
          .setIn([REMOVE_MEMBER_FROM_ORGANIZATION, seqAction.id], seqAction),
        SUCCESS: () => {
          const storedSeqAction :SequenceAction = state.getIn([REMOVE_MEMBER_FROM_ORGANIZATION, seqAction.id]);
          if (storedSeqAction) {
            const { memberId, organizationId } = storedSeqAction.value;
            const updatedMembers :List<Map> = state.getIn(['orgs', organizationId, 'members'])
              .filter((member :Map) => member.getIn(['profile', 'user_id']) !== memberId);
            return state
              .setIn(['orgs', organizationId, 'members'], updatedMembers)
              .setIn([REMOVE_MEMBER_FROM_ORGANIZATION, 'requestState'], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => state.setIn([REMOVE_MEMBER_FROM_ORGANIZATION, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([REMOVE_MEMBER_FROM_ORGANIZATION, seqAction.id]),
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

    default:
      return state;
  }
}

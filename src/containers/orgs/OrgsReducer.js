/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import { Models, Types } from 'lattice';
import { OrganizationsApiActions } from 'lattice-sagas';
import { ReduxConstants } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';
import type { OrganizationObject, UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_ORGANIZATIONS_AND_AUTHORIZATIONS,
  INITIALIZE_ORGANIZATION,
  getOrganizationsAndAuthorizations,
  initializeOrganization,
} from './OrgsActions';

import { ReduxActions } from '../../core/redux';
import {
  ERROR,
  IS_OWNER,
  MEMBERS,
  ORGANIZATIONS,
  RS_INITIAL_STATE,
} from '../../core/redux/constants';
import { PersonUtils } from '../../utils';
import type { AuthorizationObject } from '../../types';

const {
  Organization,
  OrganizationBuilder,
  Principal,
  PrincipalBuilder,
} = Models;
const { PermissionTypes, PrincipalTypes } = Types;

const {
  ADD_MEMBER_TO_ORGANIZATION,
  GET_ORGANIZATION_MEMBERS,
  REMOVE_MEMBER_FROM_ORGANIZATION,
  addMemberToOrganization,
  getOrganizationMembers,
  removeMemberFromOrganization,
} = OrganizationsApiActions;

const { RESET_REQUEST_STATE } = ReduxActions;
const { REQUEST_STATE } = ReduxConstants;
const { getUserId } = PersonUtils;

const INITIAL_STATE :Map = fromJS({
  // actions
  [ADD_MEMBER_TO_ORGANIZATION]: RS_INITIAL_STATE,
  [GET_ORGANIZATIONS_AND_AUTHORIZATIONS]: RS_INITIAL_STATE,
  [GET_ORGANIZATION_MEMBERS]: RS_INITIAL_STATE,
  [INITIALIZE_ORGANIZATION]: RS_INITIAL_STATE,
  [REMOVE_MEMBER_FROM_ORGANIZATION]: RS_INITIAL_STATE,
  // data
  [IS_OWNER]: Map(),
  [MEMBERS]: Map(),
  [ORGANIZATIONS]: Map(),
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

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
          const storedSeqAction :SequenceAction = state.getIn([ADD_MEMBER_TO_ORGANIZATION, seqAction.id]);
          if (storedSeqAction) {

            const { memberId, organizationId, user } = storedSeqAction.value;
            const memberPrincipal :Principal = (new PrincipalBuilder())
              .setId(memberId)
              .setType(PrincipalTypes.USER)
              .build();

            const orgMemberObject = fromJS({
              principal: { principal: memberPrincipal.toImmutable() },
              profile: user,
            });

            const currentOrg :Organization = state.getIn([ORGANIZATIONS, organizationId]);
            const updatedOrg :Map = currentOrg
              .toImmutable()
              .update(MEMBERS, (members :List = List()) => members.push(memberPrincipal));

            return state
              .updateIn(
                [MEMBERS, organizationId],
                (members :List = List()) => members.push(orgMemberObject),
              )
              .setIn([ORGANIZATIONS, organizationId], (new OrganizationBuilder(updatedOrg)).build())
              .setIn([ADD_MEMBER_TO_ORGANIZATION, REQUEST_STATE], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => state
          .setIn([ADD_MEMBER_TO_ORGANIZATION, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state
          .deleteIn([ADD_MEMBER_TO_ORGANIZATION, seqAction.id]),
      });
    }

    case getOrganizationsAndAuthorizations.case(action.type): {
      const seqAction :SequenceAction = action;
      return getOrganizationsAndAuthorizations.reducer(state, action, {
        REQUEST: () => state
          .setIn([GET_ORGANIZATIONS_AND_AUTHORIZATIONS, REQUEST_STATE], RequestStates.PENDING)
          .setIn([GET_ORGANIZATIONS_AND_AUTHORIZATIONS, seqAction.id], seqAction),
        SUCCESS: () => {

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
            .set(ORGANIZATIONS, organizationsMap.asImmutable())
            .setIn([GET_ORGANIZATIONS_AND_AUTHORIZATIONS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .set(ORGANIZATIONS, Map())
          .setIn([GET_ORGANIZATIONS_AND_AUTHORIZATIONS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state
          .deleteIn([GET_ORGANIZATIONS_AND_AUTHORIZATIONS, seqAction.id]),
      });
    }

    case getOrganizationMembers.case(action.type): {
      const seqAction :SequenceAction = action;
      return getOrganizationMembers.reducer(state, action, {
        REQUEST: () => state
          .setIn([GET_ORGANIZATION_MEMBERS, REQUEST_STATE], RequestStates.PENDING)
          .setIn([GET_ORGANIZATION_MEMBERS, seqAction.id], seqAction),
        SUCCESS: () => {
          const storedSeqAction :SequenceAction = state.getIn([GET_ORGANIZATION_MEMBERS, seqAction.id]);
          if (storedSeqAction) {
            const organizationId :UUID = storedSeqAction.value;
            return state
              .setIn([MEMBERS, organizationId], fromJS(seqAction.value))
              .setIn([GET_ORGANIZATION_MEMBERS, REQUEST_STATE], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => {
          const storedSeqAction :SequenceAction = state.getIn([GET_ORGANIZATION_MEMBERS, seqAction.id]);
          if (storedSeqAction) {
            const organizationId :UUID = storedSeqAction.value;
            return state
              .setIn([MEMBERS, organizationId], List())
              .setIn([GET_ORGANIZATION_MEMBERS, REQUEST_STATE], RequestStates.FAILURE);
          }
          return state.setIn([GET_ORGANIZATION_MEMBERS, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => state
          .deleteIn([GET_ORGANIZATION_MEMBERS, seqAction.id]),
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
              .setIn([ORGANIZATIONS, organization.id], organization)
              .setIn([INITIALIZE_ORGANIZATION, REQUEST_STATE], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => state
          .setIn([INITIALIZE_ORGANIZATION, ERROR], seqAction.value)
          .setIn([INITIALIZE_ORGANIZATION, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state
          .deleteIn([INITIALIZE_ORGANIZATION, seqAction.id]),
      });
    }

    case removeMemberFromOrganization.case(action.type): {
      const seqAction :SequenceAction = action;
      return removeMemberFromOrganization.reducer(state, action, {
        REQUEST: () => state
          .setIn([REMOVE_MEMBER_FROM_ORGANIZATION, REQUEST_STATE], RequestStates.PENDING)
          .setIn([REMOVE_MEMBER_FROM_ORGANIZATION, seqAction.id], seqAction),
        SUCCESS: () => {
          const storedSeqAction :SequenceAction = state.getIn([REMOVE_MEMBER_FROM_ORGANIZATION, seqAction.id]);
          if (storedSeqAction) {

            const { memberId, organizationId } = storedSeqAction.value;
            const currentOrg :Organization = state.getIn([ORGANIZATIONS, organizationId]);
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
              .setIn([ORGANIZATIONS, organizationId], (new OrganizationBuilder(updatedOrg)).build())
              .setIn([REMOVE_MEMBER_FROM_ORGANIZATION, REQUEST_STATE], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => state
          .setIn([REMOVE_MEMBER_FROM_ORGANIZATION, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state
          .deleteIn([REMOVE_MEMBER_FROM_ORGANIZATION, seqAction.id]),
      });
    }

    default:
      return state;
  }
}

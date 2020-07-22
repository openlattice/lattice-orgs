/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import { Models, Types } from 'lattice';
import { DataSetsApiActions, OrganizationsApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';

import reducer from './OrgsReducer';
import {
  ADD_CONNECTION,
  ADD_ROLE_TO_ORGANIZATION,
  GET_ORGANIZATION_ACLS,
  GET_ORGANIZATION_DETAILS,
  GET_ORGS_AND_PERMISSIONS,
  REMOVE_CONNECTION,
  REMOVE_ROLE_FROM_ORGANIZATION,
  addRoleToOrganization,
  removeRoleFromOrganization,
} from './OrgsActions';

import { MOCK_ORG, MOCK_ORG_ROLE } from '../../utils/testing/MockData';
import { genRandomUUID } from '../../utils/testing/MockUtils';

const {
  PrincipalTypes,
} = Types;

const {
  Principal,
  PrincipalBuilder,
  Role,
  RoleBuilder,
} = Models;

const { GET_ORGANIZATION_DATA_SETS } = DataSetsApiActions;

const {
  ADD_DOMAINS_TO_ORGANIZATION,
  ADD_MEMBER_TO_ORGANIZATION,
  ADD_ROLE_TO_MEMBER,
  CREATE_ORGANIZATION,
  DELETE_ORGANIZATION,
  GET_ORGANIZATION_ENTITY_SETS,
  GET_ORGANIZATION_MEMBERS,
  GRANT_TRUST_TO_ORGANIZATION,
  REMOVE_DOMAINS_FROM_ORGANIZATION,
  REMOVE_MEMBER_FROM_ORGANIZATION,
  REMOVE_ROLE_FROM_MEMBER,
  REVOKE_TRUST_FROM_ORGANIZATION,
  UPDATE_ORGANIZATION_DESCRIPTION,
  UPDATE_ORGANIZATION_TITLE,
  UPDATE_ROLE_GRANT,
  addMemberToOrganization,
  addRoleToMember,
  removeMemberFromOrganization,
  removeRoleFromMember,
} = OrganizationsApiActions;

const MOCK_USER_PRINCIPAL :Principal = (new PrincipalBuilder())
  .setId('MockUserPrincipalId')
  .setType(PrincipalTypes.USER)
  .build();

describe('OrgsReducer', () => {

  const INITIAL_STATE = reducer(undefined, { type: '__TEST__' });

  test('INITIAL_STATE', () => {
    expect(INITIAL_STATE).toBeInstanceOf(Map);
    expect(INITIAL_STATE.toJS()).toEqual({
      [ADD_CONNECTION]: {
        requestState: RequestStates.STANDBY,
      },
      [ADD_DOMAINS_TO_ORGANIZATION]: {
        requestState: RequestStates.STANDBY,
      },
      [ADD_MEMBER_TO_ORGANIZATION]: {
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
      [GET_ORGANIZATION_DATA_SETS]: {
        requestState: RequestStates.STANDBY,
      },
      [GET_ORGANIZATION_DETAILS]: {
        requestState: RequestStates.STANDBY,
      },
      [GET_ORGANIZATION_ENTITY_SETS]: {
        requestState: RequestStates.STANDBY,
      },
      [GET_ORGANIZATION_MEMBERS]: {
        requestState: RequestStates.STANDBY,
      },
      [GRANT_TRUST_TO_ORGANIZATION]: {
        requestState: RequestStates.STANDBY,
      },
      [REMOVE_CONNECTION]: {
        requestState: RequestStates.STANDBY,
      },
      [REMOVE_DOMAINS_FROM_ORGANIZATION]: {
        requestState: RequestStates.STANDBY,
      },
      [REMOVE_MEMBER_FROM_ORGANIZATION]: {
        requestState: RequestStates.STANDBY,
      },
      [REMOVE_ROLE_FROM_MEMBER]: {
        requestState: RequestStates.STANDBY,
      },
      [REMOVE_ROLE_FROM_ORGANIZATION]: {
        requestState: RequestStates.STANDBY,
      },
      [REVOKE_TRUST_FROM_ORGANIZATION]: {
        requestState: RequestStates.STANDBY,
      },
      [UPDATE_ORGANIZATION_DESCRIPTION]: {
        requestState: RequestStates.STANDBY,
      },
      [UPDATE_ORGANIZATION_TITLE]: {
        requestState: RequestStates.STANDBY,
      },
      [UPDATE_ROLE_GRANT]: {
        requestState: RequestStates.STANDBY,
      },
      isOwnerOfOrgIds: [],
      newlyCreatedOrgId: undefined,
      orgACLs: {},
      orgDataSets: {},
      orgEntitySets: {},
      orgMembers: {},
      orgs: {},
    });
  });

  describe(ADD_MEMBER_TO_ORGANIZATION, () => {

    // the structure of this object isn't 100% accurate, but it's enough to make things work
    const existingOrgMember = fromJS({
      principal: {
        principal: MOCK_ORG.members[0].toImmutable(),
      },
      profile: {
        user_id: MOCK_ORG.members[0].id,
      },
    });

    // the structure of this object isn't 100% accurate, but it's enough to make things work
    const mockOrgMember = fromJS({
      principal: {
        principal: MOCK_USER_PRINCIPAL.toImmutable(),
      },
      profile: {
        user_id: MOCK_USER_PRINCIPAL.id,
      },
    });

    const initialState = INITIAL_STATE
      .setIn(['orgs', MOCK_ORG.id], MOCK_ORG.toImmutable())
      .setIn(['orgMembers', MOCK_ORG.id], List().push(existingOrgMember));

    const requestActionValue = {
      memberId: MOCK_USER_PRINCIPAL.id,
      organizationId: MOCK_ORG.id,
    };

    test(addMemberToOrganization.REQUEST, () => {

      const { id } = addMemberToOrganization();
      const requestAction = addMemberToOrganization.request(id, requestActionValue);
      const state = reducer(initialState, requestAction);

      expect(state.getIn([ADD_MEMBER_TO_ORGANIZATION, 'requestState'])).toEqual(RequestStates.PENDING);
      expect(state.getIn([ADD_MEMBER_TO_ORGANIZATION, id])).toEqual(requestAction);
      expect(state.get('orgs').hashCode()).toEqual(initialState.get('orgs').hashCode());
      expect(state.get('orgs').equals(initialState.get('orgs'))).toEqual(true);
      expect(state.get('orgMembers').hashCode()).toEqual(initialState.get('orgMembers').hashCode());
      expect(state.get('orgMembers').equals(initialState.get('orgMembers'))).toEqual(true);
    });

    test(addMemberToOrganization.SUCCESS, () => {

      const { id } = addMemberToOrganization();
      const requestAction = addMemberToOrganization.request(id, requestActionValue);
      let state = reducer(initialState, requestAction);
      state = reducer(state, addMemberToOrganization.success(id));

      expect(state.getIn([ADD_MEMBER_TO_ORGANIZATION, 'requestState'])).toEqual(RequestStates.SUCCESS);
      expect(state.getIn([ADD_MEMBER_TO_ORGANIZATION, id])).toEqual(requestAction);

      const expectedOrgs = Map().set(
        MOCK_ORG.id,
        MOCK_ORG.toImmutable().update('members', (m :List) => m.push(MOCK_USER_PRINCIPAL.toImmutable()))
      );
      expect(state.get('orgs').hashCode()).toEqual(expectedOrgs.hashCode());
      expect(state.get('orgs').equals(expectedOrgs)).toEqual(true);

      const expectedOrgMembers = Map().set(
        MOCK_ORG.id,
        initialState.getIn(['orgMembers', MOCK_ORG.id]).push(mockOrgMember),
      );
      expect(state.get('orgMembers').hashCode()).toEqual(expectedOrgMembers.hashCode());
      expect(state.get('orgMembers').equals(expectedOrgMembers)).toEqual(true);
    });

    test(addMemberToOrganization.FAILURE, () => {

      const { id } = addMemberToOrganization();
      const requestAction = addMemberToOrganization.request(id, requestActionValue);
      let state = reducer(initialState, requestAction);
      state = reducer(state, addMemberToOrganization.failure(id));

      expect(state.getIn([ADD_MEMBER_TO_ORGANIZATION, 'requestState'])).toEqual(RequestStates.FAILURE);
      expect(state.getIn([ADD_MEMBER_TO_ORGANIZATION, id])).toEqual(requestAction);
      expect(state.get('orgs').hashCode()).toEqual(initialState.get('orgs').hashCode());
      expect(state.get('orgs').equals(initialState.get('orgs'))).toEqual(true);
      expect(state.get('orgMembers').hashCode()).toEqual(initialState.get('orgMembers').hashCode());
      expect(state.get('orgMembers').equals(initialState.get('orgMembers'))).toEqual(true);
    });

    test(addMemberToOrganization.FINALLY, () => {

      const { id } = addMemberToOrganization();
      const requestAction = addMemberToOrganization.request(id, requestActionValue);
      let state = reducer(initialState, requestAction);

      state = reducer(state, addMemberToOrganization.success(id));
      expect(state.getIn([ADD_MEMBER_TO_ORGANIZATION, 'requestState'])).toEqual(RequestStates.SUCCESS);
      expect(state.getIn([ADD_MEMBER_TO_ORGANIZATION, id])).toEqual(requestAction);

      state = reducer(state, addMemberToOrganization.finally(id));
      expect(state.getIn([ADD_MEMBER_TO_ORGANIZATION, 'requestState'])).toEqual(RequestStates.SUCCESS);
      expect(state.hasIn([ADD_MEMBER_TO_ORGANIZATION, id])).toEqual(false);
    });

  });

  describe(ADD_ROLE_TO_MEMBER, () => {

    // the structure of this object isn't 100% accurate, but it's enough to make things work
    const mockOrgMember = fromJS({
      principal: MOCK_USER_PRINCIPAL.toImmutable(),
      roles: [],
    });

    const initialState = INITIAL_STATE
      .setIn(['orgs', MOCK_ORG.id], MOCK_ORG.toImmutable())
      .setIn(['orgMembers', MOCK_ORG.id], List().push(mockOrgMember));

    const requestActionValue = {
      memberId: MOCK_USER_PRINCIPAL.id,
      organizationId: MOCK_ORG.id,
      roleId: MOCK_ORG_ROLE.id,
    };

    test(addRoleToMember.REQUEST, () => {

      const { id } = addRoleToMember();
      const requestAction = addRoleToMember.request(id, requestActionValue);
      const state = reducer(initialState, requestAction);

      expect(state.getIn([ADD_ROLE_TO_MEMBER, 'requestState'])).toEqual(RequestStates.PENDING);
      expect(state.getIn([ADD_ROLE_TO_MEMBER, id])).toEqual(requestAction);
      expect(state.get('orgs').hashCode()).toEqual(initialState.get('orgs').hashCode());
      expect(state.get('orgs').equals(initialState.get('orgs'))).toEqual(true);
      expect(state.get('orgMembers').hashCode()).toEqual(initialState.get('orgMembers').hashCode());
      expect(state.get('orgMembers').equals(initialState.get('orgMembers'))).toEqual(true);
    });

    test(addRoleToMember.SUCCESS, () => {

      const { id } = addRoleToMember();
      const requestAction = addRoleToMember.request(id, requestActionValue);
      let state = reducer(initialState, requestAction);
      state = reducer(state, addRoleToMember.success(id));

      expect(state.getIn([ADD_ROLE_TO_MEMBER, 'requestState'])).toEqual(RequestStates.SUCCESS);
      expect(state.getIn([ADD_ROLE_TO_MEMBER, id])).toEqual(requestAction);
      expect(state.get('orgs').hashCode()).toEqual(initialState.get('orgs').hashCode());
      expect(state.get('orgs').equals(initialState.get('orgs'))).toEqual(true);

      const expectedOrgMembers = Map().set(
        MOCK_ORG.id,
        List().push(mockOrgMember.set('roles', List().push(MOCK_ORG_ROLE.toImmutable()))),
      );
      expect(state.get('orgMembers').hashCode()).toEqual(expectedOrgMembers.hashCode());
      expect(state.get('orgMembers').equals(expectedOrgMembers)).toEqual(true);
    });

    test(addRoleToMember.FAILURE, () => {

      const { id } = addRoleToMember();
      const requestAction = addRoleToMember.request(id, requestActionValue);
      let state = reducer(initialState, requestAction);
      state = reducer(state, addRoleToMember.failure(id));

      expect(state.getIn([ADD_ROLE_TO_MEMBER, 'requestState'])).toEqual(RequestStates.FAILURE);
      expect(state.getIn([ADD_ROLE_TO_MEMBER, id])).toEqual(requestAction);
      expect(state.get('orgs').hashCode()).toEqual(initialState.get('orgs').hashCode());
      expect(state.get('orgs').equals(initialState.get('orgs'))).toEqual(true);
      expect(state.get('orgMembers').hashCode()).toEqual(initialState.get('orgMembers').hashCode());
      expect(state.get('orgMembers').equals(initialState.get('orgMembers'))).toEqual(true);
    });

    test(addRoleToMember.FINALLY, () => {

      const { id } = addRoleToMember();
      const requestAction = addRoleToMember.request(id, requestActionValue);
      let state = reducer(initialState, requestAction);

      state = reducer(state, addRoleToMember.success(id));
      expect(state.getIn([ADD_ROLE_TO_MEMBER, 'requestState'])).toEqual(RequestStates.SUCCESS);
      expect(state.getIn([ADD_ROLE_TO_MEMBER, id])).toEqual(requestAction);

      state = reducer(state, addRoleToMember.finally(id));
      expect(state.getIn([ADD_ROLE_TO_MEMBER, 'requestState'])).toEqual(RequestStates.SUCCESS);
      expect(state.hasIn([ADD_ROLE_TO_MEMBER, id])).toEqual(false);
    });

  });

  describe(ADD_ROLE_TO_ORGANIZATION, () => {

    const mockNewRole :Role = (new RoleBuilder())
      .setDescription('MockNewRoleDescription')
      .setId(genRandomUUID())
      // $FlowFixMe
      .setOrganizationId(MOCK_ORG.id)
      .setPrincipal(
        (new PrincipalBuilder())
          .setId('MockNewRolePrincipalId')
          .setType(PrincipalTypes.USER)
          .build()
      )
      .setTitle('MockNewRoleTitle')
      .build();

    const initialState = INITIAL_STATE
      .setIn(['orgs', MOCK_ORG.id], MOCK_ORG.toImmutable());

    const requestActionValue = { organizationId: MOCK_ORG.id, roleTitle: mockNewRole.title };

    test(addRoleToOrganization.REQUEST, () => {

      const { id } = addRoleToOrganization();
      const requestAction = addRoleToOrganization.request(id, requestActionValue);
      const state = reducer(initialState, requestAction);

      expect(state.getIn([ADD_ROLE_TO_ORGANIZATION, 'requestState'])).toEqual(RequestStates.PENDING);
      expect(state.getIn([ADD_ROLE_TO_ORGANIZATION, id])).toEqual(requestAction);
      expect(state.get('orgs').hashCode()).toEqual(initialState.get('orgs').hashCode());
      expect(state.get('orgs').equals(initialState.get('orgs'))).toEqual(true);
    });

    test(addRoleToOrganization.SUCCESS, () => {

      const { id } = addRoleToOrganization();
      const requestAction = addRoleToOrganization.request(id, requestActionValue);
      let state = reducer(initialState, requestAction);
      state = reducer(state, addRoleToOrganization.success(id, mockNewRole));

      expect(state.getIn([ADD_ROLE_TO_ORGANIZATION, 'requestState'])).toEqual(RequestStates.SUCCESS);
      expect(state.getIn([ADD_ROLE_TO_ORGANIZATION, id])).toEqual(requestAction);

      const expectedOrgs = Map().set(
        MOCK_ORG.id,
        MOCK_ORG.toImmutable().setIn(['roles', 1], mockNewRole.toImmutable()),
      );
      expect(state.get('orgs').hashCode()).toEqual(expectedOrgs.hashCode());
      expect(state.get('orgs').equals(expectedOrgs)).toEqual(true);
    });

    test(addRoleToOrganization.FAILURE, () => {

      const { id } = addRoleToOrganization();
      const requestAction = addRoleToOrganization.request(id, requestActionValue);
      let state = reducer(initialState, requestAction);
      state = reducer(state, addRoleToOrganization.failure(id));

      expect(state.getIn([ADD_ROLE_TO_ORGANIZATION, 'requestState'])).toEqual(RequestStates.FAILURE);
      expect(state.getIn([ADD_ROLE_TO_ORGANIZATION, id])).toEqual(requestAction);
      expect(state.get('orgs').hashCode()).toEqual(initialState.get('orgs').hashCode());
      expect(state.get('orgs').equals(initialState.get('orgs'))).toEqual(true);
    });

    test(addRoleToOrganization.FINALLY, () => {

      const { id } = addRoleToOrganization();
      const requestAction = addRoleToOrganization.request(id, requestActionValue);
      let state = reducer(initialState, requestAction);

      state = reducer(state, addRoleToOrganization.success(id, mockNewRole));
      expect(state.getIn([ADD_ROLE_TO_ORGANIZATION, 'requestState'])).toEqual(RequestStates.SUCCESS);
      expect(state.getIn([ADD_ROLE_TO_ORGANIZATION, id])).toEqual(requestAction);

      state = reducer(state, addRoleToOrganization.finally(id));
      expect(state.getIn([ADD_ROLE_TO_ORGANIZATION, 'requestState'])).toEqual(RequestStates.SUCCESS);
      expect(state.hasIn([ADD_ROLE_TO_ORGANIZATION, id])).toEqual(false);
    });

  });

  describe(REMOVE_MEMBER_FROM_ORGANIZATION, () => {

    // the structure of this object isn't 100% accurate, but it's enough to make things work
    const existingOrgMembers = fromJS([
      {
        principal: {
          principal: MOCK_ORG.members[0].toImmutable(),
        },
        profile: {
          user_id: MOCK_ORG.members[0].id,
        },
      },
      {
        principal: {
          principal: MOCK_USER_PRINCIPAL.toImmutable(),
        },
        profile: {
          user_id: MOCK_USER_PRINCIPAL.id,
        },
      }
    ]);

    const initialState = INITIAL_STATE
      .setIn(['orgs', MOCK_ORG.id], MOCK_ORG.toImmutable())
      .setIn(['orgMembers', MOCK_ORG.id], existingOrgMembers);

    const requestActionValue = {
      memberId: MOCK_USER_PRINCIPAL.id,
      organizationId: MOCK_ORG.id,
    };

    test(removeMemberFromOrganization.REQUEST, () => {

      const { id } = removeMemberFromOrganization();
      const requestAction = removeMemberFromOrganization.request(id, requestActionValue);
      const state = reducer(initialState, requestAction);

      expect(state.getIn([REMOVE_MEMBER_FROM_ORGANIZATION, 'requestState'])).toEqual(RequestStates.PENDING);
      expect(state.getIn([REMOVE_MEMBER_FROM_ORGANIZATION, id])).toEqual(requestAction);
      expect(state.get('orgs').hashCode()).toEqual(initialState.get('orgs').hashCode());
      expect(state.get('orgs').equals(initialState.get('orgs'))).toEqual(true);
      expect(state.get('orgMembers').hashCode()).toEqual(initialState.get('orgMembers').hashCode());
      expect(state.get('orgMembers').equals(initialState.get('orgMembers'))).toEqual(true);
    });

    test(removeMemberFromOrganization.SUCCESS, () => {

      const { id } = removeMemberFromOrganization();
      const requestAction = removeMemberFromOrganization.request(id, requestActionValue);
      let state = reducer(initialState, requestAction);
      state = reducer(state, removeMemberFromOrganization.success(id));

      expect(state.getIn([REMOVE_MEMBER_FROM_ORGANIZATION, 'requestState'])).toEqual(RequestStates.SUCCESS);
      expect(state.getIn([REMOVE_MEMBER_FROM_ORGANIZATION, id])).toEqual(requestAction);

      const expectedOrgs = Map().set(MOCK_ORG.id, MOCK_ORG.toImmutable());
      expect(state.get('orgs').hashCode()).toEqual(expectedOrgs.hashCode());
      expect(state.get('orgs').equals(expectedOrgs)).toEqual(true);

      const expectedOrgMembers = Map().set(MOCK_ORG.id, List().push(existingOrgMembers.get(0)));
      expect(state.get('orgMembers').hashCode()).toEqual(expectedOrgMembers.hashCode());
      expect(state.get('orgMembers').equals(expectedOrgMembers)).toEqual(true);
    });

    test(removeMemberFromOrganization.FAILURE, () => {

      const { id } = removeMemberFromOrganization();
      const requestAction = removeMemberFromOrganization.request(id, requestActionValue);
      let state = reducer(initialState, requestAction);
      state = reducer(state, removeMemberFromOrganization.failure(id));

      expect(state.getIn([REMOVE_MEMBER_FROM_ORGANIZATION, 'requestState'])).toEqual(RequestStates.FAILURE);
      expect(state.getIn([REMOVE_MEMBER_FROM_ORGANIZATION, id])).toEqual(requestAction);
      expect(state.get('orgs').hashCode()).toEqual(initialState.get('orgs').hashCode());
      expect(state.get('orgs').equals(initialState.get('orgs'))).toEqual(true);
      expect(state.get('orgMembers').hashCode()).toEqual(initialState.get('orgMembers').hashCode());
      expect(state.get('orgMembers').equals(initialState.get('orgMembers'))).toEqual(true);
    });

    test(removeMemberFromOrganization.FINALLY, () => {

      const { id } = removeMemberFromOrganization();
      const requestAction = removeMemberFromOrganization.request(id, requestActionValue);
      let state = reducer(initialState, requestAction);

      state = reducer(state, removeMemberFromOrganization.success(id));
      expect(state.getIn([REMOVE_MEMBER_FROM_ORGANIZATION, 'requestState'])).toEqual(RequestStates.SUCCESS);
      expect(state.getIn([REMOVE_MEMBER_FROM_ORGANIZATION, id])).toEqual(requestAction);

      state = reducer(state, removeMemberFromOrganization.finally(id));
      expect(state.getIn([REMOVE_MEMBER_FROM_ORGANIZATION, 'requestState'])).toEqual(RequestStates.SUCCESS);
      expect(state.hasIn([REMOVE_MEMBER_FROM_ORGANIZATION, id])).toEqual(false);
    });

  });

  describe(REMOVE_ROLE_FROM_MEMBER, () => {

    // the structure of this object isn't 100% accurate, but it's enough to make things work
    const mockOrgMember = fromJS({
      principal: MOCK_USER_PRINCIPAL.toImmutable(),
      roles: [MOCK_ORG_ROLE.toImmutable()],
    });

    const initialState = INITIAL_STATE
      .setIn(['orgs', MOCK_ORG.id], MOCK_ORG.toImmutable())
      .setIn(['orgMembers', MOCK_ORG.id], List().push(mockOrgMember));

    const requestActionValue = {
      memberId: MOCK_USER_PRINCIPAL.id,
      organizationId: MOCK_ORG.id,
      roleId: MOCK_ORG_ROLE.id,
    };

    test(removeRoleFromMember.REQUEST, () => {

      const { id } = removeRoleFromMember();
      const requestAction = removeRoleFromMember.request(id, requestActionValue);
      const state = reducer(initialState, requestAction);

      expect(state.getIn([REMOVE_ROLE_FROM_MEMBER, 'requestState'])).toEqual(RequestStates.PENDING);
      expect(state.getIn([REMOVE_ROLE_FROM_MEMBER, id])).toEqual(requestAction);
      expect(state.get('orgs').hashCode()).toEqual(initialState.get('orgs').hashCode());
      expect(state.get('orgs').equals(initialState.get('orgs'))).toEqual(true);
      expect(state.get('orgMembers').hashCode()).toEqual(initialState.get('orgMembers').hashCode());
      expect(state.get('orgMembers').equals(initialState.get('orgMembers'))).toEqual(true);
    });

    test(removeRoleFromMember.SUCCESS, () => {

      const { id } = removeRoleFromMember();
      const requestAction = removeRoleFromMember.request(id, requestActionValue);
      let state = reducer(initialState, requestAction);
      state = reducer(state, removeRoleFromMember.success(id));

      expect(state.getIn([REMOVE_ROLE_FROM_MEMBER, 'requestState'])).toEqual(RequestStates.SUCCESS);
      expect(state.getIn([REMOVE_ROLE_FROM_MEMBER, id])).toEqual(requestAction);
      expect(state.get('orgs').hashCode()).toEqual(initialState.get('orgs').hashCode());
      expect(state.get('orgs').equals(initialState.get('orgs'))).toEqual(true);

      const expectedOrgMembers = Map().set(
        MOCK_ORG.id,
        List().push(mockOrgMember.set('roles', List())),
      );
      expect(state.get('orgMembers').hashCode()).toEqual(expectedOrgMembers.hashCode());
      expect(state.get('orgMembers').equals(expectedOrgMembers)).toEqual(true);
    });

    test(removeRoleFromMember.FAILURE, () => {

      const { id } = removeRoleFromMember();
      const requestAction = removeRoleFromMember.request(id, requestActionValue);
      let state = reducer(initialState, requestAction);
      state = reducer(state, removeRoleFromMember.failure(id));

      expect(state.getIn([REMOVE_ROLE_FROM_MEMBER, 'requestState'])).toEqual(RequestStates.FAILURE);
      expect(state.getIn([REMOVE_ROLE_FROM_MEMBER, id])).toEqual(requestAction);
      expect(state.get('orgs').hashCode()).toEqual(initialState.get('orgs').hashCode());
      expect(state.get('orgs').equals(initialState.get('orgs'))).toEqual(true);
      expect(state.get('orgMembers').hashCode()).toEqual(initialState.get('orgMembers').hashCode());
      expect(state.get('orgMembers').equals(initialState.get('orgMembers'))).toEqual(true);
    });

    test(removeRoleFromMember.FINALLY, () => {

      const { id } = removeRoleFromMember();
      const requestAction = removeRoleFromMember.request(id, requestActionValue);
      let state = reducer(initialState, requestAction);

      state = reducer(state, removeRoleFromMember.success(id));
      expect(state.getIn([REMOVE_ROLE_FROM_MEMBER, 'requestState'])).toEqual(RequestStates.SUCCESS);
      expect(state.getIn([REMOVE_ROLE_FROM_MEMBER, id])).toEqual(requestAction);

      state = reducer(state, removeRoleFromMember.finally(id));
      expect(state.getIn([REMOVE_ROLE_FROM_MEMBER, 'requestState'])).toEqual(RequestStates.SUCCESS);
      expect(state.hasIn([REMOVE_ROLE_FROM_MEMBER, id])).toEqual(false);
    });

  });

  describe(REMOVE_ROLE_FROM_ORGANIZATION, () => {

    const initialState = INITIAL_STATE
      .setIn(['orgs', MOCK_ORG.id], MOCK_ORG.toImmutable());

    const requestActionValue = { organizationId: MOCK_ORG.id, roleId: MOCK_ORG_ROLE.id };

    test(removeRoleFromOrganization.REQUEST, () => {

      const { id } = removeRoleFromOrganization();
      const requestAction = removeRoleFromOrganization.request(id, requestActionValue);
      const state = reducer(initialState, requestAction);

      expect(state.getIn([REMOVE_ROLE_FROM_ORGANIZATION, 'requestState'])).toEqual(RequestStates.PENDING);
      expect(state.getIn([REMOVE_ROLE_FROM_ORGANIZATION, id])).toEqual(requestAction);
      expect(state.get('orgs').hashCode()).toEqual(initialState.get('orgs').hashCode());
      expect(state.get('orgs').equals(initialState.get('orgs'))).toEqual(true);
    });

    test(removeRoleFromOrganization.SUCCESS, () => {

      const { id } = removeRoleFromOrganization();
      const requestAction = removeRoleFromOrganization.request(id, requestActionValue);
      let state = reducer(initialState, requestAction);
      state = reducer(state, removeRoleFromOrganization.success(id));

      expect(state.getIn([REMOVE_ROLE_FROM_ORGANIZATION, 'requestState'])).toEqual(RequestStates.SUCCESS);
      expect(state.getIn([REMOVE_ROLE_FROM_ORGANIZATION, id])).toEqual(requestAction);

      const expectedOrgs = Map().set(MOCK_ORG.id, MOCK_ORG.toImmutable().set('roles', List()));
      expect(state.get('orgs').hashCode()).toEqual(expectedOrgs.hashCode());
      expect(state.get('orgs').equals(expectedOrgs)).toEqual(true);
    });

    test(removeRoleFromOrganization.FAILURE, () => {

      const { id } = removeRoleFromOrganization();
      const requestAction = removeRoleFromOrganization.request(id, requestActionValue);
      let state = reducer(initialState, requestAction);
      state = reducer(state, removeRoleFromOrganization.failure(id));

      expect(state.getIn([REMOVE_ROLE_FROM_ORGANIZATION, 'requestState'])).toEqual(RequestStates.FAILURE);
      expect(state.getIn([REMOVE_ROLE_FROM_ORGANIZATION, id])).toEqual(requestAction);
      expect(state.get('orgs').hashCode()).toEqual(initialState.get('orgs').hashCode());
      expect(state.get('orgs').equals(initialState.get('orgs'))).toEqual(true);
    });

    test(removeRoleFromOrganization.FINALLY, () => {

      const { id } = removeRoleFromOrganization();
      const requestAction = removeRoleFromOrganization.request(id, requestActionValue);
      let state = reducer(initialState, requestAction);

      state = reducer(state, removeRoleFromOrganization.success(id));
      expect(state.getIn([REMOVE_ROLE_FROM_ORGANIZATION, 'requestState'])).toEqual(RequestStates.SUCCESS);
      expect(state.getIn([REMOVE_ROLE_FROM_ORGANIZATION, id])).toEqual(requestAction);

      state = reducer(state, removeRoleFromOrganization.finally(id));
      expect(state.getIn([REMOVE_ROLE_FROM_ORGANIZATION, 'requestState'])).toEqual(RequestStates.SUCCESS);
      expect(state.hasIn([REMOVE_ROLE_FROM_ORGANIZATION, id])).toEqual(false);
    });

  });

});

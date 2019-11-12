/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import { Models, Types } from 'lattice';
import { OrganizationsApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';

import reducer from './OrgsReducer';
import { MOCK_ORG, MOCK_ORG_ROLE } from '../../utils/testing/MockData';
import { genRandomUUID } from '../../utils/testing/MockUtils';
import {
  GET_ORGANIZATION_ACLS,
  GET_ORGANIZATION_DETAILS,
  GET_ORGS_AND_PERMISSIONS,
  SEARCH_MEMBERS_TO_ADD_TO_ORG,
} from './OrgsActions';

const {
  PrincipalTypes,
} = Types;

const {
  Principal,
  PrincipalBuilder,
  Role,
  RoleBuilder,
} = Models;

const {
  ADD_DOMAIN_TO_ORG,
  ADD_MEMBER_TO_ORG,
  ADD_ROLE_TO_MEMBER,
  CREATE_ORGANIZATION,
  CREATE_ROLE,
  DELETE_ORGANIZATION,
  DELETE_ROLE,
  GET_ORG_ENTITY_SETS,
  GET_ORG_MEMBERS,
  GRANT_TRUST_TO_ORG,
  REMOVE_DOMAIN_FROM_ORG,
  REMOVE_MEMBER_FROM_ORG,
  REMOVE_ROLE_FROM_MEMBER,
  REVOKE_TRUST_FROM_ORG,
  UPDATE_ORG_DESCRIPTION,
  UPDATE_ORG_TITLE,
  addRoleToMember,
  createRole,
  deleteRole,
} = OrganizationsApiActions;

describe('OrgsReducer', () => {

  const INITIAL_STATE = reducer(undefined, { type: '__TEST__' });

  test('INITIAL_STATE', () => {
    expect(INITIAL_STATE).toBeInstanceOf(Map);
    expect(INITIAL_STATE.toJS()).toEqual({
      [ADD_DOMAIN_TO_ORG]: {
        requestState: RequestStates.STANDBY,
      },
      [ADD_MEMBER_TO_ORG]: {
        requestState: RequestStates.STANDBY,
      },
      [ADD_ROLE_TO_MEMBER]: {
        requestState: RequestStates.STANDBY,
      },
      [CREATE_ORGANIZATION]: {
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
      [REMOVE_DOMAIN_FROM_ORG]: {
        requestState: RequestStates.STANDBY,
      },
      [REMOVE_MEMBER_FROM_ORG]: {
        requestState: RequestStates.STANDBY,
      },
      [REMOVE_ROLE_FROM_MEMBER]: {
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
      isOwnerOfOrgIds: [],
      memberSearchResults: {},
      newlyCreatedOrgId: undefined,
      orgACLs: {},
      orgEntitySets: {},
      orgMembers: {},
      orgs: {},
    });
  });

  describe(ADD_ROLE_TO_MEMBER, () => {

    const mockMemberPrincipal :Principal = (new PrincipalBuilder())
      .setId('MockOrgMemberPrincipalId')
      .setType(PrincipalTypes.USER)
      .build();

    // the structure of this object isn't 100% accurate, but it's enough to make things work
    const mockOrgMember = fromJS({
      principal: mockMemberPrincipal.toImmutable(),
      roles: [],
    });

    const initialState = INITIAL_STATE
      .setIn(['orgs', MOCK_ORG.id], MOCK_ORG.toImmutable())
      .setIn(['orgMembers', MOCK_ORG.id], List().push(mockOrgMember));

    const requestActionValue = {
      memberId: mockMemberPrincipal.id,
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

  describe(CREATE_ROLE, () => {

    const mockRole :Role = (new RoleBuilder())
      .setDescription('MockRoleDescription')
      .setId(genRandomUUID())
      // $FlowFixMe
      .setOrganizationId(MOCK_ORG.id)
      .setPrincipal(
        (new PrincipalBuilder())
          .setId('MockRolePrincipalId')
          .setType(PrincipalTypes.USER)
          .build()
      )
      .setTitle('MockRoleTitle')
      .build();

    const initialState = INITIAL_STATE.setIn(['orgs', MOCK_ORG.id], MOCK_ORG.toImmutable());

    test(createRole.REQUEST, () => {

      const { id } = createRole();
      const requestAction = createRole.request(id, mockRole);
      const state = reducer(initialState, requestAction);

      expect(state.getIn([CREATE_ROLE, 'requestState'])).toEqual(RequestStates.PENDING);
      expect(state.getIn([CREATE_ROLE, id])).toEqual(requestAction);
      expect(state.get('orgs').hashCode()).toEqual(initialState.get('orgs').hashCode());
      expect(state.get('orgs').equals(initialState.get('orgs'))).toEqual(true);
    });

    test(createRole.SUCCESS, () => {

      const { id } = createRole();
      const requestAction = createRole.request(id, mockRole);
      let state = reducer(initialState, requestAction);
      state = reducer(state, createRole.success(id, mockRole.id));

      expect(state.getIn([CREATE_ROLE, 'requestState'])).toEqual(RequestStates.SUCCESS);
      expect(state.getIn([CREATE_ROLE, id])).toEqual(requestAction);

      const expectedOrgs = Map().set(
        MOCK_ORG.id,
        MOCK_ORG.toImmutable().setIn(['roles', 1], mockRole.toImmutable()),
      );
      expect(state.get('orgs').hashCode()).toEqual(expectedOrgs.hashCode());
      expect(state.get('orgs').equals(expectedOrgs)).toEqual(true);
    });

    test(createRole.FAILURE, () => {

      const { id } = createRole();
      const requestAction = createRole.request(id, mockRole);
      let state = reducer(initialState, requestAction);
      state = reducer(state, createRole.failure(id));

      expect(state.getIn([CREATE_ROLE, 'requestState'])).toEqual(RequestStates.FAILURE);
      expect(state.getIn([CREATE_ROLE, id])).toEqual(requestAction);
      expect(state.get('orgs').hashCode()).toEqual(initialState.get('orgs').hashCode());
      expect(state.get('orgs').equals(initialState.get('orgs'))).toEqual(true);
    });

    test(createRole.FINALLY, () => {

      const { id } = createRole();
      const requestAction = createRole.request(id, mockRole);
      let state = reducer(initialState, requestAction);

      state = reducer(state, createRole.success(id, mockRole.id));
      expect(state.getIn([CREATE_ROLE, 'requestState'])).toEqual(RequestStates.SUCCESS);
      expect(state.getIn([CREATE_ROLE, id])).toEqual(requestAction);

      state = reducer(state, createRole.finally(id));
      expect(state.getIn([CREATE_ROLE, 'requestState'])).toEqual(RequestStates.SUCCESS);
      expect(state.hasIn([CREATE_ROLE, id])).toEqual(false);
    });

  });

  describe(DELETE_ROLE, () => {

    const initialState = INITIAL_STATE.setIn(['orgs', MOCK_ORG.id], MOCK_ORG.toImmutable());
    const requestActionValue = { organizationId: MOCK_ORG.id, roleId: MOCK_ORG_ROLE.id };

    test(deleteRole.REQUEST, () => {

      const { id } = deleteRole();
      const requestAction = deleteRole.request(id, requestActionValue);
      const state = reducer(initialState, requestAction);

      expect(state.getIn([DELETE_ROLE, 'requestState'])).toEqual(RequestStates.PENDING);
      expect(state.getIn([DELETE_ROLE, id])).toEqual(requestAction);
      expect(state.get('orgs').hashCode()).toEqual(initialState.get('orgs').hashCode());
      expect(state.get('orgs').equals(initialState.get('orgs'))).toEqual(true);
    });

    test(deleteRole.SUCCESS, () => {

      const { id } = deleteRole();
      const requestAction = deleteRole.request(id, requestActionValue);
      let state = reducer(initialState, requestAction);
      state = reducer(state, deleteRole.success(id));

      expect(state.getIn([DELETE_ROLE, 'requestState'])).toEqual(RequestStates.SUCCESS);
      expect(state.getIn([DELETE_ROLE, id])).toEqual(requestAction);

      const expectedOrgs = Map().set(MOCK_ORG.id, MOCK_ORG.toImmutable().set('roles', List()));
      expect(state.get('orgs').hashCode()).toEqual(expectedOrgs.hashCode());
      expect(state.get('orgs').equals(expectedOrgs)).toEqual(true);
    });

    test(deleteRole.FAILURE, () => {

      const { id } = deleteRole();
      const requestAction = deleteRole.request(id, requestActionValue);
      let state = reducer(initialState, requestAction);
      state = reducer(state, deleteRole.failure(id));

      expect(state.getIn([DELETE_ROLE, 'requestState'])).toEqual(RequestStates.FAILURE);
      expect(state.getIn([DELETE_ROLE, id])).toEqual(requestAction);
      expect(state.get('orgs').hashCode()).toEqual(initialState.get('orgs').hashCode());
      expect(state.get('orgs').equals(initialState.get('orgs'))).toEqual(true);
    });

    test(deleteRole.FINALLY, () => {

      const { id } = deleteRole();
      const requestAction = deleteRole.request(id, requestActionValue);
      let state = reducer(initialState, requestAction);

      state = reducer(state, deleteRole.success(id));
      expect(state.getIn([DELETE_ROLE, 'requestState'])).toEqual(RequestStates.SUCCESS);
      expect(state.getIn([DELETE_ROLE, id])).toEqual(requestAction);

      state = reducer(state, deleteRole.finally(id));
      expect(state.getIn([DELETE_ROLE, 'requestState'])).toEqual(RequestStates.SUCCESS);
      expect(state.hasIn([DELETE_ROLE, id])).toEqual(false);
    });

  });

});

/*
 * @flow
 */

import { Map } from 'immutable';
import { OrganizationsApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';

import reducer from './OrgsReducer';
import { MOCK_ORGANIZATION, MOCK_ROLE } from '../../utils/testing/MockData';
import {
  GET_ORGANIZATION_ACLS,
  GET_ORGANIZATION_DETAILS,
  GET_ORGS_AND_PERMISSIONS,
  SEARCH_MEMBERS_TO_ADD_TO_ORG,
} from './OrgsActions';

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

  describe(CREATE_ROLE, () => {

    const initialState = INITIAL_STATE
      .setIn(['orgs', MOCK_ORGANIZATION.id], MOCK_ORGANIZATION.toImmutable());

    test(createRole.REQUEST, () => {

      const { id } = createRole();
      const requestAction = createRole.request(id, MOCK_ROLE);
      const state = reducer(initialState, requestAction);

      expect(state.getIn([CREATE_ROLE, 'requestState'])).toEqual(RequestStates.PENDING);
      expect(state.getIn([CREATE_ROLE, id])).toEqual(requestAction);
      expect(state.get('orgs').hashCode()).toEqual(initialState.get('orgs').hashCode());
      expect(state.get('orgs').equals(initialState.get('orgs'))).toEqual(true);
    });

    test(createRole.SUCCESS, () => {

      const { id } = createRole();
      const requestAction = createRole.request(id, MOCK_ROLE);
      let state = reducer(initialState, requestAction);
      state = reducer(state, createRole.success(id, MOCK_ROLE.id));

      expect(state.getIn([CREATE_ROLE, 'requestState'])).toEqual(RequestStates.SUCCESS);
      expect(state.getIn([CREATE_ROLE, id])).toEqual(requestAction);

      const expectedOrgs = Map().set(
        MOCK_ORGANIZATION.id,
        MOCK_ORGANIZATION.toImmutable().setIn(['roles', 1], MOCK_ROLE.toImmutable()),
      );
      expect(state.get('orgs').hashCode()).toEqual(expectedOrgs.hashCode());
      expect(state.get('orgs').equals(expectedOrgs)).toEqual(true);
    });

    test(createRole.FAILURE, () => {

      const { id } = createRole();
      const requestAction = createRole.request(id, MOCK_ROLE);
      let state = reducer(initialState, requestAction);
      state = reducer(state, createRole.failure(id));

      expect(state.getIn([CREATE_ROLE, 'requestState'])).toEqual(RequestStates.FAILURE);
      expect(state.getIn([CREATE_ROLE, id])).toEqual(requestAction);
      expect(state.get('orgs').hashCode()).toEqual(initialState.get('orgs').hashCode());
      expect(state.get('orgs').equals(initialState.get('orgs'))).toEqual(true);
    });

    test(createRole.FINALLY, () => {

      const { id } = createRole();
      const requestAction = createRole.request(id, MOCK_ROLE);
      let state = reducer(initialState, requestAction);

      state = reducer(state, createRole.success(id, MOCK_ROLE.id));
      expect(state.getIn([CREATE_ROLE, 'requestState'])).toEqual(RequestStates.SUCCESS);
      expect(state.getIn([CREATE_ROLE, id])).toEqual(requestAction);

      state = reducer(state, createRole.finally(id));
      expect(state.getIn([CREATE_ROLE, 'requestState'])).toEqual(RequestStates.SUCCESS);
      expect(state.hasIn([CREATE_ROLE, id])).toEqual(false);
    });

  });

  describe(DELETE_ROLE, () => {

    const initialState = INITIAL_STATE.setIn(
      ['orgs', MOCK_ORGANIZATION.id],
      MOCK_ORGANIZATION.toImmutable().setIn(['roles', 1], MOCK_ROLE.toImmutable()),
    );

    test(deleteRole.REQUEST, () => {

      const { id } = deleteRole();
      const requestAction = deleteRole.request(id, MOCK_ROLE);
      const state = reducer(initialState, requestAction);

      expect(state.getIn([DELETE_ROLE, 'requestState'])).toEqual(RequestStates.PENDING);
      expect(state.getIn([DELETE_ROLE, id])).toEqual(requestAction);
      expect(state.get('orgs').hashCode()).toEqual(initialState.get('orgs').hashCode());
      expect(state.get('orgs').equals(initialState.get('orgs'))).toEqual(true);
    });

    test(deleteRole.SUCCESS, () => {

      const { id } = deleteRole();
      const requestAction = deleteRole.request(id, { organizationId: MOCK_ORGANIZATION.id, roleId: MOCK_ROLE.id });
      let state = reducer(initialState, requestAction);
      state = reducer(state, deleteRole.success(id));

      expect(state.getIn([DELETE_ROLE, 'requestState'])).toEqual(RequestStates.SUCCESS);
      expect(state.getIn([DELETE_ROLE, id])).toEqual(requestAction);

      const expectedOrgs = Map().set(MOCK_ORGANIZATION.id, MOCK_ORGANIZATION.toImmutable());
      expect(state.get('orgs').hashCode()).toEqual(expectedOrgs.hashCode());
      expect(state.get('orgs').equals(expectedOrgs)).toEqual(true);
    });

    test(deleteRole.FAILURE, () => {

      const { id } = deleteRole();
      const requestAction = deleteRole.request(id, MOCK_ROLE);
      let state = reducer(initialState, requestAction);
      state = reducer(state, deleteRole.failure(id));

      expect(state.getIn([DELETE_ROLE, 'requestState'])).toEqual(RequestStates.FAILURE);
      expect(state.getIn([DELETE_ROLE, id])).toEqual(requestAction);
      expect(state.get('orgs').hashCode()).toEqual(initialState.get('orgs').hashCode());
      expect(state.get('orgs').equals(initialState.get('orgs'))).toEqual(true);
    });

    test(deleteRole.FINALLY, () => {

      const { id } = deleteRole();
      const requestAction = deleteRole.request(id, MOCK_ROLE);
      let state = reducer(initialState, requestAction);

      state = reducer(state, deleteRole.success(id, MOCK_ROLE.id));
      expect(state.getIn([DELETE_ROLE, 'requestState'])).toEqual(RequestStates.SUCCESS);
      expect(state.getIn([DELETE_ROLE, id])).toEqual(requestAction);

      state = reducer(state, deleteRole.finally(id));
      expect(state.getIn([DELETE_ROLE, 'requestState'])).toEqual(RequestStates.SUCCESS);
      expect(state.hasIn([DELETE_ROLE, id])).toEqual(false);
    });

  });

});

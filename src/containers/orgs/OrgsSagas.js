/*
 * @flow
 */

import {
  all,
  call,
  put,
  select,
  takeEvery,
  takeLatest,
} from '@redux-saga/core/effects';
import { List, Map, fromJS } from 'immutable';
import { Models, Types } from 'lattice';
import { AuthUtils } from 'lattice-auth';
import {
  AuthorizationsApiActions,
  AuthorizationsApiSagas,
  OrganizationsApiActions,
  OrganizationsApiSagas,
  PermissionsApiActions,
  PermissionsApiSagas,
  PrincipalsApiActions,
  PrincipalsApiSagas,
} from 'lattice-sagas';
import { Logger, ValidationUtils } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { $AxiosError } from 'axios';
import type { AclObject } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  ADD_CONNECTION,
  ADD_ROLE_TO_ORGANIZATION,
  GET_ORGANIZATION_ACLS,
  GET_ORGANIZATION_DATA_SETS,
  GET_ORGANIZATION_DETAILS,
  GET_ORGS_AND_PERMISSIONS,
  REMOVE_CONNECTION,
  REMOVE_ROLE_FROM_ORGANIZATION,
  addConnection,
  addRoleToOrganization,
  getOrganizationACLs,
  getOrganizationDataSets,
  getOrganizationDetails,
  getOrgsAndPermissions,
  removeConnection,
  removeRoleFromOrganization,
} from './OrgsActions';

import * as DataSetsApi from '../../core/api/DataSetsApi';

const LOG = new Logger('OrgsSagas');

const {
  AccessCheck,
  AccessCheckBuilder,
  Principal,
  PrincipalBuilder,
  Role,
  RoleBuilder,
} = Models;
const { PermissionTypes, PrincipalTypes } = Types;
const { isValidUUID } = ValidationUtils;

const { getAuthorizations } = AuthorizationsApiActions;
const { getAuthorizationsWorker } = AuthorizationsApiSagas;
const {
  addConnectionsToOrganization,
  createRole,
  deleteRole,
  getAllOrganizations,
  getOrganization,
  getOrganizationIntegrationAccount,
  getOrganizationMembers,
  removeConnectionsFromOrganization,
} = OrganizationsApiActions;
const {
  addConnectionsToOrganizationWorker,
  createRoleWorker,
  deleteRoleWorker,
  getAllOrganizationsWorker,
  getOrganizationWorker,
  getOrganizationIntegrationAccountWorker,
  removeConnectionsFromOrganizationWorker,
} = OrganizationsApiSagas;
const { getAcl } = PermissionsApiActions;
const { getAclWorker } = PermissionsApiSagas;
const { getSecurablePrincipal } = PrincipalsApiActions;
const { getSecurablePrincipalWorker } = PrincipalsApiSagas;

/*
 *
 * OrgsActions.addConnection
 *
 */

function* addConnectionWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(addConnection.request(action.id, action.value));

    if (!AuthUtils.isAdmin()) {
      throw new Error('only admins are allowed to take this action');
    }

    const { organizationId, connection } = action.value;
    if (!isValidUUID(organizationId)) {
      throw new Error('organizationId must be a valid UUID');
    }

    const response = yield call(
      addConnectionsToOrganizationWorker,
      addConnectionsToOrganization({ organizationId, connections: [connection] })
    );
    if (response.error) throw response.error;

    yield put(addConnection.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(addConnection.failure(action.id));
  }
  finally {
    yield put(addConnection.finally(action.id));
  }
}

function* addConnectionWatcher() :Saga<*> {

  yield takeLatest(ADD_CONNECTION, addConnectionWorker);
}

/*
 *
 * OrgsActions.addRoleToOrganization
 *
 */

function* addRoleToOrganizationWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(addRoleToOrganization.request(action.id, action.value));

    const {
      organizationId,
      roleTitle,
    } :{|
      organizationId :UUID;
      roleTitle :string;
    |} = action.value;

    const principal :Principal = (new PrincipalBuilder())
      .setId(`${organizationId}|${roleTitle.replace(/\W/g, '')}`)
      .setType(PrincipalTypes.ROLE)
      .build();

    const roleBuilder :RoleBuilder = (new RoleBuilder())
      .setOrganizationId(organizationId)
      .setPrincipal(principal)
      .setTitle(roleTitle);

    const response = yield call(createRoleWorker, createRole(roleBuilder.build()));
    if (response.error) throw response.error;

    const roleId :UUID = response.data;
    const role :Role = roleBuilder
      .setId(roleId)
      .build();

    yield put(addRoleToOrganization.success(action.id, role));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(addRoleToOrganization.failure(action.id));
  }
  finally {
    yield put(addRoleToOrganization.finally(action.id));
  }
}

function* addRoleToOrganizationWatcher() :Saga<*> {

  yield takeLatest(ADD_ROLE_TO_ORGANIZATION, addRoleToOrganizationWorker);
}

/*
 *
 * OrgsActions.getOrganizationACLs
 *
 */

function* getOrganizationACLsWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(getOrganizationACLs.request(action.id, action.value));

    const organizationId :UUID = action.value;
    const organizationAclKey :UUID[] = [organizationId];
    const organization :Map = yield select((state) => state.getIn(['orgs', 'orgs', organizationId]), Map());

    const orgAclResponse = yield call(getAclWorker, getAcl(organizationAclKey));
    if (orgAclResponse.error) throw orgAclResponse.error;
    const orgAcl :AclObject = orgAclResponse.data;

    const calls = {};
    organization.get('roles', List()).forEach((role :Map) => {
      const roleId :UUID = role.get('id');
      calls[roleId] = call(getAclWorker, getAcl([organizationId, roleId]));
    });
    const roleAclResponses :Object = yield all(calls);

    const acls :Map = Map().withMutations((map :Map) => {

      // org acl
      map.set(List(organizationAclKey), fromJS(orgAcl));

      // role acls
      Object.keys(roleAclResponses).forEach((roleId :UUID) => {
        const roleAclKey :UUID[] = [organizationId, roleId];
        const roleAclResponse :Object = roleAclResponses[roleId];
        if (roleAclResponse.error) {
          let error = true;
          const axiosError :$AxiosError<any> = roleAclResponse.error;
          if (axiosError.isAxiosError && axiosError.response) {
            error = {
              status: axiosError.response.status,
              statusText: axiosError.response.statusText,
            };
          }
          map.set(List(roleAclKey), fromJS({ error }));
        }
        else {
          const roleAcl :AclObject = roleAclResponse.data;
          map.set(List(roleAclKey), fromJS(roleAcl));
        }
      });
    });

    yield put(getOrganizationACLs.success(action.id, acls));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getOrganizationACLs.failure(action.id));
  }
  finally {
    yield put(getOrganizationACLs.finally(action.id));
  }
}

function* getOrganizationACLsWatcher() :Saga<*> {

  yield takeEvery(GET_ORGANIZATION_ACLS, getOrganizationACLsWorker);
}

/*
 *
 * OrgsActions.getOrganizationDataSets
 *
 */

function* getOrganizationDataSetsWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(getOrganizationDataSets.request(action.id, action.value));

    const organizationId :UUID = action.value;
    if (!isValidUUID(organizationId)) {
      throw new Error('organizationId must be a valid UUID');
    }

    const response = yield call(DataSetsApi.getDataSets, organizationId);
    if (response.error) throw response.error;

    yield put(getOrganizationDataSets.success(action.id, response));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getOrganizationDataSets.failure(action.id));
  }
  finally {
    yield put(getOrganizationDataSets.finally(action.id));
  }
}

function* getOrganizationDataSetsWatcher() :Saga<*> {

  yield takeEvery(GET_ORGANIZATION_DATA_SETS, getOrganizationDataSetsWorker);
}

/*
 *
 * OrgsActions.getOrganizationDetails
 *
 */

function* getOrganizationDetailsWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(getOrganizationDetails.request(action.id, action.value));

    const organizationId :UUID = action.value;
    if (!isValidUUID(organizationId)) {
      throw new Error('organizationId must be a valid UUID');
    }

    // non-blocking
    yield put(getOrganizationMembers(organizationId));

    const [
      orgResponse,
      orgIntegrationResponse,
      orgAclResponse,
    ] = yield all([
      call(getOrganizationWorker, getOrganization(organizationId)),
      call(getOrganizationIntegrationAccountWorker, getOrganizationIntegrationAccount(organizationId)),
      call(getAclWorker, getAcl([organizationId])),
    ]);

    // NOTE: the integration account details request will fail if the user is not an owner of the org, but we should
    // still render the organization page, just without the integration account details section
    if (orgResponse.error) throw orgResponse.error;

    const principals :Principal[] = fromJS(orgAclResponse.data || {})
      .get('aces', List())
      .filter((ace :Map) => (
        ace.getIn(['principal', 'type'], '') === PrincipalTypes.ORGANIZATION
        && ace.getIn(['permissions'], List()).includes(PermissionTypes.READ)
      ))
      .map((ace :Map) => (
        (new PrincipalBuilder())
          .setId(ace.getIn(['principal', 'id']))
          .setType(ace.getIn(['principal', 'type']))
          .build()
      ))
      .toJS();

    const securablePrincipalResponses :Object[] = yield all(
      principals.map(
        (principal :Principal) => call(getSecurablePrincipalWorker, getSecurablePrincipal(principal))
      )
    );

    const trustedOrgIds :UUID[] = securablePrincipalResponses
      .filter((response :Object) => !response.error)
      .map((response :Object) => response.data)
      .map((securablePrincipal :Object) => securablePrincipal.id);

    yield put(getOrganizationDetails.success(action.id, {
      integration: fromJS(orgIntegrationResponse.data || []),
      org: fromJS(orgResponse.data),
      trustedOrgIds: fromJS(trustedOrgIds),
    }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getOrganizationDetails.failure(action.id));
  }
  finally {
    yield put(getOrganizationDetails.finally(action.id));
  }
}

function* getOrganizationDetailsWatcher() :Saga<*> {

  yield takeEvery(GET_ORGANIZATION_DETAILS, getOrganizationDetailsWorker);
}

/*
 *
 * OrgsActions.getOrgsAndPermissions
 *
 */

function* getOrgsAndPermissionsWorker(action :SequenceAction) :Saga<*> {

  const workerResponse :Object = {};

  try {
    yield put(getOrgsAndPermissions.request(action.id, action.value));

    let response = yield call(getAllOrganizationsWorker, getAllOrganizations());
    if (response.error) throw response.error;

    const organizations :Map<UUID, Map> = Map().withMutations((map :Map) => {
      fromJS(response.data).forEach((org :Map) => map.set(org.get('id'), org));
    });

    const accessChecks :AccessCheck[] = organizations.valueSeq()
      .map((org :Map) => (
        (new AccessCheckBuilder())
          .setAclKey([org.get('id')])
          .setPermissions([PermissionTypes.OWNER])
          .build()
      ))
      .toJS();

    response = yield call(getAuthorizationsWorker, getAuthorizations(accessChecks));
    if (response.error) throw response.error;

    const permissions :Map<UUID, Map> = Map().withMutations((map :Map) => {
      fromJS(response.data).forEach((authorization :Map) => {
        map.set(
          authorization.getIn(['aclKey', 0], ''), // organization id
          authorization.get('permissions', Map()),
        );
      });
    });

    if (organizations.count() !== permissions.count()) {
      throw new Error('organizations and permissions size mismatch');
    }

    yield put(getOrgsAndPermissions.success(action.id, { organizations, permissions }));
  }
  catch (error) {
    LOG.error(action.type, error);
    workerResponse.error = error;
    yield put(getOrgsAndPermissions.failure(action.id));
  }
  finally {
    yield put(getOrgsAndPermissions.finally(action.id));
  }

  return workerResponse;
}

function* getOrgsAndPermissionsWatcher() :Saga<*> {

  yield takeEvery(GET_ORGS_AND_PERMISSIONS, getOrgsAndPermissionsWorker);
}

/*
 *
 * OrgsActions.removeConnection
 *
 */

function* removeConnectionWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(removeConnection.request(action.id, action.value));

    if (!AuthUtils.isAdmin()) {
      throw new Error('only admins are allowed to take this action');
    }

    const { organizationId, connection } = action.value;
    if (!isValidUUID(organizationId)) {
      throw new Error('organizationId must be a valid UUID');
    }

    const response = yield call(
      removeConnectionsFromOrganizationWorker,
      removeConnectionsFromOrganization({ organizationId, connections: [connection] })
    );
    if (response.error) throw response.error;

    yield put(removeConnection.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(removeConnection.failure(action.id));
  }
  finally {
    yield put(removeConnection.finally(action.id));
  }
}

function* removeConnectionWatcher() :Saga<*> {

  yield takeLatest(REMOVE_CONNECTION, removeConnectionWorker);
}

/*
 *
 * OrgsActions.removeRoleFromOrganization
 *
 */

function* removeRoleFromOrganizationWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(removeRoleFromOrganization.request(action.id, action.value));

    const {
      organizationId,
      roleId,
    } :{|
      organizationId :UUID;
      roleId :UUID;
    |} = action.value;

    if (!isValidUUID(organizationId)) {
      throw new Error('organizationId must be a valid UUID');
    }

    if (!isValidUUID(roleId)) {
      throw new Error('roleId must be a valid UUID');
    }

    const organization :Map = yield select((state) => state.getIn(['orgs', 'orgs', organizationId]), Map());
    const roleIndex :number = organization.get('roles', List()).findIndex((role :Map) => role.get('id') === roleId);
    if (roleIndex === -1) {
      throw new Error(`role ${roleId} does not belong to organization ${organizationId}`);
    }

    const response = yield call(deleteRoleWorker, deleteRole({ organizationId, roleId }));
    if (response.error) throw response.error;

    yield put(removeRoleFromOrganization.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(removeRoleFromOrganization.failure(action.id));
  }
  finally {
    yield put(removeRoleFromOrganization.finally(action.id));
  }
}

function* removeRoleFromOrganizationWatcher() :Saga<*> {

  yield takeLatest(REMOVE_ROLE_FROM_ORGANIZATION, removeRoleFromOrganizationWorker);
}

export {
  addConnectionWatcher,
  addConnectionWorker,
  addRoleToOrganizationWatcher,
  addRoleToOrganizationWorker,
  getOrganizationACLsWatcher,
  getOrganizationACLsWorker,
  getOrganizationDataSetsWatcher,
  getOrganizationDataSetsWorker,
  getOrganizationDetailsWatcher,
  getOrganizationDetailsWorker,
  getOrgsAndPermissionsWatcher,
  getOrgsAndPermissionsWorker,
  removeConnectionWatcher,
  removeConnectionWorker,
  removeRoleFromOrganizationWatcher,
  removeRoleFromOrganizationWorker,
};

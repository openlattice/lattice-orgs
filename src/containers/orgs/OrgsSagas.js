/*
 * @flow
 */

import {
  all,
  call,
  delay,
  put,
  select,
  takeEvery,
  takeLatest,
} from '@redux-saga/core/effects';
import { List, Map, fromJS } from 'immutable';
import { Models, Types } from 'lattice';
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
import type { $AxiosError } from 'axios';
import type { AclObject } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../utils/Logger';
import { isValidUUID } from '../../utils/ValidationUtils';
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

const LOG = new Logger('OrgsSagas');

const {
  AccessCheck,
  AccessCheckBuilder,
  Principal,
  PrincipalBuilder,
} = Models;
const { PermissionTypes, PrincipalTypes } = Types;

const { getAuthorizations } = AuthorizationsApiActions;
const { getAuthorizationsWorker } = AuthorizationsApiSagas;
const {
  getAllOrganizations,
  getOrganization,
  getOrganizationIntegrationAccount,
  getOrganizationMembers,
} = OrganizationsApiActions;
const {
  getAllOrganizationsWorker,
  getOrganizationWorker,
  getOrganizationIntegrationAccountWorker,
} = OrganizationsApiSagas;
const { getAcl } = PermissionsApiActions;
const { getAclWorker } = PermissionsApiSagas;
const { getSecurablePrincipal, searchAllUsers } = PrincipalsApiActions;
const { getSecurablePrincipalWorker, searchAllUsersWorker } = PrincipalsApiSagas;

/*
 *
 * OrgsActions.getOrganizationDetails
 *
 */

function* getOrganizationDetailsWorker(action :SequenceAction) :Generator<*, *, *> {

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

function* getOrganizationDetailsWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_ORGANIZATION_DETAILS, getOrganizationDetailsWorker);
}

/*
 *
 * OrgsActions.getOrganizationPermissions
 *
 */

function* getOrganizationPermissionsWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(getOrganizationPermissions.request(action.id, action.value));

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

    yield put(getOrganizationPermissions.success(action.id, acls));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getOrganizationPermissions.failure(action.id));
  }
  finally {
    yield put(getOrganizationPermissions.finally(action.id));
  }
}

function* getOrganizationPermissionsWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_ORGANIZATION_PERMISSIONS, getOrganizationPermissionsWorker);
}

/*
 *
 * OrgsActions.getOrgsAndPermissions
 *
 */

function* getOrgsAndPermissionsWorker(action :SequenceAction) :Generator<*, *, *> {

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

function* getOrgsAndPermissionsWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_ORGS_AND_PERMISSIONS, getOrgsAndPermissionsWorker);
}

/*
 *
 * OrgsActions.searchMembersToAddToOrg
 *
 */

function* searchMembersToAddToOrgWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(searchMembersToAddToOrg.request(action.id, action.value));

    const { organizationId, query } = action.value;
    if (!isValidUUID(organizationId)) {
      throw new Error('organizationId must be a valid UUID');
    }

    yield delay(1000);

    let searchResults = List();
    if (query.length > 1) {
      const response = yield call(searchAllUsersWorker, searchAllUsers(query));
      if (response.error) throw response.error;
      searchResults = fromJS(response.data);
    }
    yield put(searchMembersToAddToOrg.success(action.id, searchResults));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(searchMembersToAddToOrg.failure(action.id));
  }
  finally {
    yield put(searchMembersToAddToOrg.finally(action.id));
  }
}

function* searchMembersToAddToOrgWatcher() :Generator<*, *, *> {

  yield takeLatest(SEARCH_MEMBERS_TO_ADD_TO_ORG, searchMembersToAddToOrgWorker);
}

export {
  getOrganizationDetailsWatcher,
  getOrganizationDetailsWorker,
  getOrganizationPermissionsWatcher,
  getOrganizationPermissionsWorker,
  getOrgsAndPermissionsWatcher,
  getOrgsAndPermissionsWorker,
  searchMembersToAddToOrgWatcher,
  searchMembersToAddToOrgWorker,
};

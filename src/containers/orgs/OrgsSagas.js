/*
 * @flow
 */

import {
  all,
  call,
  delay,
  put,
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
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../utils/Logger';
import { isValidUUID } from '../../utils/ValidationUtils';
import {
  GET_ORGANIZATION_DETAILS,
  GET_ORGS_AND_PERMISSIONS,
  SEARCH_MEMBERS_TO_ADD_TO_ORG,
  getOrganizationDetails,
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
  getOrganizationMembersWorker,
} = OrganizationsApiSagas;
const { getAcl } = PermissionsApiActions;
const { getAclWorker } = PermissionsApiSagas;
const { getSecurablePrincipal, searchAllUsers } = PrincipalsApiActions;
const { getSecurablePrincipalWorker, searchAllUsersWorker } = PrincipalsApiSagas;

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

    const [
      orgResponse,
      orgIntegrationResponse,
      orgMembersResponse,
      orgAclResponse,
    ] = yield all([
      call(getOrganizationWorker, getOrganization(organizationId)),
      call(getOrganizationIntegrationAccountWorker, getOrganizationIntegrationAccount(organizationId)),
      call(getOrganizationMembersWorker, getOrganizationMembers(organizationId)),
      call(getAclWorker, getAcl([organizationId])),
    ]);

    // NOTE: the integration account details request will fail if the user is not an owner of the org, but we should
    // still render the organization page, just without the integration account details section
    if (orgResponse.error) throw orgResponse.error;
    if (orgMembersResponse.error) throw orgMembersResponse.error;

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
      members: fromJS(orgMembersResponse.data),
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
  getOrgsAndPermissionsWatcher,
  getOrgsAndPermissionsWorker,
  searchMembersToAddToOrgWatcher,
  searchMembersToAddToOrgWorker,
};

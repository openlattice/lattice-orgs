/*
 * @flow
 */

import { all, fork } from '@redux-saga/core/effects';
import { AuthSagas } from 'lattice-auth';
import { AppApiSagas, OrganizationsApiSagas, PrincipalsApiSagas } from 'lattice-sagas';

import * as EDMSagas from '../edm/EDMSagas';
import * as RoutingSagas from '../router/RoutingSagas';
import { AppSagas } from '../../containers/app';
import { OrgsSagas } from '../../containers/orgs';

export default function* sagas() :Generator<*, *, *> {

  yield all([
    // "lattice-auth" sagas
    fork(AuthSagas.watchAuthAttempt),
    fork(AuthSagas.watchAuthSuccess),
    fork(AuthSagas.watchAuthFailure),
    fork(AuthSagas.watchAuthExpired),
    fork(AuthSagas.watchLogout),

    // "lattice-sagas" sagas
    fork(AppApiSagas.getAppConfigsWatcher),
    fork(OrganizationsApiSagas.addDomainToOrganizationWatcher),
    fork(OrganizationsApiSagas.addMemberToOrganizationWatcher),
    fork(OrganizationsApiSagas.createRoleWatcher),
    fork(OrganizationsApiSagas.deleteOrganizationWatcher),
    fork(OrganizationsApiSagas.deleteRoleWatcher),
    fork(OrganizationsApiSagas.getAllOrganizationsWatcher),
    fork(OrganizationsApiSagas.getOrganizationWatcher),
    fork(OrganizationsApiSagas.getOrganizationIntegrationAccountWatcher),
    fork(OrganizationsApiSagas.grantTrustToOrganizationWatcher),
    fork(OrganizationsApiSagas.getOrganizationMembersWatcher),
    fork(OrganizationsApiSagas.removeDomainFromOrganizationWatcher),
    fork(OrganizationsApiSagas.removeMemberFromOrganizationWatcher),
    fork(OrganizationsApiSagas.revokeTrustFromOrganizationWatcher),
    fork(PrincipalsApiSagas.getSecurablePrincipalWatcher),
    fork(PrincipalsApiSagas.searchAllUsersWatcher),

    // AppSagas
    fork(AppSagas.initializeApplicationWatcher),

    // EDMSagas
    fork(EDMSagas.getEntityDataModelTypesWatcher),
    fork(EDMSagas.getEntitySetIdsWatcher),

    // OrgsSagas
    fork(OrgsSagas.getOrganizationDetailsWatcher),
    fork(OrgsSagas.getOrgsAndPermissionsWatcher),
    fork(OrgsSagas.searchMembersToAddToOrgWatcher),

    // RoutingSagas
    fork(RoutingSagas.goToRootWatcher),
    fork(RoutingSagas.goToRouteWatcher),
  ]);
}

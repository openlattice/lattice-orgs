/*
 * @flow
 */

import { all, fork } from '@redux-saga/core/effects';
import { AuthSagas } from 'lattice-auth';
import {
  AuthorizationsApiSagas,
  OrganizationsApiSagas,
  PrincipalsApiSagas,
} from 'lattice-sagas';
import type { Saga } from '@redux-saga/core';

import * as RoutingSagas from '../router/RoutingSagas';
import { AppSagas } from '../../containers/app';
import { OrgSagas } from '../../containers/org';
import { OrgsSagas } from '../../containers/orgs';
import { EDMSagas } from '../edm';
import { PermissionsSagas } from '../permissions';

export default function* sagas() :Saga<*> {

  yield all([
    // "lattice-auth" sagas
    fork(AuthSagas.watchAuthAttempt),
    fork(AuthSagas.watchAuthSuccess),
    fork(AuthSagas.watchAuthFailure),
    fork(AuthSagas.watchAuthExpired),
    fork(AuthSagas.watchLogout),

    // "lattice-sagas" sagas
    fork(AuthorizationsApiSagas.getAuthorizationsWatcher),
    fork(OrganizationsApiSagas.addDomainsToOrganizationWatcher),
    fork(OrganizationsApiSagas.addMemberToOrganizationWatcher),
    fork(OrganizationsApiSagas.addRoleToMemberWatcher),
    fork(OrganizationsApiSagas.createOrganizationWatcher),
    fork(OrganizationsApiSagas.createRoleWatcher),
    fork(OrganizationsApiSagas.deleteOrganizationWatcher),
    fork(OrganizationsApiSagas.deleteRoleWatcher),
    fork(OrganizationsApiSagas.getAllOrganizationsWatcher),
    fork(OrganizationsApiSagas.getOrganizationWatcher),
    fork(OrganizationsApiSagas.getOrganizationEntitySetsWatcher),
    fork(OrganizationsApiSagas.getOrganizationIntegrationAccountWatcher),
    fork(OrganizationsApiSagas.getOrganizationMembersWatcher),
    fork(OrganizationsApiSagas.grantTrustToOrganizationWatcher),
    fork(OrganizationsApiSagas.removeDomainsFromOrganizationWatcher),
    fork(OrganizationsApiSagas.removeMemberFromOrganizationWatcher),
    fork(OrganizationsApiSagas.removeRoleFromMemberWatcher),
    fork(OrganizationsApiSagas.revokeTrustFromOrganizationWatcher),
    fork(OrganizationsApiSagas.updateOrganizationDescriptionWatcher),
    fork(OrganizationsApiSagas.updateOrganizationTitleWatcher),
    fork(OrganizationsApiSagas.updateRoleGrantWatcher),
    fork(PrincipalsApiSagas.getAllUsersWatcher),
    fork(PrincipalsApiSagas.getSecurablePrincipalWatcher),
    fork(PrincipalsApiSagas.searchAllUsersWatcher),

    // AppSagas
    fork(AppSagas.initializeApplicationWatcher),

    // EDMSagas
    fork(EDMSagas.getEntityDataModelTypesWatcher),
    fork(EDMSagas.getOrSelectDataSetsWatcher),

    // OrgSagas
    fork(OrgSagas.addRoleToOrganizationWatcher),
    fork(OrgSagas.createNewOrganizationWatcher),
    fork(OrgSagas.initializeOrganizationWatcher),
    fork(OrgSagas.removeRoleFromOrganizationWatcher),

    // OrgSagas
    fork(OrgsSagas.getOrganizationsAndAuthorizationsWatcher),

    // PermissionsSagas
    fork(PermissionsSagas.getDataSetPermissionsWatcher),
    fork(PermissionsSagas.getPermissionsWatcher),
    fork(PermissionsSagas.setPermissionsWatcher),

    // RoutingSagas
    fork(RoutingSagas.goToRootWatcher),
    fork(RoutingSagas.goToRouteWatcher),
  ]);
}

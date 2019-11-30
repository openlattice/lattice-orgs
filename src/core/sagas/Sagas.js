/*
 * @flow
 */

import { all, fork } from '@redux-saga/core/effects';
import { AuthSagas } from 'lattice-auth';
import {
  EntitySetsApiSagas,
  OrganizationsApiSagas,
  PermissionsApiSagas,
  PrincipalsApiSagas,
} from 'lattice-sagas';

import * as EDMSagas from '../edm/EDMSagas';
import * as RoutingSagas from '../router/RoutingSagas';
import { AppSagas } from '../../containers/app';
import { OrgsSagas } from '../../containers/orgs';
import { PermissionsSagas } from '../permissions';

export default function* sagas() :Generator<*, *, *> {

  yield all([
    // "lattice-auth" sagas
    fork(AuthSagas.watchAuthAttempt),
    fork(AuthSagas.watchAuthSuccess),
    fork(AuthSagas.watchAuthFailure),
    fork(AuthSagas.watchAuthExpired),
    fork(AuthSagas.watchLogout),

    // "lattice-sagas" sagas
    fork(EntitySetsApiSagas.getAllEntitySetsWatcher),
    fork(OrganizationsApiSagas.addDomainToOrganizationWatcher),
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
    fork(OrganizationsApiSagas.removeDomainFromOrganizationWatcher),
    fork(OrganizationsApiSagas.removeMemberFromOrganizationWatcher),
    fork(OrganizationsApiSagas.removeRoleFromMemberWatcher),
    fork(OrganizationsApiSagas.revokeTrustFromOrganizationWatcher),
    fork(OrganizationsApiSagas.updateOrganizationDescriptionWatcher),
    fork(OrganizationsApiSagas.updateOrganizationTitleWatcher),
    fork(OrganizationsApiSagas.updateRoleGrantWatcher),
    fork(PermissionsApiSagas.updateAclWatcher),
    fork(PermissionsApiSagas.updateAclsWatcher),
    fork(PrincipalsApiSagas.getAllUsersWatcher),
    fork(PrincipalsApiSagas.getSecurablePrincipalWatcher),
    fork(PrincipalsApiSagas.searchAllUsersWatcher),

    // AppSagas
    fork(AppSagas.initializeApplicationWatcher),

    // EDMSagas
    fork(EDMSagas.getEntityDataModelTypesWatcher),

    // OrgsSagas
    fork(OrgsSagas.addConnectionWatcher),
    fork(OrgsSagas.addRoleToOrganizationWatcher),
    fork(OrgsSagas.getOrganizationACLsWatcher),
    fork(OrgsSagas.getOrganizationDetailsWatcher),
    fork(OrgsSagas.getOrgsAndPermissionsWatcher),
    fork(OrgsSagas.removeConnectionWatcher),
    fork(OrgsSagas.removeRoleFromOrganizationWatcher),

    // PermissionsSagas
    fork(PermissionsSagas.updateUserPermissionWatcher),

    // RoutingSagas
    fork(RoutingSagas.goToRootWatcher),
    fork(RoutingSagas.goToRouteWatcher),
  ]);
}

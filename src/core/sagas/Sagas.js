/*
 * @flow
 */

import { all, fork } from '@redux-saga/core/effects';
import { AuthSagas } from 'lattice-auth';
import {
  AuthorizationsApiSagas,
  DataSetsApiSagas,
  OrganizationsApiSagas,
  PrincipalsApiSagas,
} from 'lattice-sagas';
import type { Saga } from '@redux-saga/core';

import * as RoutingSagas from '../router/RoutingSagas';
import { AppSagas } from '../../containers/app';
import { OrgSagas } from '../../containers/org';
import { OrgsSagas } from '../../containers/orgs';
import { RequestsSagas } from '../../containers/requests';
import { DataSagas } from '../data';
import { EDMSagas } from '../edm';
import { PermissionsSagas } from '../permissions';
import { SearchSagas } from '../search';

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
    fork(DataSetsApiSagas.getOrganizationDataSetSchemaWatcher),
    fork(OrganizationsApiSagas.addDomainsToOrganizationWatcher),
    fork(OrganizationsApiSagas.addMemberToOrganizationWatcher),
    fork(OrganizationsApiSagas.addRoleToMemberWatcher),
    fork(OrganizationsApiSagas.createOrganizationWatcher),
    fork(OrganizationsApiSagas.createRoleWatcher),
    fork(OrganizationsApiSagas.deleteOrganizationWatcher),
    fork(OrganizationsApiSagas.deleteRoleWatcher),
    fork(OrganizationsApiSagas.destroyTransportedOrganizationEntitySetWatcher),
    fork(OrganizationsApiSagas.getAllOrganizationsWatcher),
    fork(OrganizationsApiSagas.getOrganizationDatabaseNameWatcher),
    fork(OrganizationsApiSagas.getOrganizationDataSourcesWatcher),
    fork(OrganizationsApiSagas.getOrganizationEntitySetsWatcher),
    fork(OrganizationsApiSagas.getOrganizationIntegrationAccountWatcher),
    fork(OrganizationsApiSagas.getOrganizationMembersWatcher),
    fork(OrganizationsApiSagas.getOrganizationWatcher),
    fork(OrganizationsApiSagas.grantTrustToOrganizationWatcher),
    fork(OrganizationsApiSagas.promoteStagingTableWatcher),
    fork(OrganizationsApiSagas.registerOrganizationDataSourceWatcher),
    fork(OrganizationsApiSagas.removeDomainsFromOrganizationWatcher),
    fork(OrganizationsApiSagas.removeMemberFromOrganizationWatcher),
    fork(OrganizationsApiSagas.removeRoleFromMemberWatcher),
    fork(OrganizationsApiSagas.renameOrganizationDatabaseWatcher),
    fork(OrganizationsApiSagas.revokeTrustFromOrganizationWatcher),
    fork(OrganizationsApiSagas.transportOrganizationEntitySetWatcher),
    fork(OrganizationsApiSagas.updateOrganizationDataSourceWatcher),
    fork(OrganizationsApiSagas.updateOrganizationDescriptionWatcher),
    fork(OrganizationsApiSagas.updateOrganizationTitleWatcher),
    fork(OrganizationsApiSagas.updateRoleGrantWatcher),

    // PrincipalsApiSagas
    fork(PrincipalsApiSagas.getAllUsersWatcher),
    fork(PrincipalsApiSagas.getAtlasCredentialsWatcher),
    fork(PrincipalsApiSagas.getSecurablePrincipalWatcher),
    fork(PrincipalsApiSagas.regenerateCredentialWatcher),
    fork(PrincipalsApiSagas.searchAllUsersWatcher),

    // AppSagas
    fork(AppSagas.initializeApplicationWatcher),

    // DataSagas
    fork(DataSagas.submitDataGraphWatcher),

    // EDMSagas
    fork(EDMSagas.getEntityDataModelTypesWatcher),
    fork(EDMSagas.getOrSelectDataSetWatcher),
    fork(EDMSagas.getOrSelectDataSetsWatcher),
    fork(EDMSagas.getOrgDataSetColumnsFromMetaWatcher),
    fork(EDMSagas.getOrgDataSetsFromMetaWatcher),
    fork(EDMSagas.initializeOrganizationDataSetWatcher),
    fork(EDMSagas.updateOrganizationDataSetWatcher),

    // OrgSagas
    fork(OrgSagas.addMembersToOrganizationWatcher),
    fork(OrgSagas.addRoleToOrganizationWatcher),
    fork(OrgSagas.assignRolesToMembersWatcher),
    fork(OrgSagas.createNewOrganizationWatcher),
    fork(OrgSagas.editOrganizationDetailsWatcher),
    fork(OrgSagas.editRoleDetailsWatcher),
    fork(OrgSagas.getOrganizationIntegrationDetailsWatcher),
    fork(OrgSagas.initializeOrganizationWatcher),
    fork(OrgSagas.removeRoleFromOrganizationWatcher),
    fork(OrgsSagas.getOrganizationsAndAuthorizationsWatcher),

    // PermissionsSagas
    fork(PermissionsSagas.assignPermissionsToDataSetWatcher),
    fork(PermissionsSagas.getCurrentDataSetAuthorizationsWatcher),
    fork(PermissionsSagas.getCurrentRoleAuthorizationsWatcher),
    fork(PermissionsSagas.getDataSetPermissionsPageWatcher),
    fork(PermissionsSagas.getOrgDataSetObjectPermissionsWatcher),
    fork(PermissionsSagas.getOrgObjectPermissionsWatcher),
    fork(PermissionsSagas.getOrgRoleObjectPermissionsWatcher),
    fork(PermissionsSagas.getOwnerStatusWatcher),
    fork(PermissionsSagas.getPermissionsWatcher),
    fork(PermissionsSagas.initializeObjectPermissionsWatcher),
    fork(PermissionsSagas.setPermissionsWatcher),
    fork(PermissionsSagas.updatePermissionsWatcher),

    // RequestsSagas
    fork(RequestsSagas.getDataSetAccessRequestsWatcher),
    fork(RequestsSagas.initializeDataSetAccessRequestWatcher),
    fork(RequestsSagas.submitDataSetAccessRequestWatcher),
    fork(RequestsSagas.submitDataSetAccessResponseWatcher),

    // RoutingSagas
    fork(RoutingSagas.goToRootWatcher),
    fork(RoutingSagas.goToRouteWatcher),

    // SearchSagas
    fork(SearchSagas.searchDataWatcher),
    fork(SearchSagas.searchOrganizationDataSetsWatcher),
  ]);
}

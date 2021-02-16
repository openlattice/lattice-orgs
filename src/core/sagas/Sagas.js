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

    // EDMSagas
    fork(EDMSagas.getEntityDataModelTypesWatcher),
    fork(EDMSagas.getOrSelectDataSetWatcher),
    fork(EDMSagas.getOrSelectDataSetsWatcher),

    // OrgSagas
    fork(OrgSagas.addMembersToOrganizationWatcher),
    fork(OrgSagas.addRoleToOrganizationWatcher),
    fork(OrgSagas.assignRolesToMembersWatcher),
    fork(OrgSagas.createNewOrganizationWatcher),
    fork(OrgSagas.deleteExistingOrganizationWatcher),
    fork(OrgSagas.editMetadataWatcher),
    fork(OrgSagas.editOrganizationDetailsWatcher),
    fork(OrgSagas.editRoleDetailsWatcher),
    fork(OrgSagas.getOrganizationIntegrationDetailsWatcher),
    fork(OrgSagas.getShiproomMetadataWatcher),
    fork(OrgSagas.initializeOrganizationWatcher),
    fork(OrgSagas.removeRoleFromOrganizationWatcher),
    fork(OrgsSagas.getOrganizationsAndAuthorizationsWatcher),

    // PermissionsSagas
    fork(PermissionsSagas.assignPermissionsToDataSetWatcher),
    fork(PermissionsSagas.getCurrentDataSetAuthorizationsWatcher),
    fork(PermissionsSagas.getCurrentRoleAuthorizationsWatcher),
    fork(PermissionsSagas.getDataSetKeysWatcher),
    fork(PermissionsSagas.getDataSetPermissionsWatcher),
    fork(PermissionsSagas.getOrgDataSetObjectPermissionsWatcher),
    fork(PermissionsSagas.getOrgObjectPermissionsWatcher),
    fork(PermissionsSagas.getOrgRoleObjectPermissionsWatcher),
    fork(PermissionsSagas.getOwnerStatusWatcher),
    fork(PermissionsSagas.getPageDataSetPermissionsWatcher),
    fork(PermissionsSagas.getPermissionsWatcher),
    fork(PermissionsSagas.initializeDataSetPermissionsWatcher),
    fork(PermissionsSagas.initializeObjectPermissionsWatcher),
    fork(PermissionsSagas.setPermissionsWatcher),
    fork(PermissionsSagas.updatePermissionsWatcher),

    // RoutingSagas
    fork(RoutingSagas.goToRootWatcher),
    fork(RoutingSagas.goToRouteWatcher),

    // SearchSagas
    fork(SearchSagas.searchDataSetsToAssignPermissionsWatcher),
    fork(SearchSagas.searchDataSetsToFilterWatcher),
    fork(SearchSagas.searchDataSetsWatcher),
    fork(SearchSagas.searchDataWatcher),
    fork(SearchSagas.searchOrganizationDataSetsWatcher),
  ]);
}

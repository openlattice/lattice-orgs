/*
 * @flow
 */

import { all, fork } from '@redux-saga/core/effects';
import { AuthSagas } from 'lattice-auth';
import { AppApiSagas, OrganizationsApiSagas } from 'lattice-sagas';

import * as EDMSagas from '../edm/EDMSagas';
import * as RoutingSagas from '../router/RoutingSagas';
import { AppSagas } from '../../containers/app';

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
    fork(OrganizationsApiSagas.addAutoApprovedDomainWatcher),
    fork(OrganizationsApiSagas.createRoleWatcher),
    fork(OrganizationsApiSagas.deleteRoleWatcher),
    fork(OrganizationsApiSagas.getAllOrganizationsWatcher),
    fork(OrganizationsApiSagas.getOrganizationWatcher),
    fork(OrganizationsApiSagas.removeAutoApprovedDomainWatcher),

    // AppSagas
    fork(AppSagas.initializeApplicationWatcher),

    // EDMSagas
    fork(EDMSagas.getEntityDataModelTypesWatcher),
    fork(EDMSagas.getEntitySetIdsWatcher),

    // RoutingSagas
    fork(RoutingSagas.goToRootWatcher),
    fork(RoutingSagas.goToRouteWatcher),
  ]);
}

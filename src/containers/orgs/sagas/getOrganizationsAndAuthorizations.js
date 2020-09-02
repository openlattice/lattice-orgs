/*
 * @flow
 */

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { Models, Types } from 'lattice';
import {
  AuthorizationsApiActions,
  AuthorizationsApiSagas,
  OrganizationsApiActions,
  OrganizationsApiSagas,
} from 'lattice-sagas';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { OrganizationObject } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { AxiosUtils } from '../../../utils';
import { GET_ORGANIZATIONS_AND_AUTHORIZATIONS, getOrganizationsAndAuthorizations } from '../actions';
import type { AuthorizationObject } from '../../../types';

const { AccessCheck, AccessCheckBuilder } = Models;
const { PermissionTypes } = Types;

const { getAuthorizations } = AuthorizationsApiActions;
const { getAuthorizationsWorker } = AuthorizationsApiSagas;
const { getAllOrganizations } = OrganizationsApiActions;
const { getAllOrganizationsWorker } = OrganizationsApiSagas;

const LOG = new Logger('OrgsSagas');

function* getOrganizationsAndAuthorizationsWorker(action :SequenceAction) :Saga<WorkerResponse> {

  let workerResponse :WorkerResponse;

  try {
    yield put(getOrganizationsAndAuthorizations.request(action.id, action.value));

    const response1 :WorkerResponse = yield call(getAllOrganizationsWorker, getAllOrganizations());
    if (response1.error) throw response1.error;

    const organizations :OrganizationObject[] = response1.data;
    const accessChecks :AccessCheck[] = [];
    organizations.forEach((org :OrganizationObject) => {
      accessChecks.push(
        (new AccessCheckBuilder())
          .setAclKey([(org.id :any)])
          .setPermissions([PermissionTypes.OWNER])
          .build()
      );
    });

    const response2 :WorkerResponse = yield call(getAuthorizationsWorker, getAuthorizations(accessChecks));
    if (response2.error) throw response2.error;

    const authorizations :AuthorizationObject[] = response2.data;
    if (organizations.length !== authorizations.length) {
      throw new Error('organizations and authorizations size mismatch');
    }

    workerResponse = { data: { authorizations, organizations } };
    yield put(getOrganizationsAndAuthorizations.success(action.id, workerResponse.data));
  }
  catch (error) {
    workerResponse = { error };
    LOG.error(action.type, error);
    yield put(getOrganizationsAndAuthorizations.failure(action.id, AxiosUtils.toSagaError(error)));
  }
  finally {
    yield put(getOrganizationsAndAuthorizations.finally(action.id));
  }

  return workerResponse;
}

function* getOrganizationsAndAuthorizationsWatcher() :Saga<*> {

  yield takeEvery(GET_ORGANIZATIONS_AND_AUTHORIZATIONS, getOrganizationsAndAuthorizationsWorker);
}

export {
  getOrganizationsAndAuthorizationsWatcher,
  getOrganizationsAndAuthorizationsWorker,
};

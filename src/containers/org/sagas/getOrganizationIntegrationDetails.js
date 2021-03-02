/*
 * @flow
 */

import {
  all,
  call,
  put,
  takeEvery,
} from '@redux-saga/core/effects';
import { Map } from 'immutable';
import { OrganizationsApiActions, OrganizationsApiSagas } from 'lattice-sagas';
import { AxiosUtils, Logger, ValidationUtils } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { GET_ORGANIZATION_INTEGRATION_DETAILS, getOrganizationIntegrationDetails } from '../actions';

const { getOrganizationDatabaseName, getOrganizationIntegrationAccount } = OrganizationsApiActions;
const { getOrganizationDatabaseNameWorker, getOrganizationIntegrationAccountWorker } = OrganizationsApiSagas;
const { isValidUUID } = ValidationUtils;
const { toSagaError } = AxiosUtils;

const LOG = new Logger('OrgsSagas');

function* getOrganizationIntegrationDetailsWorker(action :SequenceAction) :Saga<*> {

  let integrationDetails = Map();

  try {
    yield put(getOrganizationIntegrationDetails.request(action.id, action.value));

    const organizationId :UUID = action.value;
    if (!isValidUUID(organizationId)) {
      throw new Error('organizationId must be a valid UUID');
    }

    const [
      getOrganizationDatabaseNameResponse,
      getOrganizationIntegrationAccountResponse,
    ] :WorkerResponse[] = yield all([
      call(getOrganizationDatabaseNameWorker, getOrganizationDatabaseName(organizationId)),
      call(getOrganizationIntegrationAccountWorker, getOrganizationIntegrationAccount(organizationId)),
    ]);

    if (getOrganizationDatabaseNameResponse.error) throw getOrganizationDatabaseNameResponse.error;
    const databaseName = getOrganizationDatabaseNameResponse.data;
    integrationDetails = integrationDetails.set('databaseName', databaseName);

    if (getOrganizationIntegrationAccountResponse.error) throw getOrganizationIntegrationAccountResponse.error;
    const integrationAccount = getOrganizationIntegrationAccountResponse.data;
    integrationDetails = integrationDetails
      .set('credential', integrationAccount.credential)
      .set('userName', integrationAccount.user);

    yield put(getOrganizationIntegrationDetails.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getOrganizationIntegrationDetails.failure(action.id, toSagaError(error)));
  }
  finally {
    yield put(getOrganizationIntegrationDetails.finally(action.id, integrationDetails));
  }
}

function* getOrganizationIntegrationDetailsWatcher() :Saga<*> {
  yield takeEvery(GET_ORGANIZATION_INTEGRATION_DETAILS, getOrganizationIntegrationDetailsWorker);
}

export {
  getOrganizationIntegrationDetailsWatcher,
  getOrganizationIntegrationDetailsWorker,
};

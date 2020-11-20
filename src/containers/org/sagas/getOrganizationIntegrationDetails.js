/*
 * @flow
 */

import {
  all,
  call,
  put,
  takeEvery,
} from '@redux-saga/core/effects';
import { fromJS } from 'immutable';
import { OrganizationsApiActions, OrganizationsApiSagas } from 'lattice-sagas';
import { Logger, ValidationUtils } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { GET_ORGANIZATION_INTEGRATION_DETAILS, getOrganizationIntegrationDetails } from '../actions';

const { getOrganizationDatabaseName, getOrganizationIntegrationAccount } = OrganizationsApiActions;
const { getOrganizationDatabaseNameWorker, getOrganizationIntegrationAccountWorker } = OrganizationsApiSagas;
const { isValidUUID } = ValidationUtils;

const LOG = new Logger('OrgsSagas');

function* getOrganizationIntegrationDetailsWorker(action :SequenceAction) :Saga<*> {

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
    if (getOrganizationIntegrationAccountResponse.error) throw getOrganizationIntegrationAccountResponse.error;

    const databaseName = getOrganizationDatabaseNameResponse.data;
    const integrationAccount = getOrganizationIntegrationAccountResponse.data;
    const integrationDetails = fromJS({
      databaseName,
      credential: integrationAccount.credential,
      userName: integrationAccount.user,
    });

    yield put(getOrganizationIntegrationDetails.success(action.id, integrationDetails));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getOrganizationIntegrationDetails.failure(action.id));
  }
  finally {
    yield put(getOrganizationIntegrationDetails.finally(action.id));
  }
}

function* getOrganizationIntegrationDetailsWatcher() :Saga<*> {

  yield takeEvery(GET_ORGANIZATION_INTEGRATION_DETAILS, getOrganizationIntegrationDetailsWorker);
}

export {
  getOrganizationIntegrationDetailsWatcher,
  getOrganizationIntegrationDetailsWorker,
};

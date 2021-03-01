/*
 * @flow
 */

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { OrganizationsApiActions, OrganizationsApiSagas } from 'lattice-sagas';
import { AxiosUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { DELETE_EXISTING_ORGANIZATION, deleteExistingOrganization } from '../actions';

const { deleteOrganization } = OrganizationsApiActions;
const { deleteOrganizationWorker } = OrganizationsApiSagas;
const { toSagaError } = AxiosUtils;

const { toSagaError } = AxiosUtils;

const LOG = new Logger('OrgSagas');

function* deleteExistingOrganizationWorker(action :SequenceAction) :Saga<void> {

  try {
    yield put(deleteExistingOrganization.request(action.id, action.value));
    const response :WorkerResponse = yield call(deleteOrganizationWorker, deleteOrganization(action.value));
    if (response.error) throw response.error;
    yield put(deleteExistingOrganization.success(action.id, action.value));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(deleteExistingOrganization.failure(action.id, toSagaError(error)));
  }
  finally {
    yield put(deleteExistingOrganization.finally(action.id));
  }
}

function* deleteExistingOrganizationWatcher() :Saga<*> {

  yield takeEvery(DELETE_EXISTING_ORGANIZATION, deleteExistingOrganizationWorker);
}

export {
  deleteExistingOrganizationWatcher,
  deleteExistingOrganizationWorker,
};

/*
 * @flow
 */

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { AppApiActions, AppApiSagas } from 'lattice-sagas';
import { AxiosUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { IS_APP_INSTALLED, isAppInstalled } from '../actions';

const { getApp, getAppConfigs } = AppApiActions;
const { getAppWorker, getAppConfigsWorker } = AppApiSagas;
const { toSagaError } = AxiosUtils;

const LOG = new Logger('EDMSagas');

function* isAppInstalledWorker(action :SequenceAction) :Saga<WorkerResponse> {

  let workerResponse :WorkerResponse;

  try {
    yield put(isAppInstalled.request(action.id, action.value));

    const {
      appName,
      organizationId,
    } :{|
      appName :string;
      organizationId :UUID;
    |} = action.value;

    // TODO: switch to new api
    const getAppResponse :WorkerResponse = yield call(getAppWorker, getApp(appName));
    if (getAppResponse.error) throw getAppResponse.error;

    const appId :UUID = getAppResponse.data.id;
    const getAppConfigsResponse :WorkerResponse = yield call(getAppConfigsWorker, getAppConfigs(appId));
    if (getAppConfigsResponse.error) throw getAppConfigsResponse.error;

    let installed = false;
    getAppConfigsResponse.data.forEach((config) => {
      if (config.organization.id === organizationId || config.organizationId === organizationId) {
        installed = true;
      }
    });

    workerResponse = { data: installed };
    yield put(isAppInstalled.success(action.id, workerResponse.data));
  }
  catch (error) {
    workerResponse = { error };
    LOG.error(action.type, error);
    yield put(isAppInstalled.failure(action.id, toSagaError(error)));
  }
  finally {
    yield put(isAppInstalled.finally(action.id));
  }

  return workerResponse;
}

function* isAppInstalledWatcher() :Saga<*> {

  yield takeEvery(IS_APP_INSTALLED, isAppInstalledWorker);
}

export {
  isAppInstalledWatcher,
  isAppInstalledWorker,
};

/*
 * @flow
 */

import {
  call,
  put,
  takeEvery,
} from '@redux-saga/core/effects';
import { Set } from 'immutable';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { getPermissionsWorker } from './getPermissions';

import { getDataSetKeysWorker } from './getDataSetKeys';
import {
  GET_DATA_SET_PERMISSIONS,
  getDataSetKeys,
  getDataSetPermissions,
  getPermissions
} from '../actions';

const LOG = new Logger('PermissionsSagas');

function* getDataSetPermissionsWorker(action :SequenceAction) :Saga<WorkerResponse> {

  let workerResponse :WorkerResponse;

  try {
    yield put(getDataSetPermissions.request(action.id, action.value));

    const {
      atlasDataSetIds,
      entitySetIds,
      organizationId,
      withProperties = false,
    } :{|
      atlasDataSetIds :Set<UUID>;
      entitySetIds :Set<UUID>;
      organizationId :UUID;
      withProperties :boolean;
    |} = action.value;

    const keysResponse :WorkerResponse = yield call(getDataSetKeysWorker, getDataSetKeys({
      atlasDataSetIds,
      entitySetIds,
      organizationId,
      withProperties,
    }));
    if (keysResponse.error) throw keysResponse.error;

    const { keys } = keysResponse.data;

    if (!keys.isEmpty()) {
      const response :WorkerResponse = yield call(getPermissionsWorker, getPermissions(keys));
      if (response.error) throw response.error;
    }

    workerResponse = { data: {} };
    yield put(getDataSetPermissions.success(action.id));
  }
  catch (error) {
    workerResponse = { error };
    LOG.error(action.type, error);
    yield put(getDataSetPermissions.failure(action.id, error));
  }
  finally {
    yield put(getDataSetPermissions.finally(action.id));
  }

  return workerResponse;
}

function* getDataSetPermissionsWatcher() :Saga<*> {

  yield takeEvery(GET_DATA_SET_PERMISSIONS, getDataSetPermissionsWorker);
}

export {
  getDataSetPermissionsWatcher,
  getDataSetPermissionsWorker,
};

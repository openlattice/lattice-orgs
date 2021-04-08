/*
 * @flow
 */

import {
  all,
  call,
  put,
  takeEvery,
} from '@redux-saga/core/effects';
import { List } from 'immutable';
import { AxiosUtils, LangUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type {
  Ace,
  ActionType,
  UUID,
} from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { updatePermissionsWorker } from './updatePermissions';

import { UPDATE_PERMISSIONS_BULK, updatePermissions, updatePermissionsBulk } from '../actions';

const { toSagaError } = AxiosUtils;
const { isDefined } = LangUtils;

const LOG = new Logger('PermissionsSagas');

function* updatePermissionsBulkWorker(action :SequenceAction) :Saga<WorkerResponse> {

  let workerResponse :WorkerResponse;

  try {
    yield put(updatePermissionsBulk.request(action.id, action.value));

    const permissionsUpdates :Object[] = action.value;

    const permissionsCalls = [];

    permissionsUpdates.forEach((permissionUpdate :{ actionType :ActionType, permissions :Map<List<UUID, Ace>> }) => {
      permissionsCalls.push(call(updatePermissionsWorker, updatePermissions(permissionUpdate)));
    });

    const responses = yield all(permissionsCalls);
    const responseError = responses.reduce(
      (error :any, r :Object) => (isDefined(error) ? error : r.error),
      undefined,
    );
    if (responseError) throw responseError;

    workerResponse = { data: {} };
    yield put(updatePermissionsBulk.success(action.id));
  }
  catch (error) {
    workerResponse = { error };
    LOG.error(action.type, error);
    yield put(updatePermissionsBulk.failure(action.id, toSagaError(error)));
  }
  finally {
    yield put(updatePermissionsBulk.finally(action.id));
  }

  return workerResponse;
}

function* updatePermissionsBulkWatcher() :Saga<*> {

  yield takeEvery(UPDATE_PERMISSIONS_BULK, updatePermissionsBulkWorker);
}

export {
  updatePermissionsBulkWatcher,
  updatePermissionsBulkWorker,
};

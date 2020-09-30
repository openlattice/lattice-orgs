/*
 * @flow
 */

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { List, Set } from 'immutable';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { getPermissionsWorker } from './getPermissions';

import { GET_DATA_SET_PERMISSIONS, getDataSetPermissions, getPermissions } from '../actions';

const LOG = new Logger('PermissionsSagas');

function* getDataSetPermissionsWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(getDataSetPermissions.request(action.id, action.value));

    const dataSetIds :Set<UUID> = action.value;
    const dataSetKeys :List<List<UUID>> = List(dataSetIds).map((id) => List([id]));
    const response :WorkerResponse = yield call(getPermissionsWorker, getPermissions(dataSetKeys));
    if (response.error) throw response.error;

    yield put(getDataSetPermissions.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getDataSetPermissions.failure(action.id, error));
  }
  finally {
    yield put(getDataSetPermissions.finally(action.id));
  }
}

function* getDataSetPermissionsWatcher() :Saga<*> {

  yield takeEvery(GET_DATA_SET_PERMISSIONS, getDataSetPermissionsWorker);
}

export {
  getDataSetPermissionsWatcher,
  getDataSetPermissionsWorker,
};

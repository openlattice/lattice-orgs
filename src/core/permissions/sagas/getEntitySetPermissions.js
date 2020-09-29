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

import { GET_ENTITY_SET_PERMISSIONS, getEntitySetPermissions, getPermissions } from '../actions';

const LOG = new Logger('PermissionsSagas');

function* getEntitySetPermissionsWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(getEntitySetPermissions.request(action.id, action.value));

    const entitySetIds :Set<UUID> = action.value;
    const entitySetKeys :List<List<UUID>> = List(entitySetIds).map((id) => List([id]));
    const response :WorkerResponse = yield call(getPermissionsWorker, getPermissions(entitySetKeys));
    if (response.error) throw response.error;

    yield put(getEntitySetPermissions.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getEntitySetPermissions.failure(action.id, error));
  }
  finally {
    yield put(getEntitySetPermissions.finally(action.id));
  }
}

function* getEntitySetPermissionsWatcher() :Saga<*> {

  yield takeEvery(GET_ENTITY_SET_PERMISSIONS, getEntitySetPermissionsWorker);
}

export {
  getEntitySetPermissionsWatcher,
  getEntitySetPermissionsWorker,
};

/*
 * @flow
 */

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { SequenceAction } from 'redux-reqseq';

import { getPermissionsWorker } from './getPermissions';

import {
  GET_ORG_DATA_SET_OBJECT_PERMISSIONS,
  getOrgDataSetObjectPermissions,
  getPermissions,
} from '../actions';

const LOG = new Logger('PermissionsSagas');

// TODO: create a wrapperWorker as an abstraction around this exact logic
function* getOrgDataSetObjectPermissionsWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(getOrgDataSetObjectPermissions.request(action.id, action.value));
    const response = yield call(getPermissionsWorker, getPermissions(action.value));
    if (response.error) throw response.error;
    yield put(getOrgDataSetObjectPermissions.success(action.id, response.data));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getOrgDataSetObjectPermissions.failure(action.id, error));
  }
  finally {
    yield put(getOrgDataSetObjectPermissions.finally(action.id));
  }
}

function* getOrgDataSetObjectPermissionsWatcher() :Saga<*> {

  yield takeEvery(
    GET_ORG_DATA_SET_OBJECT_PERMISSIONS,
    getOrgDataSetObjectPermissionsWorker,
  );
}

export {
  getOrgDataSetObjectPermissionsWatcher,
  getOrgDataSetObjectPermissionsWorker,
};

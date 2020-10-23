/*
 * @flow
 */

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { SequenceAction } from 'redux-reqseq';

import { getDataSetPermissionsWorker } from './getDataSetPermissions';

import {
  GET_DATA_SET_PERMISSIONS_IN_DATA_SET_PERMISSIONS_MODAL,
  getDataSetPermissions,
  getDataSetPermissionsInDataSetPermissionsModal,
} from '../actions';

const LOG = new Logger('PermissionsSagas');

function* getDataSetPermissionsInDataSetPermissionsModalWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(getDataSetPermissionsInDataSetPermissionsModal.request(action.id, action.value));
    const response = yield call(getDataSetPermissionsWorker, getDataSetPermissions(action.value));
    if (response.error) throw response.error;
    yield put(getDataSetPermissionsInDataSetPermissionsModal.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getDataSetPermissionsInDataSetPermissionsModal.failure(action.id, error));
  }
  finally {
    yield put(getDataSetPermissionsInDataSetPermissionsModal.finally(action.id));
  }
}

function* getDataSetPermissionsInDataSetPermissionsModalWatcher() :Saga<*> {

  yield takeEvery(
    GET_DATA_SET_PERMISSIONS_IN_DATA_SET_PERMISSIONS_MODAL,
    getDataSetPermissionsInDataSetPermissionsModalWorker,
  );
}

export {
  getDataSetPermissionsInDataSetPermissionsModalWatcher,
  getDataSetPermissionsInDataSetPermissionsModalWorker,
};

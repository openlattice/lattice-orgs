/*
 * @flow
 */

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { SequenceAction } from 'redux-reqseq';

import { getDataSetPermissionsWorker } from './getDataSetPermissions';

import {
  GET_DATA_SET_PERMISSIONS_IN_DATA_SET_PERMISSIONS_CONTAINER,
  getDataSetPermissions,
  getDataSetPermissionsInDataSetPermissionsContainer,
} from '../actions';

const LOG = new Logger('PermissionsSagas');

function* getDataSetPermissionsInDataSetPermissionsContainerWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(getDataSetPermissionsInDataSetPermissionsContainer.request(action.id, action.value));
    const response = yield call(getDataSetPermissionsWorker, getDataSetPermissions(action.value));
    if (response.error) throw response.error;
    yield put(getDataSetPermissionsInDataSetPermissionsContainer.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getDataSetPermissionsInDataSetPermissionsContainer.failure(action.id, error));
  }
  finally {
    yield put(getDataSetPermissionsInDataSetPermissionsContainer.finally(action.id));
  }
}

function* getDataSetPermissionsInDataSetPermissionsContainerWatcher() :Saga<*> {

  yield takeEvery(
    GET_DATA_SET_PERMISSIONS_IN_DATA_SET_PERMISSIONS_CONTAINER,
    getDataSetPermissionsInDataSetPermissionsContainerWorker,
  );
}

export {
  getDataSetPermissionsInDataSetPermissionsContainerWatcher,
  getDataSetPermissionsInDataSetPermissionsContainerWorker,
};

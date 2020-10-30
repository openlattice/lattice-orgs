/*
 * @flow
 */

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { SequenceAction } from 'redux-reqseq';

import { getDataSetPermissionsWorker } from './getDataSetPermissions';

import {
  GET_PAGE_DATA_SET_PERMISSIONS,
  getDataSetPermissions,
  getPageDataSetPermissions,
} from '../actions';

const LOG = new Logger('SearchSagas');

function* getPageDataSetPermissionsWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(getPageDataSetPermissions.request(action.id, action.value));
    const response = yield call(getDataSetPermissionsWorker, getDataSetPermissions(action.value));
    if (response.error) throw response.error;
    yield put(getPageDataSetPermissions.success(action.id, response.data));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getPageDataSetPermissions.failure(action.id, error));
  }
  finally {
    yield put(getPageDataSetPermissions.finally(action.id));
  }
}

function* getPageDataSetPermissionsWatcher() :Saga<*> {

  yield takeEvery(
    GET_PAGE_DATA_SET_PERMISSIONS,
    getPageDataSetPermissionsWorker,
  );
}

export {
  getPageDataSetPermissionsWatcher,
  getPageDataSetPermissionsWorker,
};

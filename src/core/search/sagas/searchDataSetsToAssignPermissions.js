/*
 * @flow
 */

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { SequenceAction } from 'redux-reqseq';

import { searchDataSetsWorker } from './searchDataSets';

import {
  SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS,
  searchDataSets,
  searchDataSetsToAssignPermissions,
} from '../actions';

const LOG = new Logger('SearchSagas');

function* searchDataSetsToAssignPermissionsWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(searchDataSetsToAssignPermissions.request(action.id, action.value));
    const response = yield call(searchDataSetsWorker, searchDataSets(action.value));
    if (response.error) throw response.error;
    yield put(searchDataSetsToAssignPermissions.success(action.id, response.data));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(searchDataSetsToAssignPermissions.failure(action.id, error));
  }
  finally {
    yield put(searchDataSetsToAssignPermissions.finally(action.id));
  }
}

function* searchDataSetsToAssignPermissionsWatcher() :Saga<*> {

  yield takeEvery(
    SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS,
    searchDataSetsToAssignPermissionsWorker,
  );
}

export {
  searchDataSetsToAssignPermissionsWatcher,
  searchDataSetsToAssignPermissionsWorker,
};

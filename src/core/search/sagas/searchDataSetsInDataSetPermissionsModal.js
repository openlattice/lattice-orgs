/*
 * @flow
 */

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { SequenceAction } from 'redux-reqseq';

import { searchDataSetsWorker } from './searchDataSets';

import {
  SEARCH_DATA_SETS_IN_DATA_SET_PERMISSIONS_MODAL,
  searchDataSets,
  searchDataSetsInDataSetPermissionsModal,
} from '../actions';

const LOG = new Logger('SearchSagas');

function* searchDataSetsInDataSetPermissionsModalWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(searchDataSetsInDataSetPermissionsModal.request(action.id, action.value));
    const response = yield call(searchDataSetsWorker, searchDataSets(action.value));
    if (response.error) throw response.error;
    yield put(searchDataSetsInDataSetPermissionsModal.success(action.id, response.data));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(searchDataSetsInDataSetPermissionsModal.failure(action.id, error));
  }
  finally {
    yield put(searchDataSetsInDataSetPermissionsModal.finally(action.id));
  }
}

function* searchDataSetsInDataSetPermissionsModalWatcher() :Saga<*> {

  yield takeEvery(
    SEARCH_DATA_SETS_IN_DATA_SET_PERMISSIONS_MODAL,
    searchDataSetsInDataSetPermissionsModalWorker,
  );
}

export {
  searchDataSetsInDataSetPermissionsModalWatcher,
  searchDataSetsInDataSetPermissionsModalWorker,
};

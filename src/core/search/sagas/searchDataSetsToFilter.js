/*
 * @flow
 */

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { SequenceAction } from 'redux-reqseq';

import { searchDataSetsWorker } from './searchDataSets';

import {
  SEARCH_DATA_SETS_TO_FILTER,
  searchDataSets,
  searchDataSetsToFilter,
} from '../actions';

const LOG = new Logger('SearchSagas');

function* searchDataSetsToFilterWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(searchDataSetsToFilter.request(action.id, action.value));
    const response = yield call(searchDataSetsWorker, searchDataSets(action.value));
    if (response.error) throw response.error;
    yield put(searchDataSetsToFilter.success(action.id, response.data));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(searchDataSetsToFilter.failure(action.id, error));
  }
  finally {
    yield put(searchDataSetsToFilter.finally(action.id));
  }
}

function* searchDataSetsToFilterWatcher() :Saga<*> {

  yield takeEvery(
    SEARCH_DATA_SETS_TO_FILTER,
    searchDataSetsToFilterWorker,
  );
}

export {
  searchDataSetsToFilterWatcher,
  searchDataSetsToFilterWorker,
};

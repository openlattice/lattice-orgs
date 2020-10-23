/*
 * @flow
 */

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { SequenceAction } from 'redux-reqseq';

import { searchDataSetsWorker } from './searchDataSets';

import {
  SEARCH_DATA_SETS_IN_DATA_SET_PERMISSIONS_CONTAINER,
  searchDataSets,
  searchDataSetsInDataSetPermissionsContainer,
} from '../actions';

const LOG = new Logger('SearchSagas');

function* searchDataSetsInDataSetPermissionsContainerWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(searchDataSetsInDataSetPermissionsContainer.request(action.id, action.value));
    const response = yield call(searchDataSetsWorker, searchDataSets(action.value));
    if (response.error) throw response.error;
    yield put(searchDataSetsInDataSetPermissionsContainer.success(action.id, response.data));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(searchDataSetsInDataSetPermissionsContainer.failure(action.id, error));
  }
  finally {
    yield put(searchDataSetsInDataSetPermissionsContainer.finally(action.id));
  }
}

function* searchDataSetsInDataSetPermissionsContainerWatcher() :Saga<*> {

  yield takeEvery(
    SEARCH_DATA_SETS_IN_DATA_SET_PERMISSIONS_CONTAINER,
    searchDataSetsInDataSetPermissionsContainerWorker,
  );
}

export {
  searchDataSetsInDataSetPermissionsContainerWatcher,
  searchDataSetsInDataSetPermissionsContainerWorker,
};

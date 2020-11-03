/*
 * @flow
 */

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { SequenceAction } from 'redux-reqseq';

import { getOrSelectDataSetsWorker } from './getOrSelectDataSets';

import {
  GET_OR_SELECT_DATA_SET,
  getOrSelectDataSet,
  getOrSelectDataSets,
} from '../actions';

const LOG = new Logger('EDMSagas');

function* getOrSelectDataSetWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(getOrSelectDataSet.request(action.id, action.value));
    const response = yield call(
      getOrSelectDataSetsWorker,
      getOrSelectDataSets({
        atlasDataSetIds: [action.value.dataSetId],
        entitySetIds: [action.value.dataSetId],
        organizationId: action.value.organizationId,
      })
    );
    if (response.error) throw response.error;
    yield put(getOrSelectDataSet.success(action.id, response.data));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getOrSelectDataSet.failure(action.id, error));
  }
  finally {
    yield put(getOrSelectDataSet.finally(action.id));
  }
}

function* getOrSelectDataSetWatcher() :Saga<*> {

  yield takeEvery(
    GET_OR_SELECT_DATA_SET,
    getOrSelectDataSetWorker,
  );
}

export {
  getOrSelectDataSetWatcher,
  getOrSelectDataSetWorker,
};

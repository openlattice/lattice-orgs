/*
 * @flow
 */

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { getOrSelectDataSetsWorker } from './getOrSelectDataSets';

import {
  GET_OR_SELECT_DATA_SET,
  getOrSelectDataSet,
  getOrSelectDataSets,
} from '../actions';

const LOG = new Logger('EDMSagas');

function* getOrSelectDataSetWorker(action :SequenceAction) :Saga<WorkerResponse> {

  let workerResponse :WorkerResponse;

  try {
    yield put(getOrSelectDataSet.request(action.id, action.value));

    const {
      dataSetId,
      organizationId,
    } :{
      dataSetId :UUID;
      organizationId :UUID;
    } = action.value;

    const response = yield call(
      getOrSelectDataSetsWorker,
      getOrSelectDataSets({
        atlasDataSetIds: [dataSetId],
        entitySetIds: [dataSetId],
        organizationId,
      })
    );
    if (response.error) throw response.error;
    workerResponse = { data: {} };
    yield put(getOrSelectDataSet.success(action.id, response.data));
  }
  catch (error) {
    workerResponse = { error };
    LOG.error(action.type, error);
    yield put(getOrSelectDataSet.failure(action.id, error));
  }
  finally {
    yield put(getOrSelectDataSet.finally(action.id));
  }

  return workerResponse;
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

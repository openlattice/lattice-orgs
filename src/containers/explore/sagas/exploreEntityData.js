/*
 * @flow
 */

import {
  call,
  put,
  takeEvery,
} from '@redux-saga/core/effects';
import { DataApiActions, DataApiSagas } from 'lattice-sagas';
import { AxiosUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { EXPLORE_ENTITY_DATA, exploreEntityData } from '../actions';

const LOG = new Logger('ExploreSagas');

const { getEntityData } = DataApiActions;
const { getEntityDataWorker } = DataApiSagas;

function* exploreEntityDataWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(exploreEntityData.request(action.id, action.value));

    const response :WorkerResponse = yield call(getEntityDataWorker, getEntityData(action.value));
    if (response.error) throw response.error;

    yield put(exploreEntityData.success(action.id, response.data));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(exploreEntityData.failure(action.id, AxiosUtils.toSagaError(error)));
  }
  finally {
    yield put(exploreEntityData.finally(action.id));
  }
}

function* exploreEntityDataWatcher() :Saga<*> {

  yield takeEvery(EXPLORE_ENTITY_DATA, exploreEntityDataWorker);
}

export {
  exploreEntityDataWatcher,
  exploreEntityDataWorker,
};

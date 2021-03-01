/*
 * @flow
 */

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { Models } from 'lattice';
import { DataApiActions, DataApiSagas } from 'lattice-sagas';
import { AxiosUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { SUBMIT_DATA_GRAPH, submitDataGraph } from '../actions';

const { DataGraphBuilder } = Models;
const { createEntityAndAssociationData } = DataApiActions;
const { createEntityAndAssociationDataWorker } = DataApiSagas;
const { toSagaError } = AxiosUtils;

const LOG = new Logger('DataSagas');

function* submitDataGraphWorker(action :SequenceAction) :Saga<WorkerResponse> {

  let workerResponse :WorkerResponse;

  try {
    yield put(submitDataGraph.request(action.id, action.value));
    const dataGraph = (new DataGraphBuilder())
      .setAssociations(action.value.associationEntityData)
      .setEntities(action.value.entityData)
      .build();
    const response = yield call(createEntityAndAssociationDataWorker, createEntityAndAssociationData(dataGraph));
    if (response.error) throw response.error;
    workerResponse = { data: response.data };
    yield put(submitDataGraph.success(action.id));
  }
  catch (error) {
    workerResponse = { error };
    LOG.error(action.type, error);
    yield put(submitDataGraph.failure(action.id, toSagaError(error)));
  }
  finally {
    yield put(submitDataGraph.finally(action.id));
  }

  return workerResponse;
}

function* submitDataGraphWatcher() :Saga<*> {

  yield takeEvery(SUBMIT_DATA_GRAPH, submitDataGraphWorker);
}

export {
  submitDataGraphWatcher,
  submitDataGraphWorker,
};

/*
 * @flow
 */

import {
  call,
  put,
  takeEvery,
} from '@redux-saga/core/effects';
import { Map, fromJS } from 'immutable';
import { CollaborationsApiActions, CollaborationsApiSagas } from 'lattice-sagas';
import { AxiosUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { CREATE_NEW_COLLABORATION, createNewCollaboration } from '../actions';

const LOG = new Logger('CollaborationSagas');

const { createCollaboration, getCollaboration } = CollaborationsApiActions;
const { createCollaborationWorker, getCollaborationWorker } = CollaborationsApiSagas;

function* createNewCollaborationWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(createNewCollaboration.request(action.id, action.value));

    const createResponse :WorkerResponse = yield call(createCollaborationWorker, createCollaboration(action.value));
    if (createResponse.error) throw createResponse.error;

    const collaborationId :UUID = createResponse.data;

    const getResponse :WorkerResponse = yield call(getCollaborationWorker, getCollaboration(collaborationId));
    if (getResponse.error) throw getResponse.error;

    const collaborations :Map = Map().set(collaborationId, fromJS(getResponse.data));

    yield put(createNewCollaboration.success(action.id, collaborations));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(createNewCollaboration.failure(action.id, AxiosUtils.toSagaError(error)));
  }
  finally {
    yield put(createNewCollaboration.finally(action.id));
  }
}

function* createNewCollaborationWatcher() :Saga<*> {

  yield takeEvery(CREATE_NEW_COLLABORATION, createNewCollaborationWorker);
}

export {
  createNewCollaborationWatcher,
  createNewCollaborationWorker,
};

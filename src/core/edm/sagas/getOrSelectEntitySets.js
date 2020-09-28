/*
 * @flow
 */

import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { Map, Set } from 'immutable';
import { EntitySetsApiActions, EntitySetsApiSagas } from 'lattice-sagas';
import { Logger, ReduxUtils } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { EntitySet, UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { GET_OR_SELECT_ENTITY_SETS, getOrSelectEntitySets } from '../actions';

const LOG = new Logger('EDMSagas');

const { selectEntitySets } = ReduxUtils;
const { getEntitySets } = EntitySetsApiActions;
const { getEntitySetsWorker } = EntitySetsApiSagas;

function* getOrSelectEntitySetsWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(getOrSelectEntitySets.request(action.id, action.value));

    const entitySetIds :UUID[] | Set<UUID> = action.value;

    // TODO - figure out how to "expire" stored data
    const entitySets :Map<UUID, EntitySet> = yield select(selectEntitySets(entitySetIds));
    const missingEntitySetIds :Set<UUID> = Set(entitySetIds).subtract(entitySets.keySeq());

    if (!missingEntitySetIds.isEmpty()) {
      const response :WorkerResponse = yield call(getEntitySetsWorker, getEntitySets(missingEntitySetIds.toJS()));
      if (response.error) throw response.error;
    }

    yield put(getOrSelectEntitySets.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getOrSelectEntitySets.failure(action.id, error));
  }
  finally {
    yield put(getOrSelectEntitySets.finally(action.id));
  }
}

function* getOrSelectEntitySetsWatcher() :Saga<*> {

  yield takeEvery(GET_OR_SELECT_ENTITY_SETS, getOrSelectEntitySetsWorker);
}

export {
  getOrSelectEntitySetsWatcher,
  getOrSelectEntitySetsWorker,
};

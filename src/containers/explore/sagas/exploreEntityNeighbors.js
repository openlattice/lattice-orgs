/*
 * @flow
 */

import _has from 'lodash/has';
import {
  call,
  put,
  takeEvery,
} from '@redux-saga/core/effects';
import { Set, fromJS } from 'immutable';
import {
  EntitySetsApiActions,
  EntitySetsApiSagas,
  SearchApiActions,
  SearchApiSagas,
} from 'lattice-sagas';
import { AxiosUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { EXPLORE_ENTITY_NEIGHBORS, exploreEntityNeighbors } from '../actions';

const LOG = new Logger('ExploreSagas');

const { getEntitySets } = EntitySetsApiActions;
const { getEntitySetsWorker } = EntitySetsApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;

function* exploreEntityNeighborsWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(exploreEntityNeighbors.request(action.id, action.value));

    const { entityKeyId, entitySetId } = action.value;
    const response :WorkerResponse = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId,
        filter: { entityKeyIds: [entityKeyId] },
        idsOnly: true,
      }),
    );

    if (response.error) throw response.error;
    let neighbors = {};
    if (_has(response.data, entityKeyId)) {
      /*
       * this is the structure of the "ids only" neighbors response:
       *   {
       *     associationEntitySetId: {
       *       entitySetId: [{
       *         "associationId": associationEntityKeyId
       *         "neighborId": neighborEntityKeyId
       *       }]
       *     }
       *   }
       */
      neighbors = response.data[entityKeyId];
    }

    const iNeighbors = fromJS(neighbors);
    const entitySetIds :UUID[] = Set().withMutations((set) => {
      iNeighbors.reduce((ids, value, key) => ids.add(key).add(value.keySeq()), set);
    }).flatten().toJS();

    yield call(getEntitySetsWorker, getEntitySets(entitySetIds));

    yield put(exploreEntityNeighbors.success(action.id, iNeighbors));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(exploreEntityNeighbors.failure(action.id, AxiosUtils.toSagaError(error)));
  }
  finally {
    yield put(exploreEntityNeighbors.finally(action.id));
  }
}

function* exploreEntityNeighborsWatcher() :Saga<*> {
  yield takeEvery(EXPLORE_ENTITY_NEIGHBORS, exploreEntityNeighborsWorker);
}

export {
  exploreEntityNeighborsWatcher,
  exploreEntityNeighborsWorker,
};

/*
 * @flow
 */

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { SearchApiActions, SearchApiSagas } from 'lattice-sagas';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { HITS, TOTAL_HITS } from '../../redux/constants';
import { SEARCH_ENTITY_SET, searchEntitySet } from '../actions';
import { MAX_HITS_10 } from '../constants';

const LOG = new Logger('SearchSagas');

const { searchEntitySetData } = SearchApiActions;
const { searchEntitySetDataWorker } = SearchApiSagas;

function* searchEntitySetWorker(action :SequenceAction) :Saga<WorkerResponse> {

  let workerResponse :WorkerResponse;

  try {
    yield put(searchEntitySet.request(action.id, action.value));

    const {
      entitySetId,
      query,
      maxHits = MAX_HITS_10,
      start = 0,
    } :{|
      entitySetId :UUID;
      maxHits :number;
      query :string;
      start :number;
    |} = action.value;

    const searchConstraints = {
      maxHits,
      start,
      constraints: [{
        constraints: [{
          searchTerm: query,
        }],
      }],
      entitySetIds: [entitySetId],
    };

    const response :WorkerResponse = yield call(
      searchEntitySetDataWorker,
      searchEntitySetData(searchConstraints),
    );

    if (response.error) throw response.error;

    workerResponse = {
      data: {
        [HITS]: response.data.hits || [],
        [TOTAL_HITS]: response.data.numHits || 0,
      },
    };

    yield put(searchEntitySet.success(action.id, workerResponse.data));
  }
  catch (error) {
    workerResponse = { error };
    LOG.error(action.type, error);
    yield put(searchEntitySet.failure(action.id, error));
  }
  finally {
    yield put(searchEntitySet.finally(action.id));
  }

  return workerResponse;
}

function* searchEntitySetWatcher() :Saga<*> {

  yield takeEvery(SEARCH_ENTITY_SET, searchEntitySetWorker);
}

export {
  searchEntitySetWatcher,
  searchEntitySetWorker,
};

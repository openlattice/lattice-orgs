/*
 * @flow
 */

import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { Map, Set, getIn } from 'immutable';
import { SearchApiActions, SearchApiSagas } from 'lattice-sagas';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import {
  ATLAS_DATA_SET_IDS,
  ENTITY_SET_IDS,
  HITS,
  TOTAL_HITS,
} from '../../redux/constants';
import { selectAtlasDataSets, selectOrganizationAtlasDataSetIds } from '../../redux/selectors';
import { SEARCH_DATA_SETS, searchDataSets } from '../actions';
import { MAX_HITS_10000 } from '../constants';
import type { SearchEntitySetsHit } from '../../../types';

const LOG = new Logger('SearchSagas');

const { searchEntitySetMetaData } = SearchApiActions;
const { searchEntitySetMetaDataWorker } = SearchApiSagas;

function* searchDataSetsWorker(action :SequenceAction) :Saga<WorkerResponse> {

  let workerResponse :WorkerResponse;

  try {
    yield put(searchDataSets.request(action.id, action.value));

    const {
      organizationId,
      query,
      all = false,
      maxHits = MAX_HITS_10000,
      start = 0,
    } :{|
      all ?:boolean;
      maxHits :number;
      organizationId ?:UUID;
      query :string;
      start :number;
    |} = action.value;

    // TODO: search atlas data sets as well
    const response :WorkerResponse = yield call(
      searchEntitySetMetaDataWorker,
      searchEntitySetMetaData({
        maxHits,
        start,
        organizationId: all ? undefined : organizationId,
        searchTerm: query,
      }),
    );

    if (response.error) throw response.error;

    const hits = response.data.hits || [];
    const entitySetIds :Set<UUID> = Set().withMutations((mutableSet) => {
      hits.forEach((hit :SearchEntitySetsHit) => mutableSet.add(hit.entitySet.id));
    });

    const atlasDataSetIds :Set<UUID> = yield select(selectOrganizationAtlasDataSetIds(organizationId));
    const atlasDataSets :Map<UUID, Map> = yield select(selectAtlasDataSets(atlasDataSetIds));

    let atlasDataSetIdsHits :Set<UUID> = atlasDataSets.keySeq().toSet();
    if (query !== '*') {
      atlasDataSetIdsHits = atlasDataSets
        .filter((atlasDataSet :Map) => {
          const name :string = getIn(atlasDataSet, ['table', 'name']);
          const title :string = getIn(atlasDataSet, ['table', 'title']);
          return (
            name.toLowerCase().includes(query.toLowerCase())
            || title.toLowerCase().includes(query.toLowerCase())
          );
        })
        .keySeq()
        .toSet();
    }

    const atlasDataSetIdsTotalHits :number = atlasDataSetIdsHits.count();
    atlasDataSetIdsHits = atlasDataSetIdsHits
      .sort()
      .slice(start, start + maxHits);

    workerResponse = {
      data: {
        [HITS]: {
          [ATLAS_DATA_SET_IDS]: atlasDataSetIdsHits,
          [ENTITY_SET_IDS]: entitySetIds,
        },
        [TOTAL_HITS]: {
          [ATLAS_DATA_SET_IDS]: atlasDataSetIdsTotalHits,
          [ENTITY_SET_IDS]: response.data.numHits || 0,
        },
      },
    };
    yield put(searchDataSets.success(action.id, workerResponse.data));
  }
  catch (error) {
    workerResponse = { error };
    LOG.error(action.type, error);
    yield put(searchDataSets.failure(action.id, error));
  }
  finally {
    yield put(searchDataSets.finally(action.id));
  }

  return workerResponse;
}

function* searchDataSetsWatcher() :Saga<*> {

  yield takeEvery(SEARCH_DATA_SETS, searchDataSetsWorker);
}

export {
  searchDataSetsWatcher,
  searchDataSetsWorker,
};

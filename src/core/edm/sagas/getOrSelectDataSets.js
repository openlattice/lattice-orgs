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
import {
  DataSetsApiActions,
  DataSetsApiSagas,
  EntitySetsApiActions,
  EntitySetsApiSagas
} from 'lattice-sagas';
import { Logger, ReduxUtils } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { EntitySet, UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { selectAtlasDataSets } from '../../redux/selectors';
import { GET_OR_SELECT_DATA_SETS, getOrSelectDataSets } from '../actions';

const LOG = new Logger('EDMSagas');

const { selectEntitySets } = ReduxUtils;
const { getOrganizationDataSets } = DataSetsApiActions;
const { getOrganizationDataSetsWorker } = DataSetsApiSagas;
const { getEntitySets } = EntitySetsApiActions;
const { getEntitySetsWorker } = EntitySetsApiSagas;

function* getOrSelectDataSetsWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(getOrSelectDataSets.request(action.id, action.value));

    const {
      atlasDataSetIds,
      entitySetIds,
      organizationId,
    } :{|
      atlasDataSetIds :Set<UUID>;
      entitySetIds :Set<UUID>;
      organizationId :UUID;
    |} = action.value;

    // TODO - figure out how to "expire" stored data
    const atlasDataSets :Map<UUID, Map> = yield select(selectAtlasDataSets(atlasDataSetIds));
    const entitySets :Map<UUID, EntitySet> = yield select(selectEntitySets(entitySetIds));

    const missingAtlasDataSetIds :Set<UUID> = Set(atlasDataSetIds).subtract(atlasDataSets.keySeq());
    const missingEntitySetIds :Set<UUID> = Set(entitySetIds).subtract(entitySets.keySeq());

    if (!missingEntitySetIds.isEmpty()) {
      const response :WorkerResponse = yield call(getEntitySetsWorker, getEntitySets(missingEntitySetIds.toJS()));
      if (response.error) throw response.error;
    }

    if (!missingAtlasDataSetIds.isEmpty()) {
      const response :WorkerResponse = yield call(
        getOrganizationDataSetsWorker,
        getOrganizationDataSets({ organizationId }),
      );
      if (response.error) throw response.error;
    }

    yield put(getOrSelectDataSets.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getOrSelectDataSets.failure(action.id, error));
  }
  finally {
    yield put(getOrSelectDataSets.finally(action.id));
  }
}

function* getOrSelectDataSetsWatcher() :Saga<*> {

  yield takeEvery(GET_OR_SELECT_DATA_SETS, getOrSelectDataSetsWorker);
}

export {
  getOrSelectDataSetsWatcher,
  getOrSelectDataSetsWorker,
};

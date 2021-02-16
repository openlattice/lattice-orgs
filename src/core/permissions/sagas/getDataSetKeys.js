/*
 * @flow
 */

import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import {
  List,
  Map,
  Set,
  get,
} from 'immutable';
import { Logger, ReduxUtils } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { EntitySet, EntityType, UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { getOrSelectDataSets } from '../../edm/actions';
import { getOrSelectDataSetsWorker } from '../../edm/sagas';
import { selectAtlasDataSets } from '../../redux/selectors';
import { GET_DATA_SET_KEYS, getDataSetKeys } from '../actions';

const { selectEntitySets, selectEntityTypes } = ReduxUtils;

const LOG = new Logger('PermissionsSagas');

function* getDataSetKeysWorker(action :SequenceAction) :Saga<WorkerResponse> {

  let workerResponse :WorkerResponse;

  try {
    yield put(getDataSetKeys.request(action.id, action.value));

    const {
      atlasDataSetIds,
      entitySetIds,
      organizationId,
      withProperties = false,
    } :{|
      atlasDataSetIds :Set<UUID>;
      entitySetIds :Set<UUID>;
      organizationId :UUID;
      withProperties :boolean;
    |} = action.value;

    // NOTE: call getOrSelectDataSets() to populate redux store
    yield call(getOrSelectDataSetsWorker, getOrSelectDataSets({
      atlasDataSetIds,
      entitySetIds,
      organizationId,
    }));

    let atlasDataSets :Map<UUID, Map> = Map();
    let entitySets :Map<UUID, EntitySet> = Map();
    let entityTypes :Map<UUID, EntityType> = Map();
    if (withProperties) {
      atlasDataSets = yield select(selectAtlasDataSets(atlasDataSetIds));
      entitySets = yield select(selectEntitySets(entitySetIds));

      entityTypes = yield select(
        selectEntityTypes(
          entitySets.valueSeq().map((entitySet :EntitySet) => entitySet.entityTypeId)
        )
      );
    }

    const keys :List<List<UUID>> = List().withMutations((mutableKeys :List<List<UUID>>) => {

      if (!atlasDataSets.isEmpty()) {
        Set(atlasDataSetIds).forEach((id :UUID) => {
          mutableKeys.push(List([id]));
        });
      }

      if (!entitySets.isEmpty()) {
        Set(entitySetIds).forEach((id :UUID) => {
          mutableKeys.push(List([id]));
        });
      }

      if (withProperties) {
        atlasDataSets.forEach((atlasDataSet :Map, atlasDataSetId :UUID) => {
          get(atlasDataSet, 'columns', List()).forEach((column :Map) => {
            mutableKeys.push(List([atlasDataSetId, get(column, 'id')]));
          });
        });
        entitySets.forEach((entitySet :EntitySet, entitySetId :UUID) => {
          const entityType :EntityType = entityTypes.get(entitySet.entityTypeId);
          entityType.properties.forEach((propertyTypeId :UUID) => {
            mutableKeys.push(List([entitySetId, propertyTypeId]));
          });
        });
      }
    });

    workerResponse = { data: { keys } };

    yield put(getDataSetKeys.success(action.id));
  }
  catch (error) {
    workerResponse = { error };
    LOG.error(action.type, error);
    yield put(getDataSetKeys.failure(action.id, error));
  }
  finally {
    yield put(getDataSetKeys.finally(action.id));
  }

  return workerResponse;
}

function* getDataSetKeysWatcher() :Saga<*> {

  yield takeEvery(GET_DATA_SET_KEYS, getDataSetKeysWorker);
}

export {
  getDataSetKeysWatcher,
  getDataSetKeysWorker,
};

/*
 * @flow
 */

import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { Set } from 'immutable';
import { Logger, ReduxUtils } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { EntitySet, EntityType, UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { getPermissionsWorker } from './getPermissions';

import { GET_PROPERTY_TYPE_PERMISSIONS, getPermissions, getPropertyTypePermissions } from '../actions';

const LOG = new Logger('PermissionsSagas');

const { selectEntitySets, selectEntityTypes } = ReduxUtils;

function* getPropertyTypePermissionsWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(getPropertyTypePermissions.request(action.id, action.value));

    const entitySetIds :Set<UUID> = action.value;
    const entitySets :Map<UUID, EntitySet> = yield select(selectEntitySets(entitySetIds));

    const entityTypeIdsToEntitySetIds :Map<UUID, UUID> = entitySets
      .map((entitySet :EntitySet) => entitySet.entityTypeId)
      .flip();
    const entityTypeIds :Set<UUID> = entityTypeIdsToEntitySetIds.keySeq().toSet();

    const entityTypes :Map<UUID, EntityType> = yield select(selectEntityTypes(entityTypeIds));

    const propertyTypeKeys :Set<Set<UUID>> = Set().withMutations((mutableSet) => {
      entityTypes.forEach((entityType :EntityType) => {
        const entityTypeId :UUID = entityType.id;
        const entitySetId :UUID = entityTypeIdsToEntitySetIds.get(entityTypeId);
        entityType.properties.forEach((propertyTypeId :UUID) => {
          mutableSet.add(Set([entitySetId, propertyTypeId]));
        });
      });
    });

    const response :WorkerResponse = yield call(getPermissionsWorker, getPermissions(propertyTypeKeys));
    if (response.error) throw response.error;

    yield put(getPropertyTypePermissions.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getPropertyTypePermissions.failure(action.id, error));
  }
  finally {
    yield put(getPropertyTypePermissions.finally(action.id));
  }
}

function* getPropertyTypePermissionsWatcher() :Saga<*> {

  yield takeEvery(GET_PROPERTY_TYPE_PERMISSIONS, getPropertyTypePermissionsWorker);
}

export {
  getPropertyTypePermissionsWatcher,
  getPropertyTypePermissionsWorker,
};

/*
 * @flow
 */

import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { List, Map, Set } from 'immutable';
import { Models } from 'lattice';
import {
  AuthorizationsApiActions,
  AuthorizationsApiSagas,
} from 'lattice-sagas';
import { Logger, ReduxUtils } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { EntitySet, EntityType, UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { GET_CURRENT_DATA_SET_AUTHORIZATIONS, getCurrentDataSetAuthorizations } from '../actions';
import type { AuthorizationObject } from '../../../types';

const LOG = new Logger('PermissionsSagas');

const { AccessCheck, AccessCheckBuilder } = Models;
const { getAuthorizations } = AuthorizationsApiActions;
const { getAuthorizationsWorker } = AuthorizationsApiSagas;

const { selectEntitySets, selectEntityTypes } = ReduxUtils;

function* getCurrentDataSetAuthorizationsWorker(action :SequenceAction) :Saga<WorkerResponse> {

  let workerResponse :WorkerResponse;

  try {
    yield put(getCurrentDataSetAuthorizations.request(action.id, action.value));
    const { aclKey, permissions, withProperties } = action.value;

    let entitySets :Map<UUID, EntitySet> = Map();
    let entityTypes :Map<UUID, EntityType> = Map();
    if (withProperties) {
      entitySets = yield select(selectEntitySets(aclKey));
      entityTypes = yield select(
        selectEntityTypes(
          entitySets.valueSeq().map((entitySet :EntitySet) => entitySet.entityTypeId)
        )
      );
    }

    const keys :List<List<UUID>> = List().withMutations((mutableKeys :List<List<UUID>>) => {

      Set(aclKey).forEach((id :UUID) => {
        mutableKeys.push(List([id]));
      });

      if (withProperties) {
        entitySets.forEach((entitySet :EntitySet, entitySetId :UUID) => {
          const entityType :EntityType = entityTypes.get(entitySet.entityTypeId);
          entityType.properties.forEach((propertyTypeId :UUID) => {
            mutableKeys.push(List([entitySetId, propertyTypeId]));
          });
        });
      }
    });

    const accessChecks :AccessCheck[] = [];
    keys.forEach((key) => {
      accessChecks.push(
        (new AccessCheckBuilder())
          .setAclKey(key)
          .setPermissions(permissions)
          .build()
      );
    });

    const response :WorkerResponse = yield call(getAuthorizationsWorker, getAuthorizations(accessChecks));
    if (response.error) throw response.error;
    const data = Map().withMutations((mutableMap) => {
      response.data.forEach((authorization :AuthorizationObject) => {
        mutableMap.set(List(authorization.aclKey), authorization.permissions);
      });
    });
    workerResponse = { data };
    yield put(getCurrentDataSetAuthorizations.success(action.id, workerResponse.data));
  }
  catch (error) {
    workerResponse = { error };
    LOG.error(action.type, error);
    yield put(getCurrentDataSetAuthorizations.failure(action.id, error));
  }
  finally {
    yield put(getCurrentDataSetAuthorizations.finally(action.id));
  }

  return workerResponse;
}

function* getCurrentDataSetAuthorizationsWatcher() :Saga<*> {

  yield takeEvery(GET_CURRENT_DATA_SET_AUTHORIZATIONS, getCurrentDataSetAuthorizationsWorker);
}

export {
  getCurrentDataSetAuthorizationsWatcher,
  getCurrentDataSetAuthorizationsWorker,
};

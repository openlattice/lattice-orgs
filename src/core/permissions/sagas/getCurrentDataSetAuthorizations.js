/*
 * @flow
 */

import {
  call,
  put,
  takeEvery,
} from '@redux-saga/core/effects';
import { List, Map, Set } from 'immutable';
import { Models } from 'lattice';
import {
  AuthorizationsApiActions,
  AuthorizationsApiSagas,
} from 'lattice-sagas';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { getDataSetKeysWorker } from './getDataSetKeys';

import {
  GET_CURRENT_DATA_SET_AUTHORIZATIONS,
  getCurrentDataSetAuthorizations,
  getDataSetKeys
} from '../actions';
import type { AuthorizationObject } from '../../../types';

const LOG = new Logger('PermissionsSagas');

const { AccessCheck, AccessCheckBuilder } = Models;
const { getAuthorizations } = AuthorizationsApiActions;
const { getAuthorizationsWorker } = AuthorizationsApiSagas;

function* getCurrentDataSetAuthorizationsWorker(action :SequenceAction) :Saga<WorkerResponse> {

  let workerResponse :WorkerResponse;

  try {
    yield put(getCurrentDataSetAuthorizations.request(action.id, action.value));
    const {
      aclKey,
      organizationId,
      permissions,
      withProperties
    } = action.value;
    const keysResponse :WorkerResponse = yield call(getDataSetKeysWorker, getDataSetKeys({
      atlasDataSetIds: Set(aclKey),
      entitySetIds: Set(aclKey),
      organizationId,
      withProperties,
    }));
    if (keysResponse.error) throw keysResponse.error;

    const { keys } = keysResponse.data;

    let data = {};
    if (!keys.isEmpty()) {
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
      data = Map().withMutations((mutableMap) => {
        response.data.forEach((authorization :AuthorizationObject) => {
          mutableMap.set(List(authorization.aclKey), authorization.permissions);
        });
      });
    }
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

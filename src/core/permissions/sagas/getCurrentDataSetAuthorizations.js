/*
 * @flow
 */

import {
  call,
  put,
  takeEvery,
} from '@redux-saga/core/effects';
import { List, Map } from 'immutable';
import { Models } from 'lattice';
import {
  AuthorizationsApiActions,
  AuthorizationsApiSagas,
} from 'lattice-sagas';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { GET_CURRENT_DATA_SET_AUTHORIZATIONS, getCurrentDataSetAuthorizations } from '../actions';
import type { AuthorizationObject } from '../../../types';

const LOG = new Logger('PermissionsSagas');

const { AccessCheck, AccessCheckBuilder } = Models;
const { getAuthorizations } = AuthorizationsApiActions;
const { getAuthorizationsWorker } = AuthorizationsApiSagas;

function* getCurrentDataSetAuthorizationsWorker(action :SequenceAction) :Saga<WorkerResponse> {

  let workerResponse :WorkerResponse;

  try {
    yield put(getCurrentDataSetAuthorizations.request(action.id, action.value));
    const { acl, permissions } = action.value;

    const accessChecks :AccessCheck[] = [
      (new AccessCheckBuilder())
        .setAclKey(acl)
        .setPermissions(permissions)
        .build()
    ];
    const response :WorkerResponse = yield call(getAuthorizationsWorker, getAuthorizations(accessChecks));
    if (response.error) throw response.error;
    const authorization :AuthorizationObject = response.data[0];

    workerResponse = {
      data: Map([[List(authorization.aclKey), authorization.permissions]])
    };
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

/*
 * @flow
 */

import _chunk from 'lodash/chunk';
import {
  all,
  call,
  put,
  takeEvery,
} from '@redux-saga/core/effects';
import { Set } from 'immutable';
import { Models, Types } from 'lattice';
import {
  AuthorizationsApiActions,
  AuthorizationsApiSagas,
  PermissionsApiActions,
  PermissionsApiSagas,
} from 'lattice-sagas';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { GET_PERMISSIONS, getPermissions } from '../actions';

const LOG = new Logger('PermissionsSagas');

const { AccessCheck, AccessCheckBuilder } = Models;
const { PermissionTypes } = Types;
const { getAuthorizations } = AuthorizationsApiActions;
const { getAuthorizationsWorker } = AuthorizationsApiSagas;
const { getAcls } = PermissionsApiActions;
const { getAclsWorker } = PermissionsApiSagas;

function* getPermissionsWorker(action :SequenceAction) :Saga<WorkerResponse> {

  let workerResponse :WorkerResponse;

  try {
    yield put(getPermissions.request(action.id, action.value));

    const keys :Set<Set<UUID>> = action.value;

    const accessChecks :AccessCheck[] = keys.map((key :Set<UUID>) => (
      (new AccessCheckBuilder())
        .setAclKey(key)
        .setPermissions([PermissionTypes.OWNER])
        .build()
    )).toJS();

    const calls = _chunk(accessChecks, 100).map((accessChecksChunk :AccessCheck[]) => (
      call(getAuthorizationsWorker, getAuthorizations(accessChecksChunk))
    ));
    const responses :WorkerResponse[] = yield all(calls);

    const ownerAclKeys :UUID[][] = responses
      .filter((response :WorkerResponse) => !response.error)
      .map((response :WorkerResponse) => response.data)
      .flat()
      .filter((authorization) => authorization?.permissions?.[PermissionTypes.OWNER] === true)
      .map((authorization) => authorization.aclKey);

    const response :WorkerResponse = yield call(getAclsWorker, getAcls(ownerAclKeys));
    if (response.error) throw response.error;

    workerResponse = { data: response.data };
    yield put(getPermissions.success(action.id, response.data));
  }
  catch (error) {
    workerResponse = { error };
    LOG.error(action.type, error);
    yield put(getPermissions.failure(action.id, error));
  }
  finally {
    yield put(getPermissions.finally(action.id));
  }

  return workerResponse;
}

function* getPermissionsWatcher() :Saga<*> {

  yield takeEvery(GET_PERMISSIONS, getPermissionsWorker);
}

export {
  getPermissionsWatcher,
  getPermissionsWorker,
};

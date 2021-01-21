/*
 * @flow
 */

import {
  call,
  put,
  takeEvery,
} from '@redux-saga/core/effects';
import { Map } from 'immutable';
import { Models, Types } from 'lattice';
import {
  AuthorizationsApiActions,
  AuthorizationsApiSagas,
} from 'lattice-sagas';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { GET_OWNER_STATUS, getOwnerStatus } from '../actions';
import type { AuthorizationObject } from '../../../types';

const LOG = new Logger('PermissionsSagas');

const { AccessCheck, AccessCheckBuilder } = Models;
const { PermissionTypes } = Types;
const { getAuthorizations } = AuthorizationsApiActions;
const { getAuthorizationsWorker } = AuthorizationsApiSagas;

function* getOwnerStatusWorker(action :SequenceAction) :Saga<WorkerResponse> {

  let workerResponse :WorkerResponse;

  try {
    yield put(getOwnerStatus.request(action.id, action.value));
    const dataSetId = action.value;

    const accessChecks :AccessCheck[] = [
      (new AccessCheckBuilder())
        .setAclKey([dataSetId])
        .setPermissions([PermissionTypes.OWNER])
        .build()
    ];
    const response :WorkerResponse = yield call(getAuthorizationsWorker, getAuthorizations(accessChecks));
    if (response.error) throw response.error;
    const authorization :AuthorizationObject = response.data[0];
    const isOwner :boolean = authorization.permissions[PermissionTypes.OWNER] === true;

    workerResponse = {
      data: Map({
        [dataSetId]: isOwner
      })
    };
    yield put(getOwnerStatus.success(action.id, workerResponse.data));
  }
  catch (error) {
    workerResponse = { error };
    LOG.error(action.type, error);
    yield put(getOwnerStatus.failure(action.id, error));
  }
  finally {
    yield put(getOwnerStatus.finally(action.id));
  }

  return workerResponse;
}

function* getOwnerStatusWatcher() :Saga<*> {

  yield takeEvery(GET_OWNER_STATUS, getOwnerStatusWorker);
}

export {
  getOwnerStatusWatcher,
  getOwnerStatusWorker,
};

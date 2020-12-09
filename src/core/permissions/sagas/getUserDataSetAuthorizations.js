/*
 * @flow
 */

import {
  call,
  put,
  takeEvery,
} from '@redux-saga/core/effects';
import { List, Map } from 'immutable';
import { Models, Types } from 'lattice';
import {
  AuthorizationsApiActions,
  AuthorizationsApiSagas,
} from 'lattice-sagas';
import { Logger, ValidationUtils } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { ERR_INVALID_UUID } from '../../../utils/constants/errors';
import { GET_USER_DATA_SET_AUTHORIZATIONS, getUserDataSetAuthorizations } from '../actions';
import type { AuthorizationObject } from '../../../types';

const { isValidUUID } = ValidationUtils;

const LOG = new Logger('PermissionsSagas');

const { AccessCheck, AccessCheckBuilder } = Models;
const { PermissionTypes } = Types;
const { getAuthorizations } = AuthorizationsApiActions;
const { getAuthorizationsWorker } = AuthorizationsApiSagas;

function* getUserDataSetAuthorizationsWorker(action :SequenceAction) :Saga<WorkerResponse> {

  let workerResponse :WorkerResponse;

  try {
    yield put(getUserDataSetAuthorizations.request(action.id, action.value));
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
      data: Map([[List(acl), authorization]])
    };
    yield put(getUserDataSetAuthorizations.success(action.id, workerResponse.data));
  }
  catch (error) {
    workerResponse = { error };
    LOG.error(action.type, error);
    yield put(getUserDataSetAuthorizations.failure(action.id, error));
  }
  finally {
    yield put(getUserDataSetAuthorizations.finally(action.id));
  }

  return workerResponse;
}

function* getUserDataSetAuthorizationsWatcher() :Saga<*> {

  yield takeEvery(GET_USER_DATA_SET_AUTHORIZATIONS, getUserDataSetAuthorizationsWorker);
}

export {
  getUserDataSetAuthorizationsWatcher,
  getUserDataSetAuthorizationsWorker,
};

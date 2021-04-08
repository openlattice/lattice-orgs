/*
 * @flow
 */

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { AxiosUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { SequenceAction } from 'redux-reqseq';

import { getPermissionsWorker } from './getPermissions';

import {
  GET_ORG_OBJECT_PERMISSIONS,
  getOrgObjectPermissions,
  getPermissions,
} from '../actions';

const { toSagaError } = AxiosUtils;

const LOG = new Logger('PermissionsSagas');

// TODO: create a wrapperWorker as an abstraction around this exact logic
function* getOrgObjectPermissionsWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(getOrgObjectPermissions.request(action.id, action.value));
    const response = yield call(getPermissionsWorker, getPermissions(action.value));
    if (response.error) throw response.error;
    yield put(getOrgObjectPermissions.success(action.id, response.data));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getOrgObjectPermissions.failure(action.id, toSagaError(error)));
  }
  finally {
    yield put(getOrgObjectPermissions.finally(action.id));
  }
}

function* getOrgObjectPermissionsWatcher() :Saga<*> {

  yield takeEvery(
    GET_ORG_OBJECT_PERMISSIONS,
    getOrgObjectPermissionsWorker,
  );
}

export {
  getOrgObjectPermissionsWatcher,
  getOrgObjectPermissionsWorker,
};

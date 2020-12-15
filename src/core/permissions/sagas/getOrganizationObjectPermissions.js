/*
 * @flow
 */

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { SequenceAction } from 'redux-reqseq';

import { getPermissionsWorker } from './getPermissions';

import {
  GET_ORGANIZATION_OBJECT_PERMISSIONS,
  getOrganizationObjectPermissions,
  getPermissions,
} from '../actions';

const LOG = new Logger('PermissionsSagas');

// TODO: create a wrapperWorker as an abstraction around this exact logic
function* getOrganizationObjectPermissionsWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(getOrganizationObjectPermissions.request(action.id, action.value));
    const response = yield call(getPermissionsWorker, getPermissions(action.value));
    if (response.error) throw response.error;
    yield put(getOrganizationObjectPermissions.success(action.id, response.data));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getOrganizationObjectPermissions.failure(action.id, error));
  }
  finally {
    yield put(getOrganizationObjectPermissions.finally(action.id));
  }
}

function* getOrganizationObjectPermissionsWatcher() :Saga<*> {

  yield takeEvery(
    GET_ORGANIZATION_OBJECT_PERMISSIONS,
    getOrganizationObjectPermissionsWorker,
  );
}

export {
  getOrganizationObjectPermissionsWatcher,
  getOrganizationObjectPermissionsWorker,
};

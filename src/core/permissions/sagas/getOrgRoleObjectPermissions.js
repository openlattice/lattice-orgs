/*
 * @flow
 */

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { SequenceAction } from 'redux-reqseq';

import { getPermissionsWorker } from './getPermissions';

import {
  GET_ORG_ROLE_OBJECT_PERMISSIONS,
  getOrgRoleObjectPermissions,
  getPermissions,
} from '../actions';

const LOG = new Logger('PermissionsSagas');

// TODO: create a wrapperWorker as an abstraction around this exact logic
function* getOrgRoleObjectPermissionsWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(getOrgRoleObjectPermissions.request(action.id, action.value));
    const response = yield call(getPermissionsWorker, getPermissions(action.value));
    if (response.error) throw response.error;
    yield put(getOrgRoleObjectPermissions.success(action.id, response.data));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getOrgRoleObjectPermissions.failure(action.id, error));
  }
  finally {
    yield put(getOrgRoleObjectPermissions.finally(action.id));
  }
}

function* getOrgRoleObjectPermissionsWatcher() :Saga<*> {

  yield takeEvery(
    GET_ORG_ROLE_OBJECT_PERMISSIONS,
    getOrgRoleObjectPermissionsWorker,
  );
}

export {
  getOrgRoleObjectPermissionsWatcher,
  getOrgRoleObjectPermissionsWorker,
};

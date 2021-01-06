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
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { getDataSetPermissionsWorker } from './getDataSetPermissions';

import {
  selectOrganizationAtlasDataSetIds,
  selectOrganizationEntitySetIds,
} from '../../redux/selectors';
import {
  INITIALIZE_DATA_SET_PERMISSIONS,
  getDataSetPermissions,
  initializeDataSetPermissions
} from '../actions';

const LOG = new Logger('initializeDataSetPermissions');

function* initializeDataSetPermissionsWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(initializeDataSetPermissions.request(action.id, action.value));

    const {
      organizationId,
    } :{|
      organizationId :UUID;
    |} = action.value;

    const atlasDataSetIds :Set<UUID> = yield select(selectOrganizationAtlasDataSetIds(organizationId));
    const entitySetIds :Set<UUID> = yield select(selectOrganizationEntitySetIds(organizationId));

    const response :WorkerResponse = yield call(
      getDataSetPermissionsWorker,
      getDataSetPermissions({
        atlasDataSetIds,
        entitySetIds,
        organizationId,
        withProperties: false,
      })
    );

    if (response.error) throw response.error;

    yield put(initializeDataSetPermissions.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(initializeDataSetPermissions.failure(action.id, error));
  }
  finally {
    yield put(initializeDataSetPermissions.finally(action.id));
  }
}

function* initializeDataSetPermissionsWatcher() :Saga<*> {

  yield takeEvery(
    INITIALIZE_DATA_SET_PERMISSIONS,
    initializeDataSetPermissionsWorker,
  );
}

export {
  initializeDataSetPermissionsWatcher,
  initializeDataSetPermissionsWorker,
};

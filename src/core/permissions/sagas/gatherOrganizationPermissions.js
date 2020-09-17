/*
 * @flow
 */

import _chunk from 'lodash/chunk';
import {
  all,
  call,
  put,
  select,
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

import { selectOrganizationEntitySetIds } from '../../redux/utils';
import {
  GATHER_ORGANIZATION_PERMISSIONS,
  gatherOrganizationPermissions,
} from '../actions';

const LOG = new Logger('PermissionsSagas');

const { AccessCheck, AccessCheckBuilder } = Models;
const { PermissionTypes } = Types;
const { getAuthorizations } = AuthorizationsApiActions;
const { getAuthorizationsWorker } = AuthorizationsApiSagas;
const { getAcls } = PermissionsApiActions;
const { getAclsWorker } = PermissionsApiSagas;

function* gatherOrganizationPermissionsWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(gatherOrganizationPermissions.request(action.id, action.value));

    const organizationId :UUID = action.value;
    const entitySetIds :Set<UUID> = yield select(selectOrganizationEntitySetIds(organizationId));

    const orgAccessChecks :AccessCheck[] = entitySetIds.map((entitySetId :UUID) => (
      (new AccessCheckBuilder())
        .setAclKey([entitySetId])
        .setPermissions([PermissionTypes.OWNER])
        .build()
    )).toJS();

    const calls = _chunk(orgAccessChecks, 100).map((accessChecks :AccessCheck[]) => (
      call(getAuthorizationsWorker, getAuthorizations(accessChecks))
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

    yield put(gatherOrganizationPermissions.success(action.id, response.data));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(gatherOrganizationPermissions.failure(action.id, error));
  }
  finally {
    yield put(gatherOrganizationPermissions.finally(action.id));
  }
}

function* gatherOrganizationPermissionsWatcher() :Saga<*> {

  yield takeEvery(GATHER_ORGANIZATION_PERMISSIONS, gatherOrganizationPermissionsWorker);
}

export {
  gatherOrganizationPermissionsWatcher,
  gatherOrganizationPermissionsWorker,
};

/*
 * @flow
 */

import {
  call,
  put,
  takeEvery,
} from '@redux-saga/core/effects';
import { fromJS } from 'immutable';
import { Models, Types } from 'lattice';
import {
  PermissionsApiActions,
  PermissionsApiSagas,
} from 'lattice-sagas';
import { AxiosUtils, Logger, ValidationUtils } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { getOrgObjectPermissions } from '../../../core/permissions/actions';
import { getOrgObjectPermissionsWorker } from '../../../core/permissions/sagas';
import { ERR_INVALID_UUID } from '../../../utils/constants/errors';
import { REMOVE_PUBLIC_VISIBILITY, removePublicVisibility } from '../actions';
import { createOrganizationVisibilityAcl } from '../utils';

const {
  AclData,
  AclDataBuilder,
} = Models;
const { ActionTypes } = Types;
const { updateAcls } = PermissionsApiActions;
const { updateAclsWorker } = PermissionsApiSagas;
const { toSagaError } = AxiosUtils;
const { isValidUUID } = ValidationUtils;

const LOG = new Logger('PermissionsSagas');

function* removePublicVisibilityWorker(action :SequenceAction) :Saga<WorkerResponse> {

  let workerResponse :WorkerResponse;
  try {
    yield put(removePublicVisibility.request(action.id, action.value));

    const organizationId :UUID = action.value;
    if (!isValidUUID(organizationId)) throw ERR_INVALID_UUID;

    const acl = createOrganizationVisibilityAcl(organizationId);

    const aclData :AclData = (new AclDataBuilder())
      .setAction(ActionTypes.REMOVE)
      .setAcl(acl)
      .build();

    const updateAclResponse :WorkerResponse = yield call(updateAclsWorker, updateAcls([aclData]));
    if (updateAclResponse.error) throw updateAclResponse.error;

    yield put(removePublicVisibility.success(action.id, acl));
    workerResponse = { data: acl };
    yield put(getOrgObjectPermissions(fromJS([[organizationId]])));
  }
  catch (error) {
    LOG.error(action.type, error);
    workerResponse = { error };
    yield put(removePublicVisibility.failure(action.id, toSagaError(error)));
  }
  finally {
    yield put(removePublicVisibility.finally(action.id));
  }

  return workerResponse;
}

function* removePublicVisibilityWatcher() :Saga<void> {

  yield takeEvery(REMOVE_PUBLIC_VISIBILITY, removePublicVisibilityWorker);
}

export {
  removePublicVisibilityWatcher,
  removePublicVisibilityWorker,
};

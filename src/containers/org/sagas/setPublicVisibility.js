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
import { ERR_INVALID_UUID } from '../../../utils/constants/errors';
import { SET_PUBLIC_VISIBILITY, setPublicVisibility } from '../actions';
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

function* setPublicVisibilityWorker(action :SequenceAction) :Saga<WorkerResponse> {

  let workerResponse :WorkerResponse;
  try {
    yield put(setPublicVisibility.request(action.id, action.value));

    const organizationId :UUID = action.value;
    if (!isValidUUID(organizationId)) throw ERR_INVALID_UUID;

    const acl = createOrganizationVisibilityAcl(organizationId);

    const aclData :AclData = (new AclDataBuilder())
      .setAction(ActionTypes.SET)
      .setAcl(acl)
      .build();

    const updateAclResponse :WorkerResponse = yield call(updateAclsWorker, updateAcls([aclData]));
    if (updateAclResponse.error) throw updateAclResponse.error;

    yield put(setPublicVisibility.success(action.id, acl));
    workerResponse = { data: acl };
    yield put(getOrgObjectPermissions(fromJS([[organizationId]])));
  }
  catch (error) {
    LOG.error(action.type, error);
    workerResponse = { error };
    yield put(setPublicVisibility.failure(action.id, toSagaError(error)));
  }
  finally {
    yield put(setPublicVisibility.finally(action.id));
  }

  return workerResponse;
}

function* setPublicVisibilityWatcher() :Saga<void> {

  yield takeEvery(SET_PUBLIC_VISIBILITY, setPublicVisibilityWorker);
}

export {
  setPublicVisibilityWatcher,
  setPublicVisibilityWorker,
};

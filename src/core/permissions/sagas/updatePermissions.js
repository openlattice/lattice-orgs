/*
 * @flow
 */

import {
  all,
  call,
  put,
  takeEvery,
} from '@redux-saga/core/effects';
import { List } from 'immutable';
import { Models } from 'lattice';
import { PermissionsApiActions, PermissionsApiSagas } from 'lattice-sagas';
import { AxiosUtils, LangUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type {
  Ace,
  ActionType,
  UUID,
} from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { UPDATE_PERMISSIONS, updatePermissions } from '../actions';

const { AclBuilder, AclDataBuilder } = Models;
const { updateAcls } = PermissionsApiActions;
const { updateAclsWorker } = PermissionsApiSagas;
const { toSagaError } = AxiosUtils;
const { isDefined } = LangUtils;

const LOG = new Logger('PermissionsSagas');

function* updatePermissionsWorker(action :SequenceAction) :Saga<WorkerResponse> {

  let workerResponse :WorkerResponse;

  try {
    yield put(updatePermissions.request(action.id, action.value));

    const permissionsUpdates :Array<{
      actionType :ActionType;
      permissions :Map<List<UUID>, Ace>;
    }> = action.value;

    const updateAclsCalls = [];

    permissionsUpdates.forEach(({
      actionType,
      permissions,
    } :{
      actionType :ActionType;
      permissions :Map<List<UUID>, Ace>;
    }) => {

      const updates = [];

      permissions.forEach((ace :Ace, key :List<UUID>) => {

        const acl = (new AclBuilder())
          .setAces([ace])
          .setAclKey(key)
          .build();

        const aclData = (new AclDataBuilder())
          .setAcl(acl)
          .setAction(actionType)
          .build();

        updates.push(aclData);
      });

      updateAclsCalls.push(call(updateAclsWorker, updateAcls(updates)));
    });

    const responses = yield all(updateAclsCalls);
    const responseError = responses.reduce(
      (error :any, r :Object) => (isDefined(error) ? error : r.error),
      undefined,
    );
    if (responseError) throw responseError;

    workerResponse = { data: {} };
    yield put(updatePermissions.success(action.id));
  }
  catch (error) {
    workerResponse = { error };
    LOG.error(action.type, error);
    yield put(updatePermissions.failure(action.id, toSagaError(error)));
  }
  finally {
    yield put(updatePermissions.finally(action.id));
  }

  return workerResponse;
}

function* updatePermissionsWatcher() :Saga<*> {

  yield takeEvery(UPDATE_PERMISSIONS, updatePermissionsWorker);
}

export {
  updatePermissionsWatcher,
  updatePermissionsWorker,
};

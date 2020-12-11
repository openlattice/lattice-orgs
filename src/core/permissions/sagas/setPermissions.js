/*
 * @flow
 */

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { List } from 'immutable';
import { Models, Types } from 'lattice';
import { PermissionsApiActions, PermissionsApiSagas } from 'lattice-sagas';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { Ace, UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { SET_PERMISSIONS, setPermissions } from '../actions';

const LOG = new Logger('PermissionsSagas');

const { AclBuilder, AclDataBuilder } = Models;
const { ActionTypes } = Types;
const { updateAcls } = PermissionsApiActions;
const { updateAclsWorker } = PermissionsApiSagas;

function* setPermissionsWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(setPermissions.request(action.id, action.value));

    // TODO: remove setPermissions and use updatePermissions instead
    const permissions :Map<List<UUID>, Ace> = action.value;

    const updates = [];
    permissions.forEach((ace :Ace, key :List<UUID>) => {

      const acl = (new AclBuilder())
        .setAces([ace])
        .setAclKey(key)
        .build();

      const aclData = (new AclDataBuilder())
        .setAcl(acl)
        .setAction(ActionTypes.SET)
        .build();

      updates.push(aclData);
    });

    const response :WorkerResponse = yield call(updateAclsWorker, updateAcls(updates));
    if (response.error) throw response.error;

    yield put(setPermissions.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(setPermissions.failure(action.id, error));
  }
  finally {
    yield put(setPermissions.finally(action.id));
  }
}

function* setPermissionsWatcher() :Saga<*> {

  yield takeEvery(SET_PERMISSIONS, setPermissionsWorker);
}

export {
  setPermissionsWatcher,
  setPermissionsWorker,
};

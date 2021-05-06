/*
 * @flow
 */

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { List } from 'immutable';
import { Models, Types } from 'lattice';
import { PermissionsApiActions, PermissionsApiSagas } from 'lattice-sagas';
import { AxiosUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { Ace, UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { SET_PERMISSIONS, setPermissions } from '../actions';

const { AceBuilder, AclBuilder, AclDataBuilder } = Models;
const { ActionTypes, PermissionTypes } = Types;
const { updateAcls } = PermissionsApiActions;
const { updateAclsWorker } = PermissionsApiSagas;
const { toSagaError } = AxiosUtils;

const LOG = new Logger('PermissionsSagas');

function* setPermissionsWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(setPermissions.request(action.id, action.value));

    // TODO: remove setPermissions and use updatePermissions instead
    const permissions :Map<List<UUID>, Ace> = action.value;

    const updates = [];
    permissions.forEach((ace :Ace, key :List<UUID>) => {

      // NOTE: calling updateAcls with empty permissions fails with "collection is empty" error. instead of trying to
      // SET permissions to [], i.e. removing all permissions, we'll instead REMOVE all permissions
      // https://jira.openlattice.com/browse/LATTICE-2648
      const removeAll = ace.permissions.length === 0;
      const removeAce = (new AceBuilder(ace)).setPermissions((Object.values(PermissionTypes) :any)).build();
      const aces = removeAll ? [removeAce] : [ace];

      const acl = (new AclBuilder())
        .setAces(aces)
        .setAclKey(key)
        .build();

      const aclData = (new AclDataBuilder())
        .setAcl(acl)
        .setAction(removeAll ? ActionTypes.REMOVE : ActionTypes.SET)
        .build();

      updates.push(aclData);
    });

    const response :WorkerResponse = yield call(updateAclsWorker, updateAcls(updates));
    if (response.error) throw response.error;

    yield put(setPermissions.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(setPermissions.failure(action.id, toSagaError(error)));
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

/*
 * @flow
 */

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { List } from 'immutable';
import { Models } from 'lattice';
import { PermissionsApiActions, PermissionsApiSagas } from 'lattice-sagas';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type {
  Ace,
  ActionType,
  UUID,
} from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { UPDATE_PERMISSIONS, updatePermissions } from '../actions';

const LOG = new Logger('PermissionsSagas');

const { AclBuilder, AclDataBuilder } = Models;
const { updateAcls } = PermissionsApiActions;
const { updateAclsWorker } = PermissionsApiSagas;

function* updatePermissionsWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(updatePermissions.request(action.id, action.value));

    const {
      actionType,
      permissions,
    } :{
      actionType :ActionType;
      permissions :Map<List<UUID>, Ace>;
    } = action.value;

    // const aces :Map<List<UUID>, List<Ace>> = yield select((state) => state.getIn([PERMISSIONS, ACES]));

    const updates = [];
    permissions.forEach((ace :Ace, key :List<UUID>) => {

      const finalAces = [ace];
      const finalActionType = actionType;

      // NOTE: this doesn't actually work, leaving it in for now in case we need it after the bug is fixed:
      // https://jira.openlattice.com/browse/LATTICE-2648
      /*
       * if we're doing a REMOVE and the resulting permissions would be [] or ["DISCOVER"], then we should
       * actually remove the ace itself by using SET instead of REMOVE and passing all the aces minus this one
       */
      // if (actionType === ActionTypes.REMOVE) {
      //   const storedAces :List<Ace> = aces.get(key);
      //   const targetIndex :number = storedAces.findIndex((storedAce :Ace) => (
      //     storedAce.principal.id === ace.principal.id && storedAce.principal.type === ace.principal.type
      //   ));
      //   const targetAce :Ace = storedAces.get(targetIndex);
      //   const updatedPermissions :Set<PermissionType> = Set(targetAce.permissions).subtract(ace.permissions);
      //   if (updatedPermissions.isEmpty() || updatedPermissions.equals(Set([PermissionTypes.DISCOVER]))) {
      //     finalActionType = ActionTypes.SET;
      //     finalAces = storedAces.delete(targetIndex);
      //     // any aces with empty permissions will cause the request will fail, so we'll filter those out too
      //     finalAces = finalAces.filter((storedAce :Ace) => storedAce.permissions.length > 0);
      //   }
      // }

      const acl = (new AclBuilder())
        .setAces(finalAces)
        .setAclKey(key)
        .build();

      const aclData = (new AclDataBuilder())
        .setAcl(acl)
        .setAction(finalActionType)
        .build();

      updates.push(aclData);
    });

    const response :WorkerResponse = yield call(updateAclsWorker, updateAcls(updates));
    if (response.error) throw response.error;

    yield put(updatePermissions.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(updatePermissions.failure(action.id, error));
  }
  finally {
    yield put(updatePermissions.finally(action.id));
  }
}

function* updatePermissionsWatcher() :Saga<*> {

  yield takeEvery(UPDATE_PERMISSIONS, updatePermissionsWorker);
}

export {
  updatePermissionsWatcher,
  updatePermissionsWorker,
};

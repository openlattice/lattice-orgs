/*
 * @flow
 */

import _chunk from 'lodash/chunk';
import {
  all,
  call,
  put,
  takeEvery,
} from '@redux-saga/core/effects';
import { List, Map } from 'immutable';
import { Models, Types } from 'lattice';
import {
  AuthorizationsApiActions,
  AuthorizationsApiSagas,
  PermissionsApiActions,
  PermissionsApiSagas,
} from 'lattice-sagas';
import { AxiosUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { Ace, AclObject, UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { GET_PERMISSIONS, getPermissions } from '../actions';

const { AccessCheck, AccessCheckBuilder, AclBuilder } = Models;
const { PermissionTypes } = Types;
const { getAuthorizations } = AuthorizationsApiActions;
const { getAuthorizationsWorker } = AuthorizationsApiSagas;
const { getAcls } = PermissionsApiActions;
const { getAclsWorker } = PermissionsApiSagas;
const { toSagaError } = AxiosUtils;

const LOG = new Logger('PermissionsSagas');

function* getPermissionsWorker(action :SequenceAction) :Saga<WorkerResponse> {

  let workerResponse :WorkerResponse;

  try {
    yield put(getPermissions.request(action.id, action.value));

    const keys :List<List<UUID>> = action.value;

    const accessChecks :AccessCheck[] = keys.map((key :List<UUID>) => (
      (new AccessCheckBuilder())
        .setAclKey(key)
        .setPermissions([PermissionTypes.OWNER])
        .build()
    )).toJS();

    const calls = _chunk(accessChecks, 100).map((accessChecksChunk :AccessCheck[]) => (
      call(getAuthorizationsWorker, getAuthorizations(accessChecksChunk))
    ));
    const responses :WorkerResponse[] = yield all(calls);

    const ownerKeys :UUID[][] = responses
      // $FlowFixMe
      .filter((response :WorkerResponse) => !response.error)
      // $FlowFixMe
      .map((response :WorkerResponse) => response.data)
      .flat()
      .filter((authorization) => authorization?.permissions?.[PermissionTypes.OWNER] === true)
      .map((authorization) => authorization.aclKey);

    let aces :Map<List<UUID>, List<Ace>> = Map();
    if (ownerKeys.length !== 0) {

      const response :WorkerResponse = yield call(getAclsWorker, getAcls(ownerKeys));
      if (response.error) throw response.error;

      aces = Map().withMutations((mutableMap :Map<List<UUID>, List<Ace>>) => {
        response.data.forEach((aclObj :AclObject) => {
          const acl = (new AclBuilder(aclObj)).build();
          const filteredAces = List(acl.aces)
            // NOTE: empty permissions, i.e. [], is effectively the same as not having any permissions, but the ace
            // is still around. once this bug is fixed, we can probably take out the filter
            // https://jira.openlattice.com/browse/LATTICE-2648
            .filter((ace :Ace) => ace.permissions.length > 0)
            // NOTE: we're ignoring the DISCOVER permission type, i.e. filter out ["DISCOVER"]
            // https://jira.openlattice.com/browse/LATTICE-2578
            // https://jira.openlattice.com/browse/APPS-2381
            .filterNot((ace :Ace) => ace.permissions.length === 1 && ace.permissions[0] === PermissionTypes.DISCOVER);
          mutableMap.set(List(acl.aclKey), filteredAces);
        });
      });
    }

    workerResponse = { data: aces };
    yield put(getPermissions.success(action.id, workerResponse.data));
  }
  catch (error) {
    workerResponse = { error };
    LOG.error(action.type, error);
    yield put(getPermissions.failure(action.id, toSagaError(error)));
  }
  finally {
    yield put(getPermissions.finally(action.id));
  }

  return workerResponse;
}

function* getPermissionsWatcher() :Saga<*> {

  yield takeEvery(GET_PERMISSIONS, getPermissionsWorker);
}

export {
  getPermissionsWatcher,
  getPermissionsWorker,
};

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
import { Map, Set } from 'immutable';
import { Models, Types } from 'lattice';
import {
  AuthorizationsApiActions,
  AuthorizationsApiSagas,
  DataSetsApiActions,
  DataSetsApiSagas,
  EntitySetsApiActions,
  EntitySetsApiSagas
} from 'lattice-sagas';
import { Logger, ReduxUtils } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { EntitySet, UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { selectAtlasDataSets } from '../../redux/selectors';
import { GET_OR_SELECT_DATA_SETS, getOrSelectDataSets } from '../actions';

const LOG = new Logger('EDMSagas');

const { AccessCheck, AccessCheckBuilder } = Models;
const { PermissionTypes } = Types;
const { selectEntitySets } = ReduxUtils;
const { getAuthorizations } = AuthorizationsApiActions;
const { getAuthorizationsWorker } = AuthorizationsApiSagas;
const { getOrganizationDataSets } = DataSetsApiActions;
const { getOrganizationDataSetsWorker } = DataSetsApiSagas;
const { getEntitySets } = EntitySetsApiActions;
const { getEntitySetsWorker } = EntitySetsApiSagas;

function* getOrSelectDataSetsWorker(action :SequenceAction) :Saga<WorkerResponse> {

  let workerResponse :WorkerResponse;

  try {
    yield put(getOrSelectDataSets.request(action.id, action.value));

    const {
      atlasDataSetIds,
      entitySetIds,
      organizationId,
    } :{|
      atlasDataSetIds :Set<UUID>;
      entitySetIds :Set<UUID>;
      organizationId :UUID;
    |} = action.value;

    // TODO - figure out how to "expire" stored data
    const atlasDataSets :Map<UUID, Map> = yield select(selectAtlasDataSets(atlasDataSetIds));
    const entitySets :Map<UUID, EntitySet> = yield select(selectEntitySets(entitySetIds));

    const missingAtlasDataSetIds :Set<UUID> = Set(atlasDataSetIds).subtract(atlasDataSets.keySeq());
    const missingEntitySetIds :Set<UUID> = Set(entitySetIds).subtract(entitySets.keySeq());

    if (!missingEntitySetIds.isEmpty()) {

      // TODO: extract as getAuthorizedEntitySets()
      const accessChecks :AccessCheck[] = missingEntitySetIds.map((id :UUID) => (
        (new AccessCheckBuilder()).setAclKey([id]).setPermissions([PermissionTypes.READ]).build()
      )).toJS();

      const calls = _chunk(accessChecks, 100).map((accessChecksChunk :AccessCheck[]) => (
        call(getAuthorizationsWorker, getAuthorizations(accessChecksChunk))
      ));
      const responses :WorkerResponse[] = yield all(calls);

      const ownedEntitySetIds :UUID[] = responses
        // $FlowFixMe
        .filter((response :WorkerResponse) => !response.error)
        // $FlowFixMe
        .map((response :WorkerResponse) => response.data)
        .flat()
        .filter((authorization) => authorization?.permissions?.[PermissionTypes.READ] === true)
        .map((authorization) => authorization.aclKey[0]);
      // END-TODO

      if (ownedEntitySetIds.length > 0) {
        const response :WorkerResponse = yield call(getEntitySetsWorker, getEntitySets(ownedEntitySetIds));
        if (response.error) throw response.error;
      }
    }

    if (!missingAtlasDataSetIds.isEmpty()) {
      const response :WorkerResponse = yield call(
        getOrganizationDataSetsWorker,
        getOrganizationDataSets({ organizationId }),
      );
      if (response.error) throw response.error;
    }

    workerResponse = { data: {} };
    yield put(getOrSelectDataSets.success(action.id));
  }
  catch (error) {
    workerResponse = { error };
    LOG.error(action.type, error);
    yield put(getOrSelectDataSets.failure(action.id, error));
  }
  finally {
    yield put(getOrSelectDataSets.finally(action.id));
  }

  return workerResponse;
}

function* getOrSelectDataSetsWatcher() :Saga<*> {

  yield takeEvery(GET_OR_SELECT_DATA_SETS, getOrSelectDataSetsWorker);
}

export {
  getOrSelectDataSetsWatcher,
  getOrSelectDataSetsWorker,
};

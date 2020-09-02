/*
 * @flow
 */

import {
  all,
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { Map, Set } from 'immutable';
import {
  EntitySetsApiActions,
  EntitySetsApiSagas,
} from 'lattice-sagas';
import { Logger, ReduxUtils } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { EntitySet, UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_ENTITY_SETS_WITH_PERMISSIONS,
  getEntitySetsWithPermissions,
} from '../PermissionsActions';

const LOG = new Logger('PermissionsSagas');

const { selectEntitySets } = ReduxUtils;
const { getEntitySet } = EntitySetsApiActions;
const { getEntitySetWorker } = EntitySetsApiSagas;

function* getEntitySetsWithPermissionsWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(getEntitySetsWithPermissions.request(action.id, action.value));

    const {
      entitySetIds,
      // organizationId,
    } :{
      entitySetIds :UUID[] | Set<UUID>;
      organizationId :UUID;
    } = action.value;

    // TODO - figure out how to "expire" stored data
    const entitySets :Map<UUID, EntitySet> = yield select(selectEntitySets(entitySetIds));
    const missingEntitySetIds :Set<UUID> = Set(entitySetIds).subtract(entitySets.keySeq());

    // let entitySets = {};
    if (!missingEntitySetIds.isEmpty()) {
      // const response :WorkerResponse = yield call(getEntitySetsWorker, getEntitySets(missingEntitySetIds.toJS()));
      // if (response.error) throw response.error;
      const getEntitySetCalls = missingEntitySetIds.toJS().map((entitySetId :UUID) => (
        call(getEntitySetWorker, getEntitySet(entitySetId))
      ));
      const responses :WorkerResponse[] = yield all(getEntitySetCalls);
      LOG.info(responses);
    }

    // TODO - this saga is incomplete
    // TODO - this saga is incomplete
    // TODO - this saga is incomplete
    // TODO - this saga is incomplete

    yield put(getEntitySetsWithPermissions.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getEntitySetsWithPermissions.failure(action.id, error));
  }
  finally {
    yield put(getEntitySetsWithPermissions.finally(action.id));
  }
}

function* getEntitySetsWithPermissionsWatcher() :Saga<*> {

  yield takeEvery(GET_ENTITY_SETS_WITH_PERMISSIONS, getEntitySetsWithPermissionsWorker);
}

export {
  getEntitySetsWithPermissionsWatcher,
  getEntitySetsWithPermissionsWorker,
};

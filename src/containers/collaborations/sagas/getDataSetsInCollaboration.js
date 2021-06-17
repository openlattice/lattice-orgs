/*
 * @flow
 */

import {
  call,
  put,
  takeEvery,
} from '@redux-saga/core/effects';
import { List, Map, fromJS } from 'immutable';
import {
  CollaborationsApiActions,
  CollaborationsApiSagas,
  EntitySetsApiActions,
  EntitySetsApiSagas,
} from 'lattice-sagas';
import { AxiosUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { GET_DATA_SETS_IN_COLLABORATION, getDataSetsInCollaboration } from '../actions';

const LOG = new Logger('CollaborationSagas');

const { getCollaborationDataSets } = CollaborationsApiActions;
const { getCollaborationDataSetsWorker } = CollaborationsApiSagas;
const { getEntitySets } = EntitySetsApiActions;
const { getEntitySetsWorker } = EntitySetsApiSagas;

function* getDataSetsInCollaborationWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(getDataSetsInCollaboration.request(action.id, action.value));

    const getResponse :WorkerResponse = yield call(
      getCollaborationDataSetsWorker,
      getCollaborationDataSets(action.value)
    );
    if (getResponse.error) throw getResponse.error;

    /*
    * map from organizationId to all data set ids projected to the requested
    * collaboration from that organization.
    */
    const collaborationDataSets :Map<UUID, List<UUID>> = fromJS(getResponse.data);
    const dataSetIds :List<UUID> = collaborationDataSets.toSet();

    if (!dataSetIds.isEmpty()) {
      /*
      * not sure if this the best way, but created the action+saga because we
      * need to load the entity set information.
      */
      const entitySetResponse :WorkerResponse = yield call(
        getEntitySetsWorker,
        getEntitySets(dataSetIds.toJS())
      );
      if (entitySetResponse.error) throw entitySetResponse.error;
    }

    yield put(getDataSetsInCollaboration.success(action.id, collaborationDataSets));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getDataSetsInCollaboration.failure(action.id, AxiosUtils.toSagaError(error)));
  }
  finally {
    yield put(getDataSetsInCollaboration.finally(action.id));
  }
}

function* getDataSetsInCollaborationWatcher() :Saga<*> {

  yield takeEvery(GET_DATA_SETS_IN_COLLABORATION, getDataSetsInCollaborationWorker);
}

export {
  getDataSetsInCollaborationWatcher,
  getDataSetsInCollaborationWorker,
};

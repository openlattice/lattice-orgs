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
import {
  CollaborationsApiActions,
  CollaborationsApiSagas,
  DataSetMetadataApiActions,
  DataSetMetadataApiSagas,
} from 'lattice-sagas';
import { AxiosUtils, LangUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { ADD_DATA_SETS_TO_COLLABORATION, addDataSetsToCollaboration } from '../actions';

const { isDefined } = LangUtils;

const LOG = new Logger('CollaborationSagas');

const { addDataSetToCollaboration } = CollaborationsApiActions;
const { addDataSetToCollaborationWorker } = CollaborationsApiSagas;
const { getDataSetsMetadata, getDataSetColumnsMetadata } = DataSetMetadataApiActions;
const { getDataSetsMetadataWorker, getDataSetColumnsMetadataWorker } = DataSetMetadataApiSagas;

function* addDataSetsToCollaborationWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(addDataSetsToCollaboration.request(action.id, action.value));

    const { collaborationId, dataSetIdsByOrgId } = action.value;

    const addDataSetCalls = [];
    const dataSetIdsToLoad = [];
    dataSetIdsByOrgId.forEach((dataSetIds :List<UUID>, organizationId :UUID) => {
      dataSetIds.forEach((dataSetId :UUID) => {
        dataSetIdsToLoad.push(dataSetId);
        addDataSetCalls.push(
          call(
            addDataSetToCollaborationWorker,
            addDataSetToCollaboration({
              collaborationId,
              dataSetId,
              organizationId
            })
          )
        );
      });
    });

    const responses :WorkerResponse[] = yield all(addDataSetCalls);
    const responseError = responses.reduce(
      (error :any, r :Object) => (isDefined(error) ? error : r.error),
      undefined,
    );
    if (responseError) throw responseError;

    if (dataSetIdsToLoad.length) {
      /* load data sets that are being added to collaboration */
      yield all([
        call(getDataSetsMetadataWorker, getDataSetsMetadata(dataSetIdsToLoad)),
        call(getDataSetColumnsMetadataWorker, getDataSetColumnsMetadata(dataSetIdsToLoad)),
      ]);
    }

    yield put(addDataSetsToCollaboration.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(addDataSetsToCollaboration.failure(action.id, AxiosUtils.toSagaError(error)));
  }
  finally {
    yield put(addDataSetsToCollaboration.finally(action.id));
  }
}

function* addDataSetsToCollaborationWatcher() :Saga<*> {

  yield takeEvery(ADD_DATA_SETS_TO_COLLABORATION, addDataSetsToCollaborationWorker);
}

export {
  addDataSetsToCollaborationWatcher,
  addDataSetsToCollaborationWorker,
};

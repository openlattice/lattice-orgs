/*
 * @flow
 */

import { put, select, takeEvery } from '@redux-saga/core/effects';
import { List, Map } from 'immutable';
import { DataUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { FQN, UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { FQNS } from '../../../core/edm/constants';
import { DATA_SET_COLUMNS } from '../../../core/redux/constants';
import { selectOrgDataSetColumns } from '../../../core/redux/selectors';
import { toSagaError } from '../../../utils';
import { INITIALIZE_DATA_SET_ACCESS_REQUEST, initializeDataSetAccessRequest } from '../actions';
import { DataSetAccessRequestSchema } from '../schemas';

const LOG = new Logger('RequestsSagas');

const { getPropertyValue } = DataUtils;

const {
  ACCESS_REQUEST_PSK,
  ACCESS_REQUEST_EAK,
} = DataSetAccessRequestSchema;

function* initializeDataSetAccessRequestWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(initializeDataSetAccessRequest.request(action.id, action.value));

    const {
      dataSetId,
      organizationId,
    } :{
      dataSetId :UUID;
      organizationId :UUID;
    } = action.value;

    const dataSetColumns :List<Map<FQN, List>> = yield select(selectOrgDataSetColumns(organizationId, dataSetId));

    const dataSchema = JSON.parse(JSON.stringify(DataSetAccessRequestSchema.dataSchema));
    dataSchema
      .properties[ACCESS_REQUEST_PSK]
      .properties[ACCESS_REQUEST_EAK]
      .properties[DATA_SET_COLUMNS]
      .items
      .enum = dataSetColumns
        .map((column :Map<FQN, List>) => getPropertyValue(column, [FQNS.OL_ID, 0]))
        .toJS();

    dataSchema
      .properties[ACCESS_REQUEST_PSK]
      .properties[ACCESS_REQUEST_EAK]
      .properties[DATA_SET_COLUMNS]
      .items
      .enumNames = dataSetColumns
        .map((column :Map<FQN, List>) => (
          getPropertyValue(column, [FQNS.OL_TITLE, 0]) || getPropertyValue(column, [FQNS.OL_ID, 0])
        ))
        .toJS();

    yield put(initializeDataSetAccessRequest.success(action.id, {
      dataSchema,
      uiSchema: JSON.parse(JSON.stringify(DataSetAccessRequestSchema.uiSchema)),
    }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(initializeDataSetAccessRequest.failure(action.id, toSagaError(error)));
  }
  finally {
    yield put(initializeDataSetAccessRequest.finally(action.id));
  }
}

function* initializeDataSetAccessRequestWatcher() :Saga<*> {

  yield takeEvery(INITIALIZE_DATA_SET_ACCESS_REQUEST, initializeDataSetAccessRequestWorker);
}

export {
  initializeDataSetAccessRequestWatcher,
  initializeDataSetAccessRequestWorker,
};

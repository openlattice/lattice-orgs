/*
 * @flow
 */

import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { Map, get } from 'immutable';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { PropertyType, UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { getOrSelectDataSet } from '../../../core/edm/actions';
import { getOrSelectDataSetWorker } from '../../../core/edm/sagas';
import { selectDataSetProperties } from '../../../core/redux/selectors';
import { toSagaError } from '../../../utils';
import { INITIALIZE_DATA_SET_ACCESS_REQUEST, initializeDataSetAccessRequest } from '../actions';
import { DataSetAccessRequestSchema } from '../schemas';

const LOG = new Logger('RequestsSagas');

const {
  ACCESS_REQUEST_PSK,
  ACCESS_REQUEST_EAK,
  DATA_SET_PROPERTIES,
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

    const response = yield call(getOrSelectDataSetWorker, getOrSelectDataSet({ dataSetId, organizationId }));
    if (response.error) throw response.error;

    const properties :Map<UUID, PropertyType | Map> = yield select(selectDataSetProperties(dataSetId));

    const dataSchema = JSON.parse(JSON.stringify(DataSetAccessRequestSchema.dataSchema));
    dataSchema
      .properties[ACCESS_REQUEST_PSK]
      .properties[ACCESS_REQUEST_EAK]
      .properties[DATA_SET_PROPERTIES]
      .items
      .enum = properties.keySeq().toJS();

    dataSchema
      .properties[ACCESS_REQUEST_PSK]
      .properties[ACCESS_REQUEST_EAK]
      .properties[DATA_SET_PROPERTIES]
      .items
      .enumNames = properties.map((property :PropertyType | Map, propertyTypeId :UUID) => (
        property.title || get(property, 'title') || propertyTypeId
      )).valueSeq().toJS();

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

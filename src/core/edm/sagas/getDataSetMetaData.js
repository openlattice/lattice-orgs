/*
 * @flow
 */

import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { Map, fromJS } from 'immutable';
import { Models } from 'lattice';
import { SearchApiActions, SearchApiSagas } from 'lattice-sagas';
import { DataUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { Organization, PropertyType, UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import {
  ERR_MISSING_ORG,
  ERR_MISSING_PROPERTY_TYPE,
  ERR_UNEXPECTED_SEARCH_RESULTS,
} from '../../../utils/constants/errors';
import { DATA_SET, DATA_SET_COLUMNS } from '../../redux/constants';
import { selectOrganization, selectPropertyTypes } from '../../redux/selectors';
import { MAX_HITS_10000 } from '../../search/constants';
import { GET_DATA_SET_METADATA, getDataSetMetaData } from '../actions';
import { FQNS } from '../constants';

const LOG = new Logger('EDMSagas');

const { FQN } = Models;
const { searchEntitySetData } = SearchApiActions;
const { searchEntitySetDataWorker } = SearchApiSagas;
const { getPropertyValue } = DataUtils;

function* getDataSetMetaDataWorker(action :SequenceAction) :Saga<WorkerResponse> {

  let workerResponse :WorkerResponse;

  try {
    yield put(getDataSetMetaData.request(action.id, action.value));

    const {
      dataSetId,
      organizationId,
    } :{|
      dataSetId :UUID;
      organizationId :UUID;
    |} = action.value;

    const organization :?Organization = yield select(selectOrganization(organizationId));
    if (!organization) {
      throw new Error(ERR_MISSING_ORG);
    }

    const propertyTypes :Map<UUID, PropertyType> = yield select(
      selectPropertyTypes([
        FQNS.OL_DATA_SET_ID,
        FQNS.OL_DATA_SET_NAME,
        FQNS.OL_ID,
      ])
    );
    const propertyTypeIds :Map<FQN, UUID> = propertyTypes.map((propertyType) => propertyType.type).flip();
    if (propertyTypeIds.count() !== 3) {
      throw new Error(ERR_MISSING_PROPERTY_TYPE);
    }

    const response1 :WorkerResponse = yield call(
      searchEntitySetDataWorker,
      searchEntitySetData({
        constraints: [{
          constraints: [{
            searchTerm: `entity.${propertyTypeIds.get(FQNS.OL_ID)}:${JSON.stringify(dataSetId)}`,
          }],
        }],
        entitySetIds: [organization.metadataEntitySetIds.datasets],
        maxHits: 1,
        start: 0,
      }),
    );
    if (response1.error) throw response1.error;

    if (response1.data.hits.length > 1) {
      throw new Error(ERR_UNEXPECTED_SEARCH_RESULTS);
    }

    const dataSet = fromJS(response1.data.hits).get(0, Map()).mapKeys((key :string) => FQN.of(key));
    const dataSetName :string = getPropertyValue(dataSet, [FQNS.OL_DATA_SET_NAME, 0]);

    const response2 :WorkerResponse = yield call(
      searchEntitySetDataWorker,
      searchEntitySetData({
        constraints: [{
          constraints: [{
            fuzzy: false,
            searchTerm: `entity.${propertyTypeIds.get(FQNS.OL_DATA_SET_ID)}:${JSON.stringify(dataSetId)}`,
          }],
        }],
        entitySetIds: [organization.metadataEntitySetIds.columns],
        maxHits: MAX_HITS_10000,
        start: 0,
      }),
    );
    if (response2.error) throw response2.error;

    const dataSetColumns = fromJS(response2.data.hits)
      // NOTE: just make sure the search results include columns ONLY for the data set we care about
      .filter((column :Map) => getPropertyValue(column, [FQNS.OL_DATA_SET_NAME, 0]) === dataSetName)
      .filter((column :Map) => getPropertyValue(column, [FQNS.OL_DATA_SET_ID, 0]) === dataSetId)
      .map((column :Map) => column.mapKeys((key :string) => FQN.of(key)));

    workerResponse = {
      data: Map({
        [DATA_SET]: dataSet,
        [DATA_SET_COLUMNS]: dataSetColumns,
      }),
    };
    yield put(getDataSetMetaData.success(action.id, workerResponse.data));
  }
  catch (error) {
    workerResponse = { error };
    LOG.error(action.type, error);
    yield put(getDataSetMetaData.failure(action.id, error));
  }
  finally {
    yield put(getDataSetMetaData.finally(action.id));
  }

  return workerResponse;
}

function* getDataSetMetaDataWatcher() :Saga<*> {

  yield takeEvery(GET_DATA_SET_METADATA, getDataSetMetaDataWorker);
}

export {
  getDataSetMetaDataWatcher,
  getDataSetMetaDataWorker,
};

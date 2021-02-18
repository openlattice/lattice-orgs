/*
 * @flow
 */

import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import {
  List,
  Map,
  Set,
  fromJS,
} from 'immutable';
import { Models } from 'lattice';
import { SearchApiActions, SearchApiSagas } from 'lattice-sagas';
import { AxiosUtils, DataUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { Organization, PropertyType, UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { ERR_MISSING_ORG, ERR_MISSING_PROPERTY_TYPE } from '../../../utils/constants/errors';
import { HITS } from '../../redux/constants';
import { selectOrganization, selectPropertyTypes } from '../../redux/selectors';
import { MAX_HITS_10000 } from '../../search/constants';
import { GET_ORG_DATA_SET_COLUMNS_FROM_META, getOrgDataSetColumnsFromMeta } from '../actions';
import { FQNS } from '../constants';

const { FQN } = Models;
const { searchEntitySetData } = SearchApiActions;
const { searchEntitySetDataWorker } = SearchApiSagas;
const { toSagaError } = AxiosUtils;
const { getPropertyValue } = DataUtils;

const REQUIRED_PROPERTY_TYPES :FQN[] = [
  FQNS.OL_DATA_SET_ID,
];

const LOG = new Logger('EDMSagas');

function* getOrgDataSetColumnsFromMetaWorker(action :SequenceAction) :Saga<WorkerResponse> {

  let workerResponse :WorkerResponse;

  try {
    yield put(getOrgDataSetColumnsFromMeta.request(action.id, action.value));

    const {
      dataSetIds,
      organizationId,
    } :{|
      dataSetIds :Set<UUID>;
      organizationId :UUID;
    |} = action.value;

    const organization :?Organization = yield select(selectOrganization(organizationId));
    if (!organization) {
      throw new Error(ERR_MISSING_ORG);
    }

    const propertyTypes :Map<UUID, PropertyType> = yield select(selectPropertyTypes(REQUIRED_PROPERTY_TYPES));
    const propertyTypeIds :Map<FQN, UUID> = propertyTypes.map((propertyType) => propertyType.type).flip();
    if (propertyTypeIds.count() !== REQUIRED_PROPERTY_TYPES.length) {
      throw new Error(ERR_MISSING_PROPERTY_TYPE);
    }

    const dataSetConstraints = dataSetIds.map((dataSetId :UUID) => ({
      fuzzy: false,
      searchTerm: `entity.${propertyTypeIds.get(FQNS.OL_DATA_SET_ID)}:${JSON.stringify(dataSetId)}`,
    }));

    // NOTE: not sure if this is the best way to gather the columns, maybe a search request per data set?
    const searchResponse :WorkerResponse = yield call(
      searchEntitySetDataWorker,
      searchEntitySetData({
        constraints: [{ constraints: dataSetConstraints.toJS() }],
        entitySetIds: [organization.metadataEntitySetIds.columns],
        maxHits: MAX_HITS_10000,
        start: 0,
      }),
    );
    if (searchResponse.error) throw searchResponse.error;

    const dataSetsColumns :Map<UUID, List<Map<FQN, List>>> = fromJS(searchResponse.data[HITS])
      .map((column :Map) => column.mapKeys((key :string) => FQN.of(key)))
      .groupBy((column :Map) => getPropertyValue(column, [FQNS.OL_DATA_SET_ID, 0]));

    workerResponse = { data: dataSetsColumns };
    yield put(getOrgDataSetColumnsFromMeta.success(action.id, workerResponse.data));
  }
  catch (error) {
    workerResponse = { error };
    LOG.error(action.type, error);
    yield put(getOrgDataSetColumnsFromMeta.failure(action.id, toSagaError(error)));
  }
  finally {
    yield put(getOrgDataSetColumnsFromMeta.finally(action.id));
  }

  return workerResponse;
}

function* getOrgDataSetColumnsFromMetaWatcher() :Saga<*> {

  yield takeEvery(GET_ORG_DATA_SET_COLUMNS_FROM_META, getOrgDataSetColumnsFromMetaWorker);
}

export {
  getOrgDataSetColumnsFromMetaWatcher,
  getOrgDataSetColumnsFromMetaWorker,
};

/*
 * @flow
 */

import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { Set } from 'immutable';
import { DataUtils, Logger, ValidationUtils } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { Organization, UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { searchDataWorker } from './searchData';

import { getOrSelectDataSets } from '../../edm/actions';
import { FQNS } from '../../edm/constants';
import { getOrSelectDataSetsWorker } from '../../edm/sagas';
import { HITS } from '../../redux/constants';
import { selectOrganization } from '../../redux/selectors';
import {
  SEARCH_ORGANIZATION_DATA_SETS,
  searchData,
  searchOrganizationDataSets,
} from '../actions';
import { MAX_HITS_10 } from '../constants';

const LOG = new Logger('SearchSagas');

const { getPropertyValue } = DataUtils;
const { isValidUUID } = ValidationUtils;

function* searchOrganizationDataSetsWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(searchOrganizationDataSets.request(action.id, action.value));

    const {
      maxHits = MAX_HITS_10,
      organizationId,
      page,
      query,
      start,
    } :{|
      maxHits :number;
      organizationId :UUID;
      page :number;
      query :string;
      start :number;
    |} = action.value;

    const organization :?Organization = yield select(selectOrganization(organizationId));
    let response :WorkerResponse = yield call(
      searchDataWorker,
      searchData({
        entitySetId: organization?.metadataEntitySetIds.datasets,
        maxHits,
        page,
        query,
        start,
      })
    );
    if (response.error) throw response.error;

    const entitySetIdsHits :UUID[] = response.data[HITS]
      .filter((hit) => getPropertyValue(hit, [FQNS.OL_STANDARDIZED, 0]) === true)
      .map((hit) => getPropertyValue(hit, [FQNS.OL_ID, 0]))
      .filter((id :UUID) => isValidUUID(id));

    const entitySetIds :Set<UUID> = Set(entitySetIdsHits);

    const atlasDataSetIdsHits :UUID[] = response.data[HITS]
      .filter((hit) => getPropertyValue(hit, [FQNS.OL_STANDARDIZED, 0]) === false)
      .map((hit) => getPropertyValue(hit, [FQNS.OL_ID, 0]))
      .filter((id :UUID) => isValidUUID(id));

    const atlasDataSetIds :Set<UUID> = Set(atlasDataSetIdsHits);

    response = yield call(
      getOrSelectDataSetsWorker,
      getOrSelectDataSets({ atlasDataSetIds, entitySetIds, organizationId })
    );
    if (response.error) throw response.error;

    yield put(searchOrganizationDataSets.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(searchOrganizationDataSets.failure(action.id, error));
  }
  finally {
    yield put(searchOrganizationDataSets.finally(action.id));
  }
}

function* searchOrganizationDataSetsWatcher() :Saga<*> {

  yield takeEvery(SEARCH_ORGANIZATION_DATA_SETS, searchOrganizationDataSetsWorker);
}

export {
  searchOrganizationDataSetsWatcher,
  searchOrganizationDataSetsWorker,
};

/*
 * @flow
 */

import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { Organization, UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { searchDataWorker } from './searchData';

import { ERR_MISSING_ORG } from '../../../utils/constants/errors';
import { selectOrganization } from '../../redux/selectors';
import {
  SEARCH_ORGANIZATION_DATA_SETS,
  searchData,
  searchOrganizationDataSets,
} from '../actions';
import { MAX_HITS_10 } from '../constants';

const LOG = new Logger('SearchSagas');

function* searchOrganizationDataSetsWorker(action :SequenceAction) :Saga<WorkerResponse> {

  let workerResponse :WorkerResponse;

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
    if (!organization) {
      throw new Error(ERR_MISSING_ORG);
    }

    const response :WorkerResponse = yield call(
      searchDataWorker,
      searchData({
        entitySetId: organization.metadataEntitySetIds.datasets,
        maxHits,
        page,
        query,
        start,
      })
    );
    if (response.error) throw response.error;

    workerResponse = { data: response.data };
    yield put(searchOrganizationDataSets.success(action.id, workerResponse.data));
  }
  catch (error) {
    workerResponse = { error };
    LOG.error(action.type, error);
    yield put(searchOrganizationDataSets.failure(action.id, error));
  }
  finally {
    yield put(searchOrganizationDataSets.finally(action.id));
  }

  return workerResponse;
}

function* searchOrganizationDataSetsWatcher() :Saga<*> {

  yield takeEvery(SEARCH_ORGANIZATION_DATA_SETS, searchOrganizationDataSetsWorker);
}

export {
  searchOrganizationDataSetsWatcher,
  searchOrganizationDataSetsWorker,
};

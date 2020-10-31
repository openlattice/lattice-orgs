/*
 * @flow
 */

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { DataUtils, Logger, ValidationUtils } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { searchEntitySetWorker } from './searchEntitySet';

import { getOrSelectDataSets } from '../../edm/actions';
import { FQNS } from '../../edm/constants';
import { getOrSelectDataSetsWorker } from '../../edm/sagas';
import {
  ATLAS_DATA_SET_IDS,
  ENTITY_SET_IDS,
  HITS,
  TOTAL_HITS,
} from '../../redux/constants';
import {
  SEARCH_ORGANIZATION_DATA_SETS,
  searchEntitySet,
  searchOrganizationDataSets,
} from '../actions';

const LOG = new Logger('SearchSagas');

const { getPropertyValue } = DataUtils;
const { isValidUUID } = ValidationUtils;

function* searchOrganizationDataSetsWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(searchOrganizationDataSets.request(action.id, action.value));

    const organizationId :UUID = action.value.organizationId;

    const response :WorkerResponse = yield call(searchEntitySetWorker, searchEntitySet(action.value));
    if (response.error) throw response.error;

    const entitySetIds = response.data.hits
      .filter((hit) => getPropertyValue(hit, [FQNS.OL_STANDARDIZED, 0]) === true)
      .map((hit) => getPropertyValue(hit, [FQNS.OL_ID, 0]))
      .filter((id :UUID) => isValidUUID(id));

    const atlasDataSetIds = response.data.hits
      .filter((hit) => getPropertyValue(hit, [FQNS.OL_STANDARDIZED, 0]) === false)
      .map((hit) => getPropertyValue(hit, [FQNS.OL_ID, 0]))
      .filter((id :UUID) => isValidUUID(id));

    yield call(
      getOrSelectDataSetsWorker,
      getOrSelectDataSets({ atlasDataSetIds, entitySetIds, organizationId })
    );

    yield put(searchOrganizationDataSets.success(action.id, {
      [HITS]: {
        [ATLAS_DATA_SET_IDS]: atlasDataSetIds,
        [ENTITY_SET_IDS]: entitySetIds,
      },
      [TOTAL_HITS]: response.data[TOTAL_HITS]
    }));
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

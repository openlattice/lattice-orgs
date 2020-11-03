/*
 * @flow
 */

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { Set } from 'immutable';
import { DataUtils, Logger, ValidationUtils } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { searchDataWorker } from './searchData';
import { searchDataSetsWorker } from './searchDataSets';

import { getOrSelectDataSets } from '../../edm/actions';
import {
  FQNS,
  SHIP_ROOM_ORG_ID,
  SR_DS_META_ESID
} from '../../edm/constants';
import { getOrSelectDataSetsWorker } from '../../edm/sagas';
import {
  ATLAS_DATA_SET_IDS,
  ENTITY_SET_IDS,
  HITS,
  TOTAL_HITS,
} from '../../redux/constants';
import {
  SEARCH_ORGANIZATION_DATA_SETS,
  searchData,
  searchDataSets,
  searchOrganizationDataSets,
} from '../actions';

const LOG = new Logger('SearchSagas');

const { getPropertyValue } = DataUtils;
const { isValidUUID } = ValidationUtils;

function* searchOrganizationDataSetsWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(searchOrganizationDataSets.request(action.id, action.value));

    const organizationId :UUID = action.value.organizationId;

    let response :WorkerResponse;
    let atlasDataSetIds :Set<UUID> = Set();
    let atlasDataSetIdsTotalHits = 0;
    let entitySetIds :Set<UUID> = Set();
    let entitySetIdsTotalHits = 0;

    if (organizationId === SHIP_ROOM_ORG_ID) {

      response = yield call(
        searchDataWorker,
        searchData({
          ...action.value,
          entitySetId: SR_DS_META_ESID,
        })
      );
      if (response.error) throw response.error;

      const entitySetIdsHits = response.data.hits
        .filter((hit) => getPropertyValue(hit, [FQNS.OL_STANDARDIZED, 0]) === true)
        .map((hit) => getPropertyValue(hit, [FQNS.OL_ID, 0]))
        .filter((id :UUID) => isValidUUID(id));

      entitySetIds = Set(entitySetIdsHits);

      const atlasDataSetIdsHits = response.data.hits
        .filter((hit) => getPropertyValue(hit, [FQNS.OL_STANDARDIZED, 0]) === false)
        .map((hit) => getPropertyValue(hit, [FQNS.OL_ID, 0]))
        .filter((id :UUID) => isValidUUID(id));

      atlasDataSetIds = Set(atlasDataSetIdsHits);

      // NOTE: this was a regular search so atlasDataSets and entitySets are mixed
      entitySetIdsTotalHits = response.data[TOTAL_HITS];
    }
    else {
      // TODO: this will be removed
      response = yield call(searchDataSetsWorker, searchDataSets(action.value));
      if (response.error) throw response.error;
      entitySetIds = response.data[HITS][ENTITY_SET_IDS];
      entitySetIdsTotalHits = response.data[TOTAL_HITS][ENTITY_SET_IDS];
      atlasDataSetIds = response.data[HITS][ATLAS_DATA_SET_IDS];
      atlasDataSetIdsTotalHits = response.data[TOTAL_HITS][ATLAS_DATA_SET_IDS];
    }

    yield call(
      getOrSelectDataSetsWorker,
      getOrSelectDataSets({ atlasDataSetIds, entitySetIds, organizationId })
    );

    yield put(searchOrganizationDataSets.success(action.id, {
      [HITS]: {
        [ATLAS_DATA_SET_IDS]: atlasDataSetIds,
        [ENTITY_SET_IDS]: entitySetIds,
      },
      [TOTAL_HITS]: {
        [ATLAS_DATA_SET_IDS]: atlasDataSetIdsTotalHits,
        [ENTITY_SET_IDS]: entitySetIdsTotalHits,
      }
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

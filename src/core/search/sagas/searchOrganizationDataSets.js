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

import { searchDataSetsWorker } from './searchDataSets';
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
  searchDataSets,
  searchEntitySet,
  searchOrganizationDataSets,
} from '../actions';

const LOG = new Logger('SearchSagas');

// TODO: DELETE ONCE PROPERLY IMPLEMENTED
const SHIP_ROOM_ORG_ID = '81999873-5b22-434e-be9b-1f98931ae2e4';
const SR_DS_META_ESID = '091695e1-a971-40ee-9956-a6a05c5942dd';

const { getPropertyValue } = DataUtils;
const { isValidUUID } = ValidationUtils;

function* searchOrganizationDataSetsWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(searchOrganizationDataSets.request(action.id, action.value));

    const organizationId :UUID = action.value.organizationId;
    let atlasDataSetIds :Set<UUID> = Set();
    let entitySetIds :Set<UUID> = Set();

    let response :WorkerResponse;

    if (organizationId === SHIP_ROOM_ORG_ID) {

      response = yield call(
        searchEntitySetWorker, searchEntitySet({
          ...action.value,
          entitySetId: SR_DS_META_ESID,
        })
      );
      if (response.error) throw response.error;

      const entitySetIdsHits = response.data.hits
        // .filter((hit) => getPropertyValue(hit, [FQNS.OL_STANDARDIZED, 0]) === true)
        .filter((hit) => !Number.isInteger(getPropertyValue(hit, ['ol.pgoid', 0])))
        .map((hit) => getPropertyValue(hit, [FQNS.OL_ID, 0]))
        .filter((id :UUID) => isValidUUID(id));

      entitySetIds = Set(entitySetIdsHits);

      const atlasDataSetIdsHits = response.data.hits
        // .filter((hit) => getPropertyValue(hit, [FQNS.OL_STANDARDIZED, 0]) === false)
        .filter((hit) => Number.isInteger(getPropertyValue(hit, ['ol.pgoid', 0])))
        .map((hit) => getPropertyValue(hit, [FQNS.OL_ID, 0]))
        .filter((id :UUID) => isValidUUID(id));

      atlasDataSetIds = Set(atlasDataSetIdsHits);
    }
    else {
      // TODO: this will be removed
      response = yield call(searchDataSetsWorker, searchDataSets(action.value));
      if (response.error) throw response.error;
      entitySetIds = response.data.hits;
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

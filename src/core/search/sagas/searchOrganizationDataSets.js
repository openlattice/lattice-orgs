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
import { Types } from 'lattice';
import { SearchApiActions, SearchApiSagas } from 'lattice-sagas';
import { AxiosUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type {
  EntitySetFlagType,
  FQN,
  Organization,
  PropertyType,
  UUID,
} from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { ERR_MISSING_ORG, ERR_MISSING_PROPERTY_TYPE } from '../../../utils/constants/errors';
import { FQNS } from '../../edm/constants';
import { HITS, TOTAL_HITS } from '../../redux/constants';
import { selectOrganization, selectPropertyTypes } from '../../redux/selectors';
import { SEARCH_ORGANIZATION_DATA_SETS, searchOrganizationDataSets } from '../actions';
import { MAX_HITS_10 } from '../constants';

const { EntitySetFlagTypes } = Types;
const { searchEntitySetData } = SearchApiActions;
const { searchEntitySetDataWorker } = SearchApiSagas;
const { toSagaError } = AxiosUtils;

const REQUIRED_PROPERTY_TYPES :FQN[] = [
  FQNS.OL_FLAGS,
];

const LOG = new Logger('SearchSagas');

function* searchOrganizationDataSetsWorker(action :SequenceAction) :Saga<WorkerResponse> {

  let workerResponse :WorkerResponse;

  try {
    yield put(searchOrganizationDataSets.request(action.id, action.value));

    const {
      entitySetFlags = [],
      maxHits = MAX_HITS_10,
      organizationId,
      query,
      start = 0,
    } :{|
      entitySetFlags :Array<?EntitySetFlagType>;
      maxHits ?:number;
      organizationId :UUID;
      page ?:number;
      query :string;
      start ?:number;
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

    const constraints = [{
      constraints: [{
        searchTerm: query,
      }],
    }];

    if (entitySetFlags.length === 0) {
      constraints.push({
        constraints: [
          { searchTerm: `NOT(entity.${propertyTypeIds.get(FQNS.OL_FLAGS)}:${EntitySetFlagTypes.AUDIT})` },
        ],
      });
    }
    else {
      entitySetFlags.forEach((flag :?EntitySetFlagType) => {
        if (flag) {
          constraints.push({
            constraints: [
              { searchTerm: `entity.${propertyTypeIds.get(FQNS.OL_FLAGS)}:${flag}` },
            ],
          });
        }
      });
    }

    const response :WorkerResponse = yield call(
      searchEntitySetDataWorker,
      searchEntitySetData({
        constraints,
        entitySetIds: [organization.metadataEntitySetIds.datasets],
        maxHits,
        start,
      }),
    );
    if (response.error) throw response.error;

    workerResponse = {
      data: {
        [HITS]: fromJS(response.data.hits || []),
        [TOTAL_HITS]: response.data.numHits || 0,
      },
    };
    yield put(searchOrganizationDataSets.success(action.id, workerResponse.data));
  }
  catch (error) {
    workerResponse = { error };
    LOG.error(action.type, error);
    yield put(searchOrganizationDataSets.failure(action.id, toSagaError(error)));
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

/*
 * @flow
 */

import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { fromJS } from 'immutable';
import { Types } from 'lattice';
import { SearchApiActions, SearchApiSagas } from 'lattice-sagas';
import { AxiosUtils, LangUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { Organization, UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { ERR_MISSING_ORG } from '../../../utils/constants/errors';
import { HITS, TOTAL_HITS } from '../../redux/constants';
import { selectOrganization } from '../../redux/selectors';
import { SEARCH_ORGANIZATION_DATA_SETS, searchOrganizationDataSets } from '../actions';
import { MAX_HITS_10 } from '../constants';

const { EntitySetFlagTypes } = Types;
const { searchDataSetMetadata } = SearchApiActions;
const { searchDataSetMetadataWorker } = SearchApiSagas;
const { toSagaError } = AxiosUtils;
const { isDefined, isNonEmptyString } = LangUtils;

const LOG = new Logger('SearchSagas');

function* searchOrganizationDataSetsWorker(action :SequenceAction) :Saga<WorkerResponse> {

  let workerResponse :WorkerResponse;

  try {
    yield put(searchOrganizationDataSets.request(action.id, action.value));

    const {
      dataSetType,
      flags = [],
      maxHits = MAX_HITS_10,
      organizationId,
      query,
      start = 0,
    } :{|
      dataSetType ?:string;
      flags ?:string[];
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

    /*
      allows for partial strings so titles that have no spaces and have not been
      tokenized in elasticsearch as separate words are also returned in results
    */
    const searchQuery = (query.length > 1) ? `*${query}*` : query;

    const constraints = [
      {
        constraints: [{
          searchTerm: searchQuery,
        }],
      },
    ];

    const searchFlags = flags.filter(isDefined);
    if (searchFlags.length === 0) {
      constraints.push({
        constraints: [
          { searchTerm: `NOT(dataset.metadata.flags:${EntitySetFlagTypes.AUDIT})` },
        ],
      });
    }
    else {
      searchFlags.forEach((flag) => {
        constraints.push({
          constraints: [
            { searchTerm: `dataset.metadata.flags:${flag}` },
          ],
        });
      });
    }

    if (isNonEmptyString(dataSetType)) {
      constraints.push({
        constraints: [
          { searchTerm: `dataset.dataSetType:${dataSetType}` },
        ],
      });
    }

    const response :WorkerResponse = yield call(
      searchDataSetMetadataWorker,
      searchDataSetMetadata({
        constraints,
        maxHits,
        organizationIds: [organizationId],
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

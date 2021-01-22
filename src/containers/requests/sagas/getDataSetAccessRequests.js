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
import { SearchApiActions, SearchApiSagas } from 'lattice-sagas';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { Organization, UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { selectOrganization } from '../../../core/redux/selectors';
import { MAX_HITS_10000 } from '../../../core/search/constants';
import { toSagaError } from '../../../utils';
import { ERR_MISSING_ORG } from '../../../utils/constants/errors';
import { GET_DATA_SET_ACCESS_REQUESTS, getDataSetAccessRequests } from '../actions';

const LOG = new Logger('RequestsSagas');

const { searchEntitySetData } = SearchApiActions;
const { searchEntitySetDataWorker } = SearchApiSagas;

function* getDataSetAccessRequestsWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(getDataSetAccessRequests.request(action.id, action.value));

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

    // TODO: paging
    const response = yield call(
      searchEntitySetDataWorker,
      searchEntitySetData({
        constraints: [{
          constraints: [{
            // TODO: search by dataset name or id
            searchTerm: '*',
          }],
        }],
        entitySetIds: [organization.metadataEntitySetIds.accessRequests],
        maxHits: MAX_HITS_10000,
        start: 0,
      }),
    );
    if (response.error) throw response.error;

    yield put(getDataSetAccessRequests.success(action.id, fromJS(response.data.hits)));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getDataSetAccessRequests.failure(action.id, toSagaError(error)));
  }
  finally {
    yield put(getDataSetAccessRequests.finally(action.id));
  }
}

function* getDataSetAccessRequestsWatcher() :Saga<*> {

  yield takeEvery(GET_DATA_SET_ACCESS_REQUESTS, getDataSetAccessRequestsWorker);
}

export {
  getDataSetAccessRequestsWatcher,
  getDataSetAccessRequestsWorker,
};

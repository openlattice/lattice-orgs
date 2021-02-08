/*
 * @flow
 */

import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { List, Map, fromJS } from 'immutable';
import { Models } from 'lattice';
import { DataApiActions, DataApiSagas } from 'lattice-sagas';
import { DataUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { Organization, UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { ERR_MISSING_ORG } from '../../../utils/constants/errors';
import { selectOrganization } from '../../redux/selectors';
import { GET_ORG_DATA_SETS_FROM_META, getOrgDataSetsFromMeta } from '../actions';
import { FQNS } from '../constants';

const { FQN } = Models;
const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { getPropertyValue } = DataUtils;

const LOG = new Logger('EDMSagas');

function* getOrgDataSetsFromMetaWorker(action :SequenceAction) :Saga<WorkerResponse> {

  let workerResponse :WorkerResponse;

  try {
    yield put(getOrgDataSetsFromMeta.request(action.id, action.value));

    const {
      organizationId,
    } :{|
      organizationId :UUID;
    |} = action.value;

    const organization :?Organization = yield select(selectOrganization(organizationId));
    if (!organization) {
      throw new Error(ERR_MISSING_ORG);
    }

    // NOTE: this saga exists as a temporary workaround. the issue is that there's no way to get permissions based off
    // a principal, for example a USER or a ROLE. until we have an api to get a principal's permissions, we have to
    // get all data sets to figure out which ones the principal has permissions on
    // NOTE: an alternative to using getEntitySetData would be to call searchEntitySetData with '*', but in both cases,
    // we need all data sets, unfortunately
    const response :WorkerResponse = yield call(
      getEntitySetDataWorker,
      getEntitySetData({ entitySetId: organization.metadataEntitySetIds.datasets }),
    );
    if (response.error) throw response.error;

    const dataSets :Map<UUID, Map<FQN, List>> = fromJS(response.data)
      .toMap()
      .mapKeys((_, dataSet :Map) => getPropertyValue(dataSet, [FQNS.OL_ID, 0]))
      .map((dataSet :Map) => dataSet.mapKeys((key :string) => FQN.of(key)));

    workerResponse = { data: dataSets };
    yield put(getOrgDataSetsFromMeta.success(action.id, workerResponse.data));
  }
  catch (error) {
    workerResponse = { error };
    LOG.error(action.type, error);
    yield put(getOrgDataSetsFromMeta.failure(action.id, error));
  }
  finally {
    yield put(getOrgDataSetsFromMeta.finally(action.id));
  }

  return workerResponse;
}

function* getOrgDataSetsFromMetaWatcher() :Saga<*> {

  yield takeEvery(GET_ORG_DATA_SETS_FROM_META, getOrgDataSetsFromMetaWorker);
}

export {
  getOrgDataSetsFromMetaWatcher,
  getOrgDataSetsFromMetaWorker,
};

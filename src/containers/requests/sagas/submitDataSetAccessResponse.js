/*
 * @flow
 */

import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { Map, get } from 'immutable';
import { AuthUtils } from 'lattice-auth';
import { DataApiActions, DataApiSagas } from 'lattice-sagas';
import { LangUtils, Logger } from 'lattice-utils';
import { DateTime } from 'luxon';
import type { Saga } from '@redux-saga/core';
import type {
  FQN,
  Organization,
  PropertyType,
  UUID,
} from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { FQNS } from '../../../core/edm/constants';
import { selectOrganization, selectPropertyTypes } from '../../../core/redux/selectors';
import { toSagaError } from '../../../utils';
import {
  ERR_INVALID_PRINCIPAL_ID,
  ERR_INVALID_REQUEST_STATUS,
  ERR_MISSING_ORG,
  ERR_MISSING_PROPERTY_TYPE,
} from '../../../utils/constants/errors';
import { SUBMIT_DATA_SET_ACCESS_RESPONSE, submitDataSetAccessResponse } from '../actions';
import { RequestStatusTypes } from '../constants';
import type { RequestStatusType } from '../constants';

const LOG = new Logger('RequestsSagas');

const { updateEntityData } = DataApiActions;
const { updateEntityDataWorker } = DataApiSagas;
const { isNonEmptyString } = LangUtils;

const REQUIRED_PROPERTY_TYPES :FQN[] = [
  FQNS.OL_RESPONSE_DATE_TIME,
  FQNS.OL_RESPONSE_PRINCIPAL_ID,
  FQNS.OL_STATUS,
];

function* submitDataSetAccessResponseWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(submitDataSetAccessResponse.request(action.id, action.value));

    const {
      // dataSetId,
      entityKeyId,
      organizationId,
      status,
    } :{
      dataSetId :UUID;
      entityKeyId :UUID;
      organizationId :UUID;
      status :RequestStatusType;
    } = action.value;

    if (!RequestStatusTypes[status]) {
      throw new Error(ERR_INVALID_REQUEST_STATUS);
    }

    const organization :?Organization = yield select(selectOrganization(organizationId));
    if (!organization) {
      throw new Error(ERR_MISSING_ORG);
    }

    const userId :string = get(AuthUtils.getUserInfo(), 'id', '');
    if (!isNonEmptyString(userId)) {
      throw new Error(ERR_INVALID_PRINCIPAL_ID);
    }

    const propertyTypes :Map<UUID, PropertyType> = yield select(selectPropertyTypes(REQUIRED_PROPERTY_TYPES));
    const propertyTypeIds :Map<FQN, UUID> = propertyTypes.map((propertyType) => propertyType.type).flip();
    if (propertyTypeIds.count() !== REQUIRED_PROPERTY_TYPES.length) {
      throw new Error(ERR_MISSING_PROPERTY_TYPE);
    }

    const response :WorkerResponse = yield call(
      updateEntityDataWorker,
      updateEntityData({
        entities: {
          [entityKeyId]: {
            [get(propertyTypeIds, FQNS.OL_RESPONSE_DATE_TIME)]: [DateTime.local().toISO()],
            [get(propertyTypeIds, FQNS.OL_RESPONSE_PRINCIPAL_ID)]: [userId],
            [get(propertyTypeIds, FQNS.OL_STATUS)]: [status],
          },
        },
        entitySetId: organization.metadataEntitySetIds.accessRequests,
      }),
    );
    if (response.error) throw response.error;

    yield put(submitDataSetAccessResponse.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(submitDataSetAccessResponse.failure(action.id, toSagaError(error)));
  }
  finally {
    yield put(submitDataSetAccessResponse.finally(action.id));
  }
}

function* submitDataSetAccessResponseWatcher() :Saga<*> {

  yield takeEvery(SUBMIT_DATA_SET_ACCESS_RESPONSE, submitDataSetAccessResponseWorker);
}

export {
  submitDataSetAccessResponseWatcher,
  submitDataSetAccessResponseWorker,
};

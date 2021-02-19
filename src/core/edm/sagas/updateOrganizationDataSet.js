/*
 * @flow
 */

import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { Map } from 'immutable';
import { DataApiActions, DataApiSagas } from 'lattice-sagas';
import { AxiosUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type {
  FQN,
  Organization,
  PropertyType,
  UUID,
} from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { ERR_MISSING_ORG, ERR_MISSING_PROPERTY_TYPE } from '../../../utils/constants/errors';
import { selectOrganization, selectPropertyTypes } from '../../redux/selectors';
import { UPDATE_ORGANIZATION_DATA_SET, updateOrganizationDataSet } from '../actions';
import { FQNS } from '../constants';

const { updateEntityData } = DataApiActions;
const { updateEntityDataWorker } = DataApiSagas;
const { toSagaError } = AxiosUtils;

const REQUIRED_PROPERTY_TYPES :FQN[] = [
  FQNS.OL_DESCRIPTION,
  FQNS.OL_TITLE,
];

const LOG = new Logger('EDMSagas');

function* updateOrganizationDataSetWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(updateOrganizationDataSet.request(action.id, action.value));

    const {
      // dataSetId,
      description,
      entityKeyId,
      isColumn,
      organizationId,
      title,
    } :{|
      dataSetId :UUID;
      description :string;
      entityKeyId :UUID;
      isColumn ?:boolean;
      organizationId :UUID;
      title :string;
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

    const entitySetId :UUID = isColumn
      ? organization.metadataEntitySetIds.columns
      : organization.metadataEntitySetIds.datasets;

    const response :WorkerResponse = yield call(
      updateEntityDataWorker,
      updateEntityData({
        entities: {
          [entityKeyId]: {
            [propertyTypeIds.get(FQNS.OL_DESCRIPTION)]: [description],
            [propertyTypeIds.get(FQNS.OL_TITLE)]: [title],
          },
        },
        entitySetId,
      }),
    );
    if (response.error) throw response.error;

    yield put(updateOrganizationDataSet.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(updateOrganizationDataSet.failure(action.id, toSagaError(error)));
  }
  finally {
    yield put(updateOrganizationDataSet.finally(action.id));
  }
}

function* updateOrganizationDataSetWatcher() :Saga<*> {

  yield takeEvery(UPDATE_ORGANIZATION_DATA_SET, updateOrganizationDataSetWorker);
}

export {
  updateOrganizationDataSetWatcher,
  updateOrganizationDataSetWorker,
};

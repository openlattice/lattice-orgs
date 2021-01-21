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
import { Logger } from 'lattice-utils';
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
import {
  UPDATE_DATA_SET_METADATA,
  updateDataSetMetaData,
} from '../actions';
import { FQNS } from '../constants';

const LOG = new Logger('EDMSagas');

const { updateEntityData } = DataApiActions;
const { updateEntityDataWorker } = DataApiSagas;

function* updateDataSetMetaDataWorker(action :SequenceAction) :Saga<void> {

  try {
    yield put(updateDataSetMetaData.request(action.id, action.value));

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

    const propertyTypes :Map<UUID, PropertyType> = yield select(
      selectPropertyTypes([
        FQNS.OL_DESCRIPTION,
        FQNS.OL_TITLE,
      ])
    );
    const propertyTypeIds :Map<FQN, UUID> = propertyTypes.map((propertyType) => propertyType.type).flip();
    if (propertyTypeIds.count() !== 2) {
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

    yield put(updateDataSetMetaData.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(updateDataSetMetaData.failure(action.id, error));
  }
  finally {
    yield put(updateDataSetMetaData.finally(action.id));
  }
}

function* updateDataSetMetaDataWatcher() :Saga<void> {

  yield takeEvery(UPDATE_DATA_SET_METADATA, updateDataSetMetaDataWorker);
}

export {
  updateDataSetMetaDataWatcher,
  updateDataSetMetaDataWorker,
};

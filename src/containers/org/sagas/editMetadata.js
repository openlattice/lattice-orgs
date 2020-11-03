// @flow

import {
  call,
  put,
  select,
  takeLatest
} from '@redux-saga/core/effects';
import {
  List,
  Map,
  fromJS,
} from 'immutable';
import { Types } from 'lattice';
import { DataApiActions, DataApiSagas } from 'lattice-sagas';
import { DataUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { PropertyType, UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  FQNS,
  SR_DS_META_ESID,
} from '../../../core/edm/constants';
import { selectPropertyTypes } from '../../../core/redux/selectors';
import { EDIT_METADATA, editMetadata } from '../actions';

const { UpdateTypes } = Types;

const { updateEntityData } = DataApiActions;
const { updateEntityDataWorker } = DataApiSagas;

const { getPropertyValue, getEntityKeyId } = DataUtils;
const LOG = new Logger('ShiproomMetadata');

function* editMetadataWorker(action :SequenceAction) :Saga<void> {
  try {
    yield put(editMetadata.request(action.id, action.value));
    const {
      inputState,
      metadata,
      property,
    } = action.value;

    const { title, description } = inputState;
    const { index } = property;
    const columnInfo :List = getPropertyValue(metadata, FQNS.OL_COLUMN_INFO, List());
    const entityKeyId :UUID = getEntityKeyId(metadata) || '';
    const parsedColumnInfo = JSON.parse(columnInfo.first());
    const updatedColumnInfo = fromJS(parsedColumnInfo)
      .setIn([index, 'title'], title)
      .setIn([index, 'description'], description);

    const stringifiedColumnInfo = JSON.stringify(updatedColumnInfo);

    const propertyTypes :Map<UUID, PropertyType> = yield select(selectPropertyTypes([FQNS.OL_COLUMN_INFO]));

    if (propertyTypes.size !== 1) {
      throw Error('indeterminate property type id');
    }

    const columnInfoPTID = propertyTypes.keySeq().first();
    const updateResponse = yield call(
      updateEntityDataWorker,
      updateEntityData({
        entitySetId: SR_DS_META_ESID,
        entities: {
          [entityKeyId]: {
            [columnInfoPTID]: [stringifiedColumnInfo]
          }
        },
        updateType: UpdateTypes.PartialReplace,
      }),
    );
    if (updateResponse.error) throw updateResponse.error;

    yield put(editMetadata.success(action.id, metadata.setIn([FQNS.OL_COLUMN_INFO, 0], stringifiedColumnInfo)));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(editMetadata.failure(action.id));
  }
  finally {
    yield put(editMetadata.finally(action.id));
  }
}

function* editMetadataWatcher() :Saga<void> {
  yield takeLatest(EDIT_METADATA, editMetadataWorker);
}

export {
  editMetadataWatcher,
  editMetadataWorker,
};

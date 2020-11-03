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
  setIn
} from 'immutable';
import { DataUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { PropertyType, UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  FQNS,
  SHIP_ROOM_ORG_ID,
  SR_DS_META_ESID,
} from '../../../core/edm/constants';
import { selectPropertyTypes } from '../../../core/redux/selectors';
import { searchData } from '../../../core/search/actions';
import { searchDataWorker } from '../../../core/search/sagas';
import { EDIT_METADATA, editMetadata } from '../actions';

const { getPropertyValue } = DataUtils;
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
    const parsedColumnInfo = JSON.parse(columnInfo.first());
    const updatedColumnInfo = fromJS(parsedColumnInfo)
      .setIn([index, 'title'], title)
      .setIn([index, 'description'], description);

    const stringifiedColumnInfo = JSON.stringify(updatedColumnInfo);
    console.log(stringifiedColumnInfo);
    yield put(editMetadata.success(action.id));
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

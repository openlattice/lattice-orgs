// @flow

import {
  call,
  put,
  takeEvery,
  takeLatest
} from '@redux-saga/core/effects';
import type { Saga } from '@redux-saga/core';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { GET_SHIPROOM_METADATA, getShiproomMetadata } from '../actions';

function* getShiproomMetadataWorker(action :SequenceAction) :Saga<void> {
  try {
    yield put(getShiproomMetadata.request(action.id));
    yield put(getShiproomMetadata.success(action.id));
  }
  catch (error) {
    yield put(getShiproomMetadata.failure(action.id));
  }
  finally {
    yield put(getShiproomMetadata.finally(action.id));
  }
}

function* getShiproomMetadataWatcher() :Saga<void> {
  yield takeLatest(GET_SHIPROOM_METADATA, getShiproomMetadataWorker);
}

export {
  getShiproomMetadataWatcher,
  getShiproomMetadataWorker,
};

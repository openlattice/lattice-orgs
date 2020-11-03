// @flow

import {
  call,
  put,
  select,
  takeLatest
} from '@redux-saga/core/effects';
import { Map, fromJS } from 'immutable';
import { Logger } from 'lattice-utils';
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
import { GET_SHIPROOM_METADATA, getShiproomMetadata } from '../actions';

const LOG = new Logger('ShiproomMetadata');

function* getShiproomMetadataWorker(action :SequenceAction) :Saga<void> {
  try {
    yield put(getShiproomMetadata.request(action.id, action.value));
    const { organizationId, dataSetId } = action.value;

    let metadata = Map();
    if (organizationId === SHIP_ROOM_ORG_ID) {
      const propertyTypes :Map<UUID, PropertyType> = yield select(selectPropertyTypes([FQNS.OL_ID]));

      if (propertyTypes.size !== 1) {
        throw Error('indeterminate property type id');
      }

      const idPTID = propertyTypes.keySeq().first();

      const metadataResponse = yield call(
        searchDataWorker,
        searchData({
          query: `entity.${idPTID}:"${dataSetId}"`,
          entitySetId: SR_DS_META_ESID,
        })
      );
      if (metadataResponse.error) throw metadataResponse.error;
      metadata = fromJS(metadataResponse.data.hits).first();
    }
    yield put(getShiproomMetadata.success(action.id, metadata));
  }
  catch (error) {
    LOG.error(action.type, error);
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

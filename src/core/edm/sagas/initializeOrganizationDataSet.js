/*
 * @flow
 */

import {
  all,
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { List, Map, fromJS } from 'immutable';
import { Models, Types } from 'lattice';
import {
  AuthorizationsApiActions,
  AuthorizationsApiSagas,
  DataSetMetadataApiActions,
  DataSetMetadataApiSagas,
} from 'lattice-sagas';
import { AxiosUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { AccessCheck, Organization, UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { isAtlasDataSet } from '../../../utils';
import { ERR_MISSING_ORG } from '../../../utils/constants/errors';
import { DATA_SET, DATA_SET_COLUMNS, IS_OWNER } from '../../redux/constants';
import { selectOrganization } from '../../redux/selectors';
import { INITIALIZE_ORGANIZATION_DATA_SET, getOrgDataSetSize, initializeOrganizationDataSet } from '../actions';

const { AccessCheckBuilder } = Models;
const { PermissionTypes } = Types;
const { getAuthorizations } = AuthorizationsApiActions;
const { getAuthorizationsWorker } = AuthorizationsApiSagas;
const { getDataSetMetadata, getDataSetColumnsMetadata } = DataSetMetadataApiActions;
const { getDataSetMetadataWorker, getDataSetColumnsMetadataWorker } = DataSetMetadataApiSagas;
const { toSagaError } = AxiosUtils;

const LOG = new Logger('EDMSagas');

function* initializeOrganizationDataSetWorker(action :SequenceAction) :Saga<WorkerResponse> {

  let workerResponse :WorkerResponse;

  try {
    yield put(initializeOrganizationDataSet.request(action.id, action.value));

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

    const accessChecks :AccessCheck[] = [
      (new AccessCheckBuilder())
        .setAclKey([dataSetId])
        .setPermissions([PermissionTypes.OWNER])
        .build()
    ];

    const authorizationsCall = call(getAuthorizationsWorker, getAuthorizations(accessChecks));
    const dataSetCall = call(getDataSetMetadataWorker, getDataSetMetadata(dataSetId));
    const dataSetColumnsCall = call(getDataSetColumnsMetadataWorker, getDataSetColumnsMetadata([dataSetId]));

    const [
      authorizationsResponse,
      dataSetResponse,
      dataSetColumnsResponse,
    ] :WorkerResponse[] = yield all([authorizationsCall, dataSetCall, dataSetColumnsCall]);

    if (dataSetResponse.error) throw dataSetResponse.error;
    if (dataSetColumnsResponse.error) throw dataSetColumnsResponse.error;

    const dataSet :Map = fromJS(dataSetResponse.data);
    const dataSetColumns :List<Map> = fromJS(dataSetColumnsResponse.data).get(dataSetId) || List();

    if (!isAtlasDataSet(dataSet)) {
      yield put(getOrgDataSetSize({ dataSetId, organizationId }));
    }

    let isOwner :boolean = false;
    if (!authorizationsResponse.error) {
      isOwner = authorizationsResponse.data[0].permissions[PermissionTypes.OWNER] === true;
    }

    workerResponse = {
      data: {
        [DATA_SET]: dataSet,
        [DATA_SET_COLUMNS]: dataSetColumns,
        [IS_OWNER]: isOwner,
      },
    };
    yield put(initializeOrganizationDataSet.success(action.id, workerResponse.data));
  }
  catch (error) {
    workerResponse = { error };
    LOG.error(action.type, error);
    yield put(initializeOrganizationDataSet.failure(action.id, toSagaError(error)));
  }
  finally {
    yield put(initializeOrganizationDataSet.finally(action.id));
  }

  return workerResponse;
}

function* initializeOrganizationDataSetWatcher() :Saga<*> {

  yield takeEvery(INITIALIZE_ORGANIZATION_DATA_SET, initializeOrganizationDataSetWorker);
}

export {
  initializeOrganizationDataSetWatcher,
  initializeOrganizationDataSetWorker,
};

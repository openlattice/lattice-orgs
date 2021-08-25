/*
 * @flow
 */

import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import {
  List, Map, Set, fromJS
} from 'immutable';
import { Models, Types } from 'lattice';
import {
  DataSetMetadataApiActions,
  DataSetMetadataApiSagas,
  PermissionsApiActions,
  PermissionsApiSagas,
} from 'lattice-sagas';
import { AxiosUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { PermissionType, Principal, UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { getDataSetsKeys } from '../../../utils';
import { selectOrgDataSets, selectOrgDataSetsColumns } from '../../redux/selectors';
import { ASSIGN_PERMISSIONS_TO_DATA_SET, assignPermissionsToDataSet } from '../actions';

const { AceBuilder, AclBuilder, AclDataBuilder } = Models;
const { ActionTypes } = Types;
const { getDataSetColumnsMetadata } = DataSetMetadataApiActions;
const { getDataSetColumnsMetadataWorker } = DataSetMetadataApiSagas;
const { updateAcls } = PermissionsApiActions;
const { updateAclsWorker } = PermissionsApiSagas;
const { toSagaError } = AxiosUtils;

const LOG = new Logger('PermissionsSagas');

function* assignPermissionsToDataSetWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(assignPermissionsToDataSet.request(action.id, action.value));

    const {
      dataSetIds,
      organizationId,
      permissionTypes,
      principal,
      withColumns = false,
    } :{|
      dataSetIds :List<UUID>;
      organizationId :UUID;
      permissionTypes :PermissionType[];
      principal :Principal;
      withColumns ?:boolean;
    |} = action.value;

    let response :WorkerResponse;

    let keys :List<List<UUID>> = List().push(dataSetIds);
    if (withColumns) {
      const dataSets :Map = yield select(selectOrgDataSets(organizationId, dataSetIds));
      let dataSetsColumns :Map = yield select(selectOrgDataSetsColumns(organizationId, dataSetIds));
      const emptyColumnDataSetIds = Set().withMutations((mutableSet) => {
        dataSets.forEach((dataSet, dataSetId) => {
          const dataSetColumns :Map<UUID, Map> = dataSetsColumns.get(dataSetId);
          // NOTE: if "dataSetColumns" is empty, it's very likely that we just haven't loaded columns
          if (dataSetColumns.isEmpty()) {
            mutableSet.add(dataSetId);
          }
        });
      });
      // NOTE: if any "dataSetColumns" were empty, we will call them here
      if (!emptyColumnDataSetIds.isEmpty()) {
        response = yield call(getDataSetColumnsMetadataWorker, getDataSetColumnsMetadata(emptyColumnDataSetIds.toJS()));
        if (response.error) throw response.error;
        dataSetsColumns = fromJS(response.data) || Map();
      }
      keys = getDataSetsKeys(dataSets, dataSetsColumns);
    }

    const updates = [];
    const permissions = Map().withMutations((mutableMap) => {
      keys.forEach((key :List<UUID>) => {

        const ace = (new AceBuilder())
          .setPermissions(permissionTypes)
          .setPrincipal(principal)
          .build();

        const acl = (new AclBuilder())
          .setAces([ace])
          .setAclKey(key)
          .build();

        const aclData = (new AclDataBuilder())
          .setAcl(acl)
          .setAction(ActionTypes.ADD)
          .build();

        mutableMap.set(key, ace);
        updates.push(aclData);
      });
    });

    response = yield call(updateAclsWorker, updateAcls(updates));
    if (response.error) throw response.error;

    yield put(assignPermissionsToDataSet.success(action.id, { permissions }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(assignPermissionsToDataSet.failure(action.id, toSagaError(error)));
  }
  finally {
    yield put(assignPermissionsToDataSet.finally(action.id));
  }
}

function* assignPermissionsToDataSetWatcher() :Saga<*> {

  yield takeEvery(ASSIGN_PERMISSIONS_TO_DATA_SET, assignPermissionsToDataSetWorker);
}

export {
  assignPermissionsToDataSetWatcher,
  assignPermissionsToDataSetWorker,
};

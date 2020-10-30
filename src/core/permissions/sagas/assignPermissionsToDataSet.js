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
  List,
  Map,
  get,
} from 'immutable';
import { Models, Types } from 'lattice';
import { PermissionsApiActions, PermissionsApiSagas } from 'lattice-sagas';
import { Logger, ReduxUtils } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type {
  EntitySet,
  EntityType,
  PermissionType,
  Principal,
  UUID,
} from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { selectAtlasDataSets } from '../../redux/selectors';
import { ASSIGN_PERMISSIONS_TO_DATA_SET, assignPermissionsToDataSet } from '../actions';

const LOG = new Logger('PermissionsSagas');

const { AceBuilder, AclBuilder, AclDataBuilder } = Models;
const { ActionTypes } = Types;
const { updateAcls } = PermissionsApiActions;
const { updateAclsWorker } = PermissionsApiSagas;
const { selectEntitySets, selectEntityTypes } = ReduxUtils;

function* assignPermissionsToDataSetWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(assignPermissionsToDataSet.request(action.id, action.value));

    const {
      dataSetId,
      permissionTypes,
      principal,
      withProperties = false,
    } :{|
      dataSetId :UUID;
      permissionTypes :PermissionType[];
      principal :Principal;
      withProperties ?:boolean;
    |} = action.value;

    let atlasDataSets :Map<UUID, Map> = Map();
    let entitySets :Map<UUID, EntitySet> = Map();
    let entityTypes :Map<UUID, EntityType> = Map();
    if (withProperties) {
      atlasDataSets = yield select(selectAtlasDataSets([dataSetId]));
      entitySets = yield select(selectEntitySets([dataSetId]));
      entityTypes = yield select(selectEntityTypes([entitySets.get(dataSetId)?.entityTypeId]));
    }

    const keys :List<List<UUID>> = List().withMutations((mutableKeys :List<List<UUID>>) => {
      mutableKeys.push(List([dataSetId]));
      if (withProperties) {
        const atlasDataSet :?Map = atlasDataSets.get(dataSetId);
        const entitySet :?EntitySet = entitySets.get(dataSetId);
        if (atlasDataSet) {
          get(atlasDataSet, 'columns', List()).forEach((column :Map) => {
            mutableKeys.push(List([dataSetId, get(column, 'id')]));
          });
        }
        else if (entitySet) {
          const entityType :EntityType = entityTypes.get(entitySet.entityTypeId);
          entityType.properties.forEach((propertyTypeId :UUID) => {
            mutableKeys.push(List([dataSetId, propertyTypeId]));
          });
        }
      }
    });

    const updates = [];
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

      updates.push(aclData);
    });

    const response :WorkerResponse = yield call(updateAclsWorker, updateAcls(updates));
    if (response.error) throw response.error;

    yield put(assignPermissionsToDataSet.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(assignPermissionsToDataSet.failure(action.id, error));
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

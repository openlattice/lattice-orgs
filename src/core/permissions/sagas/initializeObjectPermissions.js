/*
 * @flow
 */

import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { List, Map, Set } from 'immutable';
import { Types } from 'lattice';
import { PrincipalsApiActions, PrincipalsApiSagas } from 'lattice-sagas';
import { Logger, ValidationUtils } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type {
  Ace,
  Principal,
  PropertyType,
  UUID,
} from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { getDataSetPermissionsWorker } from './getDataSetPermissions';
import { getPermissionsWorker } from './getPermissions';

import { getDataSetKeys } from '../../../utils';
import { ERR_INVALID_UUID } from '../../../utils/constants/errors';
import { getOrSelectDataSet } from '../../edm/actions';
import { getOrSelectDataSetWorker } from '../../edm/sagas';
import {
  selectDataSetProperties,
  selectPermissionsByPrincipal,
} from '../../redux/selectors';
import {
  INITIALIZE_OBJECT_PERMISSIONS,
  getDataSetPermissions,
  getPermissions,
  initializeObjectPermissions
} from '../actions';

const { PrincipalTypes } = Types;
const { isValidUUID } = ValidationUtils;

const { getUsers } = PrincipalsApiActions;
const { getUsersWorker } = PrincipalsApiSagas;

const LOG = new Logger('initializeObjectPermissions');

function* initializeObjectPermissionsWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(initializeObjectPermissions.request(action.id, action.value));

    const {
      isDataSet,
      objectKey,
      organizationId,
    } :{
      isDataSet :boolean;
      objectKey :List<UUID>;
      organizationId :UUID;
    } = action.value;

    if (!objectKey.every(isValidUUID) || !isValidUUID(organizationId)) {
      throw new Error(ERR_INVALID_UUID);
    }

    let response :WorkerResponse;
    let keys :List<List<UUID>> = List();

    if (isDataSet) {

      const dataSetId :UUID = objectKey.get(0);
      response = yield call(getOrSelectDataSetWorker, getOrSelectDataSet({ dataSetId, organizationId }));
      if (response.error) throw response.error;

      response = yield call(getDataSetPermissionsWorker, getDataSetPermissions({
        atlasDataSetIds: Set([dataSetId]),
        entitySetIds: Set([dataSetId]),
        organizationId,
        withProperties: true,
      }));
      if (response.error) throw response.error;

      const properties :Map<UUID, PropertyType | Map> = yield select(selectDataSetProperties(dataSetId));
      keys = getDataSetKeys(dataSetId, properties.keySeq().toSet());
    }
    else {
      keys = List().push(objectKey);
      response = yield call(getPermissionsWorker, getPermissions(keys));
      if (response.error) throw response.error;
    }

    const permissions :Map<Principal, Map<List<UUID>, Ace>> = yield select(selectPermissionsByPrincipal(keys));

    const userIds :string[] = permissions.keySeq()
      .filter((principal :Principal) => principal.type === PrincipalTypes.USER)
      .map((principal :Principal) => principal.id)
      .toJS();

    // NOTE: not sure if we should throw if this fails... the fallback is to show the principal id
    yield call(getUsersWorker, getUsers(userIds));

    yield put(initializeObjectPermissions.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(initializeObjectPermissions.failure(action.id, error));
  }
  finally {
    yield put(initializeObjectPermissions.finally(action.id));
  }
}

function* initializeObjectPermissionsWatcher() :Saga<*> {

  yield takeEvery(
    INITIALIZE_OBJECT_PERMISSIONS,
    initializeObjectPermissionsWorker,
  );
}

export {
  initializeObjectPermissionsWatcher,
  initializeObjectPermissionsWorker,
};

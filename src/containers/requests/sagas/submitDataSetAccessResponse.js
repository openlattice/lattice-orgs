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
  fromJS,
  get,
} from 'immutable';
import { Models, Types } from 'lattice';
import { AuthUtils } from 'lattice-auth';
import { DataApiActions, DataApiSagas } from 'lattice-sagas';
import {
  DataUtils,
  LangUtils,
  Logger,
  ValidationUtils,
} from 'lattice-utils';
import { DateTime } from 'luxon';
import type { Saga } from '@redux-saga/core';
import type {
  Ace,
  FQN,
  Organization,
  PermissionType,
  PropertyType,
  UUID,
} from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { FQNS } from '../../../core/edm/constants';
import { updatePermissions } from '../../../core/permissions/actions';
import { updatePermissionsWorker } from '../../../core/permissions/sagas';
import { selectOrganization, selectPropertyTypes } from '../../../core/redux/selectors';
import { toSagaError } from '../../../utils';
import {
  ERR_INVALID_ACL_KEY,
  ERR_INVALID_PRINCIPAL_ID,
  ERR_INVALID_REQUEST_STATUS,
  ERR_INVALID_UUID,
  ERR_MISSING_ORG,
  ERR_MISSING_PROPERTY_TYPE,
} from '../../../utils/constants/errors';
import { SUBMIT_DATA_SET_ACCESS_RESPONSE, submitDataSetAccessResponse } from '../actions';
import { RequestStatusTypes } from '../constants';
import type { RequestStatusType } from '../constants';

const LOG = new Logger('RequestsSagas');

const { AceBuilder, PrincipalBuilder } = Models;
const { ActionTypes, PrincipalTypes } = Types;
const { updateEntityData } = DataApiActions;
const { updateEntityDataWorker } = DataApiSagas;
const { getEntityKeyId, getPropertyValue } = DataUtils;
const { isNonEmptyString } = LangUtils;
const { isValidUUID } = ValidationUtils;

const REQUIRED_PROPERTY_TYPES :FQN[] = [
  FQNS.OL_RESPONSE_DATE_TIME,
  FQNS.OL_RESPONSE_PRINCIPAL_ID,
  FQNS.OL_STATUS,
];

function* submitDataSetAccessResponseWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(submitDataSetAccessResponse.request(action.id, action.value));

    const {
      dataSetId,
      organizationId,
      request,
      status,
    } :{
      dataSetId :UUID;
      request :Map;
      organizationId :UUID;
      status :RequestStatusType;
    } = action.value;

    const organization :?Organization = yield select(selectOrganization(organizationId));
    if (!organization) {
      throw new Error(ERR_MISSING_ORG);
    }

    const entityKeyId :?UUID = getEntityKeyId(request);
    if (!isValidUUID(entityKeyId)) {
      throw new Error(ERR_INVALID_UUID);
    }

    const parsedKeys :UUID[][] = JSON.parse(getPropertyValue(request, [FQNS.OL_ACL_KEYS, 0]));
    if (parsedKeys.some((key) => key[0] !== dataSetId)) {
      throw new Error(ERR_INVALID_ACL_KEY);
    }

    if (!RequestStatusTypes[status]) {
      throw new Error(ERR_INVALID_REQUEST_STATUS);
    }

    const userId :string = get(AuthUtils.getUserInfo(), 'id', '');
    if (!isNonEmptyString(userId)) {
      throw new Error(ERR_INVALID_PRINCIPAL_ID);
    }

    const propertyTypes :Map<UUID, PropertyType> = yield select(selectPropertyTypes(REQUIRED_PROPERTY_TYPES));
    const propertyTypeIds :Map<FQN, UUID> = propertyTypes.map((propertyType) => propertyType.type).flip();
    if (propertyTypeIds.count() !== REQUIRED_PROPERTY_TYPES.length) {
      throw new Error(ERR_MISSING_PROPERTY_TYPE);
    }

    const updateEntityDataResponse :WorkerResponse = yield call(
      updateEntityDataWorker,
      updateEntityData({
        entities: {
          [entityKeyId]: {
            [get(propertyTypeIds, FQNS.OL_RESPONSE_DATE_TIME)]: [DateTime.local().toISO()],
            [get(propertyTypeIds, FQNS.OL_RESPONSE_PRINCIPAL_ID)]: [userId],
            [get(propertyTypeIds, FQNS.OL_STATUS)]: [status],
          },
        },
        entitySetId: organization.metadataEntitySetIds.accessRequests,
      }),
    );
    if (updateEntityDataResponse.error) throw updateEntityDataResponse.error;

    if (status === RequestStatusTypes.APPROVED) {
      const permissionTypes :List<PermissionType> = fromJS(getPropertyValue(request, FQNS.OL_PERMISSIONS, List()));
      const principalId :string = getPropertyValue(request, [FQNS.OL_REQUEST_PRINCIPAL_ID, 0]);
      const principal = (new PrincipalBuilder()).setId(principalId).setType(PrincipalTypes.USER).build();
      const permissions :Map<List<UUID>, Ace> = Map().withMutations((mutableMap :Map) => {
        fromJS(parsedKeys).forEach((key :List<UUID>) => {
          const ace = (new AceBuilder()).setPermissions(permissionTypes).setPrincipal(principal).build();
          mutableMap.set(key, ace);
        });
      });
      const updatePermissionsResponse :WorkerResponse = yield call(
        updatePermissionsWorker,
        updatePermissions({ actionType: ActionTypes.ADD, permissions })
      );
      if (updatePermissionsResponse.error) throw updatePermissionsResponse.error;
    }

    yield put(submitDataSetAccessResponse.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(submitDataSetAccessResponse.failure(action.id, toSagaError(error)));
  }
  finally {
    yield put(submitDataSetAccessResponse.finally(action.id));
  }
}

function* submitDataSetAccessResponseWatcher() :Saga<*> {

  yield takeEvery(SUBMIT_DATA_SET_ACCESS_RESPONSE, submitDataSetAccessResponseWorker);
}

export {
  submitDataSetAccessResponseWatcher,
  submitDataSetAccessResponseWorker,
};
